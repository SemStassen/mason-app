import { useAtomRef, useAtomValue } from "@effect-atom/atom-react";
import { Field, FieldGroup, FieldSet } from "@mason/ui/field";
import { Icons } from "@mason/ui/icons";
import { revalidateLogic, useStore } from "@tanstack/react-form";
import { Schema } from "effect";
import { projectsWithTasksAtom } from "~/atoms/api";
import { calendarSortedDragSelectionAtom } from "~/atoms/calendar-atom";
import { useAppForm } from "~/components/form";

const createTimeEntrySchema = Schema.standardSchemaV1(
  Schema.Struct({
    startedAt: Schema.Date,
    stoppedAt: Schema.Date,
    projectId: Schema.NonEmptyString,
    taskId: Schema.String,
  })
);

function CreateTimeEntryForm() {
  const dragSelection = useAtomRef(calendarSortedDragSelectionAtom);
  const projectsWithTasks = useAtomValue(projectsWithTasksAtom);

  const form = useAppForm({
    defaultValues: {
      startedAt: dragSelection?.start.toISOString() ?? new Date().toISOString(),
      stoppedAt: dragSelection?.end.toISOString() ?? new Date().toISOString(),
      projectId: "",
      taskId: "",
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: createTimeEntrySchema,
    },
  });

  const selectedProjectId = useStore(
    form.store,
    (state) => state.values.projectId
  );
  const tasks = projectsWithTasks.find(
    (item) => item.id === selectedProjectId
  )?.tasks;

  return (
    <form>
      <FieldGroup>
        <FieldSet>
          <FieldGroup className="gap-2" direction="horizontal">
            <Icons.Clock className="size-4 shrink-0 text-muted-foreground" />
            <form.AppField
              children={(field) => (
                <field.TimeField
                  description={{
                    className: "sr-only",
                    children: "Time you started working on the task",
                  }}
                  label={{ className: "sr-only", children: "Started At" }}
                />
              )}
              name="startedAt"
            />
            <Icons.ArrowRight className="muted-foreground size-4 shrink-0" />
            <form.AppField
              children={(field) => (
                <field.TimeField
                  description={{
                    className: "sr-only",
                    children: "Time you stopped working on the task",
                  }}
                  label={{ className: "sr-only", children: "Stopped At" }}
                />
              )}
              name="stoppedAt"
            />
          </FieldGroup>
        </FieldSet>
        <FieldSet>
          <FieldGroup className="items-start gap-2" direction="horizontal">
            <Icons.Folder className="mt-2.5 size-4 shrink-0 text-muted-foreground" />

            <FieldGroup>
              <form.AppField
                children={(field) => (
                  <field.SelectField
                    description={{
                      className: "sr-only",
                      children: "The project you worked on",
                    }}
                    items={projectsWithTasks}
                    itemValue={(item) => item.id}
                    label={{ className: "sr-only", children: "Project" }}
                    renderItem={(item) => item.name}
                    renderValue={(value) => value?.name}
                  />
                )}
                name="projectId"
              />

              <form.AppField
                children={(field) => (
                  <field.SelectField
                    description={{
                      className: "sr-only",
                      children: "The task of the project you worked on",
                    }}
                    field={{
                      disabled: !selectedProjectId,
                    }}
                    items={tasks ?? []}
                    itemValue={(item) => item.id}
                    label={{ className: "sr-only", children: "Task" }}
                    renderItem={(item) => item.name}
                    renderValue={(value) => value?.name}
                  />
                )}
                name="taskId"
              />
            </FieldGroup>
          </FieldGroup>
        </FieldSet>
        <Field>
          <form.AppForm>
            <form.SubmitButton>Create Time Entry</form.SubmitButton>
          </form.AppForm>
        </Field>
      </FieldGroup>
    </form>
  );
}

export { CreateTimeEntryForm };
