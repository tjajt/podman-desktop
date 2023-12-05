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
import { render, screen, fireEvent } from '@testing-library/svelte';
import ContainerList from './ContainerList.svelte';
import { containersInfos } from '../../stores/containers';
import { get } from 'svelte/store';
import { providerInfos } from '../../stores/providers';

const listContainersMock = vi.fn();
const getProviderInfosMock = vi.fn();
const getContributedMenusMock = vi.fn();

const listPodsMock = vi.fn();

const kubernetesListPodsMock = vi.fn();

const deleteContainersByLabelMock = vi.fn();

// fake the window.events object
beforeAll(() => {
  const onDidUpdateProviderStatusMock = vi.fn();
  (window as any).onDidUpdateProviderStatus = onDidUpdateProviderStatusMock;
  onDidUpdateProviderStatusMock.mockImplementation(() => Promise.resolve());
  listPodsMock.mockImplementation(() => Promise.resolve([]));
  kubernetesListPodsMock.mockImplementation(() => Promise.resolve([]));
  (window as any).listContainers = listContainersMock;
  (window as any).listPods = listPodsMock;
  (window as any).kubernetesListPods = kubernetesListPodsMock;
  (window as any).getProviderInfos = getProviderInfosMock;
  (window as any).deleteContainersByLabel = deleteContainersByLabelMock;
  const listViewsContributionsMock = vi.fn();
  (window as any).listViewsContributions = listViewsContributionsMock;
  (window as any).getContributedMenus = getContributedMenusMock;

  listViewsContributionsMock.mockResolvedValue([]);
  getContributedMenusMock.mockImplementation(() => Promise.resolve([]));

  (window.events as unknown) = {
    receive: (_channel: string, func: any) => {
      func();
    },
  };
});

async function waitRender(customProperties: object): Promise<void> {
  const result = render(ContainerList, { ...customProperties });
  // wait that result.component.$$.ctx[2] is set
  while (result.component.$$.ctx[2] === undefined) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

test('Expect no container engines being displayed', async () => {
  render(ContainerList);
  const noEngine = screen.getByRole('heading', { name: 'No Container Engine' });
  expect(noEngine).toBeInTheDocument();
});

test('Delete a group of compose containers succesfully', async () => {
  getProviderInfosMock.mockResolvedValue([
    {
      name: 'podman',
      status: 'started',
      internalId: 'podman-internal-id',
      containerConnections: [
        {
          name: 'podman-machine-default',
          status: 'started',
        },
      ],
    },
  ]);

  const groupName = 'compose-group';
  const mockedContainers = [
    {
      Id: 'container1',
      Image: 'docker.io/kindest/node:foobar',
      Labels: { 'com.docker.compose.project': groupName },
      Names: ['container1'],
      State: 'RUNNING',
      engineId: 'podman',
      engineType: 'podman',
    },
    {
      Id: 'container2',
      Image: 'docker.io/kindest/node:foobar',
      Labels: { 'com.docker.compose.project': groupName },
      Names: ['container2'],
      State: 'RUNNING',
      engineId: 'podman',
      engineType: 'podman',
    },
  ];
  listContainersMock.mockResolvedValue(mockedContainers);

  // Send over custom events to simulate PD being started
  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('tray:update-provider'));

  // Wait for the store to get populated
  while (get(containersInfos).length === 0) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  while (get(providerInfos).length === 0) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  await waitRender({});

  // Find the 'Delete Compose' button for the compose group
  const deleteButton = screen.getByRole('button', { name: 'Delete Compose' });
  expect(deleteButton).toBeInTheDocument();

  // Click on it
  await fireEvent.click(deleteButton);

  // wait deleteContainerMock is called
  while (deleteContainersByLabelMock.mock.calls.length === 0) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Expect deleteContainerMock to be called / successfully clicked
  expect(deleteContainersByLabelMock).toBeCalledWith('podman', 'com.docker.compose.project', groupName);
  expect(deleteContainersByLabelMock).toBeCalledTimes(1);
});
