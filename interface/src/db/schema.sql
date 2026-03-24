CREATE TABLE "workspace_members" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"workspace_id" uuid NOT NULL,
	"display_name" varchar NOT NULL,
	"role" varchar NOT NULL,
	"image_url" varchar,
	"created_at" timestamp(0) with time zone NOT NULL,
	"updated_at" timestamp(0) with time zone NOT NULL
);

CREATE TABLE "workspaces" (
	"id" uuid PRIMARY KEY,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"logo_url" text,
	"metadata" text,
	"created_at" timestamp(0) with time zone NOT NULL,
	"updated_at" timestamp(0) with time zone NOT NULL
);

