const requiredVariables = [
  "MONGO_URL",
  "ACCESS_TOKEN_SECRET",
  "CLIENT_URL",
  "CHAPA_SECRET_KEY",
  "CHAPA_WEBHOOK_SECRET",
];

export const validateEnv = (env = process.env) => {
  const missing = requiredVariables.filter((name) => !env[name]?.trim());
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`,
    );
  }

  if (!/^mongodb(?:\+srv)?:\/\//.test(env.MONGO_URL)) {
    throw new Error("MONGO_URL must be a valid MongoDB connection URL");
  }

  try {
    new URL(env.CLIENT_URL);
  } catch {
    throw new Error("CLIENT_URL must be a valid URL");
  }
};
