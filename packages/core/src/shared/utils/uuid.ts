import { v7 as uuidv7 } from "uuid";

/**
 * Generate a UUIDv7 for new entities.
 */
export function generateUUID(): string {
  return uuidv7();
}