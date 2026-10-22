export interface User {
  id: number;
  name: string;
  email: string;
}

export interface AuthResponse {
  message: string;
  user: User;
}


export interface Workspace {
  id: number;
  name: string;
  slug: string;
  role?: string;
  created_at: string;
}


export interface WorkspaceMember {
  id: number;
  name: string;
  email: string;
  role: string;
}


export type TaskStatus = 'todo' | 'in_progress' | 'done';

export type TaskPriority = 'low' | 'medium' | 'high';

export interface TaskUser {
  id: number;
  name: string;
  email: string;
}

export interface Task {
  id: number;
  workspace_id: number;
  created_by: number | null;
  assigned_to: number | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  creator?: TaskUser | null;
  assignee?: TaskUser | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedTasks {
  current_page: number;
  data: Task[];
  last_page: number;
  per_page: number;
  total: number;
}

export interface TaskComment {
  id: number;
  task_id: number;
  user_id: number;
  body: string;
  created_at: string;
  updated_at: string;
  user: TaskUser;
}

export interface TaskCommentsResponse {
  message: string;
  data: TaskComment[];
}

export interface TaskCommentResponse {
  message: string;
  data: TaskComment;
}


export interface AppNotificationData {
  type: string;
  message: string;
  data: {
    task_id?: number;
    workspace_id?: number;
    task_title?: string;
    [key: string]: unknown;
  };
}

export interface AppNotification {
  id: string;
  type: string;
  data: AppNotificationData;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedNotifications {
  current_page: number;
  data: AppNotification[];
  last_page: number;
  per_page: number;
  total: number;
}
