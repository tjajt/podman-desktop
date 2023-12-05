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
import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import ListItemButtonIcon from './ListItemButtonIcon.svelte';
import { faRocket } from '@fortawesome/free-solid-svg-icons';
import { ContextUI } from '../context/context';
import { context } from '/@/stores/context';

test('Expect the dropDownMenuItem to have classes that display a disabled object if the disabled when clause is evaluated to true', async () => {
  const title = 'title';

  const contextUI = new ContextUI();
  contextUI.setValue('values', ['test']);
  context.set(contextUI);

  render(ListItemButtonIcon, {
    title,
    icon: faRocket,
    disabledWhen: 'test in values',
    menu: true,
  });

  const listItemSpan = screen.getByTitle(title);
  expect(listItemSpan).toBeInTheDocument();
  expect(listItemSpan.parentElement!.outerHTML.indexOf('text-gray-900 bg-charcoal-800') > 0).toBeTruthy();
});

test('Expect the dropDownMenuItem to have classes that display a disabled object if the disabled when clause is true', async () => {
  const title = 'title';

  render(ListItemButtonIcon, {
    title,
    icon: faRocket,
    disabledWhen: 'true',
    menu: true,
  });

  const listItemSpan = screen.getByTitle(title);
  expect(listItemSpan).toBeInTheDocument();
  expect(listItemSpan.parentElement!.outerHTML.indexOf('text-gray-900 bg-charcoal-800') > 0).toBeTruthy();
});

test('Expect the dropDownMenuItem NOT to have classes that display a disabled object if the disabled when clause is evaluated to false', async () => {
  const title = 'title';

  const contextUI = new ContextUI();
  contextUI.setValue('values', ['test']);
  context.set(contextUI);

  render(ListItemButtonIcon, {
    title,
    icon: faRocket,
    disabledWhen: 'unknown in values',
    menu: true,
  });

  const listItemSpan = screen.getByTitle(title);
  expect(listItemSpan).toBeInTheDocument();
  expect(listItemSpan.parentElement!.outerHTML.indexOf('text-gray-900 bg-charcoal-800') === -1).toBeTruthy();
});

test('Expect the dropDownMenuItem NOT to have classes that display a disabled object if the disabled when clause is false', async () => {
  const title = 'title';

  render(ListItemButtonIcon, {
    title,
    icon: faRocket,
    disabledWhen: 'false',
    menu: true,
  });

  const listItemSpan = screen.getByTitle(title);
  expect(listItemSpan).toBeInTheDocument();
  expect(listItemSpan.parentElement!.outerHTML.indexOf('text-gray-900 bg-charcoal-800') === -1).toBeTruthy();
});

test('Expect the dropDownMenuItem NOT to have classes that display a disabled object if the disabled when clause is empty', async () => {
  const title = 'title';

  render(ListItemButtonIcon, {
    title,
    icon: faRocket,
    disabledWhen: '',
    menu: true,
  });

  const listItemSpan = screen.getByTitle(title);
  expect(listItemSpan).toBeInTheDocument();
  expect(listItemSpan.parentElement!.outerHTML.indexOf('text-gray-900 bg-charcoal-800') === -1).toBeTruthy();
});
