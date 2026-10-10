const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || 'Something went wrong');
  return body;
}

export const api = {
  getProducts: () => request('/products'),
  getGroups: () => request('/groups'),
  createGroup: (data) => request('/groups', { method: 'POST', body: JSON.stringify(data) }),
  joinGroup: (data) => request('/groups/join', { method: 'POST', body: JSON.stringify(data) }),
  getGroup: (id) => request(`/groups/${id}`),
  addProduct: (groupId, data) => request(`/groups/${groupId}/products`, { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (productId, data) => request(`/products/${productId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteProduct: (productId) => request(`/products/${productId}`, { method: 'DELETE' }),
  suggestions: (groupId) => request(`/groups/${groupId}/suggestions`, { method: 'POST' }),
};
