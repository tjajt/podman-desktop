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

import '@testing-library/jest-dom/vitest';
import { test, expect, vi, beforeAll } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';

import PodDetails from './PodDetails.svelte';
import { get } from 'svelte/store';
import { podsInfos } from '/@/stores/pods';
import type { PodInfo } from '../../../../main/src/plugin/api/pod-info';

import { router } from 'tinro';
import { lastPage } from '/@/stores/breadcrumb';

const listPodsMock = vi.fn();
const listContainersMock = vi.fn();
const kubernetesListPodsMock = vi.fn();

const myPod: PodInfo = {
  Cgroup: '',
  Containers: [],
  Created: '',
  Id: 'beab25123a40',
  InfraId: 'pod1',
  Labels: {},
  Name: 'myPod',
  Namespace: '',
  Networks: [],
  Status: 'running',
  engineId: 'engine0',
  engineName: 'podman',
  kind: 'podman',
};

const removePodMock = vi.fn();
const getContributedMenusMock = vi.fn();

beforeAll(() => {
  (window as any).listPods = listPodsMock;
  (window as any).listContainers = listContainersMock.mockResolvedValue([]);
  (window as any).kubernetesListPods = kubernetesListPodsMock;
  (window as any).removePod = removePodMock;
  (window as any).getContributedMenus = getContributedMenusMock;
  getContributedMenusMock.mockImplementation(() => Promise.resolve([]));
});

test('Expect redirect to previous page if pod is deleted', async () => {
  const routerGotoSpy = vi.spyOn(router, 'goto');
  listPodsMock.mockResolvedValue([myPod]);
  kubernetesListPodsMock.mockResolvedValue([]);
  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  while (get(podsInfos).length !== 1) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // remove myPod from the store when we call 'removePod'
  // it will then refresh the store and update PodsDetails page
  removePodMock.mockImplementation(() => {
    podsInfos.update(pods => pods.filter(pod => pod.Id !== myPod.Id));
  });

  // defines a fake lastPage so we can check where we will be redirected
  lastPage.set({ name: 'Fake Previous', path: '/last' });

  // render the component
  render(PodDetails, { podName: 'myPod', engineId: 'engine0', kind: 'podman' });

  // grab current route
  const currentRoute = window.location;
  expect(currentRoute.href).toBe('http://localhost:3000/');

  // click on delete pod button
  const deleteButton = screen.getByRole('button', { name: 'Delete Pod' });
  await fireEvent.click(deleteButton);

  // check that remove method has been called
  expect(removePodMock).toHaveBeenCalled();

  // expect that we have called the router when page has been removed
  // to jump to the previous page
  expect(routerGotoSpy).toBeCalledWith('/last');

  // grab updated route
  const afterRoute = window.location;
  expect(afterRoute.href).toBe('http://localhost:3000/last');
});
