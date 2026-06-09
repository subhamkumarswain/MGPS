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

  // --- Gatepass APIs ---

  static async applyGatepass(gatepassType, reason, outTime, inTime) {
    return this.request('/gatepass', {
      method: 'POST',
      body: JSON.stringify({ gatepassType, reason, outTime, inTime })
    });
  }

  static async getMyGatepasses() {
    return this.request('/gatepass/my', { method: 'GET' });
  }

  static async getPendingGatepasses() {
    return this.request('/gatepass/pending', { method: 'GET' });
  }

  static async getApprovedGatepasses() {
    return this.request('/gatepass/approved', { method: 'GET' });
  }

  static async approveGatepass(id, status) {
    return this.request(`/gatepass/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ status })
    });
  }

  static async updateGateStatus(id, action) {
    return this.request(`/gatepass/${id}/gate`, {
      method: 'POST',
      body: JSON.stringify({ action })
    });
  }

  // --- Material Pass APIs ---

  static async applyMaterialPass(materialDesc, quantity, passType, outTime, returnTime) {
    return this.request('/materialpass', {
      method: 'POST',
      body: JSON.stringify({ materialDesc, quantity, passType, outTime, returnTime })
    });
  }

  static async getMyMaterialPasses() {
    return this.request('/materialpass/my', { method: 'GET' });
  }

  static async getPendingMaterialPasses() {
    return this.request('/materialpass/pending', { method: 'GET' });
  }

  static async getApprovedMaterialPasses() {
    return this.request('/materialpass/approved', { method: 'GET' });
  }

  static async approveMaterialPass(id, status) {
    return this.request(`/materialpass/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ status })
    });
  }

  static async updateMaterialGateStatus(id, action) {
    return this.request(`/materialpass/${id}/gate`, {
      method: 'POST',
      body: JSON.stringify({ action })
    });
  }

  // --- Reports & Admin APIs ---

  static async getGatepassReport(filters = {}) {
    const cleanFilters = {};
    for (const [key, val] of Object.entries(filters)) {
      if (val) cleanFilters[key] = val;
    }
    const params = new URLSearchParams(cleanFilters).toString();
    return this.request(`/gatepass/report?${params}`, { method: 'GET' });
  }

  static async getMaterialReport(filters = {}) {
    const cleanFilters = {};
    for (const [key, val] of Object.entries(filters)) {
      if (val) cleanFilters[key] = val;
    }
    const params = new URLSearchParams(cleanFilters).toString();
    return this.request(`/materialpass/report?${params}`, { method: 'GET' });
  }

  static async getAllUsers() {
    return this.request('/admin/users', { method: 'GET' });
  }

  static async updateUser(empId, designation, deptCode, roles) {
    return this.request(`/admin/users/${empId}`, {
      method: 'PUT',
      body: JSON.stringify({ designation, deptCode, roles })
    });
  }

  static async deleteUser(empId) {
    return this.request(`/admin/users/${empId}`, { method: 'DELETE' });
  }
}
