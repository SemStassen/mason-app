import { Schema } from "effect";

export class ProjectArchivedError extends Schema.TaggedErrorClass<ProjectArchivedError>()(
	"project/ProjectArchivedError",
	{},
) {}

export class ProjectEndDateBeforeStartDateError extends Schema.TaggedErrorClass<ProjectEndDateBeforeStartDateError>()(
	"project/ProjectEndDateBeforeStartDateError",
	{},
) {}
