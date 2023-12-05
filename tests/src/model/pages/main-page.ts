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

/**
 * Abstract representation of a visual page objects of the main content pages of Podman Desktop app: Images,
 * Containers, Volumes and Pods.
 * Is not intended to be directly used, but rather by particular page's implementation.
 */
export abstract class MainPage extends BasePage {
  readonly title: string;
  readonly mainPage: Locator;
  readonly header: Locator;
  readonly search: Locator;
  readonly content: Locator;
  readonly additionalActions: Locator;
  readonly bottomAdditionalActions: Locator;
  readonly heading: Locator;

  constructor(page: Page, title: string) {
    super(page);
    this.title = title;
    this.mainPage = page.getByRole('region', { name: this.title });
    this.header = this.mainPage.getByRole('region', { name: 'header' });
    this.search = this.mainPage.getByRole('region', { name: 'search' });
    this.content = this.mainPage.getByRole('region', { name: 'content' });
    this.additionalActions = this.header.getByRole('group', { name: 'additionalActions' });
    this.bottomAdditionalActions = this.header.getByRole('group', { name: 'bottomAdditionalActions' });
    this.heading = this.header.getByRole('heading', { name: this.title });
  }

  /**
   * Check the presence of items in main page's content.
   * @returns true, if there are any items present in the content's table, false otherwise
   */
  async pageIsEmpty(): Promise<boolean> {
    if (!(await this.noContainerEngine())) {
      const noImagesHeading = this.content.getByRole('heading', { name: `No ${this.title}`, exact: true });
      try {
        await noImagesHeading.waitFor({ state: 'visible', timeout: 500 });
      } catch (err) {
        return false;
      }
    }
    return true;
  }

  async noContainerEngine(): Promise<boolean> {
    const noContainerEngineHeading = this.content.getByRole('heading', { name: 'No Container Engine', exact: true });
    try {
      await noContainerEngineHeading.waitFor({ state: 'visible', timeout: 500 });
    } catch (err) {
      return false;
    }
    return true;
  }

  async getTable(): Promise<Locator> {
    if (!(await this.pageIsEmpty())) {
      return this.content.getByRole('table');
    } else {
      throw Error('Images page is empty, there are no images');
    }
  }
}
