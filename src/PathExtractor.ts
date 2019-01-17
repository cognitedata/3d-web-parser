// Copyright 2019 Cognite AS

// return undefined if the path represent the root node
export function getParentPath(path: string): undefined | string {
  if (path.length <= 2) { return; }
  return path.slice(0, path.length - 2);
}
