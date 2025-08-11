/**
 * Returns a display name for an entity, showing "Untitled [entityType]" when empty
 * This utility is designed to work with i18n in the future
 */
export function displayName(
  name: string | null | undefined,
  entityType: "project" | "task" | "time entry" | "workspace",
): string {
  const isEmpty = !name || name.trim().length === 0;

  if (isEmpty) {
    const untitledPrefix = "Untitled";
    const entityLabel = entityType;

    // In the future, this would be replaced with i18n translation:
    // return t('common.untitledEntity', { entity: t(`entities.${entityType}`) })
    return `${untitledPrefix} ${entityLabel}`;
  }

  return name.trim();
}
