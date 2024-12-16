import { renderToPipeableStream } from 'react-server-dom-webpack/server.node';
import { PassThrough, Readable } from 'stream';
import type { ReactElement } from 'react';
import context from './context';
import { RSCRenderParams, RegisterableServerComponents } from './types';
import ReactOnRails from './ReactOnRailsServer';
import { isRegisterableServerComponentsOnClient } from './ReactOnRails';
import buildConsoleReplay from './buildConsoleReplay';
import handleError from './handleError';
import {
  streamServerRenderedComponent,
  type StreamRenderState,
  transformRenderStreamChunksToResultObject,
  convertToError,
  createResultObject,
} from './serverRenderReactComponent';
import loadReactClientManifest from './loadReactClientManifest';

(async () => {
  try {
    // @ts-expect-error AsyncLocalStorage is not in the node types
    globalThis.AsyncLocalStorage = (await import('node:async_hooks')).AsyncLocalStorage;
  } catch (e) {
    console.log('AsyncLocalStorage not found');
  }
})();

const stringToStream = (str: string) => {
  const stream = new PassThrough();
  stream.push(str);
  stream.push(null);
  return stream;
};

const streamRenderRSCComponent = (reactElement: ReactElement, options: RSCRenderParams): Readable => {
  const { throwJsErrors, reactClientManifestFileName } = options;
  const renderState: StreamRenderState = {
    result: null,
    hasErrors: false,
    isShellReady: true
  };

  const ctx = context();
  // if (ctx && ctx.debugConsole) {
  //   ctx.debugConsole.log('\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n', 'streamRenderRSCComponent', options);
  // }
  const { pipeToTransform, readableStream, emitError } = transformRenderStreamChunksToResultObject(renderState);
  try {
    const rscStream = renderToPipeableStream(
      reactElement,
      loadReactClientManifest(reactClientManifestFileName),
      {
        onError: (err) => {
          // if (ctx && ctx.debugConsole) {
          //   ctx.debugConsole.log("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nError in RSC stream", err);
          // }
          const error = convertToError(err);
          if (throwJsErrors) {
            emitError(error);
          }
          renderState.hasErrors = true;
          renderState.error = error;
        }
      }
    );
    pipeToTransform(rscStream);
    return readableStream;
  } catch (e) {
    const error = convertToError(e);
    renderState.hasErrors = true;
    renderState.error = error;
    const htmlResult = handleError({ e: error, name: options.name, serverSide: true });
    const jsonResult = JSON.stringify(createResultObject(htmlResult, buildConsoleReplay(), renderState));
    return stringToStream(jsonResult);
  }
};

ReactOnRails.serverRenderRSCReactComponent = (options: RSCRenderParams) => {
  try {
    return streamServerRenderedComponent(options, streamRenderRSCComponent);
  } finally {
    console.history = [];
  }
};

ReactOnRails.registerServerComponent = (components: RegisterableServerComponents): void => {
  if (isRegisterableServerComponentsOnClient(components)) {
    throw new Error('registerServerComponent expects an object where keys are component names and values are the components when used on the server');
  }

  // In the RSC bundle, registerServerComponent acts as a wrapper around the regular register method
  // since server components are rendered exclusively on the RSC server. For non-RSC bundles (client
  // and server), only the component names are needed to fetch the RSC payload from the RSC server.
  // However, we include the component in the server bundle to make it include any client component it needs
  ReactOnRails.register(components);
};

export * from './types';
export default ReactOnRails;
