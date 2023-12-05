/**********************************************************************
 * Copyright (C) 2023 Red Hat, Inc.
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

/* eslint-disable @typescript-eslint/no-explicit-any */

import '@testing-library/jest-dom/vitest';
import { beforeAll, test, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import PodsList from '/@/lib/pod/PodsList.svelte';
import type { ProviderInfo } from '../../../../main/src/plugin/api/provider-info';
import { get } from 'svelte/store';
import { providerInfos } from '/@/stores/providers';
import { filtered, podsInfos } from '/@/stores/pods';
import type { PodInfo } from '../../../../main/src/plugin/api/pod-info';
import { router } from 'tinro';
import userEvent from '@testing-library/user-event';

const getProvidersInfoMock = vi.fn();
const listPodsMock = vi.fn();
const listContainersMock = vi.fn();
const kubernetesListPodsMock = vi.fn();
const getContributedMenusMock = vi.fn();

const provider: ProviderInfo = {
  containerConnections: [
    {
      name: 'MyConnection',
      status: 'started',
      endpoint: { socketPath: 'dummy' },
      type: 'podman',
    },
  ],
  containerProviderConnectionCreation: false,
  containerProviderConnectionInitialization: false,
  detectionChecks: [],
  id: 'providerid',
  images: {},
  installationSupport: false,
  internalId: 'providerid',
  kubernetesConnections: [],
  kubernetesProviderConnectionCreation: false,
  kubernetesProviderConnectionInitialization: false,
  links: [],
  name: 'MyProvider',
  status: 'started',
  warnings: [],
  extensionId: '',
};

const pod1: PodInfo = {
  Cgroup: '',
  // Three containers within the pod, one running, one terminated, one exited
  Containers: [
    {
      Names: 'container1',
      Id: 'container1',
      Status: 'running',
    },
    {
      Names: 'container2',
      Id: 'container2',
      Status: 'terminated',
    },
    {
      Names: 'container3',
      Id: 'container3',
      Status: 'exited',
    },
  ],
  Created: '',
  Id: 'beab25123a40',
  InfraId: 'pod1',
  Labels: {},
  Name: 'pod1',
  Namespace: '',
  Networks: [],
  Status: 'running',
  engineId: 'podman',
  engineName: 'podman',
  kind: 'podman',
};

const pod2: PodInfo = {
  Cgroup: '',
  Containers: [
    {
      Names: 'container4',
      Id: 'container4',
      Status: 'running',
    },
  ],
  Created: '',
  Id: 'e8129c5720b3',
  InfraId: 'pod2',
  Labels: {},
  Name: 'pod2',
  Namespace: '',
  Networks: [],
  Status: 'running',
  engineId: 'podman',
  engineName: 'podman',
  kind: 'podman',
};

// Pod with 11 containers that shows all the different statuses
// running, terminated, waiting, stopped, paused, exited, dead, created, degraded
// this makes it so that we "group" them as more than 10 containers equals grouping
const manyPod: PodInfo = {
  Cgroup: '',
  Containers: [
    {
      Names: 'container1',
      Id: 'container1',
      Status: 'running',
    },
    {
      Names: 'container2',
      Id: 'container2',
      Status: 'terminated',
    },
    {
      Names: 'container3',
      Id: 'container3',
      Status: 'waiting',
    },
    {
      Names: 'container4',
      Id: 'container4',
      Status: 'stopped',
    },
    {
      Names: 'container5',
      Id: 'container5',
      Status: 'paused',
    },
    {
      Names: 'container6',
      Id: 'container6',
      Status: 'exited',
    },
    {
      Names: 'container7',
      Id: 'container7',
      Status: 'dead',
    },
    {
      Names: 'container8',
      Id: 'container8',
      Status: 'created',
    },
    {
      Names: 'container9',
      Id: 'container9',
      Status: 'degraded',
    },
    {
      Names: 'container10',
      Id: 'container10',
      Status: 'running',
    },
    {
      Names: 'container11',
      Id: 'container11',
      Status: 'running',
    },
  ],
  Created: '',
  Id: 'beab25123a40',
  InfraId: 'manyPod',
  Labels: {},
  Name: 'manyPod',
  Namespace: '',
  Networks: [],
  Status: 'running',
  engineId: 'podman',
  engineName: 'podman',
  kind: 'podman',
};

const kubepod1: PodInfo = {
  Cgroup: '',
  Containers: [
    {
      Names: 'container1',
      Id: 'container1',
      Status: 'running',
    },
  ],
  Created: '',
  Id: 'beab25123a40',
  InfraId: 'kubepod1',
  Labels: {},
  Name: 'kubepod1',
  Namespace: '',
  Networks: [],
  Status: 'running',
  engineId: 'context1',
  engineName: 'Kubernetes',
  kind: 'kubernetes',
};

const kubepod2: PodInfo = {
  Cgroup: '',
  Containers: [
    {
      Names: 'container1',
      Id: 'container1',
      Status: 'running',
    },
  ],
  Created: '',
  Id: 'e8129c5720b3',
  InfraId: 'kubepod2',
  Labels: {},
  Name: 'kubepod2',
  Namespace: '',
  Networks: [],
  Status: 'running',
  engineId: 'context2',
  engineName: 'Kubernetes',
  kind: 'kubernetes',
};

const ocppod: PodInfo = {
  Cgroup: '',
  Containers: [
    {
      Names: 'container1',
      Id: 'container1',
      Status: 'running',
    },
  ],
  Created: '',
  Id: 'e8129c5720b3',
  InfraId: 'ocppod',
  Labels: {},
  Name: 'ocppod',
  Namespace: '',
  Networks: [],
  Status: 'running',
  engineId: 'userid-dev/api-sandbox-123-openshiftapps-com:6443/userId',
  engineName: 'Kubernetes',
  kind: 'kubernetes',
};

// fake the window.events object
beforeAll(() => {
  (window as any).getProviderInfos = getProvidersInfoMock;
  (window as any).listPods = listPodsMock;
  (window as any).listContainers = listContainersMock.mockResolvedValue([]);
  (window as any).kubernetesListPods = kubernetesListPodsMock;
  (window as any).onDidUpdateProviderStatus = vi.fn().mockResolvedValue(undefined);
  (window.events as unknown) = {
    receive: (_channel: string, func: any) => {
      func();
    },
  };

  (window as any).getContributedMenus = getContributedMenusMock;
  getContributedMenusMock.mockImplementation(() => Promise.resolve([]));
});

async function waitRender(customProperties: object): Promise<void> {
  const result = render(PodsList, { ...customProperties });
  // wait that result.component.$$.ctx[2] is set
  await vi.waitUntil(() => result.component.$$.ctx[2] !== undefined, { timeout: 5000 });
}

test('Expect no pods being displayed', async () => {
  getProvidersInfoMock.mockResolvedValue([provider]);
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));

  await vi.waitUntil(() => get(providerInfos).length !== 0);

  render(PodsList);
  const noPods = screen.getByText(/No pods/);
  expect(noPods).toBeInTheDocument();
});

test('Expect single podman pod being displayed', async () => {
  getProvidersInfoMock.mockResolvedValue([provider]);
  listPodsMock.mockResolvedValue([pod1]);
  kubernetesListPodsMock.mockResolvedValue([]);
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('extensions-already-started'));

  await vi.waitUntil(() => get(providerInfos).length === 1 && get(podsInfos).length === 1, { timeout: 5000 });

  render(PodsList);
  const pod1Details = screen.getByRole('cell', { name: 'pod1 beab2512' });
  expect(pod1Details).toBeInTheDocument();

  // Expect to have three "tooltips" which are the "dots".
  const pod1Row = screen.getByRole('row', {
    name: 'Toggle pod pod1 beab2512 podman tooltip tooltip tooltip 0 seconds spinner spinner spinner',
  });
  expect(pod1Row).toBeInTheDocument();
});

test('Expect 2 podman pods being displayed', async () => {
  getProvidersInfoMock.mockResolvedValue([provider]);
  listPodsMock.mockResolvedValue([pod1, pod2]);
  kubernetesListPodsMock.mockResolvedValue([]);
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('extensions-already-started'));

  await vi.waitUntil(() => get(providerInfos).length === 1 && get(podsInfos).length === 2, { timeout: 5000 });

  render(PodsList);
  const pod1Details = screen.getByRole('cell', { name: 'pod1 beab2512' });
  expect(pod1Details).toBeInTheDocument();
  const pod1Row = screen.getByRole('row', {
    name: 'Toggle pod pod1 beab2512 podman tooltip tooltip tooltip 0 seconds spinner spinner spinner',
  });
  expect(pod1Row).toBeInTheDocument();
  const pod2Row = screen.getByRole('row', {
    name: 'Toggle pod pod2 e8129c57 podman tooltip 0 seconds spinner spinner spinner',
  });
  expect(pod2Row).toBeInTheDocument();
});

test('Expect single kubernetes pod being displayed', async () => {
  getProvidersInfoMock.mockResolvedValue([provider]);
  listPodsMock.mockResolvedValue([]);
  kubernetesListPodsMock.mockResolvedValue([kubepod1]);
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('extensions-already-started'));

  await vi.waitUntil(() => get(providerInfos).length === 1 && get(podsInfos).length === 1, { timeout: 5000 });

  render(PodsList);
  const pod1Details = screen.getByRole('row', {
    name: 'Toggle pod kubepod1 beab2512 kubernetes tooltip 0 seconds spinner',
  });
  expect(pod1Details).toBeInTheDocument();
});

test('Expect 2 kubernetes pods being displayed', async () => {
  getProvidersInfoMock.mockResolvedValue([provider]);
  listPodsMock.mockResolvedValue([]);
  kubernetesListPodsMock.mockResolvedValue([kubepod1, kubepod2]);
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('extensions-already-started'));

  await vi.waitUntil(() => get(providerInfos).length === 1 && get(podsInfos).length === 2, { timeout: 5000 });

  render(PodsList);
  const pod1Details = screen.getByRole('row', {
    name: 'Toggle pod kubepod1 beab2512 kubernetes tooltip 0 seconds spinner',
  });
  expect(pod1Details).toBeInTheDocument();
  const pod2Details = screen.getByRole('row', {
    name: 'Toggle pod kubepod2 e8129c57 kubernetes tooltip 0 seconds spinner',
  });
  expect(pod2Details).toBeInTheDocument();
});

test('Expect filter empty screen', async () => {
  getProvidersInfoMock.mockResolvedValue([provider]);
  listPodsMock.mockResolvedValue([pod1]);
  kubernetesListPodsMock.mockResolvedValue([]);
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('extensions-already-started'));

  await vi.waitUntil(() => get(providerInfos).length === 1 && get(podsInfos).length === 1, { timeout: 5000 });

  render(PodsList, { searchTerm: 'No match' });
  const filterButton = screen.getByRole('button', { name: 'Clear filter' });
  expect(filterButton).toBeInTheDocument();
});

test('Expect the route to a pod details page is correctly encoded with an engineId containing / characters', async () => {
  getProvidersInfoMock.mockResolvedValue([provider]);
  listPodsMock.mockResolvedValue([]);
  kubernetesListPodsMock.mockResolvedValue([ocppod]);
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('extensions-already-started'));

  await vi.waitUntil(() => get(providerInfos).length === 1, { timeout: 5000 });

  await vi.waitUntil(
    () => {
      const infos = get(podsInfos);
      return infos.length === 1 && infos[0].Name === ocppod.Name;
    },
    { timeout: 5000 },
  );
  render(PodsList);
  const podDetails = screen.getByRole('cell', { name: 'ocppod e8129c57' });
  expect(podDetails).toBeInTheDocument();

  const podRow = screen.getByRole('row', {
    name: 'Toggle pod ocppod e8129c57 kubernetes tooltip 0 seconds spinner',
  });
  expect(podRow).toBeInTheDocument();

  const routerGotoMock = vi.fn();
  router.goto = routerGotoMock;
  await fireEvent.click(podDetails);
  expect(routerGotoMock).toHaveBeenCalledWith(
    '/pods/kubernetes/ocppod/userid-dev%2Fapi-sandbox-123-openshiftapps-com%3A6443%2FuserId/logs',
  );
});

test('Expect the pod1 row to have 3 status dots with the correct colors and the pod2 row to have 1 status dot', async () => {
  getProvidersInfoMock.mockResolvedValue([provider]);
  listPodsMock.mockResolvedValue([pod1, pod2]);
  kubernetesListPodsMock.mockResolvedValue([]);
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('extensions-already-started'));

  await vi.waitUntil(() => get(providerInfos).length === 1 && get(podsInfos).length === 2, { timeout: 5000 });

  waitRender(PodsList);

  // Should render 4 status dots.
  // 3 for the first pod, 1 for the second pod
  // this should also appear REORGANIZED and in a different order.
  const statusDots = screen.getAllByTestId('status-dot');
  expect(statusDots.length).toBe(4);

  expect(statusDots[0].title).toBe('container1: Running');
  expect(statusDots[0]).toHaveClass('bg-status-running');

  expect(statusDots[1].title).toBe('container3: Exited');
  expect(statusDots[1]).toHaveClass('outline-status-exited');

  expect(statusDots[2].title).toBe('container2: Terminated');
  expect(statusDots[2]).toHaveClass('bg-status-terminated');

  // 2nd row / 2nd pod
  expect(statusDots[3].title).toBe('container4: Running');
  expect(statusDots[3]).toHaveClass('bg-status-running');
});

test('Expect the manyPod row to show 9 dots representing every status', async () => {
  getProvidersInfoMock.mockResolvedValue([provider]);
  listPodsMock.mockResolvedValue([manyPod]);
  kubernetesListPodsMock.mockResolvedValue([]);
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('extensions-already-started'));

  await vi.waitUntil(() => get(providerInfos).length === 1 && get(podsInfos).length === 1, { timeout: 5000 });

  waitRender(PodsList);

  // Should render 9 status dots representing all statuses from the 11 containers provided
  // due to the functoin organizeContainers it will be reorganized and the order will be different
  // it should be organized as follows:
  // running, created, paused, waiting, degraded, exited, stopped, terminated, dead
  const statusDots = screen.getAllByTestId('status-dot');
  expect(statusDots.length).toBe(9);

  expect(statusDots[0].title).toBe('Running: 3');
  expect(statusDots[0]).toHaveClass('bg-status-running');

  expect(statusDots[1].title).toBe('Created: 1');
  expect(statusDots[1]).toHaveClass('outline-status-created');

  expect(statusDots[2].title).toBe('Paused: 1');
  expect(statusDots[2]).toHaveClass('bg-status-paused');

  expect(statusDots[3].title).toBe('Waiting: 1');
  expect(statusDots[3]).toHaveClass('bg-status-waiting');

  expect(statusDots[4].title).toBe('Degraded: 1');
  expect(statusDots[4]).toHaveClass('bg-status-degraded');

  expect(statusDots[5].title).toBe('Exited: 1');
  expect(statusDots[5]).toHaveClass('outline-status-exited');

  expect(statusDots[6].title).toBe('Stopped: 1');
  expect(statusDots[6]).toHaveClass('outline-status-stopped');

  expect(statusDots[7].title).toBe('Terminated: 1');
  expect(statusDots[7]).toHaveClass('bg-status-terminated');

  expect(statusDots[8].title).toBe('Dead: 1');
  expect(statusDots[8]).toHaveClass('bg-status-dead');
});

const runningPod: PodInfo = {
  Cgroup: '',
  // Three containers within the pod, one running, one terminated, one exited
  Containers: [
    {
      Names: 'container1',
      Id: 'container1',
      Status: 'running',
    },
  ],
  Created: '',
  Id: 'beab25123a40',
  InfraId: 'pod1',
  Labels: {},
  Name: 'pod1',
  Namespace: '',
  Networks: [],
  Status: 'Running',
  engineId: 'podman',
  engineName: 'podman',
  kind: 'podman',
};

const stoppedPod: PodInfo = {
  Cgroup: '',
  Containers: [
    {
      Names: 'container4',
      Id: 'container4',
      Status: 'stopped',
    },
  ],
  Created: '',
  Id: 'e8129c5720b3',
  InfraId: 'pod2',
  Labels: {},
  Name: 'pod2',
  Namespace: '',
  Networks: [],
  Status: 'Stopped',
  engineId: 'podman',
  engineName: 'podman',
  kind: 'podman',
};

test('Expect All tab to show all pods running and stopped (not running)', async () => {
  getProvidersInfoMock.mockResolvedValue([provider]);
  listPodsMock.mockResolvedValue([stoppedPod, runningPod]);
  kubernetesListPodsMock.mockResolvedValue([]);
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('extensions-already-started'));

  render(PodsList);

  await vi.waitUntil(() => get(providerInfos).length === 1 && get(filtered).length === 2, { timeout: 5000 });

  expect(get(filtered)).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ Status: 'Running' }),
      expect.objectContaining({ Status: 'Stopped' }),
    ]),
  );
});

test('Expect Running tab to show running pods only', async () => {
  getProvidersInfoMock.mockResolvedValue([provider]);
  listPodsMock.mockResolvedValue([stoppedPod, runningPod]);
  kubernetesListPodsMock.mockResolvedValue([]);
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('extensions-already-started'));

  render(PodsList);

  await vi.waitUntil(() => get(providerInfos).length === 1 && get(filtered).length === 2, { timeout: 5000 });

  const runningTab = screen.getByRole('button', { name: 'Running' });

  await userEvent.click(runningTab);

  await vi.waitUntil(() => get(filtered).length === 1, { timeout: 5000 });

  expect(get(filtered)).toEqual(expect.arrayContaining([expect.objectContaining({ Status: 'Running' })]));
});

test('Expect Stopped tab to show stopped (not running) pods only', async () => {
  getProvidersInfoMock.mockResolvedValue([provider]);
  listPodsMock.mockResolvedValue([stoppedPod, runningPod]);
  kubernetesListPodsMock.mockResolvedValue([]);
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('extensions-already-started'));

  render(PodsList);

  await vi.waitUntil(() => get(providerInfos).length === 1 && get(filtered).length === 2, { timeout: 5000 });

  const runningTab = screen.getByRole('button', { name: 'Stopped' });

  await userEvent.click(runningTab);

  await vi.waitUntil(() => get(filtered).length === 1, { timeout: 5000 });

  expect(get(filtered)).toEqual(expect.arrayContaining([expect.objectContaining({ Status: 'Stopped' })]));
});
