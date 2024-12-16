declare module 'react-server-dom-webpack/server.node' {
  export interface Options {
    environmentName?: string;
    onError?: (error: unknown) => void;
    onPostpone?: (reason: string) => void;
    identifierPrefix?: string;
  }

  export interface PipeableStream {
    abort(reason: unknown): void;
    pipe<Writable extends NodeJS.WritableStream>(destination: Writable): Writable;
  }

  // Note: ReactClientValue is likely what React uses internally for RSC
  // We're using 'unknown' here as it's the most accurate type we can use
  // without accessing React's internal types
  export function renderToPipeableStream(
    model: unknown,
    webpackMap: { [key: string]: unknown },
    options?: Options
  ): PipeableStream;
}

declare module 'react-server-dom-webpack/client' {
  import type { ReactElement } from 'react';

  export const createFromFetch: (promise: Promise<Response>) => Promise<ReactElement>;

  export const createFromReadableStream: (stream: ReadableStream) => Promise<ReactElement>;
}

declare module 'react-server-dom-webpack/client.node' {
  import type { ReactElement } from 'react';

  export const createFromNodeStream: (stream: NodeJS.ReadableStream, manifest: Record<string, string>) => Promise<ReactElement>;
}
