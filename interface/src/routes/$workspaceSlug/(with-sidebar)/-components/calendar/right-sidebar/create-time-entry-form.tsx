import { useAtomRef, useAtomValue } from "@effect-atom/atom-react";
import { Field, FieldGroup, Fieldset } from "@mason/ui/field";
import { Icons } from "@mason/ui/icons";
import { revalidateLogic } from "@tanstack/react-form";
import { isEqual } from "date-fns";
import { Schema } from "effect";
import { useEffect } from "react";
import { projectsWithTasksAtom } from "~/atoms/api";
import {
  calendarSortedDragSelectionAtom,
  setDragSelectionFirst,
  setDragSelectionSecond,
} from "~/atoms/calendar-atom";
import { useAppForm } from "~/components/form";

const createTimeEntrySchema = Schema.standardSchemaV1(
  Schema.Struct({
    startedAt: Schema.Date,
    stoppedAt: Schema.Date,
    projectId: Schema.NonEmptyString,
    taskId: Schema.NullOr(Schema.String),
    description: Schema.NullOr(Schema.String),
  })
);

const defaultValues: typeof createTimeEntrySchema.Encoded = {
  startedAt: new Date().toISOString(),
  stoppedAt: new Date().toISOString(),
  projectId: "",
  taskId: null,
  description: null,
};

function CreateTimeEntryForm() {
  const dragSelection = useAtomRef(calendarSortedDragSelectionAtom);
  const projectsWithTasks = useAtomValue(projectsWithTasksAtom);

  const form = useAppForm({
    defaultValues: {
      ...defaultValues,
      startedAt: dragSelection?.start.toISOString() ?? defaultValues.startedAt,
      stoppedAt: dragSelection?.end.toISOString() ?? defaultValues.stoppedAt,
      projectId: projectsWithTasks[0]?.id,
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: createTimeEntrySchema,
    },
  });

  return (
    <form>
      <FieldGroup direction="vertical">
        <Fieldset>
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
              listeners={{
                onChange: (value) => {
                  if (isEqual(value.value, form.state.values.startedAt)) {
                    return;
                  }

                  setDragSelectionFirst(new Date(value.value));
                },
              }}
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
              listeners={{
                onChange: (value) => {
                  if (isEqual(value.value, form.state.values.stoppedAt)) {
                    return;
                  }

                  setDragSelectionSecond(new Date(value.value));
                },
              }}
              name="stoppedAt"
            />
          </FieldGroup>
        </Fieldset>
        <Fieldset>
          <FieldGroup className="items-start gap-2" direction="horizontal">
            <Icons.Folder className="mt-2.5 size-4 shrink-0 text-muted-foreground" />

            <FieldGroup>
              <form.AppField
                children={(field) => (
                  <field.ComboBoxField
                    description={{
                      className: "sr-only",
                      children: "The project you worked on",
                    }}
                    items={[
                      {
                        label: "No project",
                        value: null,
                      },
                      ...projectsWithTasks.map((project) => ({
                        label: project.name,
                        value: project.id,
                      })),
                    ]}
                    label={{ className: "sr-only", children: "Project" }}
                  />
                )}
                name="projectId"
              />
              <form.Subscribe
                selector={(state) => state.values.projectId}
                children={(projectId) => (
                  <form.AppField
                    children={(field) => {
                      const tasks =
                        projectsWithTasks.find((p) => p.id === projectId)
                          ?.tasks ?? [];
                      const hasTasks = tasks.length > 0;

                      const items = hasTasks
                        ? [
                            { label: "No task", value: null },
                            ...tasks.map((t) => ({
                              label: t.name,
                              value: t.id,
                            })),
                          ]
                        : [{ label: "No tasks available", value: null }];

                      return (
                        <field.SelectField
                          description={{
                            className: "sr-only",
                            children: "The task of the project you worked on",
                          }}
                          field={{
                            disabled: !projectId || !hasTasks,
                          }}
                          items={items}
                          label={{ className: "sr-only", children: "Task" }}
                        />
                      );
                    }}
                    name="taskId"
                  />
                )}
              />
            </FieldGroup>
          </FieldGroup>
        </Fieldset>
        <Fieldset>
          <form.AppField
            children={(field) => (
              <field.TextareaField
                field={{
                  className: "ml-6",
                }}
                textarea={{
                  placeholder: "Notes...",
                }}
                description={{ className: "sr-only", children: "The description of the time entry" }}
                label={{ className: "sr-only", children: "Description" }}
              />
            )}
            name="description"
          />
        </Fieldset>
        <Field className="ml-6">
          <form.AppForm>
            <form.SubmitButton>Create Time Entry</form.SubmitButton>
          </form.AppForm>
        </Field>
      </FieldGroup>
    </form>
  );
}

export { CreateTimeEntryForm };
