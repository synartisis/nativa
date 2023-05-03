/// <reference types="node" resolution-mode="require"/>
export function readRequestBody(req: http.IncomingMessage): Promise<Buffer>;
export function getSessionCookie(req: http.IncomingMessage): string | undefined;
export function setSessionCookie(res: http.ServerResponse, value: string): void;
export function redirect(res: http.ServerResponse, url: string): void;
export function hashText(text: string): string;
export function ensureSlashEnding(url: string): string;
export const env: "production" | "development";
import * as http from 'node:http';
