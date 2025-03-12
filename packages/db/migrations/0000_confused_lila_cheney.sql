CREATE TABLE "organizations" (
	"uuid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "time_entries" (
	"uuid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_uuid" uuid NOT NULL,
	"started_at" timestamp (0) with time zone NOT NULL,
	"stopped_at" timestamp (0) with time zone
);
--> statement-breakpoint
CREATE TABLE "users" (
	"uuid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_uuid" uuid NOT NULL,
	"name" varchar NOT NULL,
	"display_name" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users_to_workspaces" (
	"user_uuid" uuid NOT NULL,
	"workspace_uuid" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workspaces" (
	"uuid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_uuid" uuid NOT NULL,
	"name" varchar NOT NULL
);
--> statement-breakpoint
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_user_uuid_users_uuid_fk" FOREIGN KEY ("user_uuid") REFERENCES "public"."users"("uuid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_organization_uuid_organizations_uuid_fk" FOREIGN KEY ("organization_uuid") REFERENCES "public"."organizations"("uuid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_to_workspaces" ADD CONSTRAINT "users_to_workspaces_user_uuid_users_uuid_fk" FOREIGN KEY ("user_uuid") REFERENCES "public"."users"("uuid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_to_workspaces" ADD CONSTRAINT "users_to_workspaces_workspace_uuid_workspaces_uuid_fk" FOREIGN KEY ("workspace_uuid") REFERENCES "public"."workspaces"("uuid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_organization_uuid_organizations_uuid_fk" FOREIGN KEY ("organization_uuid") REFERENCES "public"."organizations"("uuid") ON DELETE cascade ON UPDATE no action;