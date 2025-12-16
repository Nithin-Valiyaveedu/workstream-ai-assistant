import { useState } from "react";
import { ProjectPlan, Workstream } from "../types/project-plan";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";

interface ProjectPlanPreviewProps {
  projectPlan: ProjectPlan;
}

export function ProjectPlanPreview({ projectPlan }: ProjectPlanPreviewProps) {
  return (
    <div className="border rounded-lg p-6 bg-background my-4">
      <h3 className="text-xl font-semibold mb-6">Project Workstreams</h3>
      <div className="flex flex-col gap-4">
        {projectPlan.workstreams.map((workstream) => (
          <WorkstreamItem key={workstream.id} workstream={workstream} />
        ))}
      </div>
    </div>
  );
}

interface WorkstreamItemProps {
  workstream: Workstream;
}

function WorkstreamItem({ workstream }: WorkstreamItemProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="border rounded-lg overflow-hidden">
        {/* Header */}
        <CollapsibleTrigger className="w-full">
          <div className="flex items-start gap-4 p-4 hover:bg-accent/50 transition-colors">
            {/* Letter Badge */}
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center font-semibold text-muted-foreground">
              {workstream.id}
            </div>

            {/* Content */}
            <div className="flex-1 text-left">
              <h4 className="font-semibold text-base mb-2">{workstream.title}</h4>
              <p className="text-sm text-muted-foreground">{workstream.description}</p>
            </div>

            {/* Chevron */}
            <div className="flex-shrink-0 text-muted-foreground">
              {isOpen ? (
                <ChevronUpIcon className="w-5 h-5" />
              ) : (
                <ChevronDownIcon className="w-5 h-5" />
              )}
            </div>
          </div>
        </CollapsibleTrigger>

        {/* Deliverables */}
        <CollapsibleContent>
          {workstream.deliverables.length > 0 && (
            <div className="border-t bg-muted/30 p-4">
              <h5 className="font-semibold text-sm mb-3">Deliverables</h5>
              <div className="flex flex-col gap-3">
                {workstream.deliverables.map((deliverable, index) => (
                  <div key={index} className="flex items-start gap-3">
                    {/* Icon placeholder - using a simple dot */}
                    <div className="flex-shrink-0 w-5 h-5 rounded bg-primary/20 flex items-center justify-center mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>

                    {/* Deliverable content */}
                    <div className="flex-1">
                      <h6 className="font-semibold text-sm mb-1">{deliverable.title}</h6>
                      <p className="text-sm text-muted-foreground">{deliverable.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
