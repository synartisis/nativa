/**
 * nativa configuration and loading
 * must run before start using nativa
 * @param {Config} config configuration settings
 * @example nativa.config({ rootDir: 'my_content/', adminUrl: '/admin/', languages: ['en', 'fr'] })
 */
export function config({ rootDir, adminUrl, languages }: Config): Promise<void>;
/**
 * nativa http middleware
 *
 * - attaches rawdb data on http.ServerResponse.locals for use in UI databinding
 * - enables nativa admin section
 * @returns {(req: import('node:http').IncomingMessage, res: import('node:http').ServerResponse & { locals: string }) => void}
 * @example server.use(nativa.middleware())
 * */
export function middleware(): (req: import('node:http').IncomingMessage, res: import('node:http').ServerResponse & {
    locals: string;
}) => void;
export type Config = import('./types.js').Config;
