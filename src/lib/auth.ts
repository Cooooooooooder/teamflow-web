
import api from './axios';

export async function initializeCsrf() {
  await api.get('/sanctum/csrf-cookie');
}

export async function register(data: {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}) {
  await initializeCsrf();

  const response = await api.post('/register', data);

  return response.data;
}

export async function login(data: {
  email: string;
  password: string;
}) {
  await initializeCsrf();

  const response = await api.post('/login', data);

  return response.data;       
}

export async function logout() {
  const response = await api.post('/logout');

  return response.data;
}

export async function getCurrentUser() {
  const response = await api.get('/api/user');

  return response.data;
}


export async function getWorkspaces() {
  const response = await api.get('/api/workspaces');
  return response.data;
}

export async function createWorkspace(data: { name: string }) {
  const response = await api.post('/api/workspaces', data);
  return response.data;
}

export async function deleteWorkspace(workspaceId: number) {
  const response = await api.delete(`/api/workspaces/${workspaceId}`);
  return response.data;
}

export async function getWorkspaceMembers(workspaceId: number) {
  const response = await api.get(
    `/api/workspaces/${workspaceId}/members`
  );

  return response.data;
}

export async function addWorkspaceMember(
  workspaceId: number,
  email: string
) {
  const response = await api.post(
    `/api/workspaces/${workspaceId}/members`,
    { email }
  );

  return response.data;
}

export async function removeWorkspaceMember(
  workspaceId: number,
  userId: number
) {
  const response = await api.delete(
    `/api/workspaces/${workspaceId}/members/${userId}`
  );

  return response.data;
}


export async function getWorkspaceTasks(workspaceId: number) {
  const response = await api.get(
    `/api/workspaces/${workspaceId}/tasks`
  );

  return response.data;
}

export async function createTask(
  workspaceId: number,
  data: {
    title: string;
    description?: string | null;
    status?: 'todo' | 'in_progress' | 'done';
    priority?: 'low' | 'medium' | 'high';
    assigned_to?: number | null;
    due_date?: string | null;
  }
) {
  const response = await api.post(
    `/api/workspaces/${workspaceId}/tasks`,
    data
  );

  return response.data;
}

export async function updateTask(
  workspaceId: number,
  taskId: number,
  data: {
    title?: string;
    description?: string | null;
    status?: 'todo' | 'in_progress' | 'done';
    priority?: 'low' | 'medium' | 'high';
    assigned_to?: number | null;
    due_date?: string | null;
  }
) {
  const response = await api.patch(
    `/api/workspaces/${workspaceId}/tasks/${taskId}`,
    data
  );

  return response.data;
}

export async function deleteTask(
  workspaceId: number,
  taskId: number
) {
  const response = await api.delete(
    `/api/workspaces/${workspaceId}/tasks/${taskId}`
  );

  return response.data;
}


export async function getTaskComments(taskId: number) {
  const response = await api.get(
    `/api/tasks/${taskId}/comments`
  );

  return response.data;
}

export async function createTaskComment(
  taskId: number,
  body: string
) {
  const response = await api.post(
    `/api/tasks/${taskId}/comments`,
    { body }
  );

  return response.data;
}


export async function deleteTaskComment(
  taskId: number,
  commentId: number
) {
  const response = await api.delete(
    `/api/tasks/${taskId}/comments/${commentId}`
  );

  return response.data;
}


export async function getNotifications() {
  const response = await api.get('/api/notifications');

  return response.data;
}

export async function markNotificationAsRead(
  notificationId: string
) {
  const response = await api.patch(
    `/api/notifications/${notificationId}/read`
  );

  return response.data;
}

export async function markAllNotificationsAsRead() {
  const response = await api.patch(
    '/api/notifications/read-all'
  );

  return response.data;
}

