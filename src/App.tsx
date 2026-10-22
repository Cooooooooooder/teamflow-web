import { useEffect, useState } from 'react';
import './App.css';
import './index.css';
import {
  login,
  register,
  logout,
  getCurrentUser,
  getWorkspaces,
  createWorkspace,
  deleteWorkspace,
  getWorkspaceMembers,
  addWorkspaceMember,
  removeWorkspaceMember,
  getWorkspaceTasks,
  createTask,
  updateTask,
  deleteTask,
  getTaskComments,
  createTaskComment,
  deleteTaskComment,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from './lib/auth';

import type {
  User,
  Workspace,
  WorkspaceMember,
  Task,
  TaskStatus,
  TaskPriority,
  TaskComment,
  TaskCommentsResponse,
  TaskCommentResponse,
  AppNotification,
} from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Workspaces state
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspaceName, setWorkspaceName] = useState('');
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(false);

  const [selectedWorkspaceId, setSelectedWorkspaceId] =
    useState<number | null>(null);

  // Workspace members state
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [memberEmail, setMemberEmail] = useState('');
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [memberActionLoading, setMemberActionLoading] = useState(false);

  // Tasks state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [taskActionLoading, setTaskActionLoading] = useState(false);

  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskStatus, setTaskStatus] = useState<TaskStatus>('todo');
  const [taskPriority, setTaskPriority] =
    useState<TaskPriority>('medium');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);

  // Task comments state
  const [selectedCommentsTaskId, setSelectedCommentsTaskId] =
    useState<number | null>(null);
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentBody, setCommentBody] = useState('');
  const [commentActionLoading, setCommentActionLoading] = useState(false);
  const [deletingCommentId, setDeletingCommentId] =
    useState<number | null>(null);

  // Notifications state
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [notificationActionLoading, setNotificationActionLoading] =
    useState(false);

  const selectedWorkspace = workspaces.find(
    (workspace) => workspace.id === selectedWorkspaceId
  );

  const unreadNotificationsCount = notifications.filter(
    (notification) => notification.read_at === null
  ).length;

  // Shared styles
  const inputStyle = {
    display: 'block',
    width: '100%',
    padding: '11px 13px',
    marginTop: '6px',
    marginBottom: '12px',
    boxSizing: 'border-box' as const,
    border: '1px solid #dbe2ee',
    borderRadius: '9px',
    backgroundColor: '#ffffff',
    color: '#172033',
    fontSize: '14px',
    outlineColor: '#4f46e5',
  };

  const sectionStyle = {
    marginTop: '24px',
    padding: '24px',
    border: '1px solid #e2e8f0',
    borderRadius: '14px',
    backgroundColor: '#ffffff',
    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
  };

  // Load workspaces
  async function loadWorkspaces() {
    setLoadingWorkspaces(true);

    try {
      const result = await getWorkspaces();
      setWorkspaces(result.data);
    } catch (error: any) {
      setMessage(
        error.response?.data?.message || 'Could not load workspaces.'
      );
    } finally {
      setLoadingWorkspaces(false);
    }
  }

  // Load workspace members
  async function loadMembers(workspaceId: number) {
    setLoadingMembers(true);
    setMembers([]);

    try {
      const result = await getWorkspaceMembers(workspaceId);
      setMembers(result.data);
    } catch (error: any) {
      setMessage(
        error.response?.data?.message ||
          'Could not load workspace members.'
      );
    } finally {
      setLoadingMembers(false);
    }
  }

  // Load workspace tasks
  async function loadTasks(workspaceId: number) {
    setLoadingTasks(true);

    try {
      const result = await getWorkspaceTasks(workspaceId);

      setTasks(
        Array.isArray(result.data)
          ? result.data
          : Array.isArray(result.data?.data)
            ? result.data.data
            : []
      );
    } catch (error: any) {
      setMessage(
        error.response?.data?.message || 'Could not load tasks.'
      );
    } finally {
      setLoadingTasks(false);
    }
  }

  // Load notifications
  async function loadNotifications() {
    setLoadingNotifications(true);

    try {
      const result = await getNotifications();

      // Supports a direct paginated response or a response wrapped in data.
      const payload = result?.data ?? result;
      const notificationList = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.data?.data)
            ? payload.data.data
            : [];

      setNotifications(notificationList as AppNotification[]);
    } catch (error: any) {
      setMessage(
        error.response?.data?.message ||
          'Could not load notifications.'
      );
    } finally {
      setLoadingNotifications(false);
    }
  }

  // Mark one notification as read
  async function handleMarkNotificationAsRead(
    notification: AppNotification
  ) {
    if (notification.read_at !== null) {
      return;
    }

    setNotificationActionLoading(true);
    setMessage('');

    try {
      await markNotificationAsRead(notification.id);

      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id
            ? { ...item, read_at: new Date().toISOString() }
            : item
        )
      );

      setMessage('Notification marked as read.');
    } catch (error: any) {
      setMessage(
        error.response?.data?.message ||
          'Could not mark notification as read.'
      );
    } finally {
      setNotificationActionLoading(false);
    }
  }

  // Mark all notifications as read
  async function handleMarkAllNotificationsAsRead() {
    if (unreadNotificationsCount === 0) {
      return;
    }

    setNotificationActionLoading(true);
    setMessage('');

    try {
      await markAllNotificationsAsRead();

      const readAt = new Date().toISOString();

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          read_at: notification.read_at ?? readAt,
        }))
      );

      setMessage('All notifications marked as read.');
    } catch (error: any) {
      setMessage(
        error.response?.data?.message ||
          'Could not mark all notifications as read.'
      );
    } finally {
      setNotificationActionLoading(false);
    }
  }

  // Load comments for a task
  async function loadTaskComments(taskId: number) {
    setLoadingComments(true);
    setComments([]);
    setMessage('');

    try {
      const result: TaskCommentsResponse =
        await getTaskComments(taskId);

      setComments(result.data);
      setSelectedCommentsTaskId(taskId);
    } catch (error: any) {
      setMessage(
        error.response?.data?.message ||
          'Could not load task comments.'
      );
    } finally {
      setLoadingComments(false);
    }
  }

  // Show or hide task comments
  async function handleToggleComments(taskId: number) {
    if (selectedCommentsTaskId === taskId) {
      setSelectedCommentsTaskId(null);
      setComments([]);
      setCommentBody('');
      return;
    }

    await loadTaskComments(taskId);
  }

  // Create a comment
  async function handleCreateComment(
    event: React.FormEvent<HTMLFormElement>,
    taskId: number
  ) {
    event.preventDefault();

    const body = commentBody.trim();

    if (!body) {
      setMessage('Please write a comment first.');
      return;
    }

    setCommentActionLoading(true);
    setMessage('');

    try {
      const result: TaskCommentResponse =
        await createTaskComment(taskId, body);

      setComments((current) => [result.data, ...current]);
      setCommentBody('');
      setMessage(result.message || 'Comment created successfully.');
    } catch (error: any) {
      const errors = error.response?.data?.errors;
      const firstError = errors ? Object.values(errors).flat()[0] : null;

      setMessage(
        typeof firstError === 'string'
          ? firstError
          : error.response?.data?.message ||
              'Could not create the comment.'
      );
    } finally {
      setCommentActionLoading(false);
    }
  }

  // Delete a comment
  async function handleDeleteComment(taskId: number, commentId: number) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this comment?'
    );

    if (!confirmed) {
      return;
    }

    setDeletingCommentId(commentId);
    setMessage('');

    try {
      const result = await deleteTaskComment(taskId, commentId);

      setComments((current) =>
        current.filter((comment) => comment.id !== commentId)
      );

      setMessage(result.message || 'Comment deleted successfully.');
    } catch (error: any) {
      setMessage(
        error.response?.data?.message ||
          'Could not delete the comment.'
      );
    } finally {
      setDeletingCommentId(null);
    }
  }

  // Restore the logged-in session
  useEffect(() => {
    async function restoreSession() {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch {
        setUser(null);
      } finally {
        setCheckingSession(false);
      }
    }

    void restoreSession();
  }, []);

  // Load user data after login and clear it after logout
  useEffect(() => {
    if (user) {
      void loadWorkspaces();
      void loadNotifications();
    } else {
      setWorkspaces([]);
      setMembers([]);
      setTasks([]);
      setSelectedWorkspaceId(null);
      setSelectedCommentsTaskId(null);
      setComments([]);
      setNotifications([]);
    }
  }, [user]);

  // Select a workspace when necessary
  useEffect(() => {
    if (workspaces.length === 0) {
      setSelectedWorkspaceId(null);
      setMembers([]);
      setTasks([]);
      return;
    }

    const selectionExists = workspaces.some(
      (workspace) => workspace.id === selectedWorkspaceId
    );

    if (!selectionExists) {
      setSelectedWorkspaceId(workspaces[0].id);
    }
  }, [workspaces, selectedWorkspaceId]);

  // Load members and tasks for the selected workspace
  useEffect(() => {
    if (selectedWorkspaceId !== null) {
      void loadMembers(selectedWorkspaceId);
      void loadTasks(selectedWorkspaceId);

      setEditingTaskId(null);
      setSelectedCommentsTaskId(null);
      setComments([]);
    } else {
      setMembers([]);
      setTasks([]);
      setSelectedCommentsTaskId(null);
      setComments([]);
    }
  }, [selectedWorkspaceId]);

  // Login or register
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const result =
        mode === 'login'
          ? await login({ email, password })
          : await register({
              name,
              email,
              password,
              password_confirmation: passwordConfirmation,
            });

      setUser(result.user);
      setMessage(result.message);
      setPassword('');
      setPasswordConfirmation('');
    } catch (error: any) {
      const errors = error.response?.data?.errors;
      const firstError = errors ? Object.values(errors).flat()[0] : null;

      setMessage(
        typeof firstError === 'string'
          ? firstError
          : error.response?.data?.message || 'Something went wrong.'
      );
    } finally {
      setLoading(false);
    }
  }

  // Create a workspace
  async function handleCreateWorkspace(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const result = await createWorkspace({ name: workspaceName });
      const newWorkspace = result.data as Workspace;

      setWorkspaces((current) => [...current, newWorkspace]);
      setSelectedWorkspaceId(newWorkspace.id);
      setWorkspaceName('');
      setMessage('Workspace created successfully.');
    } catch (error: any) {
      const errors = error.response?.data?.errors;
      const firstError = errors ? Object.values(errors).flat()[0] : null;

      setMessage(
        typeof firstError === 'string'
          ? firstError
          : error.response?.data?.message ||
              'Could not create workspace.'
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteWorkspace(workspace: Workspace) {
  if (workspace.role !== 'owner') {
    return;
  }

  const confirmed = window.confirm(
    `Are you sure you want to delete "${workspace.name}"? This action cannot be undone.`
  );

  if (!confirmed) {
    return;
  }

  try {
    await deleteWorkspace(workspace.id);

    const remainingWorkspaces = workspaces.filter(
      (item) => item.id !== workspace.id
    );

    setWorkspaces(remainingWorkspaces);

    if (selectedWorkspaceId === workspace.id) {
      setSelectedWorkspaceId(null);
    }

    setMessage('Workspace deleted successfully.');

    await loadWorkspaces();
  } catch (error: any) {
    setMessage(
      error.response?.data?.message ||
        'Could not delete workspace.'
    );
  }
}

  // Add a workspace member
  async function handleAddMember(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (selectedWorkspaceId === null) {
      setMessage('Please select a workspace first.');
      return;
    }

    setMemberActionLoading(true);
    setMessage('');

    try {
      const result = await addWorkspaceMember(
        selectedWorkspaceId,
        memberEmail.trim()
      );

      setMemberEmail('');
      setMessage(result.message || 'Member added successfully.');

      await loadMembers(selectedWorkspaceId);
    } catch (error: any) {
      const errors = error.response?.data?.errors;
      const firstError = errors ? Object.values(errors).flat()[0] : null;

      setMessage(
        typeof firstError === 'string'
          ? firstError
          : error.response?.data?.message || 'Could not add member.'
      );
    } finally {
      setMemberActionLoading(false);
    }
  }

  // Remove a workspace member
  async function handleRemoveMember(member: WorkspaceMember) {
    if (selectedWorkspaceId === null) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to remove ${member.name} from this workspace?`
    );

    if (!confirmed) {
      return;
    }

    setMemberActionLoading(true);
    setMessage('');

    try {
      const result = await removeWorkspaceMember(
        selectedWorkspaceId,
        member.id
      );

      setMessage(result.message || 'Member removed successfully.');

      await loadMembers(selectedWorkspaceId);
    } catch (error: any) {
      setMessage(
        error.response?.data?.message || 'Could not remove member.'
      );
    } finally {
      setMemberActionLoading(false);
    }
  }

  // Create or update a task
  async function handleTaskSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (selectedWorkspaceId === null) {
      setMessage('Please select a workspace first.');
      return;
    }

    setTaskActionLoading(true);
    setMessage('');

    try {
      const data = {
        title: taskTitle.trim(),
        description: taskDescription.trim() || null,
        status: taskStatus,
        priority: taskPriority,
        assigned_to: taskAssignee ? Number(taskAssignee) : null,
        due_date: taskDueDate ? `${taskDueDate}T12:00:00` : null,
      };

      if (editingTaskId !== null) {
        const result = await updateTask(
          selectedWorkspaceId,
          editingTaskId,
          data
        );

        setMessage(result.message || 'Task updated successfully.');
      } else {
        const result = await createTask(selectedWorkspaceId, data);

        setMessage(result.message || 'Task created successfully.');
      }

      resetTaskForm();
      await loadTasks(selectedWorkspaceId);
    } catch (error: any) {
      const errors = error.response?.data?.errors;
      const firstError = errors ? Object.values(errors).flat()[0] : null;

      setMessage(
        typeof firstError === 'string'
          ? firstError
          : error.response?.data?.message || 'Could not save the task.'
      );
    } finally {
      setTaskActionLoading(false);
    }
  }

  // Reset the task form
  function resetTaskForm() {
    setEditingTaskId(null);
    setTaskTitle('');
    setTaskDescription('');
    setTaskStatus('todo');
    setTaskPriority('medium');
    setTaskAssignee('');
    setTaskDueDate('');
  }

  // Edit a task
  function handleEditTask(task: Task) {
    setEditingTaskId(task.id);
    setTaskTitle(task.title);
    setTaskDescription(task.description || '');
    setTaskStatus(task.status);
    setTaskPriority(task.priority);
    setTaskAssignee(
      task.assigned_to !== null ? String(task.assigned_to) : ''
    );
    setTaskDueDate(task.due_date ? task.due_date.slice(0, 10) : '');

    setMessage('');
  }

  // Cancel editing
  function handleCancelTaskEdit() {
    resetTaskForm();
    setMessage('');
  }

  // Delete a task
  async function handleDeleteTask(task: Task) {
    if (selectedWorkspaceId === null) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${task.title}"?`
    );

    if (!confirmed) {
      return;
    }

    setTaskActionLoading(true);
    setMessage('');

    try {
      const result = await deleteTask(selectedWorkspaceId, task.id);

      setMessage(result.message || 'Task deleted successfully.');

      if (editingTaskId === task.id) {
        resetTaskForm();
      }

      if (selectedCommentsTaskId === task.id) {
        setSelectedCommentsTaskId(null);
        setComments([]);
      }

      await loadTasks(selectedWorkspaceId);
    } catch (error: any) {
      setMessage(
        error.response?.data?.message || 'Could not delete the task.'
      );
    } finally {
      setTaskActionLoading(false);
    }
  }

  // Log out
  async function handleLogout() {
    try {
      const result = await logout();
      setUser(null);
      setMessage(result.message);
    } catch {
      setMessage('Unable to log out. Please try again.');
    }
  }

  if (checkingSession) {
    return <p style={{ padding: '2rem' }}>Loading TeamFlow...</p>;
  }

  return (
   <main className="app-shell">
      <h1>TeamFlow</h1>
      <p>Workspace management platform</p>

      {user ? (
        <>
          {/* User information */}
          <section style={sectionStyle}>
            <h2>Welcome, {user.name}!</h2>
            <p>Email: {user.email}</p>

            <button
              type="button"
              className="btn-secondary"
              onClick={() => void handleLogout()}
            >
              Logout
            </button>

          </section>

       
{/* Notifications */}
<section style={sectionStyle} className="notifications-section">
  <div className="notifications-header">
    <div>
      <h2>Notifications</h2>
      <p className="notifications-subtitle">
        Stay updated on your assigned tasks.
      </p>
    </div>

    {unreadNotificationsCount > 0 && (
      <span className="unread-count">
        {unreadNotificationsCount} unread
      </span>
    )}
  </div>

  <div className="notifications-actions">
    <button
      type="button"
      className="btn-secondary"
      onClick={() => void loadNotifications()}
      disabled={loadingNotifications}
    >
      {loadingNotifications ? 'Refreshing...' : 'Refresh'}
    </button>

    <button
      type="button"
      className="btn-primary"
      onClick={() => void handleMarkAllNotificationsAsRead()}
      disabled={
        notificationActionLoading ||
        unreadNotificationsCount === 0
      }
    >
      {notificationActionLoading
        ? 'Please wait...'
        : 'Mark All as Read'}
    </button>
  </div>

  {loadingNotifications ? (
    <p>Loading notifications...</p>
  ) : notifications.length === 0 ? (
    <div className="notifications-empty">
      <span className="notification-icon" aria-hidden="true">
        ✓
      </span>
      <h3>You're all caught up!</h3>
      <p>You have no notifications yet.</p>
    </div>
  ) : (
    <div className="notifications-list">
      {notifications.map((notification) => {
        const notificationMessage =
          notification.data?.message ||
          notification.data?.type ||
          'You have a new notification.';

        const taskTitle =
          notification.data?.data?.task_title;

        return (
          <article
            key={notification.id}
            className={`notification-card ${
              notification.read_at
                ? 'notification-read'
                : 'notification-unread'
            }`}
          >
            <div className="notification-icon" aria-hidden="true">
              {notification.read_at ? '✓' : '🔔'}
            </div>

            <div className="notification-content">
              <div className="notification-title-row">
                <strong>
                  {notification.read_at
                    ? 'Notification'
                    : 'New notification'}
                </strong>

                {!notification.read_at && (
                  <span className="unread-badge">Unread</span>
                )}
              </div>

              <p className="notification-message">
                {notificationMessage}
              </p>

              {taskTitle && (
                <p className="notification-task">
                  <strong>Task:</strong> {taskTitle}
                </p>
              )}

              <small className="notification-date">
                {new Date(
                  notification.created_at
                ).toLocaleString()}
              </small>

              {!notification.read_at && (
                <div className="notification-card-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    disabled={notificationActionLoading}
                    onClick={() =>
                      void handleMarkNotificationAsRead(
                        notification
                      )
                    }
                  >
                    Mark as Read
                  </button>
                </div>
              )}
            </div>
          </article>
        );
      })}
    </div>
  )}
</section>


          {/* Workspaces */}
          <section style={sectionStyle}>
            <h2>My Workspaces</h2>

            <form onSubmit={handleCreateWorkspace}>
              <label>
                Workspace name
                <input
                  required
                  minLength={3}
                  maxLength={100}
                  value={workspaceName}
                  onChange={(event) =>
                    setWorkspaceName(event.target.value)
                  }
                  placeholder="e.g. Marketing Team"
                  style={inputStyle}
                />
              </label>

              <button
                type="submit"
                  className="btn-primary"
                disabled={loading}
                style={{ marginTop: '12px' }}
              >
                {loading ? 'Please wait...' : 'Create Workspace'}
              </button>
            </form>

            {loadingWorkspaces ? (
              <p>Loading workspaces...</p>
            ) : workspaces.length === 0 ? (
              <p>You have no workspaces yet. Create your first one!</p>
            ) : (
              <>
                <label
                  htmlFor="workspace-select"
                  style={{ display: 'block', marginTop: '20px' }}
                >
                  Select a workspace
                </label>

                <select
                  id="workspace-select"
                  value={selectedWorkspaceId ?? ''}
                  onChange={(event) =>
                    setSelectedWorkspaceId(
                      event.target.value
                        ? Number(event.target.value)
                        : null
                    )
                  }
                  style={inputStyle}
                >
                  {workspaces.map((workspace) => (
                    <option key={workspace.id} value={workspace.id}>
                      {workspace.name}
                      {workspace.role ? ` (${workspace.role})` : ''}
                    </option>
                  ))}
                </select>

                          
                <div className="workspace-list">
                  {workspaces.map((workspace) => (
                    <article key={workspace.id} className="workspace-card">
                      <div className="workspace-card-header">
                        <h3>{workspace.name}</h3>

                        {workspace.role && (
                          <span className={`role-badge role-${workspace.role}`}>
                            {workspace.role}
                          </span>
                        )}
                      </div>

                      <p className="workspace-slug">
                        <span>Slug</span>
                        <code>{workspace.slug}</code>
                      </p>

                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setSelectedWorkspaceId(workspace.id)}
                      >
                        {selectedWorkspaceId === workspace.id
                          ? 'Selected Workspace'
                          : 'Select Workspace'}
                      </button>

                      {workspace.role === 'owner' && (
                        <button
                          type="button"
                          className="btn-danger"
                          onClick={() => void handleDeleteWorkspace(workspace)}
                        >
                          Delete Workspace
                        </button>
                      )}
                    </article>
                  ))}
                </div>

              </>
            )}

            <button
              type="button"
                className="btn-secondary"
              onClick={() => void loadWorkspaces()}
              disabled={loadingWorkspaces}
            >
              Refresh Workspaces
            </button>
          </section>

          {/* Selected workspace features */}
          {selectedWorkspace && (
            <>
              {/* Members */}
              <section style={sectionStyle}>
                <h2>Members: {selectedWorkspace.name}</h2>

                {selectedWorkspace.role === 'owner' && (
                  <form onSubmit={handleAddMember}>
                    <label>
                      Member email
                      <input
                        required
                        type="email"
                        value={memberEmail}
                        onChange={(event) =>
                          setMemberEmail(event.target.value)
                        }
                        placeholder="person@example.com"
                        style={inputStyle}
                      />
                    </label>

                    <button
                      type="submit"
                        className="btn-primary"
                      disabled={memberActionLoading}
                      style={{ marginTop: '12px' }}
                    >
                      {memberActionLoading
                        ? 'Please wait...'
                        : 'Add Member'}
                    </button>
                  </form>
                )}

            
{loadingMembers ? (
  <p>Loading members...</p>
) : members.length === 0 ? (
  <p>No members found.</p>
) : (
  <div className="members-list">
    {members.map((member) => (
      <article key={member.id} className="member-card">
        <div className="member-avatar" aria-hidden="true">
          {member.name.charAt(0).toUpperCase()}
        </div>

        <div className="member-info">
          <h3>{member.name}</h3>
          <p className="member-email">{member.email}</p>

          <span className={`role-badge role-${member.role}`}>
            {member.role}
          </span>
        </div>

        {selectedWorkspace.role === 'owner' &&
          member.role !== 'owner' && (
            <button
              type="button"
              className="btn-danger"
              disabled={memberActionLoading}
              onClick={() => void handleRemoveMember(member)}
            >
              Remove Member
            </button>
          )}
      </article>
    ))}
  </div>
)}

                <button
                  type="button"
                    className="btn-secondary"
                  onClick={() =>
                    selectedWorkspaceId !== null &&
                    void loadMembers(selectedWorkspaceId)
                  }
                  disabled={loadingMembers}
                  style={{ marginTop: '12px' }}
                >
                  Refresh Members
                </button>
              </section>

              {/* Tasks */}
              <section style={sectionStyle}>
                <h2>Tasks: {selectedWorkspace.name}</h2>

<h3 className="task-form-title">
  {editingTaskId !== null ? 'Edit Task' : 'Create Task'}
</h3>

<form onSubmit={handleTaskSubmit} className="task-form">
  <label>
    Task title
    <input
      required
      minLength={3}
      maxLength={150}
      value={taskTitle}
      onChange={(event) => setTaskTitle(event.target.value)}
      placeholder="e.g. Build login page"
      style={inputStyle}
    />
  </label>

  <label>
    Description
    <textarea
      value={taskDescription}
      onChange={(event) => setTaskDescription(event.target.value)}
      placeholder="Describe the task..."
      rows={3}
      style={inputStyle}
    />
  </label>

  <label>
    Status
    <select
      value={taskStatus}
      onChange={(event) =>
        setTaskStatus(event.target.value as TaskStatus)
      }
      style={inputStyle}
    >
      <option value="todo">To do</option>
      <option value="in_progress">In progress</option>
      <option value="done">Done</option>
    </select>
  </label>

  <label>
    Priority
    <select
      value={taskPriority}
      onChange={(event) =>
        setTaskPriority(event.target.value as TaskPriority)
      }
      style={inputStyle}
    >
      <option value="low">Low</option>
      <option value="medium">Medium</option>
      <option value="high">High</option>
    </select>
  </label>

  <label>
    Assign to member
    <select
      value={taskAssignee}
      onChange={(event) => setTaskAssignee(event.target.value)}
      style={inputStyle}
    >
      <option value="">Unassigned</option>

      {members.map((member) => (
        <option key={member.id} value={member.id}>
          {member.name} ({member.email})
        </option>
      ))}
    </select>
  </label>

  <label>
    Due date
    <input
      type="date"
      value={taskDueDate}
      onChange={(event) => setTaskDueDate(event.target.value)}
      style={inputStyle}
    />
  </label>

  <div className="task-form-actions">
    <button
      type="submit"
      className="btn-primary"
      disabled={taskActionLoading}
    >
      {taskActionLoading
        ? 'Please wait...'
        : editingTaskId !== null
          ? 'Save Changes'
          : 'Create Task'}
    </button>

    {editingTaskId !== null && (
      <button
        type="button"
        className="btn-secondary"
        onClick={handleCancelTaskEdit}
        disabled={taskActionLoading}
      >
        Cancel Edit
      </button>
    )}
  </div>
</form>


                <hr style={{ margin: '24px 0' }} />

                <h3>Task List</h3>

                {loadingTasks ? (
                  <p>Loading tasks...</p>
                ) : tasks.length === 0 ? (
                  <p>No tasks yet. Create your first task!</p>
                ) : (
                  <div>
                    {tasks.map((task) => (
                     <article key={task.id} className="task-card">
                        <h4>{task.title}</h4>

                        <p>
                          {task.description || 'No description provided.'}
                        </p>

                                              
                        <p className="task-status">
                          <strong>Status:</strong>
                          <span className={`status-badge status-${task.status}`}>
                            {task.status.replace('_', ' ')}
                          </span>
                        </p>


                     
                        <p className="task-priority">
                          <strong>Priority:</strong>
                          <span className={`priority-badge priority-${task.priority}`}>
                            {task.priority}
                          </span>
                        </p>


                        <p>
                          <strong>Created by:</strong>{' '}
                          {task.creator?.name || 'Unknown'}
                        </p>

                        <p>
                          <strong>Assigned to:</strong>{' '}
                          {task.assignee?.name || 'Unassigned'}
                        </p>

                        <p>
                          <strong>Due date:</strong>{' '}
                          {task.due_date
                            ? task.due_date.slice(0, 10)
                            : 'Not set'}
                        </p>

                        <button
                          type="button"
                              className="btn-secondary"
                          onClick={() => handleEditTask(task)}
                          disabled={taskActionLoading}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                            className="btn-danger"
                          onClick={() => void handleDeleteTask(task)}
                          disabled={taskActionLoading}
                          style={{ marginLeft: '8px' }}
                        >
                          Delete
                        </button>

                        <button
                          type="button"
                            className="btn-primary"
                          onClick={() =>
                            void handleToggleComments(task.id)
                          }
                          disabled={loadingComments}
                          style={{ marginLeft: '8px' }}
                        >
                          {selectedCommentsTaskId === task.id
                            ? 'Hide Comments'
                            : 'Comments'}
                        </button>

                        {/* Comments */}
                        {selectedCommentsTaskId === task.id && (
                          <section
                            style={{
                              marginTop: '20px',
                              padding: '12px',
                              background: '#f8f8f8',
                              borderRadius: '8px',
                            }}
                          >
                            <h4>Comments</h4>

                            {loadingComments ? (
                              <p>Loading comments...</p>
                            ) : comments.length === 0 ? (
                              <p>
                                No comments yet. Write the first one!
                              </p>
                            ) : (
                              comments.map((comment) => (
                                <article
                                  key={comment.id}
                                  style={{
                                    background: '#fff',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    padding: '10px',
                                    marginBottom: '10px',
                                  }}
                                >
                                  <strong>
                                    {comment.user?.name || 'Unknown user'}
                                  </strong>

                                  <p
                                    style={{
                                      whiteSpace: 'pre-wrap',
                                      overflowWrap: 'anywhere',
                                    }}
                                  >
                                    {comment.body}
                                  </p>

                                  <small>
                                    {new Date(
                                      comment.created_at
                                    ).toLocaleString()}
                                  </small>

                                  {(comment.user_id === user.id ||
                                    selectedWorkspace.role === 'owner' ||
                                    selectedWorkspace.role === 'admin') && (
                                    <div style={{ marginTop: '8px' }}>
                                      <button
                                        type="button"
                                          className="btn-danger"
                                        disabled={
                                          deletingCommentId === comment.id
                                        }
                                        onClick={() =>
                                          void handleDeleteComment(
                                            task.id,
                                            comment.id
                                          )
                                        }
                                      >
                                        {deletingCommentId === comment.id
                                          ? 'Deleting...'
                                          : 'Delete Comment'}
                                      </button>
                                    </div>
                                  )}
                                </article>
                              ))
                            )}

                            <form
                              onSubmit={(event) =>
                                void handleCreateComment(event, task.id)
                              }
                              style={{ marginTop: '16px' }}
                            >
                              <label>
                                Write a comment
                                <textarea
                                  required
                                  minLength={1}
                                  maxLength={5000}
                                  rows={3}
                                  value={commentBody}
                                  onChange={(event) =>
                                    setCommentBody(event.target.value)
                                  }
                                  placeholder="Write your comment here..."
                                  style={inputStyle}
                                />
                              </label>

                              <button
                                type="submit"
                                disabled={
                                  commentActionLoading ||
                                  !commentBody.trim()
                                }
                              >
                                {commentActionLoading
                                  ? 'Sending...'
                                  : 'Add Comment'}
                              </button>
                            </form>
                          </section>
                        )}
                      </article>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                    className="btn-secondary"
                  onClick={() =>
                    selectedWorkspaceId !== null &&
                    void loadTasks(selectedWorkspaceId)
                  }
                  disabled={loadingTasks}
                  style={{ marginTop: '16px' }}
                >
                  Refresh Tasks
                </button>
              </section>
            </>
          )}
        </>
      ) : (
        // Login and registration
        <section style={sectionStyle}>
          <div
            style={{
              display: 'flex',
              gap: '10px',
              marginBottom: '20px',
            }}
          >
            <button type="button" onClick={() => setMode('login')}>
              Login
            </button>

            <button type="button" onClick={() => setMode('register')}>
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <label>
                Name
                <input
                  required
                  minLength={3}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  style={inputStyle}
                />
              </label>
            )}

            <label>
              Email
              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                style={inputStyle}
              />
            </label>

            <label>
              Password
              <input
                required
                type="password"
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                style={inputStyle}
              />
            </label>

            {mode === 'register' && (
              <label>
                Confirm password
                <input
                  required
                  type="password"
                  value={passwordConfirmation}
                  onChange={(event) =>
                    setPasswordConfirmation(event.target.value)
                  }
                  style={inputStyle}
                />
              </label>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ marginTop: '16px' }}
            >
              {loading
                ? 'Please wait...'
                : mode === 'login'
                  ? 'Login'
                  : 'Create account'}
            </button>
          </form>
        </section>
      )}

      {message && (
        <p role="status" style={{ overflowWrap: 'anywhere' }}>
          {message}
        </p>
      )}
    </main>
  );
}

export default App;