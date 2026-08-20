import type { BetterAuthOptions } from 'better-auth'
import { twoFactor } from 'better-auth/plugins'
import { passkey } from '@better-auth/passkey'
import { apiKey } from '@better-auth/api-key'

export const betterAuthOptions: Partial<BetterAuthOptions> = {
  // Model names are SINGULAR - they get pluralized automatically
  // 'user' becomes 'users', 'session' becomes 'sessions', etc.
  user: {
    additionalFields: {
      // input: false keeps `role` server-only (payload-better-auth 0.8+): clients
      // cannot set it at sign-up. Role is assigned server-side by firstUserAdmin.
      role: { type: 'string', defaultValue: 'user', input: false },
    },
  },
  session: {
    // Absolute lifetime of a session row / session cookie: 30 days.
    // NOTE: expiresAt is stamped when the session is CREATED, so changing this
    // only affects new logins — existing sessions keep their original expiry.
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    // Sliding window: once a session is older than updateAge and gets used,
    // its expiry is pushed out to now + expiresIn. With 1 day, an active user
    // is effectively never logged out; an idle one is logged out after 30 days.
    updateAge: 60 * 60 * 24, // 1 day
    // How long a session counts as "fresh" for sensitive operations
    // (e.g. delete-user, change-email). Does not affect logout.
    freshAge: 60 * 60 * 24, // 1 day
    // Optional: serve the session from a short-lived signed cookie instead of
    // hitting the database on every request. Left off on purpose — with it on,
    // a role change or a revoked session can take up to `maxAge` to take
    // effect, which matters because Payload access control reads req.user.
    // cookieCache: { enabled: true, maxAge: 5 * 60 },
  },
  emailAndPassword: { enabled: true },
  plugins: [
    twoFactor(),
    apiKey({ enableMetadata: true }),
    passkey(),
  ],
}
