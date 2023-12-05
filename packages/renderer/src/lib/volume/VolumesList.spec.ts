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
import { beforeAll, test, expect, vi, beforeEach, describe } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import VolumesList from './VolumesList.svelte';
import { get } from 'svelte/store';
import { providerInfos } from '/@/stores/providers';
import { volumeListInfos, volumesEventStore } from '/@/stores/volumes';
import type { ProviderInfo } from '../../../../main/src/plugin/api/provider-info';
import userEvent from '@testing-library/user-event';

const listVolumesMock = vi.fn();
const getProviderInfosMock = vi.fn();
const onDidUpdateProviderStatusMock = vi.fn();

// fake the window.events object
beforeAll(() => {
  (window as any).getConfigurationValue = vi.fn();
  (window as any).updateConfigurationValue = vi.fn();
  (window as any).getContributedMenus = vi.fn();

  (window as any).onDidUpdateProviderStatus = onDidUpdateProviderStatusMock;
  (window as any).listVolumes = listVolumesMock;
  (window as any).listImages = vi.fn();

  (window as any).getProviderInfos = getProviderInfosMock;

  (window.events as unknown) = {
    receive: (_channel: string, func: any) => {
      func();
    },
  };
});

beforeEach(() => {
  vi.resetAllMocks();
  vi.clearAllMocks();
  onDidUpdateProviderStatusMock.mockImplementation(() => Promise.resolve());
  getProviderInfosMock.mockResolvedValue([]);
});

async function waitRender(customProperties: object): Promise<void> {
  const result = render(VolumesList, { ...customProperties });
  // wait that result.component.$$.ctx[2] is set
  while (result.component.$$.ctx[2] === undefined) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

test('Expect No Container Engine being displayed', async () => {
  listVolumesMock.mockResolvedValue([]);
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
  render(VolumesList);
  const noEngine = screen.getByRole('heading', { name: 'No Container Engine' });
  expect(noEngine).toBeInTheDocument();
});

test('Expect volumes being displayed once extensions are started (without size data)', async () => {
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

  listVolumesMock.mockResolvedValue([
    {
      Volumes: [
        {
          Driver: 'local',
          Labels: {},
          Mountpoint: '/var/lib/containers/storage/volumes/fedora/_data',
          Name: '0052074a2ade930338c00aea982a90e4243e6cf58ba920eb411c388630b8c967',
          Options: {},
          Scope: 'local',
          engineName: 'Podman',
          engineId: 'podman.Podman Machine',
          UsageData: { RefCount: 1, Size: -1 },
          containersUsage: [],
        },
      ],
    },
  ]);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));

  // ask to fetch the volumes
  const volumesEventStoreInfo = volumesEventStore.setup();

  await volumesEventStoreInfo.fetch();

  // first call is with listing without details
  expect(listVolumesMock).toHaveBeenNthCalledWith(1, false);

  // wait store are populated
  while (get(volumeListInfos).length === 0) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  while (get(providerInfos).length === 0) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  await waitRender({});

  const volumeName = screen.getByRole('cell', { name: '0052074a2ade' });
  // expect size to be N/A
  const volumeSize = screen.getByRole('cell', { name: 'N/A' });
  expect(volumeName).toBeInTheDocument();
  expect(volumeSize).toBeInTheDocument();

  expect(volumeName.compareDocumentPosition(volumeSize)).toBe(4);
});

test('Expect volumes being displayed once extensions are started (with size data)', async () => {
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

  listVolumesMock.mockResolvedValue([
    {
      Volumes: [
        {
          Driver: 'local',
          Labels: {},
          Mountpoint: '/var/lib/containers/storage/volumes/fedora/_data',
          Name: '0052074a2ade930338c00aea982a90e4243e6cf58ba920eb411c388630b8c967',
          Options: {},
          Scope: 'local',
          engineName: 'Podman',
          engineId: 'podman.Podman Machine',
          UsageData: { RefCount: 1, Size: 89 },
          containersUsage: [],
        },
      ],
    },
  ]);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));

  // ask to fetch the volumes
  const volumesEventStoreInfo = volumesEventStore.setup();

  await volumesEventStoreInfo.fetch('fetchUsage');

  // first call is with listing with details
  expect(listVolumesMock).toHaveBeenNthCalledWith(1, true);

  // wait store are populated
  while (get(volumeListInfos).length === 0) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  while (get(providerInfos).length === 0) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  await waitRender({});

  const volumeName = screen.getByRole('cell', { name: '0052074a2ade' });
  const volumeSize = screen.getByRole('cell', { name: '89 B' });
  expect(volumeName).toBeInTheDocument();
  expect(volumeSize).toBeInTheDocument();

  expect(volumeName.compareDocumentPosition(volumeSize)).toBe(4);
});

describe('Create volume', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.clearAllMocks();
  });

  const createVolumeButtonTitle = 'Create';
  test('no create volume button if no providers', async () => {
    providerInfos.set([]);
    await waitRender({});

    // now check if we have a create volume button, it should not be there
    const createVolumeButton = screen.queryByRole('button', { name: createVolumeButtonTitle });
    expect(createVolumeButton).not.toBeInTheDocument();
  });

  test('create volume button is there if there is one provider', async () => {
    providerInfos.set([
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
      } as unknown as ProviderInfo,
    ]);

    await waitRender({});

    // now check if we have a create volume button, it should not be there
    const createVolumeButton = screen.getByRole('button', { name: createVolumeButtonTitle });
    expect(createVolumeButton).toBeInTheDocument();

    // click on the button
    await userEvent.click(createVolumeButton);

    // check we are redirected to the right page
    expect(window.location.pathname).toBe('/volumes/create');
  });
});

test('Expect filter empty screen', async () => {
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

  listVolumesMock.mockResolvedValue([
    {
      Volumes: [
        {
          Driver: 'local',
          Labels: {},
          Mountpoint: '/var/lib/containers/storage/volumes/fedora/_data',
          Name: '0052074a2ade930338c00aea982a90e4243e6cf58ba920eb411c388630b8c967',
          Options: {},
          Scope: 'local',
          engineName: 'Podman',
          engineId: 'podman.Podman Machine',
          UsageData: { RefCount: 1, Size: -1 },
          containersUsage: [],
        },
      ],
    },
  ]);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));

  // ask to fetch the volumes
  const volumesEventStoreInfo = volumesEventStore.setup();

  await volumesEventStoreInfo.fetch();

  // first call is with listing without details
  expect(listVolumesMock).toHaveBeenNthCalledWith(1, false);

  // wait store are populated
  while (get(volumeListInfos).length === 0) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  while (get(providerInfos).length === 0) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  await waitRender({ searchTerm: 'No match' });

  const filterButton = screen.getByRole('button', { name: 'Clear filter' });
  expect(filterButton).toBeInTheDocument();
});
