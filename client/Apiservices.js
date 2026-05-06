import axios from "axios";

const baseUrl = "http://localhost:3000/api/";

class Apiservices {
  getAuthConfig(config = {}) {
    const token = localStorage.getItem("token");

    if (!token) {
      return config;
    }

    return {
      ...config,
      headers: {
        ...(config.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    };
  }

  getToken() {
    return this.getAuthConfig();
  }

  register(data) {
    return axios.post(baseUrl + "auth/register", data);
  }

  login(data) {
    return axios.post(baseUrl + "auth/login", data);
  }

  AddSkill(data) {
    return axios.post(baseUrl + "skills", data, this.getToken());
  }

  getSkills(includeDeleted = false) {
    const config = includeDeleted ? { params: { includeDeleted: true } } : {};
    return axios.get(baseUrl + "skills", this.getAuthConfig(config));
  }

  getSessions() {
    return axios.get(baseUrl + "sessions", this.getAuthConfig());
  }

  getSession(sessionId) {
    return axios.get(baseUrl + `sessions/${sessionId}`, this.getAuthConfig());
  }

  updateSession(sessionId, data) {
    return axios.put(baseUrl + `sessions/${sessionId}`, data, this.getToken());
  }

  deleteSession(sessionId) {
    return axios.delete(baseUrl + `sessions/${sessionId}`, this.getToken());
  }

  updateSkillStatus(skillId, status) {
    return axios.put(
      baseUrl + `skills/${skillId}`,
      { status },
      this.getToken(),
    );
  }

  deleteSkill(skillId) {
    return axios.delete(baseUrl + `skills/${skillId}`, this.getToken());
  }

  getCategories() {
    return axios.get(baseUrl + "categories");
  }

  getUsers() {
    return axios.get(baseUrl + "users", this.getToken());
  }

  applyForMentor() {
    return axios.post(baseUrl + "users/apply-mentor", {}, this.getToken());
  }

  updateUserStatus(userId, status) {
    return axios.put(
      baseUrl + `users/${userId}/status`,
      { status },
      this.getToken(),
    );
  }

  blockUser(userId) {
    return axios.put(baseUrl + `users/${userId}/block`, {}, this.getToken());
  }

  unblockUser(userId) {
    return axios.put(baseUrl + `users/${userId}/unblock`, {}, this.getToken());
  }

  approveUser(userId) {
    return axios.put(baseUrl + `users/${userId}/approve`, {}, this.getToken());
  }

  getRequests() {
    return axios.get(baseUrl + "requests", this.getToken());
  }

  updateRequest(id, status) {
    return axios.put(baseUrl + `requests/${id}`, { status }, this.getToken());
  }
}

export default new Apiservices();
