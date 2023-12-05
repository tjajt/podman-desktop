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
import { BasePage } from './base-page';

export class ImageEditPage extends BasePage {
  readonly name: string;
  readonly cancelButton: Locator;
  readonly saveButton: Locator;
  readonly imageName: Locator;
  readonly imageTag: Locator;
  constructor(page: Page, name: string) {
    super(page);
    this.imageName = page.getByLabel('imageName');
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.saveButton = page.getByRole('button', { name: 'Save' });
    this.name = name;
    this.imageTag = page.getByLabel('imageTag');
  }
}
