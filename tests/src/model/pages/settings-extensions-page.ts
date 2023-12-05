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

import type { Locator, Page } from '@playwright/test';
import { SettingsPage } from './settings-page';

export class SettingsExtensionsPage extends SettingsPage {
  readonly heading: Locator;
  readonly featuredExtensions: Locator;
  readonly devSandboxBox: Locator;
  readonly openshiftLocalBox: Locator;
  readonly extensionsTable: Locator;

  constructor(page: Page) {
    super(page, 'Extensions');
    this.heading = page.getByText('Extensions');
    this.featuredExtensions = page.getByLabel('FeaturedExtensions');
    this.devSandboxBox = this.featuredExtensions.getByLabel('Developer Sandbox');
    this.openshiftLocalBox = this.featuredExtensions.getByLabel('OpenShift Local');
    this.extensionsTable = page.getByRole('table');
  }

  public getExtensionRowFromTable(extensionName: string): Locator {
    return this.extensionsTable.getByRole('row', { name: extensionName });
  }

  public getExtensionStopButton(extensionRow: Locator): Locator {
    return extensionRow.getByLabel('Extension Action Stop');
  }

  public getExtensionStartButton(extensionRow: Locator): Locator {
    return extensionRow.getByLabel('Extension Action Start');
  }

  public getFeaturedExtension(extensionName: string): Locator {
    return this.featuredExtensions.getByLabel(extensionName, { exact: true });
  }
}
