import React from 'react';
import { RegisterableServerComponents } from './types';
import ReactOnRails, { isRegisterableServerComponentsOnClient } from './ReactOnRails';


ReactOnRails.registerServerComponent = (components: RegisterableServerComponents): void => {
  if (isRegisterableServerComponentsOnClient(components)) {
    throw new Error('registerServerComponent expects an object where keys are component names and values are the components when used on the server');
  }

  // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
  const RSCServerRoot = (require('./RSCServerRoot') as typeof import('./RSCServerRoot')).default;

  // The component itself is not needed in server bundle, server will render server components using the RSC Payload fetched from the RSC server
  // But we need to include the component in the server bundle to make it include any client component it needs
  // TODO: In the future, we can develop a webpack plugin to include client components in the server bundle without the need to include the server components that need them
  const componentsWrappedInRSCServerRoot = Object.entries(components).reduce(
    (acc, [name]) => ({ ...acc, [name]: () => React.createElement(RSCServerRoot, { componentName: name }) }),
    {}
  );
  ReactOnRails.register(componentsWrappedInRSCServerRoot);
};

export default ReactOnRails;
