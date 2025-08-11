import { sql } from 'drizzle-orm';
import { timestamp, uuid } from 'drizzle-orm/pg-core';

export const tableId = uuid('id').primaryKey().default(sql`uuid_generate_v7()`);

export const tableMetadata = {
  created_at: timestamp('created_at', {
    withTimezone: true,
    precision: 0,
  })
    .defaultNow()
    .notNull(),
  updated_at: timestamp('updated_at', {
    withTimezone: true,
    precision: 0,
  })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
};
