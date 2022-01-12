import { entries, isArray, isPlainObject } from "lodash";

export function noJsonLdContext(doc: object): boolean {
  let objects: object[] = [doc];

  while (objects.length > 0) {
    const obj = objects.pop();
    for (const [k, v] of entries(obj)) {
      if (k === "@context") return false;
      if (isPlainObject(v) || isArray(v)) {
        objects.push(v);
      }
    }
  }

  return true;
}
