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

import { beforeEach, expect, test, vi } from 'vitest';
import { DeploymentUtils } from './deployment-utils';
import type { V1Deployment } from '@kubernetes/client-node';

let deploymentUtils: DeploymentUtils;

beforeEach(() => {
  vi.clearAllMocks();
  deploymentUtils = new DeploymentUtils();
});

test('expect basic UI conversion', async () => {
  const deployment = {
    metadata: {
      name: 'my-deployment',
      namespace: 'test-namespace',
    },
    status: {
      replicas: 4,
      readyReplicas: 2,
    },
  } as V1Deployment;
  const deploymentUI = deploymentUtils.getDeploymentUI(deployment);
  expect(deploymentUI.name).toEqual('my-deployment');
  expect(deploymentUI.namespace).toEqual('test-namespace');
  expect(deploymentUI.replicas).toEqual(4);
  expect(deploymentUI.ready).toEqual(2);
});
