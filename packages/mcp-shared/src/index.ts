import path from "node:path";
import { fileURLToPath } from "node:url";
import { ArtifactStore } from "@apdr/core";

export function resolveProjectsRoot(): string {
  if (process.env.APDR_PROJECTS_ROOT) {
    return process.env.APDR_PROJECTS_ROOT;
  }
  const here = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(here, "../../../projects");
}

export function createStore(): ArtifactStore {
  return new ArtifactStore(resolveProjectsRoot());
}

export function textResult(text: string, isError = false) {
  return {
    content: [{ type: "text" as const, text }],
    isError,
  };
}
