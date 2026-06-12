import axios from "axios";

axios.defaults.withCredentials = true;

const baseUrl = "/api/";

class Apiservices {

  logout() {
    return axios.post(baseUrl + "auth/logout");
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

  resendVerification(data = {}) {
    return axios.post(baseUrl + "auth/resend-verification", data);
  }

  deleteAccount(data) {
    return axios.post(baseUrl + "auth/delete-account", data);
  }

  forgotPassword(data) {
    return axios.post(baseUrl + "auth/forgot-password", data);
  }

  resetPassword(data) {
    return axios.post(baseUrl + "auth/reset-password", data);
  }

  AddSkill(data) {
    return axios.post(baseUrl + "skills", data);
  }

  getSkills(includeDeleted = false, extraParams = {}) {
    const config = { params: { ...extraParams } };
    if (includeDeleted) config.params.includeDeleted = true;
    return axios.get(baseUrl + "skills", config);
  }

  fetchSessions(params = {}) {
    return axios.get(baseUrl + "sessions", { params });
  }

  getMySessions(params = {}) {
    return axios.get(baseUrl + "sessions/mentor/me", { params });
  }

  getSession(sessionId) {
    return axios.get(baseUrl + `sessions/${sessionId}`);
  }

  fetchSessionDetails(sessionId) {
    return axios.get(baseUrl + `sessions/${sessionId}`);
  }

  createSession(data) {
    return axios.post(baseUrl + "sessions", data);
  }

  updateSession(sessionId, data) {
    return axios.put(baseUrl + `sessions/${sessionId}`, data);
  }

  deleteSession(sessionId) {
    return axios.delete(baseUrl + `sessions/${sessionId}`);
  }

  updateSkillStatus(skillId, status) {
    return axios.put(
      baseUrl + `skills/${skillId}`,
      { status },
    );
  }

  deleteSkill(skillId) {
    return axios.delete(baseUrl + `skills/${skillId}`);
  }

  getCategories(params = {}) {
    return axios.get(baseUrl + "categories", { params });
  }

  addCategory(data) {
    return axios.post(baseUrl + "categories", data);
  }

  updateCategory(id, data) {
    return axios.put(baseUrl + `categories/${id}`, data);
  }

  deleteCategory(id) {
    return axios.delete(baseUrl + `categories/${id}`);
  }

  toggleCategory(id) {
    return axios.patch(baseUrl + `categories/toggle/${id}`);
  }

  getUsers(config = {}) {
    return axios.get(baseUrl + "users", config);
  }

  updateUserStatus(userId, status) {
    return axios.put(
      baseUrl + `users/${userId}/status`,
      { status },
    );
  }

  adminBlockUser(userId) {
    return axios.put(baseUrl + `users/${userId}/block`);
  }

  adminUnblockUser(userId) {
    return axios.put(baseUrl + `users/${userId}/unblock`);
  }

  getRequests() {
    return axios.get(baseUrl + "requests");
  }

  bookSession(data) {
    return axios.post(baseUrl + "requests/book", data);
  }

  fetchBookings(params = {}) {
    return axios.get(baseUrl + "requests/my-bookings", { params });
  }

  fetchProgress() {
    return axios.get(baseUrl + "progress");
  }

  getAllProgress(params = {}) {
    return axios.get(baseUrl + "progress/all", { params });
  }

  fetchReviews(params = {}) {
    return axios.get(baseUrl + "reviews", { params });
  }

  createReview(data) {
    return axios.post(baseUrl + "reviews", data);
  }

  updateReview(reviewId, data) {
    return axios.put(baseUrl + `reviews/${reviewId}`, data);
  }

  deleteReview(reviewId) {
    return axios.delete(baseUrl + `reviews/${reviewId}`);
  }

  downloadCertificate(skillName) {
    return axios.get(baseUrl + `certificates/download/${encodeURIComponent(skillName)}`, {
      responseType: "blob",
    });
  }

  updateProfile(data) {
    return axios.put(baseUrl + "profile", data);
  }

  getProfile() {
    return axios.get(baseUrl + "profile");
  }

  getProfileStats() {
    return axios.get(baseUrl + "profile/stats");
  }

  getSidebarCounts() {
    return axios.get(baseUrl + "sidebar/counts");
  }

  getXpHistory(params = {}) {
    return axios.get(baseUrl + "profile/xp-history", { params });
  }

  fetchRecommendations() {
    return axios.get(baseUrl + "ai/recommendations");
  }

  generateTitle(data) {
    return axios.post(baseUrl + "ai/generate-title", data);
  }

  generateDescription(data) {
    return axios.post(baseUrl + "ai/generate-description", data);
  }

  generateOutcomes(data) {
    return axios.post(baseUrl + "ai/generate-outcomes", data);
  }

  generateTags(data) {
    return axios.post(baseUrl + "ai/generate-tags", data);
  }

  generateRoadmap(data) {
    return axios.post(baseUrl + "ai/generate-roadmap", data);
  }

  mentorAssistant(data) {
    return axios.post(baseUrl + "ai/mentor-assistant", data);
  }

  chatAI(data) {
    return axios.post(baseUrl + "ai/chat", data);
  }

  searchSessions(data) {
    return axios.post(baseUrl + "ai/search", data);
  }

  getMentorBookings(params = {}) {
    return axios.get(baseUrl + "requests/mentor/bookings", { params });
  }

  getMentorLearners(params = {}) {
    return axios.get(baseUrl + "requests/mentor/learners", { params });
  }

  updateRequest(id, status) {
    return axios.put(
      baseUrl + `requests/${id}/status`,
      { status },
    );
  }

  startBooking(id) {
    return axios.put(baseUrl + `requests/${id}/start`);
  }

  startSession(sessionId) {
    return axios.put(baseUrl + `sessions/${sessionId}/start`);
  }

  getSettings() {
    return axios.get(baseUrl + "settings");
  }

  updateSettings(data) {
    return axios.put(baseUrl + "settings", data);
  }

  applyForMentor(data) {
    return axios.post(baseUrl + "mentor-applications/apply", data);
  }

  getMyApplication() {
    return axios.get(baseUrl + "mentor-applications/my-application");
  }

  getAllMentorApplications(params = {}) {
    return axios.get(baseUrl + "mentor-applications/all", { params });
  }

  calendarConnect() {
    return axios.get(baseUrl + "calendar/connect");
  }

  calendarStatus() {
    return axios.get(baseUrl + "calendar/status");
  }

  calendarDisconnect() {
    return axios.post(baseUrl + "calendar/disconnect");
  }

  getMyAvailability() {
    return axios.get(baseUrl + "availability/me");
  }

  updateMyAvailability(data) {
    return axios.put(baseUrl + "availability/me", data);
  }

  getMentorAvailability(mentorId) {
    return axios.get(baseUrl + `availability/${mentorId}`);
  }

  getBookedSlots(params = {}) {
    return axios.get(baseUrl + "availability/booked-slots", { params });
  }

  getAllBadges() {
    return axios.get(baseUrl + "badges");
  }

  getMyBadges() {
    return axios.get(baseUrl + "badges/mine");
  }

  getMentorLeaderboard(params = {}) {
    return axios.get(baseUrl + "leaderboard/mentors", { params });
  }

  getLearnerLeaderboard(params = {}) {
    return axios.get(baseUrl + "leaderboard/learners", { params });
  }

  toggleWishlist(sessionId) {
    return axios.post(baseUrl + "wishlist/toggle", { sessionId });
  }

  getWishlist(params = {}) {
    return axios.get(baseUrl + "wishlist", { params });
  }

  getAdminAnalytics(period) {
    return axios.get(baseUrl + "admin/analytics", { params: { period } });
  }

  getSessionMaterials(sessionId) {
    return axios.get(baseUrl + `sessions/${sessionId}/materials`);
  }

  uploadSessionMaterial(sessionId, formData) {
    return axios.post(baseUrl + `sessions/${sessionId}/materials`, formData);
  }

  deleteSessionMaterial(sessionId, materialId) {
    return axios.delete(baseUrl + `sessions/${sessionId}/materials/${materialId}`);
  }

  getWallet() {
    return axios.get(baseUrl + "wallet");
  }

  addWalletFunds(amount) {
    return axios.post(baseUrl + "wallet/add-funds", { amount });
  }

  verifyWalletFunds(data) {
    return axios.post(baseUrl + "wallet/verify-funds", data);
  }

  getWalletTransactions(params = {}) {
    return axios.get(baseUrl + "wallet/transactions", { params });
  }

  payWithWallet(requestId) {
    return axios.post(baseUrl + "wallet/pay", { requestId });
  }

  getEarnings() {
    return axios.get(baseUrl + "earnings");
  }

  getAdminCreditBalances(params = {}) {
    return axios.get(baseUrl + "admin/credits/balances", { params });
  }

  getAdminCreditHistory(params = {}) {
    return axios.get(baseUrl + "admin/credits/history", { params });
  }

  getCreditHistory(params = {}) {
    return axios.get(baseUrl + "wallet/credit-history", { params });
  }

  disputeRequest(id, reason) {
    return axios.put(baseUrl + `requests/${id}/dispute`, { reason });
  }

  resolveDispute(id, action) {
    return axios.put(baseUrl + `admin/disputes/${id}/resolve`, { action });
  }

  getBookingAnalytics() {
    return axios.get(baseUrl + "admin/analytics/bookings");
  }

  getEarningTransactions(params = {}) {
    return axios.get(baseUrl + "earnings/transactions", { params });
  }

  withdrawEarnings(amount) {
    return axios.post(baseUrl + "earnings/withdraw", { amount });
  }

  // Follow System
  toggleFollow(userId) {
    return axios.post(baseUrl + "follow/toggle", { userId });
  }

  getFollowers(userId, params = {}) {
    return axios.get(baseUrl + `follow/followers/${userId}`, { params });
  }

  getFollowing(userId, params = {}) {
    return axios.get(baseUrl + `follow/following/${userId}`, { params });
  }

  getFollowStatus(userId) {
    return axios.get(baseUrl + `follow/status/${userId}`);
  }

  getPublicProfile(userId) {
    return axios.get(baseUrl + `profile/public/${userId}`);
  }

  getOnboarding(role) {
    const params = role ? { role } : {};
    return axios.get(baseUrl + "profile/onboarding", { params });
  }

  dismissOnboarding() {
    return axios.put(baseUrl + "profile/onboarding/dismiss");
  }

  getFeed(params = {}) {
    return axios.get(baseUrl + "feed", { params });
  }

  getNotifications(params = {}) {
    return axios.get(baseUrl + "notifications", { params });
  }

  getUnreadCount() {
    return axios.get(baseUrl + "notifications/unread-count");
  }

  markNotificationRead(id) {
    return axios.patch(baseUrl + `notifications/${id}/read`);
  }

  markAllNotificationsRead() {
    return axios.patch(baseUrl + "notifications/read-all");
  }

  getFollowSuggestions(params = {}) {
    return axios.get(baseUrl + "follow/suggestions", { params });
  }

  sendMessage(data) {
    return axios.post(baseUrl + "chat/send", data);
  }

  getConversations() {
    return axios.get(baseUrl + "chat/conversations");
  }

  getChat(chatId) {
    return axios.get(baseUrl + `chat/${chatId}`);
  }

  getOrCreateDM(userId) {
    return axios.get(baseUrl + `chat/dm/${userId}`);
  }

  getOrCreateBookingChat(requestId) {
    return axios.get(baseUrl + `chat/booking/${requestId}`);
  }

  markChatRead(chatId) {
    return axios.patch(baseUrl + `chat/${chatId}/read`);
  }

  getUnreadChatCount() {
    return axios.get(baseUrl + "chat/unread-count");
  }

  uploadChatFile(formData) {
    return axios.post(baseUrl + "chat/upload", formData);
  }

  searchMessages(q) {
    return axios.get(baseUrl + "chat/search", { params: { q } });
  }

  toggleReaction(chatId, messageId, emoji) {
    return axios.post(baseUrl + `chat/${chatId}/messages/${messageId}/reaction`, { emoji });
  }

  searchUsers(q) {
    return axios.get(baseUrl + "users/search", { params: { q } });
  }

  deleteMessage(chatId, messageId) {
    return axios.delete(baseUrl + `chat/${chatId}/messages/${messageId}`);
  }

  blockUser(userId) {
    return axios.post(baseUrl + `users/${userId}/block`);
  }

  unblockUser(userId) {
    return axios.post(baseUrl + `users/${userId}/unblock`);
  }

  getBlockedUsers() {
    return axios.get(baseUrl + "users/blocked");
  }

  getMentorAnalytics() {
    return axios.get(baseUrl + "analytics/mentor");
  }

  broadcastNotification(data) {
    return axios.post(baseUrl + "admin/broadcast", data);
  }

  getBroadcasts(params = {}) {
    return axios.get(baseUrl + "admin/broadcasts", { params });
  }

  deleteBroadcast(id) {
    return axios.delete(baseUrl + `admin/broadcast/${id}`);
  }

  updateBroadcast(id, data) {
    return axios.put(baseUrl + `admin/broadcast/${id}`, data);
  }

  getAdminPayments(params = {}) {
    return axios.get(baseUrl + "admin/payments", { params });
  }

  createDispute(data) {
    return axios.post(baseUrl + "disputes", data);
  }

  getMyDisputes() {
    return axios.get(baseUrl + "disputes");
  }

  getDispute(id) {
    return axios.get(baseUrl + `disputes/${id}`);
  }

  getAllDisputes(params = {}) {
    return axios.get(baseUrl + "disputes/all", { params });
  }

  resolveDispute(id, data) {
    return axios.put(baseUrl + `disputes/${id}/resolve`, data);
  }

  joinBooking(id) {
    return axios.put(baseUrl + `requests/${id}/join`);
  }

  getAuditLogs(params = {}) {
    return axios.get(baseUrl + "admin/audit-logs", { params });
  }

  guideWelcome() {
    return axios.get(baseUrl + "ai/guide/welcome");
  }

  guideChat(message, context = {}) {
    return axios.post(baseUrl + "ai/guide/chat", { message, ...context });
  }

  updateOnboardingStatus(status) {
    return axios.put(baseUrl + "ai/guide/onboarding", { status });
  }

}

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve();
  });
  failedQueue = [];
};

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status !== 401 || originalRequest._retry) {
      throw error;
    }
    if (originalRequest.url?.includes("auth/refresh")) {
      throw error;
    }
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(() => axios(originalRequest));
    }
    originalRequest._retry = true;
    isRefreshing = true;
    try {
      await axios.post("/api/auth/refresh");
      processQueue(null);
      return axios(originalRequest);
    } catch {
      processQueue(error);
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
      throw error;
    } finally {
      isRefreshing = false;
    }
  }
);

export default new Apiservices();
