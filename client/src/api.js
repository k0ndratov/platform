// Two modes:
//  - 'remote' (default): fetch from /api (Express + SQLite)
//  - 'local': everything runs in the browser and is stored in localStorage (static demo deploys)
// The mode is chosen at build time with VITE_API_MODE.
import { localApi } from './api.local'

export const apiMode = import.meta.env.VITE_API_MODE === 'local' ? 'local' : 'remote'

// Small fetch wrapper. All requests go to /api (proxied to Express in dev).
async function request(path, { method = 'GET', body } = {}) {
  const res = await fetch(`/api${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  })
  if (res.status === 204) return null
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`)
  return data
}

const remoteApi = {
  // current user
  me: () => request('/me'),
  updateSkills: (skills) => request('/me/skills', { method: 'PUT', body: { skills } }),

  // meetups
  meetups: () => request('/meetups'),
  meetup: (id) => request(`/meetups/${id}`),
  createMeetup: (data) => request('/meetups', { method: 'POST', body: data }),
  joinMeetup: (id) => request(`/meetups/${id}/join`, { method: 'POST' }),
  leaveMeetup: (id) => request(`/meetups/${id}/join`, { method: 'DELETE' }),

  // startups
  startups: (params = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString()
    return request(`/startups${qs ? `?${qs}` : ''}`)
  },
  recommendedStartups: () => request('/startups/recommended'),
  startup: (slug) => request(`/startups/${slug}`),
  createStartup: (data) => request('/startups', { method: 'POST', body: data }),
  applyToStartup: (slug, data) => request(`/startups/${slug}/apply`, { method: 'POST', body: data }),
  createPost: (slug, data) => request(`/startups/${slug}/posts`, { method: 'POST', body: data }),
  likePost: (slug, postId) => request(`/startups/${slug}/posts/${postId}/like`, { method: 'POST' }),
}

export const api = apiMode === 'local' ? localApi : remoteApi
