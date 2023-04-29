/// <reference types="node" resolution-mode="require"/>
export function nativaMiddleware(req: http.IncomingMessage, res: http.ServerResponse<http.IncomingMessage> & {
    req: http.IncomingMessage;
}): void;
import * as http from 'node:http';
