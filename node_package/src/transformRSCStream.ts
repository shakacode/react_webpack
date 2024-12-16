import { Transform } from 'stream';
import context from './context';

export default function transformRSCStream(stream: NodeJS.ReadableStream) {
  const ctx = context();
  let transformCount = 0;
  const htmlExtractor = new Transform({
    transform(oneOrMoreChunks, _, callback) {
      if (ctx) {
        ctx.debugConsole?.log('\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\ntransformCount', transformCount, '\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n');
      }
      transformCount += 1;
      try {
        const decoder = new TextDecoder('utf-8');
        const decodedChunk = decoder.decode(oneOrMoreChunks);

        const separateChunks = decodedChunk.split('\n').filter(line => line.trim() !== '');
        for (const chunk of separateChunks) {
          const parsedData = JSON.parse(chunk) as { html: string };

          if (ctx) {
            ctx.debugConsole?.log('\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nHTML:', parsedData.html, '\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n');
          }
          this.push(parsedData.html);
        }
        callback();
      } catch (error) {
        ctx?.debugConsole?.log('\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nError in transformRSCStream', error, '\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n');
        callback(error as Error);
      }
    }
  });
  return stream.pipe(htmlExtractor);
}
