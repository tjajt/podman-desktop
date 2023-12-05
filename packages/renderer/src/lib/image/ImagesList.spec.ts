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
import { render, screen } from '@testing-library/svelte';
import ImagesList from './ImagesList.svelte';
import { imagesInfos } from '../../stores/images';
import { get } from 'svelte/store';
import { providerInfos } from '../../stores/providers';

const listImagesMock = vi.fn();
const getProviderInfosMock = vi.fn();

// fake the window.events object
beforeAll(() => {
  (window as any).getConfigurationValue = vi.fn();
  (window as any).updateConfigurationValue = vi.fn();
  (window as any).getContributedMenus = vi.fn();
  const onDidUpdateProviderStatusMock = vi.fn();
  (window as any).onDidUpdateProviderStatus = onDidUpdateProviderStatusMock;
  onDidUpdateProviderStatusMock.mockImplementation(() => Promise.resolve());
  (window as any).hasAuthconfigForImage = vi.fn();
  (window as any).hasAuthconfigForImage.mockImplementation(() => Promise.resolve(false));

  (window as any).listContainers = vi.fn();
  (window as any).listImages = listImagesMock;
  (window as any).getProviderInfos = getProviderInfosMock;

  (window.events as unknown) = {
    receive: (_channel: string, func: any) => {
      func();
    },
  };
});

async function waitRender(customProperties: object): Promise<void> {
  const result = render(ImagesList, { ...customProperties });
  // wait that result.component.$$.ctx[2] is set
  while (result.component.$$.ctx[2] === undefined) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

test('Expect no container engines being displayed', async () => {
  render(ImagesList);
  const noEngine = screen.getByRole('heading', { name: 'No Container Engine' });
  expect(noEngine).toBeInTheDocument();
});

test('Expect images being ordered by newest first', async () => {
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

  listImagesMock.mockResolvedValue([
    {
      Id: 'sha256:1234567890123',
      RepoTags: ['fedora:old'],
      Created: 1644009612,
      Size: 123,
      Status: 'Running',
      engineId: 'podman',
      engineName: 'podman',
    },
    {
      Id: 'sha256:456456456456456',
      RepoTags: ['veryold:image'],
      Created: 1,
      Size: 1234,
      Status: 'Running',
      engineId: 'podman',
      engineName: 'podman',
    },
    {
      Id: 'sha256:7897891234567890123',
      RepoTags: ['fedora:recent'],
      Created: 1644109612,
      Size: 123,
      Status: 'Running',
      engineId: 'podman',
      engineName: 'podman',
    },
  ]);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('image-build'));

  // wait store are populated
  while (get(imagesInfos).length === 0) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  while (get(providerInfos).length === 0) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  await waitRender({});

  const fedoraRecent = screen.getByRole('cell', { name: 'fedora 789789123456 recent' });
  const fedoraOld = screen.getByRole('cell', { name: 'fedora 123456789012 old' });
  const veryOld = screen.getByRole('cell', { name: 'veryold 456456456456 image' });
  expect(fedoraRecent).toBeInTheDocument();
  expect(fedoraOld).toBeInTheDocument();
  expect(veryOld).toBeInTheDocument();

  expect(fedoraRecent.compareDocumentPosition(fedoraOld)).toBe(4);
  expect(fedoraRecent.compareDocumentPosition(veryOld)).toBe(4);
  expect(fedoraOld.compareDocumentPosition(veryOld)).toBe(4);
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

  listImagesMock.mockResolvedValue([
    {
      Id: 'sha256:1234567890123',
      RepoTags: ['fedora:old'],
      Created: 1644009612,
      Size: 123,
      Status: 'Running',
      engineId: 'podman',
      engineName: 'podman',
    },
  ]);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('image-build'));

  // wait store are populated
  while (get(imagesInfos).length === 0) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  while (get(providerInfos).length === 0) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  await waitRender({ searchTerm: 'No match' });

  const filterButton = screen.getByRole('button', { name: 'Clear filter' });
  expect(filterButton).toBeInTheDocument();
});
