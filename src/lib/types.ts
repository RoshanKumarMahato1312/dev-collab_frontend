export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface ProjectMemberRole {
  user: User;
  role: "admin" | "member";
}

export interface Project {
  _id: string;
  name: string;
  description: string;
  status?: "active" | "completed";
  completedAt?: string | null;
  owner: User;
  members: User[];
  memberRoles?: ProjectMemberRole[];
  currentUserRole?: "owner" | "admin" | "member" | "none";
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  _id: string;
  projectId: string;
  actor: User;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "done";
  assignedTo?: User | null;
  dueDate?: string | null;
  projectId: string;
  createdAt: string;
}

export interface Message {
  _id: string;
  text: string;
  sender: User;
  projectId: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Snippet {
  _id: string;
  code: string;
  language: string;
  projectId: string;
  createdBy: User;
  createdAt: string;
}

export interface Notification {
  _id: string;
  userId: string;
  message: string;
  read: boolean;
  createdAt: string;
}
