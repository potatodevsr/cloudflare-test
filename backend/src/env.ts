import { z } from "zod";

const EnvSchema = z.object({
    ENVIRONMENT: z.enum(["development", "production", "preview"]).default("development"),
    CORS_ORIGINS: z.string().default(""),
});

export function validateEnv(env: unknown) {
    return EnvSchema.parse(env);
}