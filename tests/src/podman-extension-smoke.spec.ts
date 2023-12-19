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

import type { Page } from 'playwright';
import type { RunnerTestContext } from './testContext/runner-test-context';
import { afterAll, beforeAll, test, describe, beforeEach } from 'vitest';
import { PodmanDesktopRunner } from './runner/podman-desktop-runner';
import { WelcomePage } from './model/pages/welcome-page';
import type { DashboardPage } from './model/pages/dashboard-page';
import { expect as playExpect } from '@playwright/test';
import { NavigationBar } from './model/workbench/navigation';
import type { SettingsBar } from './model/pages/settings-bar';
import { SettingsExtensionsPage } from './model/pages/settings-extensions-page';
import { ExtensionPage } from './model/pages/extension-page';

const SETTINGS_EXTENSIONS_TABLE_PODMAN_TITLE: string = 'podman';
const SETTINGS_EXTENSIONS_TABLE_EXTENSION_STATUS_LABEL: string = 'connection-status-label';
const PODMAN_EXTENSION_STATUS_RUNNING: string = 'RUNNING';
const PODMAN_EXTENSION_STATUS_OFF: string = 'OFF';
const SETTINGS_NAVBAR_PREFERENCES_PODMAN_EXTENSION: string = 'Extension: Podman';
const SETTINGS_NAVBAR_EXTENSIONS_PODMAN: string = 'Podman';
const PODMAN_EXTENSION_PAGE_HEADING: string = 'Podman Extension';
const PODMAN_EXTENSION_PAGE_STATUS_ENABLED: string = 'ENABLED';
const PODMAN_EXTENSION_PAGE_STATUS_DISABLED: string = 'DISABLED';

let pdRunner: PodmanDesktopRunner;
let page: Page;
let dashboardPage: DashboardPage;
let settingsBar: SettingsBar;
let navigationBar: NavigationBar;

beforeAll(async () => {
  pdRunner = new PodmanDesktopRunner();
  page = await pdRunner.start();
  pdRunner.setVideoName('settings-extensions-e2e');

  const welcomePage = new WelcomePage(page);
  await welcomePage.handleWelcomePage(true);
  navigationBar = new NavigationBar(page);
});

afterAll(async () => {
  await pdRunner.close();
}, 120000);

beforeEach<RunnerTestContext>(async ctx => {
  ctx.pdRunner = pdRunner;
});

describe('Verification of Podman extension', async () => {
  test('Podman is enabled and present', async () => {
    await verifyPodmanExtensionStatus(true);
  });
  test('Podman extension can be disabled from Podman Extension Page', async () => {
    await openSettingsExtensionsPage();
    const podmanExtensionPage = await openSettingsExtensionsPodmanPage();
    await podmanExtensionPage.disableButton.click();
    await verifyPodmanExtensionStatus(false);
  });
  test('Podman extension can be re-enabled from Settings Extension Page', async () => {
    const settingsExtensionsPage = await openSettingsExtensionsPage();
    const podmanExtensionRowLocator = settingsExtensionsPage.getExtensionRowFromTable(
      SETTINGS_EXTENSIONS_TABLE_PODMAN_TITLE,
    );
    await settingsExtensionsPage.getExtensionStartButton(podmanExtensionRowLocator).click();
    await verifyPodmanExtensionStatus(true);
  });
});

async function verifyPodmanExtensionStatus(enabled: boolean) {
  dashboardPage = await navigationBar.openDashboard();
  const podmanProviderLocator = dashboardPage.getPodmanStatusLocator();
  enabled
    ? await playExpect(podmanProviderLocator).toBeVisible()
    : await playExpect(podmanProviderLocator).not.toBeVisible();
  // always present and visible
  const settingsExtensionsPage = await openSettingsExtensionsPage();
  const podmanExtensionRowLocator = settingsExtensionsPage.getExtensionRowFromTable(
    SETTINGS_EXTENSIONS_TABLE_PODMAN_TITLE,
  );
  await playExpect(podmanExtensionRowLocator).toBeVisible();
  const connectionStatusLabel = podmanExtensionRowLocator.getByLabel(SETTINGS_EXTENSIONS_TABLE_EXTENSION_STATUS_LABEL);
  await playExpect(connectionStatusLabel).toBeVisible();
  const connectionStatusLocatorText = await connectionStatusLabel.innerText({ timeout: 3000 });
  // --------------------------
  await playExpect(
    enabled
      ? settingsExtensionsPage.getExtensionStopButton(podmanExtensionRowLocator)
      : settingsExtensionsPage.getExtensionStartButton(podmanExtensionRowLocator),
  ).toBeVisible();
  playExpect(
    enabled
      ? connectionStatusLocatorText === PODMAN_EXTENSION_STATUS_RUNNING
      : connectionStatusLocatorText === PODMAN_EXTENSION_STATUS_OFF,
  ).toBeTruthy();
  // always present and visible
  const podmanExtensionPage = await openSettingsExtensionsPodmanPage();
  await playExpect(podmanExtensionPage.heading).toBeVisible();
  // --------------------------
  if (enabled) {
    await playExpect(podmanExtensionPage.enableButton).toBeDisabled({ timeout: 10000 });
    await playExpect(podmanExtensionPage.disableButton).toBeEnabled({ timeout: 10000 });
    await playExpect(podmanExtensionPage.status.getByText(PODMAN_EXTENSION_PAGE_STATUS_ENABLED)).toBeVisible();
  } else {
    await playExpect(podmanExtensionPage.enableButton).toBeEnabled({ timeout: 10000 });
    await playExpect(podmanExtensionPage.disableButton).toBeDisabled({ timeout: 10000 });
    await playExpect(podmanExtensionPage.status.getByText(PODMAN_EXTENSION_PAGE_STATUS_DISABLED)).toBeVisible();
  }
  // expand Settings -> Preferences menu
  await settingsBar.preferencesTab.click();
  enabled
    ? await playExpect(
        settingsBar.getSettingsNavBarTabLocator(SETTINGS_NAVBAR_PREFERENCES_PODMAN_EXTENSION),
      ).toBeVisible()
    : await playExpect(
        settingsBar.getSettingsNavBarTabLocator(SETTINGS_NAVBAR_PREFERENCES_PODMAN_EXTENSION),
      ).not.toBeVisible();
  // collapse Settings -> Preferences menu
  await settingsBar.preferencesTab.click();
}

async function openSettingsExtensionsPage(): Promise<SettingsExtensionsPage> {
  await navigationBar.openDashboard();
  settingsBar = await navigationBar.openSettings();
  return settingsBar.openTabPage(SettingsExtensionsPage);
}

async function openSettingsExtensionsPodmanPage(): Promise<ExtensionPage> {
  const podmanExtensionNavBarLocator = settingsBar.getSettingsNavBarTabLocator(SETTINGS_NAVBAR_EXTENSIONS_PODMAN);
  await podmanExtensionNavBarLocator.click();
  return new ExtensionPage(page, SETTINGS_NAVBAR_EXTENSIONS_PODMAN, PODMAN_EXTENSION_PAGE_HEADING);
}
