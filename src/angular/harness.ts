import {
  ApplicationRef,
  ComponentRef,
  createComponent,
  createEnvironmentInjector,
  EnvironmentInjector,
  Type,
} from '@angular/core';

export interface VisualHarness {
  readonly host: HTMLElement;
  readonly componentRef: ComponentRef<unknown>;
  destroy(): void;
}

export function createVisualHarness<T>(
  applicationRef: ApplicationRef,
  component: Type<T>,
  providers: readonly import('@angular/core').Provider[] = [],
): VisualHarness {
  const host = document.createElement('div');
  host.dataset.visualTesting = 'true';
  document.body.appendChild(host);
  const injector: EnvironmentInjector = providers.length
    ? createEnvironmentInjector([...providers], applicationRef.injector)
    : applicationRef.injector;
  const componentRef = createComponent(component, { environmentInjector: injector, hostElement: host });
  applicationRef.attachView(componentRef.hostView);
  componentRef.changeDetectorRef.detectChanges();
  return {
    host,
    componentRef: componentRef as ComponentRef<unknown>,
    destroy() {
      componentRef.destroy();
      if (providers.length) injector.destroy();
      host.remove();
    },
  };
}
