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
import FormPageSpec from './FormPageSpec.svelte';

test('Expect icon slot is defined', async () => {
  render(FormPageSpec);

  const element = screen.getByLabelText('icon');
  expect(element).toBeInTheDocument();
});

test('Expect actions slot is defined', async () => {
  render(FormPageSpec);

  const element = screen.getByLabelText('actions');
  expect(element).toBeInTheDocument();
});

test('Expect content slot is defined', async () => {
  render(FormPageSpec);

  const element = screen.getByLabelText('content');
  expect(element).toBeInTheDocument();
});

test('Expect tabs slot is defined', async () => {
  render(FormPageSpec);

  const fooTabElement = screen.getByRole('link', { name: 'Foo' });
  expect(fooTabElement).toBeInTheDocument();

  const barTabElement = screen.getByRole('link', { name: 'Bar' });
  expect(barTabElement).toBeInTheDocument();

  const bazTabElement = screen.getByRole('link', { name: 'Baz' });
  expect(bazTabElement).toBeInTheDocument();
});
