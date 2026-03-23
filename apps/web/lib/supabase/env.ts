type EnvSource = Record<string, string | undefined>;

export function getMissingEnvKeys(
  env: EnvSource,
  keys: readonly string[],
): string[] {
  return keys.filter((key) => !env[key]);
}

export function getRequiredEnv<const TKeys extends readonly string[]>(
  env: EnvSource,
  keys: TKeys,
): Record<TKeys[number], string> {
  const missingKeys = getMissingEnvKeys(env, keys);

  if (missingKeys.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingKeys.join(", ")}`,
    );
  }

  return Object.fromEntries(
    keys.map((key) => [key, env[key]!]),
  ) as Record<TKeys[number], string>;
}
