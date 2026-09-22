import { readFile } from 'node:fs/promises';
import { dirname, isAbsolute, join, resolve } from 'node:path';

export interface AngularWorkspace {
  readonly version: number;
  readonly defaultProject?: string;
  readonly projects: Record<string, AngularProject>;
}

export interface AngularProject {
  readonly root?: string;
  readonly projectType: 'application' | 'library' | string;
  readonly architect?: Record<string, AngularTarget>;
  readonly targets?: Record<string, AngularTarget>;
}

export interface AngularTarget {
  readonly builder: string;
  readonly options?: Record<string, unknown>;
  readonly configurations?: Record<string, Record<string, unknown>>;
}

export interface VisualWorkspace {
  readonly workspaceRoot: string;
  readonly projectName: string;
  readonly projectRoot: string;
  readonly browserEntryPoint: string;
  readonly buildTarget: AngularTarget;
}

export async function loadAngularWorkspace(
  cwd: string,
): Promise<VisualWorkspace> {
  const workspaceRoot = await findWorkspaceRoot(cwd);
  const workspacePath = join(workspaceRoot, 'angular.json');
  const workspace = JSON.parse(await readFile(workspacePath, 'utf8')) as AngularWorkspace;
  const projectName = resolveProjectName(workspace);
  const project = workspace.projects[projectName];

  if (!project) {
    throw new Error(`Angular project "${projectName}" was not found in angular.json.`);
  }

  if (project.projectType !== 'application') {
    throw new Error(
      `Visual testing requires an Angular application project. Project "${projectName}" is "${project.projectType}".`,
    );
  }

  const buildTarget = project.targets?.build ?? project.architect?.build;
  if (!buildTarget) {
    throw new Error(`Angular project "${projectName}" does not define a build target.`);
  }

  const browser = buildTarget.options?.browser;
  if (typeof browser !== 'string' || !browser.trim()) {
    throw new Error(
      `Angular project "${projectName}" must define the application build "browser" entry point.`,
    );
  }

  const projectRoot = resolve(workspaceRoot, project.root ?? '');
  return {
    workspaceRoot,
    projectName,
    projectRoot,
    browserEntryPoint: resolve(projectRoot, browser),
    buildTarget,
  };
}

async function findWorkspaceRoot(start: string): Promise<string> {
  let current = resolve(start);

  while (true) {
    try {
      await readFile(join(current, 'angular.json'), 'utf8');
      return current;
    } catch {
      const parent = dirname(current);
      if (parent === current) {
        throw new Error('Could not find angular.json from the current directory.');
      }
      current = parent;
    }
  }
}

function resolveProjectName(workspace: AngularWorkspace): string {
  if (workspace.defaultProject) {
    return workspace.defaultProject;
  }

  const application = Object.entries(workspace.projects).find(
    ([, project]) => project.projectType === 'application',
  );

  if (!application) {
    throw new Error('Could not find an Angular application project in angular.json.');
  }

  return application[0];
}
