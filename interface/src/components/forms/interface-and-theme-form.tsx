import { Description } from "@mason/ui/description";
import { Label } from "@mason/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@mason/ui/select";
import { observer } from "mobx-react-lite";
import { uiStore } from "~/stores/ui-store";

type FormValues = {
  theme: "light" | "dark" | "system";
};

const InterfaceAndThemeForm = observer(() => {
  return (
    <ul className="flex flex-col bg-muted rounded-md">
      <div className="flex gap-2 justify-between items-center p-3">
        <div className="flex flex-col gap-0.5">
          <Label>Interface theme</Label>
          <Description>Select your interface color schema</Description>
        </div>
        <Select
          onValueChange={(value: FormValues["theme"]) =>
            uiStore.setTheme(value)
          }
          value={uiStore.theme as FormValues["theme"]}
        >
          <SelectTrigger>
            <SelectValue defaultValue="Theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </ul>
  );
});

export { InterfaceAndThemeForm };
