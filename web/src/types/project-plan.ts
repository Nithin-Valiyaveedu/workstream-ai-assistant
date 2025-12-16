export interface Deliverable {
  title: string;
  description: string;
}

export interface Workstream {
  id: string;
  title: string;
  description: string;
  deliverables: Deliverable[];
}

export interface ProjectPlan {
  workstreams: Workstream[];
}

export interface MessagePart {
  type: 'text' | 'project-plan';
  content: string | ProjectPlan;
}
