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

  getSkills(includeDeleted = false, extraParams = {}) {
    const config = { params: { ...extraParams } };
    if (includeDeleted) config.params.includeDeleted = true;
    return axios.get(baseUrl + "skills", this.getAuthConfig(config));
  }

  getSessions() {
    return axios.get(baseUrl + "sessions", this.getAuthConfig());
  }

  fetchSessions(params = {}) {
    return axios.get(baseUrl + "sessions", this.getAuthConfig({ params }));
  }

  getMySessions() {
    return axios.get(baseUrl + "sessions/mentor/me", this.getToken());
  }

  getSession(sessionId) {
    return axios.get(baseUrl + `sessions/${sessionId}`, this.getAuthConfig());
  }

  fetchSessionDetails(sessionId) {
    return axios.get(baseUrl + `sessions/${sessionId}`, this.getAuthConfig());
  }

  createSession(data) {
    return axios.post(baseUrl + "sessions", data, this.getToken());
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

  addCategory(data) {
    return axios.post(baseUrl + "categories", data, this.getToken());
  }

  updateCategory(id, data) {
    return axios.put(baseUrl + `categories/${id}`, data, this.getToken());
  }

  deleteCategory(id) {
    return axios.delete(baseUrl + `categories/${id}`, this.getToken());
  }

  toggleCategory(id) {
    return axios.patch(baseUrl + `categories/toggle/${id}`, {}, this.getToken());
  }

  getUsers(config = {}) {
    return axios.get(baseUrl + "users", this.getAuthConfig(config));
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

  bookSession(data) {
    return axios.post(baseUrl + "requests/book", data, this.getToken());
  }

  fetchBookings() {
    return axios.get(baseUrl + "requests/my-bookings", this.getToken());
  }

  fetchProgress() {
    return axios.get(baseUrl + "progress", this.getToken());
  }

  getAllProgress() {
    return axios.get(baseUrl + "progress/all", this.getToken());
  }

  fetchReviews() {
    return axios.get(baseUrl + "reviews", this.getToken());
  }

  createReview(data) {
    return axios.post(baseUrl + "reviews", data, this.getToken());
  }

  updateReview(reviewId, data) {
    return axios.put(baseUrl + `reviews/${reviewId}`, data, this.getToken());
  }

  deleteReview(reviewId) {
    return axios.delete(baseUrl + `reviews/${reviewId}`, this.getToken());
  }

  updateProfile(data) {
    return axios.put(baseUrl + "profile", data, this.getToken());
  }

  getProfile() {
    return axios.get(baseUrl + "profile", this.getToken());
  }

  fetchRecommendations() {
    return axios.get(baseUrl + "ai/recommendations", this.getToken());
  }

  getMentorBookings() {
    return axios.get(baseUrl + "requests/mentor/bookings", this.getToken());
  }

  getMentorLearners() {
    return axios.get(baseUrl + "requests/mentor/learners", this.getToken());
  }

  updateRequest(id, status) {
    return axios.put(
      baseUrl + `requests/${id}/status`,
      { status },
      this.getToken(),
    );
  }

  createOrder(data) {
    return axios.post(baseUrl + "payments/create-order", data, this.getToken());
  }

  verifyPayment(data) {
    return axios.post(baseUrl + "payments/verify-payment", data, this.getToken());
  }

  processRefund(data) {
    return axios.post(baseUrl + "payments/refund", data, this.getToken());
  }

  getSettings() {
    return axios.get(baseUrl + "settings", this.getToken());
  }

  updateSettings(data) {
    return axios.put(baseUrl + "settings", data, this.getToken());
  }
}

export default new Apiservices();
