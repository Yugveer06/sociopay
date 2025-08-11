import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { Pool } from "pg";
import { validateBetterAuthEnv } from "./env-check";

// Validate environment variables
validateBetterAuthEnv();

export const auth = betterAuth({
	user: {
		additionalFields: {
			houseNumber: {
				type: "string",
				unique: true,
				required: true,
				validation: {
					maxLength: 10,
					pattern: "^[A-Z]-\\d{1,2}$",
					message:
						"Please enter a valid house number (e.g., A-1, B-9, C-23).",
				},
			},
			phone: {
				type: "string",
				required: true,
				validation: {
					minLength: 10,
					maxLength: 10,
					pattern: "^[0-9]{10}$",
					message: "Please enter a valid 10-digit phone number.",
				},
			},
		},
	},
	emailAndPassword: { enabled: true },
	database: new Pool({
		connectionString: process.env.DATABASE_URL,
		ssl:
			process.env.NODE_ENV === "production"
				? { rejectUnauthorized: false }
				: false,
	}),
	secret: process.env.BETTER_AUTH_SECRET,
	baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
	plugins: [nextCookies(), admin()], // nextCookies should come first
});
