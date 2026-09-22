import { mkdir, writeFile } from 'node:fs/promises';
import { mkdtemp, readFile, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { prepareSnapshotUpdate } from '../../src/snapshots/storage.js';
import { defineVisual } from '../../src/definitions/define-visual.js';

class ButtonComponent {}
class InputComponent {}

const button = defineVisual({
  name: 'states',
  component: ButtonComponent,
  variants: [{ name: 'default' }, { name: 'disabled' }],
});

const input = defineVisual({
  name: 'states',
  component: InputComponent,
  variants: [{ name: 'default' }],
});

describe('prepareSnapshotUpdate', () => {
  it('recreates the whole snapshot directory for an unfiltered update', async () => {
    const root = await mkdtemp(join(tmpdir(), 'visual-testing-'));
    await mkdir(join(root, 'old'), { recursive: true });
    await writeFile(join(root, 'old', 'stale.png'), 'stale');

    await prepareSnapshotUpdate(root, [button, input], {});

    await expect(access(join(root, 'old', 'stale.png'))).rejects.toThrow();
    await expect(access(root)).resolves.toBeUndefined();
  });

  it('removes only the selected component snapshots for a filtered update', async () => {
    const root = await mkdtemp(join(tmpdir(), 'visual-testing-'));
    const selected = join(root, 'ButtonComponent', 'states', 'disabled.png');
    const preserved = join(root, 'ButtonComponent', 'states', 'default.png');
    const other = join(root, 'InputComponent', 'states', 'default.png');

    await mkdir(join(root, 'ButtonComponent', 'states'), { recursive: true });
    await mkdir(join(root, 'InputComponent', 'states'), { recursive: true });
    await writeFile(selected, 'selected');
    await writeFile(preserved, 'preserved');
    await writeFile(other, 'other');

    await prepareSnapshotUpdate(root, [button, input], { component: 'ButtonComponent' });

    await expect(access(selected)).rejects.toThrow();
    await expect(readFile(preserved, 'utf8')).resolves.toBe('preserved');
    await expect(readFile(other, 'utf8')).resolves.toBe('other');
  });

  it('removes only the selected variant snapshots', async () => {
    const root = await mkdtemp(join(tmpdir(), 'visual-testing-'));
    const selected = join(root, 'ButtonComponent', 'states', 'disabled.png');
    const preserved = join(root, 'ButtonComponent', 'states', 'default.png');

    await mkdir(join(root, 'ButtonComponent', 'states'), { recursive: true });
    await writeFile(selected, 'selected');
    await writeFile(preserved, 'preserved');

    await prepareSnapshotUpdate(root, [button], { variant: 'disabled' });

    await expect(access(selected)).rejects.toThrow();
    await expect(readFile(preserved, 'utf8')).resolves.toBe('preserved');
  });
});
