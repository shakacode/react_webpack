import * as React from 'react';
// @ts-expect-error react-error-boundary is not a valid module
// eslint-disable-next-line import/no-unresolved
import { ErrorBoundary } from 'react-error-boundary';
import { createFromNodeStream } from 'react-server-dom-webpack/client.node';
import fetch, { type Response } from 'node-fetch';
import fs from 'fs';
import transformRSCStream from './transformRSCStream';
import context from './context';

// TODO: upload manifest as an asset and read it from assets directory
const manifest = JSON.parse(fs.readFileSync('/mnt/ssd/react_on_rails_pro/spec/dummy/test/dev/react-ssr-manifest.json', 'utf8'));

if (!('use' in React)) {
  throw new Error('React.use is not defined. Please ensure you are using React 18.3.0-canary-670811593-20240322 or later to use server components.');
}

// It's not the exact type, but it's close enough for now
type Use = <T>(promise: Promise<T>) => T;
const { use } = React as { use: Use };

const renderCache: Record<string, Promise<React.ReactElement>> = {};

const createFromFetch = async (fetchPromise: Promise<Response>) => {
  const response = await fetchPromise;
  const stream = response.body;
  if (!stream) {
    throw new Error('No stream found in response');
  }
  const transformedStream = transformRSCStream(stream);
  return createFromNodeStream(transformedStream, manifest);
}

const fetchRSC = ({ componentName }: { componentName: string }) => {
  if (!renderCache[componentName]) {
    renderCache[componentName] = createFromFetch(fetch(`http://localhost:3000/rsc/${componentName}`));
  }
  return renderCache[componentName];
}

const RSCServertRoot = ({ componentName }: { componentName: string }) => use(fetchRSC({ componentName }));

const ErrorComponent = ({ error }: { error: Error }) => {
  const ctx = context();
  ctx?.debugConsole?.log('\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nError in RSCServerRoot', error, '\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n');
  return null;
}

const HandledRSCServerRoot = ({ componentName }: { componentName: string }) => {
  const ctx = context();
  ctx?.debugConsole?.log('\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nHandledRSCServerRoot', componentName, ErrorBoundary, ErrorComponent, '\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n');
  return (
    React.createElement(ErrorBoundary, { FallbackComponent: ErrorComponent },
      React.createElement(RSCServertRoot, { componentName })
    )
  );
};

export default RSCServertRoot;
