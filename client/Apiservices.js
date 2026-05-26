import axios from "axios";

const baseUrl = "/api/";

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

  verifyEmail(token) {
    return axios.get(baseUrl + `auth/verify/${token}`);
  }

  resendVerification() {
    return axios.post(baseUrl + "auth/resend-verification", {}, this.getToken());
  }

  deleteAccount(data) {
    return axios.post(baseUrl + "auth/delete-account", data, this.getToken());
  }

  forgotPassword(data) {
    return axios.post(baseUrl + "auth/forgot-password", data);
  }

  resetPassword(data) {
    return axios.post(baseUrl + "auth/reset-password", data);
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

  getMySessions(params = {}) {
    return axios.get(baseUrl + "sessions/mentor/me", this.getAuthConfig({ params }));
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

  getCategories(params = {}) {
    return axios.get(baseUrl + "categories", { params });
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

  fetchBookings(params = {}) {
    return axios.get(baseUrl + "requests/my-bookings", this.getAuthConfig({ params }));
  }

  fetchProgress() {
    return axios.get(baseUrl + "progress", this.getToken());
  }

  getAllProgress(params = {}) {
    return axios.get(baseUrl + "progress/all", this.getAuthConfig({ params }));
  }

  fetchReviews(params = {}) {
    return axios.get(baseUrl + "reviews", this.getAuthConfig({ params }));
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

  downloadCertificate(skillName) {
    return axios.get(baseUrl + `certificates/download/${encodeURIComponent(skillName)}`, {
      ...this.getToken(),
      responseType: "blob",
    });
  }

  updateProfile(data) {
    return axios.put(baseUrl + "profile", data, this.getToken());
  }

  getProfile() {
    return axios.get(baseUrl + "profile", this.getToken());
  }

  getProfileStats() {
    return axios.get(baseUrl + "profile/stats", this.getToken());
  }

  fetchRecommendations() {
    return axios.get(baseUrl + "ai/recommendations", this.getToken());
  }

  generateTitle(data) {
    return axios.post(baseUrl + "ai/generate-title", data, this.getToken());
  }

  generateDescription(data) {
    return axios.post(baseUrl + "ai/generate-description", data, this.getToken());
  }

  generateOutcomes(data) {
    return axios.post(baseUrl + "ai/generate-outcomes", data, this.getToken());
  }

  generateTags(data) {
    return axios.post(baseUrl + "ai/generate-tags", data, this.getToken());
  }

  generateRoadmap(data) {
    return axios.post(baseUrl + "ai/generate-roadmap", data, this.getToken());
  }

  mentorAssistant(data) {
    return axios.post(baseUrl + "ai/mentor-assistant", data, this.getToken());
  }

  chatAI(data) {
    return axios.post(baseUrl + "ai/chat", data, this.getToken());
  }

  searchSessions(data) {
    return axios.post(baseUrl + "ai/search", data, this.getToken());
  }

  getMentorBookings(params = {}) {
    return axios.get(baseUrl + "requests/mentor/bookings", this.getAuthConfig({ params }));
  }

  getMentorLearners(params = {}) {
    return axios.get(baseUrl + "requests/mentor/learners", this.getAuthConfig({ params }));
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

  applyForMentor(data) {
    return axios.post(baseUrl + "mentor-applications/apply", data, this.getToken());
  }

  getMyApplication() {
    return axios.get(baseUrl + "mentor-applications/my-application", this.getToken());
  }

  getAllMentorApplications(params = {}) {
    return axios.get(baseUrl + "mentor-applications/all", this.getAuthConfig({ params }));
  }

  approveMentorApplication(id, data = {}) {
    return axios.put(baseUrl + `mentor-applications/${id}/approve`, data, this.getToken());
  }

  rejectMentorApplication(id, data = {}) {
    return axios.put(baseUrl + `mentor-applications/${id}/reject`, data, this.getToken());
  }

  removeMentor(id) {
    return axios.put(baseUrl + `mentor-applications/${id}/remove-mentor`, {}, this.getToken());
  }

  unblockMentor(id) {
    return axios.put(baseUrl + `mentor-applications/${id}/unblock`, {}, this.getToken());
  }

  deleteMentorApplication(id) {
    return axios.delete(baseUrl + `mentor-applications/${id}`, this.getToken());
  }

  calendarConnect() {
    return axios.get(baseUrl + "calendar/connect", this.getToken());
  }

  calendarStatus() {
    return axios.get(baseUrl + "calendar/status", this.getToken());
  }

  calendarDisconnect() {
    return axios.post(baseUrl + "calendar/disconnect", {}, this.getToken());
  }
}

export default new Apiservices();
