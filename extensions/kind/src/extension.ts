/**********************************************************************
 * Copyright (C) 2022 Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 ***********************************************************************/

import * as extensionApi from '@podman-desktop/api';
import { detectKind, getKindPath } from './util';
import { KindInstaller } from './kind-installer';
import type { AuditRequestItems, CancellationToken, Logger } from '@podman-desktop/api';
import { ProgressLocation, window } from '@podman-desktop/api';
import type { ImageInfo } from './image-handler';
import { ImageHandler } from './image-handler';
import { createCluster, connectionAuditor } from './create-cluster';

const API_KIND_INTERNAL_API_PORT = 6443;

const KIND_INSTALL_COMMAND = 'kind.install';

const KIND_MOVE_IMAGE_COMMAND = 'kind.image.move';
let imagesPushInProgressToKind: string[] = [];

export interface KindCluster {
  name: string;
  status: extensionApi.ProviderConnectionStatus;
  apiPort: number;
  engineType: 'podman' | 'docker';
}

let kindClusters: KindCluster[] = [];
const registeredKubernetesConnections: {
  connection: extensionApi.KubernetesProviderConnection;
  disposable: extensionApi.Disposable;
}[] = [];

let kindCli: string | undefined;

const imageHandler = new ImageHandler();

async function registerProvider(
  extensionContext: extensionApi.ExtensionContext,
  provider: extensionApi.Provider,
  telemetryLogger: extensionApi.TelemetryLogger,
): Promise<void> {
  const disposable = provider.setKubernetesProviderConnectionFactory(
    {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      create: (params: { [key: string]: any }, logger?: Logger, token?: CancellationToken) =>
        createCluster(params, logger, kindCli, telemetryLogger, token),
      creationDisplayName: 'Kind cluster',
    },
    {
      auditItems: async (items: AuditRequestItems) => {
        return await connectionAuditor(new ProviderNameExtractor(items).getProviderName(), items);
      },
    },
  );
  extensionContext.subscriptions.push(disposable);

  // search
  await searchKindClusters(provider);
  console.log('kind extension is active');
}

class ProviderNameExtractor {
  constructor(private items: AuditRequestItems) {}

  getProviderName(): string {
    if (this.items['kind.cluster.creation.provider']) {
      return this.items['kind.cluster.creation.provider'];
    }

    return 'docker';
  }
}

// search for clusters
async function updateClusters(provider: extensionApi.Provider, containers: extensionApi.ContainerInfo[]) {
  const kindContainers = containers.map(container => {
    const clusterName = container.Labels['io.x-k8s.kind.cluster'];
    const clusterStatus = container.State;

    // search the port where the cluster is listening
    const listeningPort = container.Ports.find(
      port => port.PrivatePort === API_KIND_INTERNAL_API_PORT && port.Type === 'tcp',
    );
    let status: extensionApi.ProviderConnectionStatus;
    if (clusterStatus === 'running') {
      status = 'started';
    } else {
      status = 'stopped';
    }

    return {
      name: clusterName,
      status,
      apiPort: listeningPort?.PublicPort || 0,
      engineType: container.engineType,
      engineId: container.engineId,
      id: container.Id,
    };
  });
  kindClusters = kindContainers.map(container => {
    return {
      name: container.name,
      status: container.status,
      apiPort: container.apiPort,
      engineType: container.engineType,
    };
  });

  kindContainers.forEach(cluster => {
    const item = registeredKubernetesConnections.find(item => item.connection.name === cluster.name);
    const status = () => {
      return cluster.status;
    };
    if (!item) {
      const lifecycle: extensionApi.ProviderConnectionLifecycle = {
        start: async (context, logger): Promise<void> => {
          try {
            if (context || logger) {
              await extensionApi.containerEngine.logsContainer(
                cluster.engineId,
                cluster.id,
                getLoggerCallback(context, logger),
              );
            }
            // start the container
            await extensionApi.containerEngine.startContainer(cluster.engineId, cluster.id);
          } catch (err) {
            console.error(err);
            // propagate the error
            throw err;
          }
        },
        stop: async (context, logger): Promise<void> => {
          if (context || logger) {
            await extensionApi.containerEngine.logsContainer(
              cluster.engineId,
              cluster.id,
              getLoggerCallback(context, logger),
            );
          }
          await extensionApi.containerEngine.stopContainer(cluster.engineId, cluster.id);
        },
        delete: async (logger): Promise<void> => {
          const env = Object.assign({}, process.env);
          if (cluster.engineType === 'podman') {
            env['KIND_EXPERIMENTAL_PROVIDER'] = 'podman';
          }
          env.PATH = getKindPath();
          await extensionApi.process.exec(kindCli, ['delete', 'cluster', '--name', cluster.name], { env, logger });
        },
      };
      // create a new connection
      const connection: extensionApi.KubernetesProviderConnection = {
        name: cluster.name,
        status,
        endpoint: {
          apiURL: `https://localhost:${cluster.apiPort}`,
        },
        lifecycle,
      };
      const disposable = provider.registerKubernetesProviderConnection(connection);

      registeredKubernetesConnections.push({ connection, disposable });
    } else {
      item.connection.status = status;
      item.connection.endpoint.apiURL = `https://localhost:${cluster.apiPort}`;
    }
  });

  // do we have registeredKubernetesConnections that are not in kindClusters?
  registeredKubernetesConnections.forEach(item => {
    const cluster = kindClusters.find(cluster => cluster.name === item.connection.name);
    if (!cluster) {
      // remove the connection
      item.disposable.dispose();

      // remove the item frm the list
      const index = registeredKubernetesConnections.indexOf(item);
      if (index > -1) {
        registeredKubernetesConnections.splice(index, 1);
      }
    }
  });
}

function getLoggerCallback(context?: extensionApi.LifecycleContext, logger?: Logger) {
  return (_name: string, data: string) => {
    if (data) {
      context?.log?.log(data);
      logger?.log(data);
    }
  };
}

async function searchKindClusters(provider: extensionApi.Provider): Promise<void> {
  const allContainers = await extensionApi.containerEngine.listContainers();

  // search all containers with io.x-k8s.kind.cluster label
  const kindContainers = allContainers.filter(container => {
    return container.Labels?.['io.x-k8s.kind.cluster'];
  });
  await updateClusters(provider, kindContainers);
}

export function refreshKindClustersOnProviderConnectionUpdate(provider: extensionApi.Provider) {
  // when a provider is changing, update the status
  extensionApi.provider.onDidUpdateContainerConnection(async () => {
    // needs to search for kind clusters
    await searchKindClusters(provider);
  });
}

export async function createProvider(
  extensionContext: extensionApi.ExtensionContext,
  telemetryLogger: extensionApi.TelemetryLogger,
): Promise<void> {
  const providerOptions: extensionApi.ProviderOptions = {
    name: 'Kind',
    id: 'kind',
    status: 'unknown',
    images: {
      icon: './icon.png',
      logo: {
        dark: './logo-dark.png',
        light: './logo-light.png',
      },
    },
  };

  // Empty connection descriptive message
  providerOptions.emptyConnectionMarkdownDescription = `
  Kind is a Kubernetes utility for running local clusters using single-container "nodes", providing an easy way to create and manage Kubernetes environments for development and testing.\n\nMore information: [kind.sigs.k8s.io](https://kind.sigs.k8s.io/)`;

  const provider = extensionApi.provider.createProvider(providerOptions);

  extensionContext.subscriptions.push(provider);
  await registerProvider(extensionContext, provider, telemetryLogger);
  extensionContext.subscriptions.push(
    extensionApi.commands.registerCommand(KIND_MOVE_IMAGE_COMMAND, async image => {
      telemetryLogger.logUsage('moveImage');

      return extensionApi.window.withProgress(
        { location: ProgressLocation.TASK_WIDGET, title: `Loading ${image.name} to kind.` },
        async progress => await moveImage(progress, image),
      );
    }),
  );

  // when containers are refreshed, update
  extensionApi.containerEngine.onEvent(async event => {
    if (event.Type === 'container') {
      // needs to search for kind clusters
      await searchKindClusters(provider);
    }
  });

  // when a container provider connection is changing, search for kind clusters
  refreshKindClustersOnProviderConnectionUpdate(provider);

  // search when a new container is updated or removed
  extensionApi.provider.onDidRegisterContainerConnection(async () => {
    await searchKindClusters(provider);
  });
  extensionApi.provider.onDidUnregisterContainerConnection(async () => {
    await searchKindClusters(provider);
  });
  extensionApi.provider.onDidUpdateProvider(async () => registerProvider(extensionContext, provider, telemetryLogger));
  // search for kind clusters on boot
  await searchKindClusters(provider);
}

export async function moveImage(
  progress: extensionApi.Progress<{
    message?: string;
    increment?: number;
  }>,
  image: unknown,
) {
  // as the command receive an "any" value we check that it contains an id and an engineId as they are mandatory
  if (!(typeof image === 'object' && 'id' in image && 'engineId' in image)) {
    throw new Error('Image selection not supported yet');
  }

  // update the list of the images whose pushing to kind is in progress
  imagesPushInProgressToKind.push(image.id as string);
  extensionApi.context.setValue('imagesPushInProgressToKind', imagesPushInProgressToKind);
  try {
    await imageHandler.moveImage(image as ImageInfo, kindClusters, kindCli);
  } finally {
    // Mark the task as completed and remove the image from the pushInProgressToKind list on context
    imagesPushInProgressToKind = imagesPushInProgressToKind.filter(id => id !== image.id);
    extensionApi.context.setValue('imagesPushInProgressToKind', imagesPushInProgressToKind);
    progress.report({ increment: -1 });
  }
}

export async function activate(extensionContext: extensionApi.ExtensionContext): Promise<void> {
  const telemetryLogger = extensionApi.env.createTelemetryLogger();
  const installer = new KindInstaller(extensionContext.storagePath, telemetryLogger);
  kindCli = await detectKind(extensionContext.storagePath, installer);

  if (!kindCli) {
    if (await installer.isAvailable()) {
      const statusBarItem = extensionApi.window.createStatusBarItem();
      statusBarItem.text = 'Kind';
      statusBarItem.tooltip = 'Kind not found on your system, click to download and install it';
      statusBarItem.command = KIND_INSTALL_COMMAND;
      statusBarItem.iconClass = 'fa fa-exclamation-triangle';
      extensionContext.subscriptions.push(
        extensionApi.commands.registerCommand(KIND_INSTALL_COMMAND, () =>
          installer.performInstall().then(
            async status => {
              if (status) {
                statusBarItem.dispose();
                kindCli = await detectKind(extensionContext.storagePath, installer);
                await createProvider(extensionContext, telemetryLogger);
              }
            },
            (err: unknown) => window.showErrorMessage('Kind installation failed ' + err),
          ),
        ),
        statusBarItem,
      );
      statusBarItem.show();
    }
  } else {
    await createProvider(extensionContext, telemetryLogger);
  }
}

export function deactivate(): void {
  console.log('stopping kind extension');
}
