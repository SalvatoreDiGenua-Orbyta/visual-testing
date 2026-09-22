export type CliCommand = 'help' | 'version' | 'test' | 'update' | 'init';

export interface CliOptions {
  readonly command: CliCommand;
  readonly component?: string;
  readonly variant?: string;
}

export function parseArgs(args: readonly string[]): CliOptions {
  if (!args.length) return { command: 'help' };
  const [command, ...rest] = args;
  if (!command) return { command: 'help' };
  if (command === '--help' || command === '-h') return { command: 'help' };
  if (command === '--version' || command === '-v') return { command: 'version' };
  if (!['test', 'update', 'init'].includes(command)) throw new Error(`Unknown command "${command}".`);
  let component: string | undefined;
  let variant: string | undefined;
  for (let i = 0; i < rest.length; i++) {
    const arg = rest[i];
    if (arg === undefined) throw new Error('Invalid empty argument.');
    if (arg === '--variant') {
      variant = rest[++i];
      if (!variant) throw new Error('--variant requires a value.');
    } else if (!arg.startsWith('-')) {
      if (component) throw new Error('Only one component filter is supported.');
      component = arg;
    } else throw new Error(`Unknown option "${arg}".`);
  }
  return { command: command as CliCommand, component, variant };
}
