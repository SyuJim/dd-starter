import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

/**
 * Better Auth 1.7 scopes account identity by issuer: provider identities are
 * keyed on (issuer, accountId) instead of providerId.
 *
 * Payload generates this as a single `ADD COLUMN "issuer" varchar NOT NULL`,
 * which fails on any table that already has rows. Split into
 * add-nullable → backfill → enforce so it works on a populated database.
 *
 * Issuer values follow Better Auth's synthetic scheme (see
 * `createLocalAccountIssuer` / `createOAuthAccountIssuer`):
 *   - email/password       → 'local:credential'
 *   - built-in social      → 'local:oauth:<providerId>'
 * Generic-OAuth/OIDC providers (Okta, Auth0, Keycloak, Entra ID) use their real
 * discovery issuer instead; this project configures none, so the two rules above
 * cover every row.
 */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "accounts" ADD COLUMN "issuer" varchar;`)

  await db.execute(sql`
    UPDATE "accounts" SET "issuer" = 'local:credential'
    WHERE "provider_id" = 'credential';`)

  await db.execute(sql`
    UPDATE "accounts" SET "issuer" = 'local:oauth:' || "provider_id"
    WHERE "issuer" IS NULL;`)

  // Fail loudly here rather than through an opaque unique-index violation.
  const dupes = await db.execute(sql`
    SELECT "issuer", "account_id", COUNT(*) AS count
    FROM "accounts" GROUP BY "issuer", "account_id" HAVING COUNT(*) > 1;`)
  const dupeRows = (dupes as unknown as { rows?: unknown[] }).rows ?? []
  if (dupeRows.length > 0) {
    throw new Error(
      `Cannot enforce the unique (issuer, accountId) index: ${dupeRows.length} duplicate ` +
        `account identity/identities found. Resolve them before re-running. ` +
        `Duplicates: ${JSON.stringify(dupeRows)}`,
    )
  }

  await db.execute(sql`ALTER TABLE "accounts" ALTER COLUMN "issuer" SET NOT NULL;`)
  await db.execute(sql`
    CREATE UNIQUE INDEX "issuer_accountId_idx"
    ON "accounts" USING btree ("issuer","account_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "issuer_accountId_idx";
  ALTER TABLE "accounts" DROP COLUMN "issuer";`)
}
