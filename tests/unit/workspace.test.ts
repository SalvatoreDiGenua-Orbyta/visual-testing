import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadAngularWorkspace } from '../../src/cli/workspace.js';

async function createWorkspace(
  workspace: Record<string, unknown>,
): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'visual-testing-'));
  await writeFile(join(root, 'angular.json'), JSON.stringify(workspace), 'utf8');
  return root;
}

describe('loadAngularWorkspace', () => {
  it('loads the default application and its browser entry point', async () => {
    const root = await createWorkspace({
      version: 1,
      defaultProject: 'app',
      projects: {
        app: {
          projectType: 'application',
          root: '',
          architect: {
            build: {
              builder: '@angular/build:application',
              options: {
                browser: 'src/main.ts',
              },
            },
          },
        },
      },
    });

    await expect(loadAngularWorkspace(join(root, 'src'))).resolves.toMatchObject({
      workspaceRoot: root,
      projectName: 'app',
      projectRoot: root,
      browserEntryPoint: join(root, 'src/main.ts'),
    });

    await rm(root, { recursive: true, force: true });
  });

  it('falls back to the first application when no default project exists', async () => {
    const root = await createWorkspace({
      version: 1,
      projects: {
        library: {
          projectType: 'library',
        },
        app: {
          projectType: 'application',
          root: 'projects/app',
          targets: {
            build: {
              builder: '@angular/build:application',
              options: {
                browser: 'src/main.ts',
              },
            },
          },
        },
      },
    });

    await expect(loadAngularWorkspace(root)).resolves.toMatchObject({
      projectName: 'app',
      projectRoot: join(root, 'projects/app'),
      browserEntryPoint: join(root, 'projects/app/src/main.ts'),
    });

    await rm(root, { recursive: true, force: true });
  });

  it('rejects library projects', async () => {
    const root = await createWorkspace({
      version: 1,
      defaultProject: 'lib',
      projects: {
        lib: {
          projectType: 'library',
          root: '',
        },
      },
    });

    await expect(loadAngularWorkspace(root)).rejects.toThrow(
      'Visual testing requires an Angular application project.',
    );

    await rm(root, { recursive: true, force: true });
  });

  it('rejects application targets without a browser entry point', async () => {
    const root = await createWorkspace({
      version: 1,
      defaultProject: 'app',
      projects: {
        app: {
          projectType: 'application',
          root: '',
          architect: {
            build: {
              builder: '@angular/build:application',
            },
          },
        },
      },
    });

    await expect(loadAngularWorkspace(root)).rejects.toThrow(
      'must define the application build "browser" entry point',
    );

    await rm(root, { recursive: true, force: true });
  });
});
