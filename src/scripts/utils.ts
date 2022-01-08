import isString from "lodash-es/isString";

// TODO: move to utils and change:
// - if context is seen, must be an object (expanded)
// - redo these documents to use expanded context

export function noRemoteContext(doc: object): boolean {
  let objects: object[] = [doc];

  while (objects.length > 0) {
    const obj = objects.pop();
    for (const [k, v] of Object.entries(obj)) {
      if (k === "@context") {
        if (isString(v)) {
          return false;
        }
      }
      if (v instanceof Object) {
        objects.push(v);
      }
    }
  }

  return true;
}
