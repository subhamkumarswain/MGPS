// API service for MGPS frontend

const API_BASE = 'http://localhost:3000/api';

class ApiService {
  
  /**
   * Make a fetch request with error handling
   */
  static async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        credentials: 'include', // Include cookies/session
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  /**
   * Login user
   */
  static async login(username, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  }

  /**
   * Register new user
   */
  static async register(empId, name, designation, deptCode, password, roles = []) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        empId,
        name,
        designation,
        deptCode,
        password,
        roles
      })
    });
  }

  /**
   * Verify if user is authenticated
   */
  static async verify() {
    return this.request('/auth/verify', {
      method: 'GET'
    });
  }

  /**
   * Get current session info
   */
  static async getSession() {
    return this.request('/session', {
      method: 'GET'
    });
  }

  /**
   * Logout user
   */
  static async logout() {
    return this.request('/logout', {
      method: 'GET'
    });
  }

  /**
   * Check if server is running
   */
  static async health() {
    return this.request('/health', {
      method: 'GET'
    });
  }
}
