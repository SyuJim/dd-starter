import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_tenants_roles" AS ENUM('tenant-admin', 'tenant-editor');
  CREATE TYPE "public"."enum_tenants_status" AS ENUM('active', 'inactive');
  CREATE TYPE "public"."enum_tenants_theme_fonts_heading" AS ENUM('', 'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Playfair Display', 'Merriweather', 'Noto Sans TC', 'Noto Serif TC');
  CREATE TYPE "public"."enum_tenants_theme_fonts_body" AS ENUM('', 'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Playfair Display', 'Merriweather', 'Noto Sans TC', 'Noto Serif TC');
  CREATE TYPE "public"."enum_site_templates_header_nav_items_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_site_templates_footer_nav_items_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_site_templates_pages_page_layout" AS ENUM('default', 'full-width', 'landing');
  CREATE TYPE "public"."enum_site_templates_theme_fonts_heading" AS ENUM('', 'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Playfair Display', 'Merriweather', 'Noto Sans TC', 'Noto Serif TC');
  CREATE TYPE "public"."enum_site_templates_theme_fonts_body" AS ENUM('', 'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Playfair Display', 'Merriweather', 'Noto Sans TC', 'Noto Serif TC');
  CREATE TYPE "public"."enum_headers_nav_items_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_footers_nav_items_link_type" AS ENUM('reference', 'custom');
  CREATE TABLE "users_tenants_roles" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_users_tenants_roles",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "users_tenants" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tenant_id" integer NOT NULL
  );
  
  CREATE TABLE "tenants_domains" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"domain" varchar NOT NULL
  );
  
  CREATE TABLE "tenants" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"status" "enum_tenants_status" DEFAULT 'active',
  	"template_id" integer,
  	"theme_colors_primary" varchar,
  	"theme_colors_primary_foreground" varchar,
  	"theme_colors_background" varchar,
  	"theme_colors_foreground" varchar,
  	"theme_colors_accent" varchar,
  	"theme_colors_accent_foreground" varchar,
  	"theme_colors_card" varchar,
  	"theme_colors_card_foreground" varchar,
  	"theme_colors_muted" varchar,
  	"theme_colors_muted_foreground" varchar,
  	"theme_colors_border" varchar,
  	"theme_fonts_heading" "enum_tenants_theme_fonts_heading",
  	"theme_fonts_body" "enum_tenants_theme_fonts_body",
  	"theme_logo_id" integer,
  	"theme_radius" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_templates_header_nav_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_site_templates_header_nav_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar NOT NULL
  );
  
  CREATE TABLE "site_templates_footer_nav_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_site_templates_footer_nav_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar NOT NULL
  );
  
  CREATE TABLE "site_templates_pages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"page_segment" varchar,
  	"is_homepage" boolean DEFAULT false,
  	"page_layout" "enum_site_templates_pages_page_layout" DEFAULT 'default',
  	"puck_data" jsonb
  );
  
  CREATE TABLE "site_templates" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"thumbnail_id" integer,
  	"theme_colors_primary" varchar,
  	"theme_colors_primary_foreground" varchar,
  	"theme_colors_background" varchar,
  	"theme_colors_foreground" varchar,
  	"theme_colors_accent" varchar,
  	"theme_colors_accent_foreground" varchar,
  	"theme_colors_card" varchar,
  	"theme_colors_card_foreground" varchar,
  	"theme_colors_muted" varchar,
  	"theme_colors_muted_foreground" varchar,
  	"theme_colors_border" varchar,
  	"theme_fonts_heading" "enum_site_templates_theme_fonts_heading",
  	"theme_fonts_body" "enum_site_templates_theme_fonts_body",
  	"theme_logo_id" integer,
  	"theme_radius" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_templates_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer
  );
  
  CREATE TABLE "headers_nav_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_headers_nav_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar NOT NULL
  );
  
  CREATE TABLE "headers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "headers_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer
  );
  
  CREATE TABLE "footers_nav_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_footers_nav_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar NOT NULL
  );
  
  CREATE TABLE "footers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "footers_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer
  );
  
  ALTER TABLE "header_nav_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "header" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "header_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_nav_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_rels" DISABLE ROW LEVEL SECURITY;
  -- Backfill: create a default tenant when the database already has content,
  -- so pre-multi-tenant data stays reachable (as the "default" subdomain site).
  INSERT INTO "tenants" ("name", "slug", "status", "updated_at", "created_at")
  SELECT 'Default', 'default', 'active', now(), now()
  WHERE (
      EXISTS (SELECT 1 FROM "pages")
      OR EXISTS (SELECT 1 FROM "posts")
      OR EXISTS (SELECT 1 FROM "media")
      OR EXISTS (SELECT 1 FROM "header_nav_items")
      OR EXISTS (SELECT 1 FROM "footer_nav_items")
    )
    AND NOT EXISTS (SELECT 1 FROM "tenants" WHERE "slug" = 'default');

  -- Copy the legacy header/footer globals into the default tenant's docs
  -- before their tables are dropped below.
  INSERT INTO "headers" ("tenant_id", "updated_at", "created_at")
  SELECT t."id", now(), now() FROM "tenants" t WHERE t."slug" = 'default';

  INSERT INTO "headers_nav_items" ("_order", "_parent_id", "id", "link_type", "link_new_tab", "link_url", "link_label")
  SELECT hni."_order", h."id", hni."id", hni."link_type"::text::"public"."enum_headers_nav_items_link_type", hni."link_new_tab", hni."link_url", hni."link_label"
  FROM "header_nav_items" hni
  CROSS JOIN "headers" h;

  INSERT INTO "headers_rels" ("order", "parent_id", "path", "pages_id", "posts_id")
  SELECT r."order", h."id", r."path", r."pages_id", r."posts_id"
  FROM "header_rels" r
  CROSS JOIN "headers" h;

  INSERT INTO "footers" ("tenant_id", "updated_at", "created_at")
  SELECT t."id", now(), now() FROM "tenants" t WHERE t."slug" = 'default';

  INSERT INTO "footers_nav_items" ("_order", "_parent_id", "id", "link_type", "link_new_tab", "link_url", "link_label")
  SELECT fni."_order", f."id", fni."id", fni."link_type"::text::"public"."enum_footers_nav_items_link_type", fni."link_new_tab", fni."link_url", fni."link_label"
  FROM "footer_nav_items" fni
  CROSS JOIN "footers" f;

  INSERT INTO "footers_rels" ("order", "parent_id", "path", "pages_id", "posts_id")
  SELECT r."order", f."id", r."path", r."pages_id", r."posts_id"
  FROM "footer_rels" r
  CROSS JOIN "footers" f;

  DROP TABLE "header_nav_items" CASCADE;
  DROP TABLE "header" CASCADE;
  DROP TABLE "header_rels" CASCADE;
  DROP TABLE "footer_nav_items" CASCADE;
  DROP TABLE "footer" CASCADE;
  DROP TABLE "footer_rels" CASCADE;
  DROP INDEX "posts_slug_idx";
  DROP INDEX "pages_slug_idx";
  ALTER TABLE "posts" ADD COLUMN "tenant_id" integer;
  ALTER TABLE "_posts_v" ADD COLUMN "version_tenant_id" integer;
  ALTER TABLE "media" ADD COLUMN "tenant_id" integer;
  ALTER TABLE "puck_templates" ADD COLUMN "tenant_id" integer;
  ALTER TABLE "pages" ADD COLUMN "tenant_id" integer;
  ALTER TABLE "_pages_v" ADD COLUMN "version_tenant_id" integer;
  ALTER TABLE "redirects" ADD COLUMN "tenant_id" integer;
  ALTER TABLE "search" ADD COLUMN "tenant_id" integer;
  ALTER TABLE "payload_folders" ADD COLUMN "tenant_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "tenants_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "site_templates_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "headers_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "footers_id" integer;
  ALTER TABLE "users_tenants_roles" ADD CONSTRAINT "users_tenants_roles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users_tenants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_tenants" ADD CONSTRAINT "users_tenants_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_tenants" ADD CONSTRAINT "users_tenants_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tenants_domains" ADD CONSTRAINT "tenants_domains_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tenants" ADD CONSTRAINT "tenants_template_id_site_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."site_templates"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "tenants" ADD CONSTRAINT "tenants_theme_logo_id_media_id_fk" FOREIGN KEY ("theme_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_templates_header_nav_items" ADD CONSTRAINT "site_templates_header_nav_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_templates_footer_nav_items" ADD CONSTRAINT "site_templates_footer_nav_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_templates_pages" ADD CONSTRAINT "site_templates_pages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_templates" ADD CONSTRAINT "site_templates_thumbnail_id_media_id_fk" FOREIGN KEY ("thumbnail_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_templates" ADD CONSTRAINT "site_templates_theme_logo_id_media_id_fk" FOREIGN KEY ("theme_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_templates_rels" ADD CONSTRAINT "site_templates_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."site_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_templates_rels" ADD CONSTRAINT "site_templates_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_templates_rels" ADD CONSTRAINT "site_templates_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "headers_nav_items" ADD CONSTRAINT "headers_nav_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."headers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "headers" ADD CONSTRAINT "headers_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "headers_rels" ADD CONSTRAINT "headers_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."headers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "headers_rels" ADD CONSTRAINT "headers_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "headers_rels" ADD CONSTRAINT "headers_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footers_nav_items" ADD CONSTRAINT "footers_nav_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footers" ADD CONSTRAINT "footers_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "footers_rels" ADD CONSTRAINT "footers_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."footers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footers_rels" ADD CONSTRAINT "footers_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footers_rels" ADD CONSTRAINT "footers_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_tenants_roles_order_idx" ON "users_tenants_roles" USING btree ("order");
  CREATE INDEX "users_tenants_roles_parent_idx" ON "users_tenants_roles" USING btree ("parent_id");
  CREATE INDEX "users_tenants_order_idx" ON "users_tenants" USING btree ("_order");
  CREATE INDEX "users_tenants_parent_id_idx" ON "users_tenants" USING btree ("_parent_id");
  CREATE INDEX "users_tenants_tenant_idx" ON "users_tenants" USING btree ("tenant_id");
  CREATE INDEX "tenants_domains_order_idx" ON "tenants_domains" USING btree ("_order");
  CREATE INDEX "tenants_domains_parent_id_idx" ON "tenants_domains" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "tenants_slug_idx" ON "tenants" USING btree ("slug");
  CREATE INDEX "tenants_template_idx" ON "tenants" USING btree ("template_id");
  CREATE INDEX "tenants_theme_theme_logo_idx" ON "tenants" USING btree ("theme_logo_id");
  CREATE INDEX "tenants_updated_at_idx" ON "tenants" USING btree ("updated_at");
  CREATE INDEX "tenants_created_at_idx" ON "tenants" USING btree ("created_at");
  CREATE INDEX "site_templates_header_nav_items_order_idx" ON "site_templates_header_nav_items" USING btree ("_order");
  CREATE INDEX "site_templates_header_nav_items_parent_id_idx" ON "site_templates_header_nav_items" USING btree ("_parent_id");
  CREATE INDEX "site_templates_footer_nav_items_order_idx" ON "site_templates_footer_nav_items" USING btree ("_order");
  CREATE INDEX "site_templates_footer_nav_items_parent_id_idx" ON "site_templates_footer_nav_items" USING btree ("_parent_id");
  CREATE INDEX "site_templates_pages_order_idx" ON "site_templates_pages" USING btree ("_order");
  CREATE INDEX "site_templates_pages_parent_id_idx" ON "site_templates_pages" USING btree ("_parent_id");
  CREATE INDEX "site_templates_thumbnail_idx" ON "site_templates" USING btree ("thumbnail_id");
  CREATE INDEX "site_templates_theme_theme_logo_idx" ON "site_templates" USING btree ("theme_logo_id");
  CREATE INDEX "site_templates_updated_at_idx" ON "site_templates" USING btree ("updated_at");
  CREATE INDEX "site_templates_created_at_idx" ON "site_templates" USING btree ("created_at");
  CREATE INDEX "site_templates_rels_order_idx" ON "site_templates_rels" USING btree ("order");
  CREATE INDEX "site_templates_rels_parent_idx" ON "site_templates_rels" USING btree ("parent_id");
  CREATE INDEX "site_templates_rels_path_idx" ON "site_templates_rels" USING btree ("path");
  CREATE INDEX "site_templates_rels_pages_id_idx" ON "site_templates_rels" USING btree ("pages_id");
  CREATE INDEX "site_templates_rels_posts_id_idx" ON "site_templates_rels" USING btree ("posts_id");
  CREATE INDEX "headers_nav_items_order_idx" ON "headers_nav_items" USING btree ("_order");
  CREATE INDEX "headers_nav_items_parent_id_idx" ON "headers_nav_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "headers_tenant_idx" ON "headers" USING btree ("tenant_id");
  CREATE INDEX "headers_updated_at_idx" ON "headers" USING btree ("updated_at");
  CREATE INDEX "headers_created_at_idx" ON "headers" USING btree ("created_at");
  CREATE INDEX "headers_rels_order_idx" ON "headers_rels" USING btree ("order");
  CREATE INDEX "headers_rels_parent_idx" ON "headers_rels" USING btree ("parent_id");
  CREATE INDEX "headers_rels_path_idx" ON "headers_rels" USING btree ("path");
  CREATE INDEX "headers_rels_pages_id_idx" ON "headers_rels" USING btree ("pages_id");
  CREATE INDEX "headers_rels_posts_id_idx" ON "headers_rels" USING btree ("posts_id");
  CREATE INDEX "footers_nav_items_order_idx" ON "footers_nav_items" USING btree ("_order");
  CREATE INDEX "footers_nav_items_parent_id_idx" ON "footers_nav_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "footers_tenant_idx" ON "footers" USING btree ("tenant_id");
  CREATE INDEX "footers_updated_at_idx" ON "footers" USING btree ("updated_at");
  CREATE INDEX "footers_created_at_idx" ON "footers" USING btree ("created_at");
  CREATE INDEX "footers_rels_order_idx" ON "footers_rels" USING btree ("order");
  CREATE INDEX "footers_rels_parent_idx" ON "footers_rels" USING btree ("parent_id");
  CREATE INDEX "footers_rels_path_idx" ON "footers_rels" USING btree ("path");
  CREATE INDEX "footers_rels_pages_id_idx" ON "footers_rels" USING btree ("pages_id");
  CREATE INDEX "footers_rels_posts_id_idx" ON "footers_rels" USING btree ("posts_id");
  ALTER TABLE "posts" ADD CONSTRAINT "posts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "media" ADD CONSTRAINT "media_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "puck_templates" ADD CONSTRAINT "puck_templates_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "redirects" ADD CONSTRAINT "redirects_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "search" ADD CONSTRAINT "search_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_folders" ADD CONSTRAINT "payload_folders_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tenants_fk" FOREIGN KEY ("tenants_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_site_templates_fk" FOREIGN KEY ("site_templates_id") REFERENCES "public"."site_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_headers_fk" FOREIGN KEY ("headers_id") REFERENCES "public"."headers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_footers_fk" FOREIGN KEY ("footers_id") REFERENCES "public"."footers"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "posts_tenant_idx" ON "posts" USING btree ("tenant_id");
  CREATE UNIQUE INDEX "tenant_slug_idx" ON "posts" USING btree ("tenant_id","slug");
  CREATE INDEX "_posts_v_version_version_tenant_idx" ON "_posts_v" USING btree ("version_tenant_id");
  CREATE INDEX "version_tenant_version_slug_idx" ON "_posts_v" USING btree ("version_tenant_id","version_slug");
  CREATE INDEX "media_tenant_idx" ON "media" USING btree ("tenant_id");
  CREATE INDEX "puck_templates_tenant_idx" ON "puck_templates" USING btree ("tenant_id");
  CREATE INDEX "pages_tenant_idx" ON "pages" USING btree ("tenant_id");
  CREATE UNIQUE INDEX "tenant_slug_1_idx" ON "pages" USING btree ("tenant_id","slug");
  CREATE INDEX "_pages_v_version_version_tenant_idx" ON "_pages_v" USING btree ("version_tenant_id");
  CREATE INDEX "version_tenant_version_slug_1_idx" ON "_pages_v" USING btree ("version_tenant_id","version_slug");
  CREATE INDEX "redirects_tenant_idx" ON "redirects" USING btree ("tenant_id");
  CREATE INDEX "search_tenant_idx" ON "search" USING btree ("tenant_id");
  CREATE INDEX "payload_folders_tenant_idx" ON "payload_folders" USING btree ("tenant_id");
  CREATE INDEX "payload_locked_documents_rels_tenants_id_idx" ON "payload_locked_documents_rels" USING btree ("tenants_id");
  CREATE INDEX "payload_locked_documents_rels_site_templates_id_idx" ON "payload_locked_documents_rels" USING btree ("site_templates_id");
  CREATE INDEX "payload_locked_documents_rels_headers_id_idx" ON "payload_locked_documents_rels" USING btree ("headers_id");
  CREATE INDEX "payload_locked_documents_rels_footers_id_idx" ON "payload_locked_documents_rels" USING btree ("footers_id");
  CREATE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");
  CREATE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  DROP TYPE "public"."enum_header_nav_items_link_type";
  DROP TYPE "public"."enum_footer_nav_items_link_type";`)

  // Backfill: assign all pre-existing content to the default tenant (created
  // above only when legacy content exists).
  await db.execute(sql`
  UPDATE "pages" p SET "tenant_id" = t."id" FROM "tenants" t WHERE t."slug" = 'default' AND p."tenant_id" IS NULL;
  UPDATE "_pages_v" v SET "version_tenant_id" = t."id" FROM "tenants" t WHERE t."slug" = 'default' AND v."version_tenant_id" IS NULL;
  UPDATE "posts" p SET "tenant_id" = t."id" FROM "tenants" t WHERE t."slug" = 'default' AND p."tenant_id" IS NULL;
  UPDATE "_posts_v" v SET "version_tenant_id" = t."id" FROM "tenants" t WHERE t."slug" = 'default' AND v."version_tenant_id" IS NULL;
  UPDATE "media" m SET "tenant_id" = t."id" FROM "tenants" t WHERE t."slug" = 'default' AND m."tenant_id" IS NULL;
  UPDATE "puck_templates" pt SET "tenant_id" = t."id" FROM "tenants" t WHERE t."slug" = 'default' AND pt."tenant_id" IS NULL;
  UPDATE "redirects" r SET "tenant_id" = t."id" FROM "tenants" t WHERE t."slug" = 'default' AND r."tenant_id" IS NULL;
  UPDATE "search" s SET "tenant_id" = t."id" FROM "tenants" t WHERE t."slug" = 'default' AND s."tenant_id" IS NULL;
  UPDATE "payload_folders" f SET "tenant_id" = t."id" FROM "tenants" t WHERE t."slug" = 'default' AND f."tenant_id" IS NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_header_nav_items_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_footer_nav_items_link_type" AS ENUM('reference', 'custom');
  CREATE TABLE "header_nav_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_header_nav_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar NOT NULL
  );
  
  CREATE TABLE "header" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "header_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer
  );
  
  CREATE TABLE "footer_nav_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_footer_nav_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar NOT NULL
  );
  
  CREATE TABLE "footer" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "footer_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer
  );
  
  ALTER TABLE "users_tenants_roles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "users_tenants" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "tenants_domains" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "tenants" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_templates_header_nav_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_templates_footer_nav_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_templates_pages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_templates" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_templates_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "headers_nav_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "headers" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "headers_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footers_nav_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footers" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footers_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "users_tenants_roles" CASCADE;
  DROP TABLE "users_tenants" CASCADE;
  DROP TABLE "tenants_domains" CASCADE;
  DROP TABLE "tenants" CASCADE;
  DROP TABLE "site_templates_header_nav_items" CASCADE;
  DROP TABLE "site_templates_footer_nav_items" CASCADE;
  DROP TABLE "site_templates_pages" CASCADE;
  DROP TABLE "site_templates" CASCADE;
  DROP TABLE "site_templates_rels" CASCADE;
  DROP TABLE "headers_nav_items" CASCADE;
  DROP TABLE "headers" CASCADE;
  DROP TABLE "headers_rels" CASCADE;
  DROP TABLE "footers_nav_items" CASCADE;
  DROP TABLE "footers" CASCADE;
  DROP TABLE "footers_rels" CASCADE;
  ALTER TABLE "posts" DROP CONSTRAINT IF EXISTS "posts_tenant_id_tenants_id_fk";
  
  ALTER TABLE "_posts_v" DROP CONSTRAINT IF EXISTS "_posts_v_version_tenant_id_tenants_id_fk";
  
  ALTER TABLE "media" DROP CONSTRAINT IF EXISTS "media_tenant_id_tenants_id_fk";
  
  ALTER TABLE "puck_templates" DROP CONSTRAINT IF EXISTS "puck_templates_tenant_id_tenants_id_fk";
  
  ALTER TABLE "pages" DROP CONSTRAINT IF EXISTS "pages_tenant_id_tenants_id_fk";
  
  ALTER TABLE "_pages_v" DROP CONSTRAINT IF EXISTS "_pages_v_version_tenant_id_tenants_id_fk";
  
  ALTER TABLE "redirects" DROP CONSTRAINT IF EXISTS "redirects_tenant_id_tenants_id_fk";
  
  ALTER TABLE "search" DROP CONSTRAINT IF EXISTS "search_tenant_id_tenants_id_fk";
  
  ALTER TABLE "payload_folders" DROP CONSTRAINT IF EXISTS "payload_folders_tenant_id_tenants_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_tenants_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_site_templates_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_headers_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_footers_fk";
  
  DROP INDEX "posts_tenant_idx";
  DROP INDEX "tenant_slug_idx";
  DROP INDEX "_posts_v_version_version_tenant_idx";
  DROP INDEX "version_tenant_version_slug_idx";
  DROP INDEX "media_tenant_idx";
  DROP INDEX "puck_templates_tenant_idx";
  DROP INDEX "pages_tenant_idx";
  DROP INDEX "tenant_slug_1_idx";
  DROP INDEX "_pages_v_version_version_tenant_idx";
  DROP INDEX "version_tenant_version_slug_1_idx";
  DROP INDEX "redirects_tenant_idx";
  DROP INDEX "search_tenant_idx";
  DROP INDEX "payload_folders_tenant_idx";
  DROP INDEX "payload_locked_documents_rels_tenants_id_idx";
  DROP INDEX "payload_locked_documents_rels_site_templates_id_idx";
  DROP INDEX "payload_locked_documents_rels_headers_id_idx";
  DROP INDEX "payload_locked_documents_rels_footers_id_idx";
  DROP INDEX "posts_slug_idx";
  DROP INDEX "pages_slug_idx";
  ALTER TABLE "header_nav_items" ADD CONSTRAINT "header_nav_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_nav_items" ADD CONSTRAINT "footer_nav_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "header_nav_items_order_idx" ON "header_nav_items" USING btree ("_order");
  CREATE INDEX "header_nav_items_parent_id_idx" ON "header_nav_items" USING btree ("_parent_id");
  CREATE INDEX "header_rels_order_idx" ON "header_rels" USING btree ("order");
  CREATE INDEX "header_rels_parent_idx" ON "header_rels" USING btree ("parent_id");
  CREATE INDEX "header_rels_path_idx" ON "header_rels" USING btree ("path");
  CREATE INDEX "header_rels_pages_id_idx" ON "header_rels" USING btree ("pages_id");
  CREATE INDEX "header_rels_posts_id_idx" ON "header_rels" USING btree ("posts_id");
  CREATE INDEX "footer_nav_items_order_idx" ON "footer_nav_items" USING btree ("_order");
  CREATE INDEX "footer_nav_items_parent_id_idx" ON "footer_nav_items" USING btree ("_parent_id");
  CREATE INDEX "footer_rels_order_idx" ON "footer_rels" USING btree ("order");
  CREATE INDEX "footer_rels_parent_idx" ON "footer_rels" USING btree ("parent_id");
  CREATE INDEX "footer_rels_path_idx" ON "footer_rels" USING btree ("path");
  CREATE INDEX "footer_rels_pages_id_idx" ON "footer_rels" USING btree ("pages_id");
  CREATE INDEX "footer_rels_posts_id_idx" ON "footer_rels" USING btree ("posts_id");
  CREATE UNIQUE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  ALTER TABLE "posts" DROP COLUMN "tenant_id";
  ALTER TABLE "_posts_v" DROP COLUMN "version_tenant_id";
  ALTER TABLE "media" DROP COLUMN "tenant_id";
  ALTER TABLE "puck_templates" DROP COLUMN "tenant_id";
  ALTER TABLE "pages" DROP COLUMN "tenant_id";
  ALTER TABLE "_pages_v" DROP COLUMN "version_tenant_id";
  ALTER TABLE "redirects" DROP COLUMN "tenant_id";
  ALTER TABLE "search" DROP COLUMN "tenant_id";
  ALTER TABLE "payload_folders" DROP COLUMN "tenant_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "tenants_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "site_templates_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "headers_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "footers_id";
  DROP TYPE "public"."enum_users_tenants_roles";
  DROP TYPE "public"."enum_tenants_status";
  DROP TYPE "public"."enum_tenants_theme_fonts_heading";
  DROP TYPE "public"."enum_tenants_theme_fonts_body";
  DROP TYPE "public"."enum_site_templates_header_nav_items_link_type";
  DROP TYPE "public"."enum_site_templates_footer_nav_items_link_type";
  DROP TYPE "public"."enum_site_templates_pages_page_layout";
  DROP TYPE "public"."enum_site_templates_theme_fonts_heading";
  DROP TYPE "public"."enum_site_templates_theme_fonts_body";
  DROP TYPE "public"."enum_headers_nav_items_link_type";
  DROP TYPE "public"."enum_footers_nav_items_link_type";`)
}
