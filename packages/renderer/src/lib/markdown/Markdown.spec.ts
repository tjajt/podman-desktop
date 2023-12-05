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
import { test, expect, describe, beforeAll, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import Markdown from './Markdown.svelte';

async function waitRender(customProperties: object): Promise<void> {
  const result = render(Markdown, { ...customProperties });
  // wait that result.component.$$.ctx[0] is set
  while (result.component.$$.ctx[0] === undefined) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

beforeAll(() => {
  (window as any).executeCommand = vi.fn();
});

test('Expect to have bold', async () => {
  await waitRender({ markdown: '**bold**' });
  const markdownContent = screen.getByRole('region', { name: 'markdown-content' });
  expect(markdownContent).toBeInTheDocument();
  expect(markdownContent).toContainHTML('<strong>bold</strong>');
});

test('Expect to have italic', async () => {
  await waitRender({ markdown: '_italic_' });
  const markdownContent = screen.getByRole('region', { name: 'markdown-content' });
  expect(markdownContent).toBeInTheDocument();
  expect(markdownContent).toContainHTML('<em>italic</em>');
});

describe('Custom button', () => {
  test('Expect button to be rendered as a link without attributes', async () => {
    await waitRender({ markdown: ':button[Name of the button]' });
    const markdownContent = screen.getByRole('region', { name: 'markdown-content' });
    expect(markdownContent).toBeInTheDocument();
    expect(markdownContent).toContainHTML(
      '<a class="px-4 py-[6px] rounded-[4px] text-white text-[13px] whitespace-nowrap bg-purple-600 hover:bg-purple-500 no-underline">Name of the button</a>',
    );
  });

  test('Expect button to be rendered as a link with all attributes', async () => {
    await waitRender({ markdown: ':button[Name of the button]{href=https://my-link title="tooltip text"}' });
    const markdownButton = screen.getByRole('link');
    expect(markdownButton).toBeInTheDocument();
    expect(markdownButton).toHaveTextContent('Name of the button');
    expect(markdownButton).toHaveAttribute('href', 'https://my-link');
    expect(markdownButton).toHaveAttribute('title', 'tooltip text');
  });

  test('Expect button to be rendered as a button with attributes', async () => {
    await waitRender({ markdown: ':button[Name of the button]{command=command}' });
    const markdownContent = screen.getByRole('region', { name: 'markdown-content' });
    expect(markdownContent).toBeInTheDocument();
    expect(markdownContent).toContainHTML(
      '<button class="px-4 py-[6px] rounded-[4px] text-white text-[13px] whitespace-nowrap bg-purple-600 hover:bg-purple-500 no-underline"',
    );
    expect(markdownContent).toContainHTML('data-command="command"');
    expect(markdownContent).toContainHTML('Name of the button</button>');
  });
});

describe('Custom link', () => {
  test('Expect link to be rendered as a link without attributes', async () => {
    await waitRender({ markdown: ':link[Name of the link]' });
    const markdownContent = screen.getByRole('region', { name: 'markdown-content' });
    expect(markdownContent).toBeInTheDocument();
    expect(markdownContent).toContainHTML('<a>Name of the link</a>');
  });

  test('Expect link to be rendered as a link with all attributes', async () => {
    await waitRender({ markdown: ':link[Name of the link]{href=https://my-link title="tooltip text"}' });
    const markdownLink = screen.getByRole('link');
    expect(markdownLink).toBeInTheDocument();
    expect(markdownLink).toHaveTextContent('Name of the link');
    expect(markdownLink).toHaveAttribute('href', 'https://my-link');
    expect(markdownLink).toHaveAttribute('title', 'tooltip text');
  });

  test('Expect link to be rendered as a link without href and with command attribute', async () => {
    await waitRender({ markdown: ':link[Name of the link]{command=example.onboarding.command.checkRequirements}' });
    const markdownContent = screen.getByRole('region', { name: 'markdown-content' });
    expect(markdownContent).toBeInTheDocument();
    expect(markdownContent).toContainHTML(
      '<a data-command="example.onboarding.command.checkRequirements">Name of the link</a>',
    );
  });
});

describe('Custom warnings', () => {
  test('Expect warning failed status and description', async () => {
    const warnings = [
      {
        state: 'failed',
        description: 'description',
      },
    ];

    await waitRender({ markdown: `:warnings[${JSON.stringify(warnings)}]` });
    const markdownContent = screen.getByRole('region', { name: 'markdown-content' });
    expect(markdownContent).toBeInTheDocument();
    expect(markdownContent.textContent).toContain('description');
    expect(markdownContent.textContent).toContain('❌');
  });

  test('Expect warning successful status and description', async () => {
    const warnings = [
      {
        state: 'successful',
        description: 'successful description',
      },
    ];

    await waitRender({ markdown: `:warnings[${JSON.stringify(warnings)}]` });
    const markdownContent = screen.getByRole('region', { name: 'markdown-content' });
    expect(markdownContent).toBeInTheDocument();
    expect(markdownContent.textContent).toContain('successful description');
    expect(markdownContent.textContent).toContain('✅');
  });

  test('Expect command, docdescription and links to be rendered correctly', async () => {
    const warnings = [
      {
        state: 'successful',
        description: 'successful description',
        command: {
          id: 'command',
          title: 'command title',
        },
        docDescription: 'this is the doc description',
        docLinks: [
          {
            url: 'url',
            title: 'first link',
          },
        ],
      },
    ];

    await waitRender({ markdown: `:warnings[${JSON.stringify(warnings)}]` });
    const markdownContent = screen.getByRole('region', { name: 'markdown-content' });
    expect(markdownContent).toBeInTheDocument();
    expect(markdownContent.textContent).toContain('this is the doc description');
    const button = screen.getByRole('button', { name: 'command title' });
    expect(button).toBeDefined();
    // open expandable section to check if link is there
    const moreInfoButton = screen.getByRole('button', { name: 'micromark-expandable-4' });
    expect(moreInfoButton).toBeDefined();
    await fireEvent.click(moreInfoButton);

    const link = screen.getByRole('link', { name: 'first link' });
    expect(link).toBeDefined();
  });

  test('Expect button to be in error mode if execution fails', async () => {
    vi.spyOn(window, 'executeCommand').mockRejectedValue('error');
    const warnings = [
      {
        state: 'failed',
        description: 'failed description',
        command: {
          id: 'command',
          title: 'command title',
        },
        docDescription: 'this is the doc description',
        docLinks: [
          {
            url: 'url',
            title: 'first link',
          },
        ],
      },
    ];

    await waitRender({ markdown: `:warnings[${JSON.stringify(warnings)}]` });
    const markdownContent = screen.getByRole('region', { name: 'markdown-content' });
    expect(markdownContent).toBeInTheDocument();
    expect(markdownContent.textContent).toContain('this is the doc description');
    const button = screen.getByRole('button', { name: 'command title' });
    expect(button).toBeDefined();
    await fireEvent.click(button);

    const buttonFailedStatus = await screen.findByText('command title failed');
    expect(buttonFailedStatus).toBeDefined();
  });
});
