export function createFromHTML<TagName extends keyof HTMLElementTagNameMap>(tagName: TagName, html: string): HTMLElementTagNameMap[TagName];
export function isTag<TagName extends keyof HTMLElementTagNameMap>(tagName: TagName, node: unknown): node is HTMLElementTagNameMap[TagName];
export function ensureTag<TagName extends keyof HTMLElementTagNameMap>(tagName: TagName, node: unknown): HTMLElementTagNameMap[TagName];
