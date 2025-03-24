import { faker } from "@faker-js/faker";
import type {} from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { reset } from "drizzle-seed";
import * as schema from "./src/schema";

async function main() {
  const db = drizzle({
    connection: {
      url: "postgres://electric_user:password@localhost:5442/mason",
    },
  });

  await reset(db, schema);

  const workspaces = await db
    .insert(schema.workspacesTable)
    .values([
      {
        name: "Mason HQ",
      },
    ])
    .returning({ uuid: schema.workspacesTable.uuid });

  const users = await db
    .insert(schema.usersTable)
    .values(
      Array.from({ length: 20 }, () => {
        const fullName = faker.person.fullName();
        return {
          workspace_uuid: workspaces[0].uuid,
          name: fullName,
          display_name: fullName,
        };
      }),
    )
    .returning({ uuid: schema.usersTable.uuid });

  const projects = await db
    .insert(schema.projectsTable)
    .values(
      Array.from({ length: 20 }, () => {
        return {
          workspace_uuid: workspaces[0].uuid,
          name: faker.commerce.productName(),
        };
      }),
    )
    .returning({ uuid: schema.projectsTable.uuid });

  const activities = await db
    .insert(schema.activitiesTable)
    .values(
      Array.from({ length: 20 }, (_, i) => {
        return {
          project_uuid: projects[i % projects.length].uuid,
          name: faker.helpers.arrayElement([
            "Design",
            "Development",
            "Testing",
            "Deployment",
          ]),
        };
      }),
    )
    .returning({ uuid: schema.activitiesTable.uuid });

  const timeEntries = await db
    .insert(schema.timeEntriesTable)
    .values(
      Array.from({ length: 200 }, (_, i) => {
        const startDate = faker.date.between({
          from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          to: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        // Add random duration (15min to 6hrs)
        const durationMinutes = faker.number.int({ min: 15, max: 360 });
        const endDate = new Date(
          startDate.getTime() + durationMinutes * 60 * 1000,
        );

        return {
          user_uuid: users[i % users.length].uuid,
          activity_uuid: activities[i % activities.length].uuid,
          started_at: startDate,
          stopped_at: endDate,
        };
      }),
    )
    .returning({ uuid: schema.timeEntriesTable.uuid });

  console.log("✅ Seed successful!");
  console.log(`Created: 
      - ${workspaces.length} workspaces
      - ${users.length} users
      - ${projects.length} projects
      - ${activities.length} activities
      - ${timeEntries.length} time entries`);

  return;
}

main();
