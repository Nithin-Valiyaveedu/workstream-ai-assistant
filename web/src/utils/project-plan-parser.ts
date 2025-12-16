import { MessagePart, ProjectPlan } from '../types/project-plan';

/**
 * Parse message content to extract project plans and text
 *
 * Expected format in LLM response:
 * ```
 * Some text before...
 *
 * <PROJECT_PLAN>
 * {
 *   "workstreams": [
 *     {
 *       "title": "Workstream Title",
 *       "description": "Description",
 *       "deliverables": [
 *         { "title": "Deliverable 1", "description": "Description" }
 *       ]
 *     }
 *   ]
 * }
 * </PROJECT_PLAN>
 *
 * Some text after...
 * ```
 */
export function parseMessageContent(content: string): MessagePart[] {
    const parts: MessagePart[] = [];

    // Regex to find project plan blocks
    const projectPlanRegex = /<PROJECT_PLAN>([\s\S]*?)<\/PROJECT_PLAN>/g;

    let lastIndex = 0;
    let match;

    while ((match = projectPlanRegex.exec(content)) !== null) {
        // Add text before the project plan
        const textBefore = content.substring(lastIndex, match.index);
        if (textBefore.trim()) {
            parts.push({
                type: 'text',
                content: textBefore.trim(),
            });
        }

        // Parse the project plan JSON
        try {
            const jsonContent = match[1].trim();
            const projectPlan = JSON.parse(jsonContent) as ProjectPlan;

            // Add IDs to workstreams if not present
            const workstreamsWithIds = projectPlan.workstreams.map((ws, index) => ({
                ...ws,
                id: ws.id || String.fromCharCode(65 + index), // A, B, C, etc.
            }));

            parts.push({
                type: 'project-plan',
                content: {
                    workstreams: workstreamsWithIds,
                },
            });
        } catch (error) {
            console.error('Failed to parse project plan JSON:', error);
            // If parsing fails, treat it as text
            parts.push({
                type: 'text',
                content: match[0],
            });
        }

        lastIndex = match.index + match[0].length;
    }

    // Add remaining text after the last project plan
    const textAfter = content.substring(lastIndex);
    if (textAfter.trim()) {
        parts.push({
            type: 'text',
            content: textAfter.trim(),
        });
    }

    // If no project plans found, return the entire content as text
    if (parts.length === 0) {
        parts.push({
            type: 'text',
            content: content,
        });
    }

    return parts;
}
