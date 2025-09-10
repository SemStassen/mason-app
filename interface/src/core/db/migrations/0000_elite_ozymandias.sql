CREATE TABLE "snapshots" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "snapshots_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"timestamp" integer,
	"applicationName" varchar,
	"windowTitle" varchar,
	"idleTimeSeconds" integer
);
