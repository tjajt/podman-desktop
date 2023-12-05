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

import path from 'node:path';
import { coverageConfig, testConfig } from '../../vitest-shared-extensions.config';

const PACKAGE_ROOT = __dirname;
const PACKAGE_NAME = 'extensions/kube-context';

/**
 * Config for global end-to-end tests
 * placed in project root tests folder
 * @type {import('vite').UserConfig}
 * @see https://vitest.dev/config/
 */

const config = {
  test: {
    ...testConfig(),
    ...coverageConfig(PACKAGE_ROOT, PACKAGE_NAME),
  },
  resolve: {
    alias: {
      '@podman-desktop/api': path.resolve(PACKAGE_ROOT, '../../', '__mocks__/@podman-desktop/api.js'),
    },
  },
};

export default config;
