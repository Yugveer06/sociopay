import { createAuthClient } from "better-auth/react";
import { adminClient, emailOTPClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
	/** The base URL of the server (optional if you're using the same domain) */
	baseURL:
		process.env.NODE_ENV === "production"
			? process.env.BETTER_AUTH_URL
			: "http://localhost:3000",
	plugins: [adminClient(), emailOTPClient()],
});

// Export hooks for easier use
export const { useSession, signIn, signOut, signUp } = authClient;
