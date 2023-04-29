/// <reference types="node" resolution-mode="require"/>
export function serveStatic(res: http.OutgoingMessage, filename: string): Promise<void>;
import * as http from 'node:http';
