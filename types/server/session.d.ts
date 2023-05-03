/// <reference types="node" resolution-mode="require"/>
export function createSession(req: nativa.Request, res: http.ServerResponse, username: string): Promise<nativa.Session | undefined>;
export function attachSession(req: nativa.Request): void;
export function removeSession(req: nativa.Request, res: http.ServerResponse): void;
export namespace nativa {
    type Session = import('../types.js').nativa.Session;
    type Request = import('../types.js').nativa.Request;
}
import * as http from 'node:http';
