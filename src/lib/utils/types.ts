/**
 * nullableな値がnull/undefinedでないことを確認し、型を保証します
 */
export function isPresent<T>(arg: T | null | undefined): arg is T {
  return arg != null;
}

/**
 * argがnull/undefinedのときはnullを返し、そうでなければcallable(arg)の結果を返します
 */
export function map<T, U>(
  arg: T | null | undefined,
  callable: (arg: T) => U
): U | null {
  return arg != null ? callable(arg) : null;
}

/**
 * argがnull/undefinedのときは例外を送出し、そうでなければcallable(arg)の結果を返します
 */
export function orThrow<T, U>(
  arg: T | null | undefined,
  callable: (arg: T) => void,
  opts?: { message?: string }
): void {
  if (arg != null) {
    callable(arg);
    return;
  }
  throw Error(
    opts?.message ?? "予期せずundefined/nullが発生しましたので中断しました"
  );
}
