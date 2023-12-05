/**********************************************************************
 * Copyright (C) 2022-2023 Red Hat, Inc.
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

import type { ContainerInfo } from '../../../../main/src/plugin/api/container-info';
import type { ContainerGroupInfoUI, ContainerGroupPartInfoUI, ContainerInfoUI } from './ContainerInfoUI';
import { ContainerGroupInfoTypeUI } from './ContainerInfoUI';
import moment from 'moment';
import humanizeDuration from 'humanize-duration';
import { filesize } from 'filesize';
import type { Port } from '@podman-desktop/api';
import type { ContextUI } from '../context/context';
import type { ViewInfoUI } from '../../../../main/src/plugin/api/view-info';
import { ContextKeyExpr } from '../context/contextKey';
import ContainerIcon from '../images/ContainerIcon.svelte';

export class ContainerUtils {
  getName(containerInfo: ContainerInfo) {
    // part of a compose ?
    const composeService = containerInfo.Labels?.['com.docker.compose.service'];
    if (composeService) {
      const composeContainerNumber = containerInfo.Labels?.['com.docker.compose.container-number'];
      if (composeContainerNumber) {
        return `${composeService}-${composeContainerNumber}`;
      }
    }
    if (containerInfo.Names.length === 0) {
      return '';
    }
    return containerInfo.Names[0].replace(/^\//, '');
  }

  getState(containerInfo: ContainerInfo): string {
    return (containerInfo.State || '').toUpperCase();
  }

  getUptime(containerInfo: ContainerInfo): string {
    if (containerInfo.State?.toUpperCase() !== 'RUNNING' || !containerInfo.StartedAt) {
      return '';
    }

    // make it human friendly
    return this.humanizeUptime(containerInfo.StartedAt);
  }

  humanizeUptime(started: string): string {
    // get start time in ms
    const uptimeInMs = moment().diff(started);
    // make it human friendly
    return humanizeDuration(uptimeInMs, { round: true, largest: 1 });
  }

  refreshUptime(containerInfoUI: ContainerInfoUI): string {
    if (containerInfoUI.state !== 'RUNNING' || !containerInfoUI.startedAt) {
      return '';
    }
    // make it human friendly
    return this.humanizeUptime(containerInfoUI.startedAt);
  }

  getImage(containerInfo: ContainerInfo): string {
    return containerInfo.Image;
  }

  getShortImage(containerInfo: ContainerInfo): string {
    // if image has a digest, keep only first 7 digits
    const image = containerInfo.Image;
    const shaIndex = image.indexOf('@sha256:');
    if (shaIndex > 0) {
      return image.substring(0, shaIndex + 15);
    }
    return image;
  }

  getPorts(containerInfo: ContainerInfo): Port[] {
    return containerInfo.Ports?.filter(port => port.PublicPort).map(port => port) || [];
  }

  getDisplayPort(containerInfo: ContainerInfo): string {
    const ports = this.getPorts(containerInfo).map(port => port.PublicPort);
    if (ports.length === 0) {
      return '';
    }
    return `PORT${ports.length > 1 ? 'S' : ''} ${ports}`;
  }

  hasPublicPort(containerInfo: ContainerInfo): boolean {
    const publicPorts = containerInfo.Ports?.filter(port => port.PublicPort).map(port => port.PublicPort);

    return publicPorts && publicPorts.length > 0;
  }

  getOpeningUrl(containerInfo: ContainerInfo): string {
    const ports = containerInfo.Ports?.filter(port => port.PublicPort).map(port => port.PublicPort);
    if (ports && ports.length > 0) {
      return `http://localhost:${ports[0]}`;
    } else {
      return '';
    }
  }

  getOpeningUrls(containerInfo: ContainerInfo): string[] {
    return containerInfo.Ports?.filter(port => port.PublicPort)
      .map(port => port.PublicPort)
      .map(port => `http://localhost:${port}`);
  }

  getEngineId(containerInfo: ContainerInfo): string {
    return containerInfo.engineId;
  }

  getEngineName(containerInfo: ContainerInfo): string {
    return containerInfo.engineName;
  }

  getContainerInfoUI(
    containerInfo: ContainerInfo,
    context?: ContextUI,
    viewContributions?: ViewInfoUI[],
  ): ContainerInfoUI {
    return {
      id: containerInfo.Id,
      shortId: containerInfo.Id.substring(0, 8),
      name: this.getName(containerInfo),
      image: this.getImage(containerInfo),
      shortImage: this.getShortImage(containerInfo),
      state: this.getState(containerInfo),
      startedAt: containerInfo.StartedAt,
      uptime: this.getUptime(containerInfo),
      engineId: this.getEngineId(containerInfo),
      engineName: this.getEngineName(containerInfo),
      engineType: containerInfo.engineType,
      command: containerInfo.Command,
      ports: this.getPorts(containerInfo),
      portsAsString: this.getPortsAsString(containerInfo),
      displayPort: this.getDisplayPort(containerInfo),
      hasPublicPort: this.hasPublicPort(containerInfo),
      openingUrl: this.getOpeningUrl(containerInfo),
      groupInfo: this.getContainerGroup(containerInfo),
      selected: false,
      created: containerInfo.Created,
      labels: containerInfo.Labels,
      icon: this.iconClass(containerInfo, context, viewContributions) || ContainerIcon,
    };
  }

  getContainerGroup(containerInfo: ContainerInfo): ContainerGroupPartInfoUI {
    // compose metatadata ?
    const composeProject = containerInfo.Labels?.['com.docker.compose.project'];
    if (composeProject) {
      return {
        name: composeProject,
        type: ContainerGroupInfoTypeUI.COMPOSE,
        engineId: containerInfo.engineId,
        engineType: containerInfo.engineType,
      };
    }

    // pod ?
    const podInfo = containerInfo.pod;
    if (podInfo) {
      return {
        name: podInfo.name,
        type: ContainerGroupInfoTypeUI.POD,
        id: podInfo.id,
        status: (podInfo.status || '').toUpperCase(),
        engineId: containerInfo.engineId,
        engineType: containerInfo.engineType,
      };
    }

    // else, standalone
    return {
      name: this.getName(containerInfo),
      type: ContainerGroupInfoTypeUI.STANDALONE,
      status: (containerInfo.Status || '').toUpperCase(),
      engineType: containerInfo.engineType,
    };
  }

  getContainerGroups(containerInfos: ContainerInfoUI[]): ContainerGroupInfoUI[] {
    // create a map from containers having the same group field
    const groups = new Map<string, ContainerGroupInfoUI>();
    containerInfos.forEach(containerInfo => {
      const group = containerInfo.groupInfo;
      if (group.type === ContainerGroupInfoTypeUI.STANDALONE) {
        // standalone group, insert with id as key
        groups.set(containerInfo.id, {
          ...group,
          containers: [containerInfo],
          expanded: true,
          selected: false,
          allContainersCount: 1,
        });
      } else {
        if (!groups.has(group.name)) {
          groups.set(group.name, {
            selected: false,
            expanded: true,
            name: group.name,
            type: group.type,
            id: group.id,
            status: group.status,
            engineId: group.engineId,
            engineType: group.engineType,
            allContainersCount: 0,
            containers: [],
          });
        }
        groups.get(group.name)?.containers.push(containerInfo);
      }
    });
    groups.forEach(group => (group.allContainersCount = group.containers.length));

    Array.from(groups.values())
      .filter(group => group.type === ContainerGroupInfoTypeUI.COMPOSE)
      .forEach(group => (group.status = group.containers.every(c => c.state === 'RUNNING') ? 'RUNNING' : 'STOPPED'));

    return Array.from(groups.values());
  }

  getMemoryPercentageUsageTitle(memoryUsagePercentage: number, usedMemory: number): string {
    return `${memoryUsagePercentage.toFixed(2)}% (${filesize(usedMemory)})`;
  }

  getMemoryUsageTitle(usedMemory: number): string {
    return `${filesize(usedMemory)}`;
  }

  getPortsAsString(containerInfo: ContainerInfo): string {
    const ports = this.getPorts(containerInfo).map(port => port.PublicPort);
    if (ports.length > 1) {
      return `${ports.join(', ')}`;
    } else if (ports.length === 1) {
      return `${ports[0]}`;
    } else {
      return '';
    }
  }

  iconClass(container: ContainerInfo, context?: ContextUI, viewContributions?: ViewInfoUI[]): string | undefined {
    if (!context || !viewContributions) {
      return undefined;
    }

    let icon;
    // loop over all contribution for this view
    for (const contribution of viewContributions) {
      // adapt the context to work with containers (e.g save container labels into the context)
      this.adaptContextOnContainer(context, container);
      // deserialize the when clause
      const whenDeserialized = ContextKeyExpr.deserialize(contribution.when);
      // if the when clause has to be applied to this container
      if (whenDeserialized?.evaluate(context)) {
        // handle ${} in icon class
        // and interpret the value and replace with the class-name
        const match = contribution.icon.match(/\$\{(.*)\}/);
        if (match && match.length === 2) {
          const className = match[1];
          icon = contribution.icon.replace(match[0], `podman-desktop-icon-${className}`);
          return icon;
        }
      }
    }
    return icon;
  }

  adaptContextOnContainer(context: ContextUI, container: ContainerInfo): void {
    context.setValue('containerLabelKeys', container.Labels ? Object.keys(container.Labels) : []);
  }

  filterResetRunning(f: string) {
    return f
      .split(' ')
      .filter(part => !part.startsWith('is:running') && !part.startsWith('is:stopped'))
      .join(' ');
  }

  filterSetRunning(f: string) {
    const parts = f.split(' ').filter(part => !part.startsWith('is:running') && !part.startsWith('is:stopped'));
    parts.push('is:running');
    return parts.join(' ');
  }

  filterSetStopped(f: string) {
    const parts = f.split(' ').filter(part => !part.startsWith('is:running') && !part.startsWith('is:stopped'));
    parts.push('is:stopped');
    return parts.join(' ');
  }

  filterResetSearchTerm(f: string): string {
    return f
      .split(' ')
      .filter(part => part.startsWith('is:'))
      .join(' ');
  }

  filterIsRunning(f: string): boolean {
    return f.split(' ').includes('is:running');
  }

  filterIsStopped(f: string): boolean {
    return f.split(' ').includes('is:stopped');
  }

  filterIsAll(f: string): boolean {
    return !this.filterIsRunning(f) && !this.filterIsStopped(f);
  }

  filterSearchTerm(f: string): string {
    return f
      .split(' ')
      .filter(part => !part.startsWith('is:'))
      .join(' ');
  }
}
