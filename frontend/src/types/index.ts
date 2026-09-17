export type Role = 'Owner' | 'Admin' | 'Manager' | 'Member';

export interface User {
  _id: string;
  name: string;
  email: string;
  companyId: string;
  companyName?: string;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
}

export interface Company {
  _id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Project {
  _id: string;
  title: string;
  description?: string;
  status?: string;
  deadline?: string;
  companyId: string;
  members?: (string | User)[];
  createdBy?: string | User;
  createdAt?: string;
  updatedAt?: string;
}

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in-progress' | 'done';

export interface Task {
  _id: string;
  title: string;
  description?: string;
  priority?: TaskPriority | string;
  status?: TaskStatus | string;
  dueDate?: string;
  labels?: string[];
  companyId: string;
  projectId: string;
  assignedTo?: string | User;
  createdBy?: string | User;
  createdAt?: string;
  updatedAt?: string;
}

export interface Comment {
  _id: string;
  text: string;
  taskId: string;
  userId: string | User;
  companyId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ActivityLogItem {
  _id: string;
  companyId: string;
  projectId?: string;
  userId: string | { _id: string; name: string; email: string };
  action: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NotificationItem {
  _id: string;
  companyId: string;
  userId: string;
  message: string;
  type: string;
  read: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  tasksByStatus: Record<string, number>;
  overdueTasks: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}
