import '@testing-library/jest-dom/vitest';
import { beforeAll, beforeEach, expect, test, vi } from 'vitest';
import ImageDetailsCheck from './ImageDetailsCheck.svelte';
import { fireEvent, render, screen } from '@testing-library/svelte';
import type { ImageChecks } from '@podman-desktop/api';
import { imageCheckerProviders } from '/@/stores/image-checker-providers';

const getCancellableTokenSourceMock = vi.fn();
const imageCheckMock = vi.fn();
const cancelTokenSpy = vi.fn();

const tokenID = 70735;
beforeAll(() => {
  (window as any).getCancellableTokenSource = getCancellableTokenSourceMock;
  getCancellableTokenSourceMock.mockImplementation(() => tokenID);
  (window as any).imageCheck = imageCheckMock;
  (window as any).cancelToken = cancelTokenSpy;
  (window as any).telemetryTrack = vi.fn();
});

beforeEach(() => {
  vi.clearAllMocks();
});

test('expect to display wait message before to receive results', async () => {
  imageCheckerProviders.set([
    {
      id: 'provider1',
      label: 'Image Checker',
    },
  ]);

  imageCheckMock.mockImplementation(async () => {
    // never returns results
    return new Promise(() => {});
  });

  render(ImageDetailsCheck, {
    imageInfo: {
      engineId: 'podman.Podman',
      engineName: 'Podman',
      Id: 'sha256:3696f18be9a51a60395a7c2667e2fcebd2d913af0ad6da287e03810fda566833',
      ParentId: '7f8297e79d497136a7d75d506781b545b20ea599041f02ab14aa092e24f110b7',
      RepoTags: ['quay.io/user/image-name:v0.0.1'],
      Created: 1701338214,
      Size: 34134140,
      VirtualSize: 34134140,
      SharedSize: 0,
      Labels: {},
      Containers: 0,
    },
  });

  await vi.waitFor(() => {
    const msg = screen.getByText(content => content.includes('Image analysis in progress'));
    expect(msg).toBeInTheDocument();
  });
});

test('expect to cancel when clicking the Cancel button', async () => {
  imageCheckerProviders.set([
    {
      id: 'provider1',
      label: 'Image Checker',
    },
  ]);

  imageCheckMock.mockImplementation(async () => {
    // never returns results
    return new Promise(() => {});
  });

  render(ImageDetailsCheck, {
    imageInfo: {
      engineId: 'podman.Podman',
      engineName: 'Podman',
      Id: 'sha256:3696f18be9a51a60395a7c2667e2fcebd2d913af0ad6da287e03810fda566833',
      ParentId: '7f8297e79d497136a7d75d506781b545b20ea599041f02ab14aa092e24f110b7',
      RepoTags: ['quay.io/user/image-name:v0.0.1'],
      Created: 1701338214,
      Size: 34134140,
      VirtualSize: 34134140,
      SharedSize: 0,
      Labels: {},
      Containers: 0,
    },
  });

  await vi.waitFor(async () => {
    const abortBtn = screen.getByRole('button', { name: 'Cancel' });
    await fireEvent.click(abortBtn);
  });

  await vi.waitFor(() => {
    const msg = screen.getByText(content => content.includes('Image analysis canceled'));
    expect(msg).toBeInTheDocument();
  });

  expect(cancelTokenSpy).toHaveBeenCalledWith(tokenID);
});

test('expect to cancel when destroying the component', async () => {
  imageCheckerProviders.set([
    {
      id: 'provider1',
      label: 'Image Checker',
    },
  ]);

  imageCheckMock.mockImplementation(async () => {
    // never returns results
    return new Promise(() => {});
  });

  const result = render(ImageDetailsCheck, {
    imageInfo: {
      engineId: 'podman.Podman',
      engineName: 'Podman',
      Id: 'sha256:3696f18be9a51a60395a7c2667e2fcebd2d913af0ad6da287e03810fda566833',
      ParentId: '7f8297e79d497136a7d75d506781b545b20ea599041f02ab14aa092e24f110b7',
      RepoTags: ['quay.io/user/image-name:v0.0.1'],
      Created: 1701338214,
      Size: 34134140,
      VirtualSize: 34134140,
      SharedSize: 0,
      Labels: {},
      Containers: 0,
    },
  });

  await vi.waitFor(async () => {
    screen.getByRole('button', { name: 'Cancel' });
  });

  result.unmount();

  expect(cancelTokenSpy).toHaveBeenCalledWith(tokenID);
});

test('expect to not cancel again when destroying the component after manual cancel', async () => {
  imageCheckerProviders.set([
    {
      id: 'provider1',
      label: 'Image Checker',
    },
  ]);

  imageCheckMock.mockImplementation(async () => {
    // never returns results
    return new Promise(() => {});
  });

  const result = render(ImageDetailsCheck, {
    imageInfo: {
      engineId: 'podman.Podman',
      engineName: 'Podman',
      Id: 'sha256:3696f18be9a51a60395a7c2667e2fcebd2d913af0ad6da287e03810fda566833',
      ParentId: '7f8297e79d497136a7d75d506781b545b20ea599041f02ab14aa092e24f110b7',
      RepoTags: ['quay.io/user/image-name:v0.0.1'],
      Created: 1701338214,
      Size: 34134140,
      VirtualSize: 34134140,
      SharedSize: 0,
      Labels: {},
      Containers: 0,
    },
  });

  await vi.waitFor(async () => {
    const abortBtn = screen.getByRole('button', { name: 'Cancel' });
    await fireEvent.click(abortBtn);
  });

  await vi.waitFor(() => {
    const msg = screen.getByText(content => content.includes('Image analysis canceled'));
    expect(msg).toBeInTheDocument();
  });

  expect(cancelTokenSpy).toHaveBeenCalledWith(tokenID);

  result.unmount();

  expect(cancelTokenSpy).toHaveBeenCalledTimes(1);
});

test('expect to display results from image checker provider', async () => {
  imageCheckerProviders.set([
    {
      id: 'provider1',
      label: 'Image Checker',
    },
  ]);

  imageCheckMock.mockResolvedValue({
    checks: [
      {
        name: 'check1',
        status: 'failed',
        markdownDescription: 'an error for check1',
        severity: 'critical',
      },
    ],
  } as ImageChecks);

  render(ImageDetailsCheck, {
    imageInfo: {
      engineId: 'podman.Podman',
      engineName: 'Podman',
      Id: 'sha256:3696f18be9a51a60395a7c2667e2fcebd2d913af0ad6da287e03810fda566833',
      ParentId: '7f8297e79d497136a7d75d506781b545b20ea599041f02ab14aa092e24f110b7',
      RepoTags: ['quay.io/user/image-name:v0.0.1'],
      Created: 1701338214,
      Size: 34134140,
      VirtualSize: 34134140,
      SharedSize: 0,
      Labels: {},
      Containers: 0,
    },
  });

  await vi.waitFor(() => {
    const msg = screen.getByText(content => content.includes('Image analysis complete'));
    expect(msg).toBeInTheDocument();
  });

  await vi.waitFor(() => {
    const cell = screen.getByText('check1');
    expect(cell).toBeInTheDocument();
  });
});

test('expect to not cancel when destroying the component after displaying results from image checker provider', async () => {
  imageCheckerProviders.set([
    {
      id: 'provider1',
      label: 'Image Checker',
    },
  ]);

  imageCheckMock.mockResolvedValue({
    checks: [
      {
        name: 'check1',
        status: 'failed',
        markdownDescription: 'an error for check1',
        severity: 'critical',
      },
    ],
  } as ImageChecks);

  const result = render(ImageDetailsCheck, {
    imageInfo: {
      engineId: 'podman.Podman',
      engineName: 'Podman',
      Id: 'sha256:3696f18be9a51a60395a7c2667e2fcebd2d913af0ad6da287e03810fda566833',
      ParentId: '7f8297e79d497136a7d75d506781b545b20ea599041f02ab14aa092e24f110b7',
      RepoTags: ['quay.io/user/image-name:v0.0.1'],
      Created: 1701338214,
      Size: 34134140,
      VirtualSize: 34134140,
      SharedSize: 0,
      Labels: {},
      Containers: 0,
    },
  });

  await vi.waitFor(() => {
    const cell = screen.getByText('check1');
    expect(cell).toBeInTheDocument();
  });

  result.unmount();

  expect(cancelTokenSpy).not.toHaveBeenCalled();
});
