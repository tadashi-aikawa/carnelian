import { execFile } from "child_process";

async function readKeychain(service: string, account: string): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(
      "/usr/bin/security",
      ["find-generic-password", "-a", account, "-s", service, "-w"],
      { timeout: 30 * 1000, windowsHide: true },
      (err, stdout) => {
        if (err)
          return reject(new Error(`Keychain read failed: ${err.message}`));
        resolve(stdout.replace(/\s+$/, "")); // 末尾改行除去
      },
    );
  });
}

const keychainCache: { [key: string]: string } = {};

async function readKeychainObsidian(
  key: string,
): Promise<{ value: string; error: null } | { value: null; error: string }> {
  if (key in keychainCache) {
    return { value: keychainCache[key], error: null };
  }

  try {
    const value = await readKeychain("net.mamansoft.Obsidian.Carnelian", key);
    keychainCache[key] = value;
    return { value, error: null };
  } catch (e: any) {
    return { value: null, error: e.message };
  }
}

export async function resolveOpenAI(
  apiKeyEnvName: string | undefined,
): Promise<{ apiKey: string; error: null } | { apiKey: null; error: string }> {
  if (!apiKeyEnvName) {
    return {
      apiKey: null,
      error: "OpenAI APIキーのKeychainアカウント名が設定されていません",
    };
  }
  const { value: apiKey, error } = await readKeychainObsidian(apiKeyEnvName);
  if (error != null) {
    return { apiKey: null, error };
  }

  return { apiKey, error: null };
}

export async function resolveAzure(args: {
  apiKeyEnvName: string | undefined;
  apiEndpointEnvName: string | undefined;
}): Promise<
  | { apiKey: string; apiEndpoint: string; error: null }
  | { apiKey: null; apiEndpoint: null; error: string }
> {
  const { apiKeyEnvName, apiEndpointEnvName } = args;
  const errorBase = { apiKey: null, apiEndpoint: null };

  if (!apiKeyEnvName) {
    return {
      ...errorBase,
      error: "Azure OpenAI APIキーのKeychainアカウント名が設定されていません",
    };
  }
  if (!apiEndpointEnvName) {
    return {
      ...errorBase,
      error:
        "Azure OpenAI エンドポイントのKeychainアカウント名が設定されていません",
    };
  }

  const { value: apiKey, error: e1 } =
    await readKeychainObsidian(apiKeyEnvName);
  if (e1 != null) {
    return { ...errorBase, error: e1 };
  }

  const { value: apiEndpoint, error: e2 } =
    await readKeychainObsidian(apiEndpointEnvName);
  if (e2 != null) {
    return { ...errorBase, error: e2 };
  }

  return { apiKey, apiEndpoint, error: null };
}
