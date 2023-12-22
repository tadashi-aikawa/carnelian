export const errorMessage = {
  "ActiveEditor is null": "アクティブエディタが存在しません",
  "MetadataEditor is null": "アクティブメタエディタが存在しません",
};

/**
 * switch文などで網羅性漏れを防ぐために利用するエラーです
 */
export class ExhaustiveError extends Error {
  constructor(value: never, message = `Unsupported type: ${value}`) {
    super(message);
  }
}
