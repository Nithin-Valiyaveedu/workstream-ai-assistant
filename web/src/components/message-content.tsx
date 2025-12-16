import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { parseMessageContent } from "../utils/project-plan-parser";
import { ProjectPlanPreview } from "./project-plan-preview";
import { ProjectPlan } from "../types/project-plan";

interface MessageContentProps {
  content: string;
}

/**
 * Renders message content, parsing out project plans and rendering them
 * as interactive preview components
 */
export function MessageContent({ content }: MessageContentProps) {
  const parts = parseMessageContent(content);

  return (
    <div className="flex flex-col gap-0">
      {parts.map((part, index) => {
        if (part.type === 'text') {
          return (
            <div key={index} className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {part.content as string}
              </ReactMarkdown>
            </div>
          );
        } else if (part.type === 'project-plan') {
          return (
            <ProjectPlanPreview
              key={index}
              projectPlan={part.content as ProjectPlan}
            />
          );
        }
        return null;
      })}
    </div>
  );
}
