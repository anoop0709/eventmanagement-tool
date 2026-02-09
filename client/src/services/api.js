const API_BASE_URL = 'http://localhost:5001/api/v1';

// Store CSRF token
let csrfToken = null;

// Get CSRF token from server
const fetchCSRFToken = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/csrf-token`, {
      credentials: 'include',
    });
    const data = await response.json();
    csrfToken = data.csrfToken;
    return csrfToken;
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
    return null;
  }
};

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshSubscribers = [];

// Notify all subscribers when token is refreshed
const onTokenRefreshed = () => {
  refreshSubscribers.forEach((callback) => callback());
  refreshSubscribers = [];
};

// Add request to queue while refreshing
const addRefreshSubscriber = (callback) => {
  refreshSubscribers.push(callback);
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || 'Request failed');
  }
  return response.json();
};

// Helper function to make API requests with credentials (cookies)
const apiRequest = async (endpoint, options = {}, retryCount = 0) => {
  // Fetch CSRF token if not present and request is not GET/HEAD
  const method = options.method || 'GET';
  if (!csrfToken && !['GET', 'HEAD'].includes(method.toUpperCase())) {
    await fetchCSRFToken();
  }

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Important: include cookies
  };

  // Add CSRF token header for non-GET requests
  if (csrfToken && !['GET', 'HEAD'].includes(method.toUpperCase())) {
    defaultOptions.headers['x-csrf-token'] = csrfToken;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  });

  // If unauthorized and not already refreshing, try to refresh token
  if (response.status === 401 && endpoint !== '/auth/refresh' && endpoint !== '/auth/login' && retryCount === 0) {
    
    // If already refreshing, wait for it to complete
    if (isRefreshing) {
      return new Promise((resolve) => {
        addRefreshSubscriber(async () => {
          // Retry the original request after token refresh
          const retryResponse = await apiRequest(endpoint, options, 1);
          resolve(retryResponse);
        });
      });
    }

    // Start refreshing
    isRefreshing = true;
    
    try {
      // Attempt to refresh the token
      await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      
      isRefreshing = false;
      onTokenRefreshed();
      
      // Retry the original request
      return apiRequest(endpoint, options, 1);
    } catch (refreshError) {
      console.error('Token refresh failed:', refreshError);
      isRefreshing = false;
      // If refresh fails, user needs to log in again
      window.location.href = '/login';
      throw new Error('Session expired. Please log in again.');
    }
  }

  return handleResponse(response);
};

// Auth API
export const authAPI = {
  login: async (email, password) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (name, email, password) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },

  logout: async () => {
    return apiRequest('/auth/logout', {
      method: 'POST',
    });
  },

  getMe: async () => {
    return apiRequest('/auth/me');
  },

  refreshToken: async () => {
    return apiRequest('/auth/refresh', {
      method: 'POST',
    });
  },
};

// Event API
export const eventAPI = {
  // Create new event (initial draft)
  createEvent: async (eventData) => {
    return apiRequest('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  },

  // Update existing event (merge data)
  updateEvent: async (eventId, eventData) => {
    return apiRequest(`/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
  },

  // Get all events
  getAllEvents: async () => {
    return apiRequest('/events');
  },

  // Get single event by ID
  getEventById: async (eventId) => {
    return apiRequest(`/events/${eventId}`);
  },

  // Delete event (admin only)
  deleteEvent: async (eventId) => {
    return apiRequest(`/events/${eventId}`, {
      method: 'DELETE',
    });
  },

  // Get draft events
  getDraftEvents: async () => {
    return apiRequest('/events/drafts');
  },

  // Get upcoming events
  getUpcomingEvents: async () => {
    return apiRequest('/events/calendar/upcoming');
  },

  // Get dashboard stats (admin only)
  getDashboardStats: async () => {
    return apiRequest('/events/dashboard/stats');
  },
};

// Initialize CSRF token on module load
fetchCSRFToken();

// Export fetchCSRFToken for manual refresh if needed
export { fetchCSRFToken };
