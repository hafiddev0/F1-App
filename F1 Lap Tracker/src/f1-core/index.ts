/**
 * Framework-agnostic F1 core.
 *
 * Everything under `src/f1-core/` is plain TypeScript with zero UI framework
 * dependencies — copy the folder into an Angular (or Vue/Svelte/Node) project
 * and it works unchanged. See ./README.md for an Angular service example.
 */

export * from "./types";
export * from "./format";
export * from "./transforms";
export * from "./openf1-client";
export * from "./polling";
