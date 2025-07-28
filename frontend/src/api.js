import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to include JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // console.error('API Error:', error.response?.data || error.message)
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Authentication - Updated for new backend endpoints
export const authAPI = {
  login: async (username, password) => {
    const response = await api.post('/users/login/', { username, password })
    return {
      token: response.data.access,
      refresh: response.data.refresh,
      user: response.data.user || null
    }
  },

  register: async (userData) => {
    const response = await api.post('/users/register/', userData)
    return {
      token: response.data.access,
      refresh: response.data.refresh,
      user: response.data.user
    }
  },

  refresh: async (refreshToken) => {
    const response = await api.post('/token/refresh/', { refresh: refreshToken })
    return response.data.access
  },

  getCurrentUser: async () => {
    const response = await api.get('/users/me/')
    return response.data
  },

  getUsers: async () => {
    const response = await api.get('/users/')
    return response.data
  }
}

// Feedback operations with proper filtering and sorting
export const getFeedbackList = async (filters = {}) => {
  try {
    const params = {}
    if (filters.status) params.status = filters.status
    if (filters.search) params.search = filters.search
    if (filters.ordering) params.ordering = filters.ordering
    
    const response = await api.get('feedback/', { params })
    return Array.isArray(response.data) ? response.data : response.data.results || []
  } catch (error) {
    // console.error('Failed to fetch feedback:', error)
    return []
  }
}

export const getFeedbackDetails = async (id) => {
  try {
    const response = await api.get(`feedback/${id}/`)
    return response.data
  } catch (error) {
    // console.error('Failed to fetch feedback details:', error)
    throw error
  }
}

export const createFeedback = async (data) => {
  try {
    const response = await api.post('feedback/', data)
    return response.data
  } catch (error) {
    // console.error('Failed to create feedback:', error)
    throw error
  }
}

export const updateFeedback = async (id, data) => {
  try {
    const response = await api.patch(`feedback/${id}/`, data)
    return response.data
  } catch (error) {
    // console.error('Failed to update feedback:', error)
    throw error
  }
}

export const voteFeedback = async (id) => {
  try {
    const response = await api.post(`feedback/${id}/vote/`)
    return response.data
  } catch (error) {
    // console.error('Failed to vote on feedback:', error)
    throw error
  }
}

// Comments
export const getComments = async (feedbackId = null) => {
  try {
    const params = feedbackId ? { feedback: feedbackId } : {}
    const response = await api.get('comments/', { params })
    return Array.isArray(response.data) ? response.data : response.data.results || []
  } catch (error) {
    // console.error('Failed to fetch comments:', error)
    return []
  }
}

export const addComment = async (feedbackId, content) => {
  try {
    const response = await api.post('comments/', { feedback: feedbackId, content })
    return response.data
  } catch (error) {
    // console.error('Failed to add comment:', error)
    throw error
  }
}

export const updateComment = async (id, content) => {
  try {
    const response = await api.patch(`comments/${id}/`, { content })
    return response.data
  } catch (error) {
    // console.error('Failed to update comment:', error)
    throw error
  }
}

export const deleteComment = async (id) => {
  try {
    await api.delete(`comments/${id}/`)
    return true
  } catch (error) {
    // console.error('Failed to delete comment:', error)
    throw error
  }
}

// Boards
export const getBoards = async () => {
  try {
    const response = await api.get('boards/')
    return Array.isArray(response.data) ? response.data : response.data.results || []
  } catch (error) {
    // console.error('Failed to fetch boards:', error)
    return []
  }
}

export const createBoard = async (data) => {
  try {
    const response = await api.post('boards/', data)
    return response.data
  } catch (error) {
    // console.error('Failed to create board:', error)
    throw error
  }
}

export const updateBoard = async (id, data) => {
  try {
    const response = await api.patch(`boards/${id}/`, data)
    return response.data
  } catch (error) {
    // console.error('Failed to update board:', error)
    throw error
  }
}

export const deleteBoard = async (id) => {
  try {
    await api.delete(`boards/${id}/`)
    return true
  } catch (error) {
    // console.error('Failed to delete board:', error)
    throw error
  }
}

export const getBoardDetails = async (id) => {
  try {
    const response = await api.get(`boards/${id}/`)
    return response.data
  } catch (error) {
    // console.error('Failed to fetch board details:', error)
    throw error
  }
}

// Board membership
export const joinBoard = async (id) => {
  try {
    const response = await api.post(`boards/${id}/join/`)
    return response.data
  } catch (error) {
    // console.error('Failed to join board:', error)
    throw error
  }
}

export const leaveBoard = async (id) => {
  try {
    const response = await api.post(`boards/${id}/leave/`)
    return response.data
  } catch (error) {
    // console.error('Failed to leave board:', error)
    throw error
  }
}

export const addMemberToBoard = async (boardId, username) => {
  try {
    const response = await api.post(`boards/${boardId}/add_member/`, { username })
    return response.data
  } catch (error) {
    // console.error('Failed to add member to board:', error)
    throw error
  }
}

// Dashboard analytics
export const getDashboardStats = async () => {
  try {
    const response = await api.get('feedback/counts/')
    return response.data
  } catch (error) {
    // console.error('Failed to fetch dashboard stats:', error)
    return {}
  }
}

export const getTopVotedFeedback = async () => {
  try {
    const response = await api.get('feedback/top_voted/')
    return response.data
  } catch (error) {
    // console.error('Failed to fetch top voted feedback:', error)
    return []
  }
}

export const getFeedbackTrends = async () => {
  try {
    const response = await api.get('feedback/trends/')
    return response.data
  } catch (error) {
    // console.error('Failed to fetch feedback trends:', error)
    return []
  }
}

// Tags
export const getTags = async () => {
  try {
    const response = await api.get('tags/')
    return Array.isArray(response.data) ? response.data : response.data.results || []
  } catch (error) {
    // console.error('Failed to fetch tags:', error)
    return []
  }
}

export const createTag = async (name) => {
  try {
    const response = await api.post('tags/', { name })
    return response.data
  } catch (error) {
    // console.error('Failed to create tag:', error)
    throw error
  }
}