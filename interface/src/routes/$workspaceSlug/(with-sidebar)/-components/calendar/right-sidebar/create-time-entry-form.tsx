import { useAtomRef } from "@effect-atom/atom-react";
import { Field, FieldGroup, FieldSet } from "@mason/ui/field";
import { useAppForm } from "@mason/ui/form";
import { Icons } from "@mason/ui/icons";
import { TimePicker } from "@mason/ui/time-picker";
import { revalidateLogic } from "@tanstack/react-form";
import z from "zod";
import { calendarSortedDragSelectionAtom } from "~/atoms/calendar-atom";
import { formatter } from "~/utils/date-time";

const createTimeEntrySchema = z.object({
  startedAt: z.iso.datetime(),
  stoppedAt: z.iso.datetime(),
});

function CreateTimeEntryForm() {
  const dragSelection = useAtomRef(calendarSortedDragSelectionAtom);

  const form = useAppForm({
    defaultValues: {
      startedAt: dragSelection?.start.toISOString() ?? new Date().toISOString(),
      stoppedAt: dragSelection?.end.toISOString() ?? new Date().toISOString(),
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: createTimeEntrySchema,
    },
  });

  return (
    <form>
      <FieldSet>
        <FieldGroup className="gap-3" direction="horizontal">
          <form.Field
            children={(field) => (
              <Field>
                <TimePicker
                  format={(date) => formatter.time(date)}
                  onChange={(value) => field.handleChange(value.toISOString())}
                  value={new Date(field.state.value)}
                />
              </Field>
            )}
            name="startedAt"
          />
          <Icons.ArrowRight className="muted-foreground size-4 shrink-0" />
          <form.Field
            children={(field) => (
              <Field>
                <TimePicker
                  format={(date) => formatter.time(date)}
                  onChange={(value) => field.handleChange(value.toISOString())}
                  value={new Date(field.state.value)}
                />
              </Field>
            )}
            name="stoppedAt"
          />
        </FieldGroup>
      </FieldSet>
    </form>
  );
}

export { CreateTimeEntryForm };
