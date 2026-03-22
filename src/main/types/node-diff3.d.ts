declare module 'node-diff3' {
  interface OkResult<T> {
    ok: T[]
  }

  interface ConflictResult<T> {
    conflict: {
      a: T[]
      aIndex: number
      o: T[]
      oIndex: number
      b: T[]
      bIndex: number
    }
  }

  type Diff3MergeResult<T> = OkResult<T> | ConflictResult<T>

  interface Diff3MergeOptions {
    excludeFalseConflicts?: boolean
    stringSeparator?: string | RegExp
  }

  export function diff3Merge<T>(
    a: T[] | string,
    o: T[] | string,
    b: T[] | string,
    options?: Diff3MergeOptions
  ): Diff3MergeResult<T>[]

  export function merge(
    a: string,
    o: string,
    b: string,
    options?: Diff3MergeOptions
  ): { result: string[]; conflict: boolean }

  export function mergeDiff3(
    a: string,
    o: string,
    b: string,
    options?: Diff3MergeOptions
  ): { result: string[]; conflict: boolean }
}
