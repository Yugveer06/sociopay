// Environment validation for Better Auth
export function validateBetterAuthEnv() {
	const requiredEnvVars = {
		BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
		DATABASE_URL: process.env.DATABASE_URL,
	};

	const optionalEnvVars = {
		BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
		NODE_ENV: process.env.NODE_ENV,
	};

	const missing = Object.entries(requiredEnvVars)
		.filter(([, value]) => !value)
		.map(([key]) => key);

	if (missing.length > 0) {
		throw new Error(
			`Missing required environment variables: ${missing.join(", ")}`
		);
	}

	console.log("Better Auth Environment Check:");
	console.log("✅ Required variables present:", Object.keys(requiredEnvVars));
	console.log("📝 Optional variables:", optionalEnvVars);

	return {
		...requiredEnvVars,
		...optionalEnvVars,
	};
}

// Call this in your auth.ts file
export const envVars = validateBetterAuthEnv();
