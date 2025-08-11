import type { Project } from "@mason/db/schema";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@mason/ui/collapsible";
import { RichEditor } from "@mason/ui/rich-editor";
import { ToggleGroup, ToggleGroupItem } from "@mason/ui/toggle-group";
import { observer } from "mobx-react-lite";
import { AnimatePresence, motion } from "motion/react";
import {
  Property,
  PropertyContent,
  PropertyLabel,
} from "~/components/property";
import { useLiveQuery } from "~/hooks/use-live-query";
import { rootStore } from "~/stores/root-store";
import { Route } from ".";
import { UpdateLeadCombobox } from "./_components/update-lead-combobox";

const ProjectSidebar = observer(() => {
  const { projectId } = Route.useParams();
  const { pg, liveUsers, liveProjects } = Route.useLoaderData();
  const { projectPageStore } = rootStore;

  const usersData = useLiveQuery(liveUsers);
  const projectsData = useLiveQuery(liveProjects);

  const users = usersData?.rows;
  const project = projectsData?.rows[0];

  if (!users || !project) {
    return null;
  }

  const handleMutation = (data: Partial<Project>) => {
    const setClause = Object.keys(data)
      .map((key, index) => `${key} = $${index + 1}`)
      .join(", ");

    return pg.query(
      `UPDATE projects SET ${setClause} WHERE id = $${Object.keys(data).length + 1}`,
      [...Object.values(data), projectId],
    );
  };

  return (
    <AnimatePresence initial={false}>
      {projectPageStore.isInfoPanelOpen && (
        <motion.div
          className="h-full flex-none overflow-hidden border-l"
          transition={{
            ease: "linear",
            duration: 0.1,
          }}
          initial={{ width: 0 }}
          animate={{ width: 400 }}
          exit={{ width: 0 }}
        >
          <Collapsible className="p-4" defaultOpen={true}>
            <CollapsibleTrigger variant="ghost" size="sm" asChild>
              Info
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="flex flex-col gap-4">
                <Property>
                  <PropertyLabel>Lead</PropertyLabel>
                  <PropertyContent>
                    <UpdateLeadCombobox
                      users={users}
                      leadId={project.lead_id}
                      onChange={(val) =>
                        handleMutation({
                          lead_id: val,
                        })
                      }
                    />
                  </PropertyContent>
                </Property>
                <Property>
                  <PropertyLabel>Billable</PropertyLabel>
                  <PropertyContent>
                    <ToggleGroup
                      type="single"
                      variant="outline"
                      size="sm"
                      value={project.is_billable.toString()}
                      onValueChange={(value) =>
                        handleMutation({ is_billable: value === "true" })
                      }
                    >
                      <ToggleGroupItem value="true">Billable</ToggleGroupItem>
                      <ToggleGroupItem value="false">
                        Non-billable
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </PropertyContent>
                </Property>
                <Property>
                  <PropertyLabel>Notes</PropertyLabel>
                  <PropertyContent className="h-60 w-full">
                    <RichEditor
                      content={project.notes}
                      onBlur={(props) => {
                        handleMutation({ notes: props.editor.getJSON() });
                      }}
                    />
                  </PropertyContent>
                </Property>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export { ProjectSidebar };
