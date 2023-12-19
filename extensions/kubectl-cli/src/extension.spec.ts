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
/* eslint-disable @typescript-eslint/no-explicit-any */

import { test, expect, vi, beforeEach } from 'vitest';
import * as extensionApi from '@podman-desktop/api';
import * as KubectlExtension from './extension';
import { afterEach } from 'node:test';
import type { Configuration } from '@podman-desktop/api';
import * as path from 'node:path';

const extensionContext = {
  subscriptions: [],
  storagePath: '/tmp/kubectl-cli',
} as extensionApi.ExtensionContext;

vi.mock('@podman-desktop/api', () => {
  return {
    cli: {
      createCliTool: vi.fn(),
    },
    process: {
      exec: vi.fn(),
    },
    env: {
      isMac: true,
      isWindows: false,
      isLinux: false,
      createTelemetryLogger: vi.fn(),
    },
    configuration: {
      getConfiguration: vi.fn(),
      onDidChangeConfiguration: vi.fn(),
    },
    context: {
      setValue: vi.fn(),
    },
    commands: {
      registerCommand: vi.fn(),
    },
    provider: {
      createProvider: vi.fn(),
    },
  };
});

beforeEach(() => {
  vi.mocked(extensionApi.configuration.getConfiguration).mockReturnValue({
    update: vi.fn(),
  } as unknown as Configuration);
  vi.mocked(extensionApi.process.exec).mockClear();
});

afterEach(() => {
  vi.resetAllMocks();
});

const log = console.log;

const jsonStdout = {
  clientVersion: {
    major: '1',
    minor: '28',
    gitVersion: 'v1.28.3',
    gitCommit: 'a8a1abc25cad87333840cd7d54be2efaf31a3177',
    gitTreeState: 'clean',
    buildDate: '2023-10-18T11:33:16Z',
    goVersion: 'go1.20.10',
    compiler: 'gc',
    platform: 'darwin/arm64',
  },
  kustomizeVersion: 'v5.0.4-0.20230601165947-6ce0bf390ce3',
};

test('kubectl CLI tool registered when detected and extension is activated', async () => {
  vi.mocked(extensionApi.process.exec).mockResolvedValue({
    stderr: '',
    stdout: JSON.stringify(jsonStdout),
    command: 'kubectl version --client=true -o=json',
  });

  const deferred = new Promise<void>(resolve => {
    vi.mocked(extensionApi.cli.createCliTool).mockImplementation(() => {
      resolve();
      return {} as extensionApi.CliTool;
    });
  });

  await KubectlExtension.activate(extensionContext);

  return deferred.then(() => {
    expect(extensionApi.cli.createCliTool).toBeCalled();
    expect(extensionApi.cli.createCliTool).toBeCalledWith(
      expect.objectContaining({
        name: 'kubectl',
        version: '1.28.3',
      }),
    );
  });
});

test('kubectl CLI tool not registered when not detected', async () => {
  vi.mocked(extensionApi.process.exec).mockRejectedValue(new Error('Error running version command'));
  const deferred = new Promise<void>(resolve => {
    vi.spyOn(console, 'warn').mockImplementation(() => {
      resolve();
    });
  });

  await KubectlExtension.activate(extensionContext);

  return deferred.then(() => {
    expect(console.warn).toBeCalled();
    expect(console.warn).toBeCalledWith(expect.stringContaining('Error running version command'));
  });
});

test('kubectl CLI tool not registered when version json stdout cannot be parsed', async () => {
  vi.mocked(extensionApi.process.exec).mockResolvedValue({
    stderr: '',
    stdout: `{${JSON.stringify(jsonStdout)}`,
    command: 'kubectl version --client=true -o=json',
  });

  const deferred = new Promise<void>(resolve => {
    vi.spyOn(console, 'warn').mockImplementation((message: string) => {
      log(message);
      resolve();
    });
  });

  await KubectlExtension.activate(extensionContext);

  return deferred.then(() => {
    expect(console.warn).toBeCalled();
    expect(console.warn).toBeCalledWith(
      expect.stringContaining(
        'Error getting kubectl from user PATH: SyntaxError: Unexpected token { in JSON at position 1',
      ),
    );
  });
});

test('kubectl CLI tool not registered when version cannot be extracted from object', async () => {
  const wrongJsonStdout = {
    clientVersion: {
      ...jsonStdout.clientVersion,
    },
  };
  delete (wrongJsonStdout.clientVersion as any).gitVersion;
  vi.mocked(extensionApi.process.exec).mockResolvedValue({
    stderr: '',
    stdout: JSON.stringify(wrongJsonStdout),
    command: 'kubectl version --client=true -o=json',
  });

  const deferred = new Promise<void>(resolve => {
    vi.spyOn(console, 'warn').mockImplementation((message: string) => {
      log(message);
      resolve();
    });
  });

  await KubectlExtension.activate(extensionContext);

  return deferred.then(() => {
    expect(console.warn).toBeCalled();
    expect(console.warn).toBeCalledWith(expect.stringContaining('Error: Cannot extract version from stdout'));
  });
});

test('kubectl CLI tool not registered when version cannot be extracted from object', async () => {
  const wrongJsonStdout = {
    clientVersion: {
      ...jsonStdout.clientVersion,
    },
  };
  delete (wrongJsonStdout.clientVersion as any).gitVersion;
  vi.mocked(extensionApi.process.exec).mockResolvedValue({
    stderr: '',
    stdout: JSON.stringify(wrongJsonStdout),
    command: 'kubectl version --client=true -o=json',
  });

  const deferred = new Promise<void>(resolve => {
    vi.spyOn(console, 'warn').mockImplementation((message: string) => {
      log(message);
      resolve();
    });
  });

  await KubectlExtension.activate(extensionContext);

  return deferred.then(() => {
    expect(console.warn).toBeCalled();
    expect(console.warn).toBeCalledWith(expect.stringContaining('Error: Cannot extract version from stdout'));
  });
});

test('getStorageKubectlPath', async () => {
  // get current directory
  const currentDirectory = process.cwd();

  const extensionContext = {
    storagePath: currentDirectory,
  } as unknown as extensionApi.ExtensionContext;

  const storagePath = KubectlExtension.getStorageKubectlPath(extensionContext);
  expect(storagePath).toContain(path.resolve(currentDirectory, 'bin', 'kubectl'));
});

test('findKubeCtl with global kubectl being installed on macOS', async () => {
  // get current directory
  const currentDirectory = process.cwd();

  const extensionContext = {
    storagePath: currentDirectory,
  } as unknown as extensionApi.ExtensionContext;

  // first call is replying the kubectl version
  vi.mocked(extensionApi.process.exec).mockResolvedValueOnce({
    stderr: '',
    stdout: JSON.stringify(jsonStdout),
    command: 'kubectl version --client=true -o=json',
  });

  //
  vi.mocked(extensionApi.env).isMac = true;

  // second call is replying the path to kubectl
  vi.mocked(extensionApi.process.exec).mockResolvedValueOnce({
    stderr: '',
    stdout: '/fake/directory/kubectl',
    command: 'which kubectl',
  });

  const { version, path } = await KubectlExtension.findKubeCtl(extensionContext);
  expect(version).toBe('1.28.3');
  expect(path).toBe('/fake/directory/kubectl');

  // expect we call with which
  expect(extensionApi.process.exec).toBeCalledWith('which', expect.anything());
});

test('findKubeCtl with global kubectl being installed on Windows', async () => {
  // get current directory
  const currentDirectory = process.cwd();

  const extensionContext = {
    storagePath: currentDirectory,
  } as unknown as extensionApi.ExtensionContext;

  // first call is replying the kubectl version
  vi.mocked(extensionApi.process.exec).mockResolvedValueOnce({
    stderr: '',
    stdout: JSON.stringify(jsonStdout),
    command: 'kubectl version --client=true -o=json',
  });

  //
  vi.mocked(extensionApi.env).isMac = false;
  vi.mocked(extensionApi.env).isLinux = false;
  vi.mocked(extensionApi.env).isWindows = true;

  // second call is replying the path to kubectl
  vi.mocked(extensionApi.process.exec).mockResolvedValueOnce({
    stderr: '',
    stdout: '/fake/directory/kubectl',
    command: 'which kubectl',
  });

  const { version, path } = await KubectlExtension.findKubeCtl(extensionContext);
  expect(version).toBe('1.28.3');
  expect(path).toBe('/fake/directory/kubectl');

  // expect we call with which
  expect(extensionApi.process.exec).toBeCalledWith('where', expect.anything());
});

test('findKubeCtl not global kubectl but in storage installed on macOS', async () => {
  // get current directory
  const fakeStorageDirectory = '/fake/directory';

  const extensionContext = {
    storagePath: fakeStorageDirectory,
  } as unknown as extensionApi.ExtensionContext;

  // first call is replying the kubectl version
  vi.mocked(extensionApi.process.exec).mockRejectedValueOnce(new Error('Error running kubectl command'));

  //
  vi.mocked(extensionApi.env).isMac = true;

  // second call is replying the path to storage kubectl
  vi.mocked(extensionApi.process.exec).mockResolvedValueOnce({
    stderr: '',
    stdout: JSON.stringify(jsonStdout),
    command: 'kubectl version --client=true -o=json',
  });

  // mock extension storage path
  vi.spyOn(KubectlExtension, 'getStorageKubectlPath').mockReturnValue('/fake/directory/kubectl');

  const { version, path } = await KubectlExtension.findKubeCtl(extensionContext);
  expect(version).toBe('1.28.3');
  expect(path).toContain('fake');
  expect(path).toContain('directory');
  expect(path).toContain('bin');
  expect(path).toContain('kubectl');

  // expect no call with which
  expect(extensionApi.process.exec).not.toBeCalledWith('which', expect.anything());
});
