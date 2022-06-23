import type { ReactElement } from 'react';
import ReactDOM from 'react-dom';
import type { RenderReturnType } from './types';

type HydrateOrRenderType = (domNode: Element, reactElement: ReactElement) => RenderReturnType;
const supportsReactCreateRoot = parseInt(ReactDOM.version.split('.')[0], 10) >= 18;

// TODO: once React dependency is updated to >= 18, we can remove this and just
// import ReactDOM from 'react-dom/client';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let reactDomClient: any;
if (supportsReactCreateRoot) {
  // eslint-disable-next-line camelcase
  if (__webpack_require__) {
    // we are in a Webpack environment (and in a node-modules directory of another project)
    // See https://webpack.js.org/guides/dependency-management/#context-module-api
    const reactDomContext = require.context('react-dom/', false, /^client\.js$/);
    reactDomClient = reactDomContext('react-dom/client.js');
  } else {
    // we want a dynamic require here so that webpack doesn't rewrite it
    const reactDomClientName = 'react-dom/client';
    // eslint-disable-next-line global-require,import/no-dynamic-require
    reactDomClient = require(reactDomClientName);
  }
}

export const reactHydrate: HydrateOrRenderType = supportsReactCreateRoot ?
  reactDomClient.hydrateRoot :
  (domNode, reactElement) => ReactDOM.hydrate(reactElement, domNode);

export function reactRender(domNode: Element, reactElement: ReactElement): RenderReturnType {
  if (supportsReactCreateRoot) {
    const root = reactDomClient.createRoot(domNode);
    root.render(reactElement);
    return root;
  }

  // eslint-disable-next-line react/no-render-return-value
  return ReactDOM.render(reactElement, domNode);
}

export default function reactHydrateOrRender(domNode: Element, reactElement: ReactElement, hydrate: boolean): RenderReturnType {
  return hydrate ? reactHydrate(domNode, reactElement) : reactRender(domNode, reactElement);
}
