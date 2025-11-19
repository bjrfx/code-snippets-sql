// API client for making requests to the backend

const API_BASE = '';

let authToken: string | null = localStorage.getItem('authToken');

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
}

export function getAuthToken() {
  return authToken;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

// Auth API
export const authAPI = {
  signup: (email: string, password: string) =>
    request<{ user: any; token: string }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  signin: (email: string, password: string) =>
    request<{ user: any; token: string }>('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  me: () => request<any>('/api/auth/me'),
};

// User API
export const userAPI = {
  getAll: () => request<any[]>('/api/users'),
  getById: (id: string) => request<any>(`/api/users/${id}`),
  update: (id: string, data: any) =>
    request<any>(`/api/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    request<void>(`/api/users/${id}`, { method: 'DELETE' }),
};

// Snippet API
export const snippetAPI = {
  getAll: () => request<any[]>('/api/snippets'),
  getById: (id: string) => request<any>(`/api/snippets/${id}`),
  getByFolder: (folderId: string) =>
    request<any[]>(`/api/folders/${folderId}/snippets`),
  getByProject: (projectId: string) =>
    request<any[]>(`/api/projects/${projectId}/snippets`),
  create: (data: any) =>
    request<any>('/api/snippets', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    request<any>(`/api/snippets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    request<void>(`/api/snippets/${id}`, { method: 'DELETE' }),
};

// Note API
export const noteAPI = {
  getAll: () => request<any[]>('/api/notes'),
  getById: (id: string) => request<any>(`/api/notes/${id}`),
  getByFolder: (folderId: string) =>
    request<any[]>(`/api/folders/${folderId}/notes`),
  getByProject: (projectId: string) =>
    request<any[]>(`/api/projects/${projectId}/notes`),
  create: (data: any) =>
    request<any>('/api/notes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    request<any>(`/api/notes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    request<void>(`/api/notes/${id}`, { method: 'DELETE' }),
};

// Checklist API
export const checklistAPI = {
  getAll: () => request<any[]>('/api/checklists'),
  getById: (id: string) => request<any>(`/api/checklists/${id}`),
  getByFolder: (folderId: string) =>
    request<any[]>(`/api/folders/${folderId}/checklists`),
  getByProject: (projectId: string) =>
    request<any[]>(`/api/projects/${projectId}/checklists`),
  create: (data: any) =>
    request<any>('/api/checklists', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    request<any>(`/api/checklists/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    request<void>(`/api/checklists/${id}`, { method: 'DELETE' }),
};

// Smart Note API
export const smartNoteAPI = {
  getAll: () => request<any[]>('/api/smart-notes'),
  getById: (id: string) => request<any>(`/api/smart-notes/${id}`),
  getByFolder: (folderId: string) =>
    request<any[]>(`/api/folders/${folderId}/smart-notes`),
  getByProject: (projectId: string) =>
    request<any[]>(`/api/projects/${projectId}/smart-notes`),
  create: (data: any) =>
    request<any>('/api/smart-notes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    request<any>(`/api/smart-notes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    request<void>(`/api/smart-notes/${id}`, { method: 'DELETE' }),
};

// Project API
export const projectAPI = {
  getAll: () => request<any[]>('/api/projects'),
  getById: (id: string) => request<any>(`/api/projects/${id}`),
  getStats: (id: string) => 
    request<{ snippets: number; notes: number; checklists: number; smartNotes: number; total: number }>(`/api/projects/${id}/stats`),
  create: (data: any) =>
    request<any>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    request<any>(`/api/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    request<void>(`/api/projects/${id}`, { method: 'DELETE' }),
};

// Folder API
export const folderAPI = {
  getAll: () => request<any[]>('/api/folders'),
  getById: (id: string) => request<any>(`/api/folders/${id}`),
  create: (data: any) =>
    request<any>('/api/folders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    request<void>(`/api/folders/${id}`, { method: 'DELETE' }),
};

// Tag API
export const tagAPI = {
  getAll: () => request<any[]>('/api/tags'),
  create: (data: any) =>
    request<any>('/api/tags', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    request<void>(`/api/tags/${id}`, { method: 'DELETE' }),
};

// Premium Request API
export const premiumRequestAPI = {
  getAll: () => request<any[]>('/api/premium-requests'),
  create: (data: any) =>
    request<any>('/api/premium-requests', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    request<any>(`/api/premium-requests/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    request<void>(`/api/premium-requests/${id}`, { method: 'DELETE' }),
};

// Search API
export const searchAPI = {
  search: (query: string) =>
    request<{ snippets: any[]; notes: any[]; checklists: any[]; smartNotes: any[] }>(
      `/api/search?q=${encodeURIComponent(query)}`
    ),
};
