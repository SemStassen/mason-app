# @mason/db

## Temporary Drizzle driver note

This package is currently using plain Drizzle (`drizzle-orm/node-postgres`) wrapped by the `Database` Effect service.

### Reminder

When Drizzle ships a stable Effect v4-native driver, switch `packages/db/src/database.layer.ts` from plain node-postgres Drizzle to the Effect-native Drizzle client.

The goal is to keep repository code unchanged and only swap the layer implementation.
