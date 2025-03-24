CREATE TABLE "activities" (
	"uuid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_uuid" uuid NOT NULL,
	"name" varchar NOT NULL,
	"created_at" timestamp (0) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (0) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"uuid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_uuid" uuid NOT NULL,
	"created_by" uuid,
	"name" varchar NOT NULL,
	"created_at" timestamp (0) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (0) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "time_entries" (
	"uuid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_uuid" uuid NOT NULL,
	"activity_uuid" uuid NOT NULL,
	"started_at" timestamp (0) with time zone NOT NULL,
	"stopped_at" timestamp (0) with time zone,
	"created_at" timestamp (0) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (0) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"uuid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_uuid" uuid NOT NULL,
	"name" varchar NOT NULL,
	"display_name" varchar NOT NULL,
	"created_at" timestamp (0) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (0) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workspaces" (
	"uuid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"created_at" timestamp (0) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (0) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_project_uuid_projects_uuid_fk" FOREIGN KEY ("project_uuid") REFERENCES "public"."projects"("uuid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_workspace_uuid_workspaces_uuid_fk" FOREIGN KEY ("workspace_uuid") REFERENCES "public"."workspaces"("uuid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_created_by_users_uuid_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("uuid") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_user_uuid_users_uuid_fk" FOREIGN KEY ("user_uuid") REFERENCES "public"."users"("uuid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_activity_uuid_activities_uuid_fk" FOREIGN KEY ("activity_uuid") REFERENCES "public"."activities"("uuid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_workspace_uuid_workspaces_uuid_fk" FOREIGN KEY ("workspace_uuid") REFERENCES "public"."workspaces"("uuid") ON DELETE cascade ON UPDATE no action;