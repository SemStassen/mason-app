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
import { rootStore } from "~/stores/root-store";

type FormValues = {
  theme: "light" | "dark" | "system";
};

const InterfaceAndThemeForm = observer(() => {
  const { uiStore } = rootStore;

  return (
    <ul className="flex flex-col rounded-md bg-contrast-5 ring ring-contrast-10">
      <div className="flex items-center justify-between gap-2 p-3">
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
