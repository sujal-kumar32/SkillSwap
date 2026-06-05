const swaggerUi = require("swagger-ui-express");

const spec = {
  openapi: "3.0.0",
  info: {
    title: "SkillSwap API",
    version: "1.0.0",
    description: "Peer-to-peer skill exchange platform API — complete backend reference.",
  },
  servers: [{ url: "http://localhost:3000", description: "Development" }],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          _id: { type: "string" },
          name: { type: "string" },
          email: { type: "string" },
          roles: { type: "array", items: { type: "string" } },
          profileImage: { type: "string" },
          status: { type: "string", enum: ["active", "blocked"] },
        },
      },
      Session: {
        type: "object",
        properties: {
          _id: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          mentorId: { type: "string" },
          skillId: { type: "string" },
          categoryId: { type: "string" },
          price: { type: "number" },
          date: { type: "string", format: "date" },
          time: { type: "string" },
          duration: { type: "number" },
          sessionType: { type: "string", enum: ["online", "offline"] },
          status: { type: "string", enum: ["active", "ongoing", "completed", "cancelled"] },
        },
      },
      Request: {
        type: "object",
        properties: {
          _id: { type: "string" },
          sessionId: { type: "string" },
          learnerId: { type: "string" },
          mentorId: { type: "string" },
          requestStatus: { type: "string", enum: ["pending", "accepted", "rejected", "completed", "cancelled"] },
          paymentStatus: { type: "string", enum: ["pending", "paid", "failed", "refunded"] },
        },
      },
      Review: {
        type: "object",
        properties: {
          _id: { type: "string" },
          sessionId: { type: "string" },
          mentorId: { type: "string" },
          learnerId: { type: "string" },
          rating: { type: "number", minimum: 1, maximum: 5 },
          comment: { type: "string" },
        },
      },
      Payment: {
        type: "object",
        properties: {
          _id: { type: "string" },
          requestId: { type: "string" },
          amount: { type: "number" },
          paymentStatus: { type: "string", enum: ["pending", "success", "failed", "refunded"] },
          orderId: { type: "string" },
          transactionId: { type: "string" },
        },
      },
      Category: {
        type: "object",
        properties: {
          _id: { type: "string" },
          name: { type: "string" },
          slug: { type: "string" },
          icon: { type: "string" },
          status: { type: "string", enum: ["active", "inactive"] },
        },
      },
      Skill: {
        type: "object",
        properties: {
          _id: { type: "string" },
          name: { type: "string" },
          categoryId: { type: "string" },
          status: { type: "string", enum: ["pending", "active", "rejected"] },
          level: { type: "string" },
        },
      },
      Dispute: {
        type: "object",
        properties: {
          _id: { type: "string" },
          requestId: { type: "string" },
          raisedBy: { type: "string" },
          raisedAgainst: { type: "string" },
          status: { type: "string", enum: ["open", "under_review", "resolved", "dismissed"] },
        },
      },
      Notification: {
        type: "object",
        properties: {
          _id: { type: "string" },
          recipient: { type: "string" },
          type: { type: "string" },
          message: { type: "string" },
          link: { type: "string" },
          read: { type: "boolean" },
        },
      },
      Error: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string" },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    // ─── AUTH ──────────────────────────────────────────────────────────────
    "/api/auth/register": {
      post: { tags: ["Auth"], summary: "Register a new user", security: [], requestBody: { content: { "application/json": { schema: { type: "object", properties: { name: { type: "string" }, email: { type: "string" }, password: { type: "string" } }, required: ["name", "email", "password"] } } } }, responses: { 201: { description: "User registered" }, 400: { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } } } },
    },
    "/api/auth/login": {
      post: { tags: ["Auth"], summary: "Login", security: [], requestBody: { content: { "application/json": { schema: { type: "object", properties: { email: { type: "string" }, password: { type: "string" } }, required: ["email", "password"] } } } }, responses: { 200: { description: "Login successful" }, 401: { description: "Invalid credentials" } } },
    },
    "/api/auth/verify/{token}": {
      get: { tags: ["Auth"], summary: "Verify email", security: [], parameters: [{ name: "token", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Email verified" } } },
    },
    "/api/auth/resend-verification": {
      post: { tags: ["Auth"], summary: "Resend verification email", security: [], responses: { 200: { description: "Verification email sent" } } },
    },
    "/api/auth/me": {
      get: { tags: ["Auth"], summary: "Get current user", responses: { 200: { description: "Current user data", content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } } } } },
    },
    "/api/auth/refresh": {
      post: { tags: ["Auth"], summary: "Refresh access token", security: [], responses: { 200: { description: "New tokens" } } },
    },
    "/api/auth/logout": {
      post: { tags: ["Auth"], summary: "Logout", responses: { 200: { description: "Logged out" } } },
    },
    "/api/auth/change-password": {
      post: { tags: ["Auth"], summary: "Change password", requestBody: { content: { "application/json": { schema: { type: "object", properties: { currentPassword: { type: "string" }, newPassword: { type: "string" } }, required: ["currentPassword", "newPassword"] } } } }, responses: { 200: { description: "Password changed" } } },
    },
    "/api/auth/forgot-password": {
      post: { tags: ["Auth"], summary: "Request password reset", security: [], requestBody: { content: { "application/json": { schema: { type: "object", properties: { email: { type: "string" } }, required: ["email"] } } } }, responses: { 200: { description: "Reset email sent" } } },
    },
    "/api/auth/reset-password": {
      post: { tags: ["Auth"], summary: "Reset password with token", security: [], requestBody: { content: { "application/json": { schema: { type: "object", properties: { token: { type: "string" }, password: { type: "string" } }, required: ["token", "password"] } } } }, responses: { 200: { description: "Password reset" } } },
    },
    "/api/auth/delete-account": {
      post: { tags: ["Auth"], summary: "Delete own account", responses: { 200: { description: "Account deleted" } } },
    },

    // ─── CATEGORIES ────────────────────────────────────────────────────────
    "/api/categories": {
      get: { tags: ["Categories"], summary: "List all categories", security: [], responses: { 200: { description: "Category list", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Category" } } } } } } },
      post: { tags: ["Categories"], summary: "Create a category (admin)", responses: { 201: { description: "Category created" } } },
    },
    "/api/categories/{id}": {
      get: { tags: ["Categories"], summary: "Get category by ID", security: [], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Category data" } } },
      put: { tags: ["Categories"], summary: "Update category (admin)", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Category updated" } } },
      delete: { tags: ["Categories"], summary: "Delete category (admin)", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Category deleted" } } },
    },
    "/api/categories/toggle/{id}": {
      patch: { tags: ["Categories"], summary: "Toggle category status (admin)", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Status toggled" } } },
    },

    // ─── SKILLS ────────────────────────────────────────────────────────────
    "/api/skills": {
      get: { tags: ["Skills"], summary: "List skills", security: [], parameters: [{ name: "categoryId", in: "query", schema: { type: "string" } }], responses: { 200: { description: "Skill list", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Skill" } } } } } } },
      post: { tags: ["Skills"], summary: "Create a skill (mentor/admin)", responses: { 201: { description: "Skill created" } } },
    },
    "/api/skills/{id}": {
      get: { tags: ["Skills"], summary: "Get skill by ID", security: [], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Skill data" } } },
      put: { tags: ["Skills"], summary: "Update skill", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Skill updated" } } },
      delete: { tags: ["Skills"], summary: "Delete skill", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Skill deleted" } } },
    },

    // ─── SESSIONS ──────────────────────────────────────────────────────────
    "/api/sessions": {
      get: { tags: ["Sessions"], summary: "List sessions", security: [], parameters: [{ name: "categoryId", in: "query", schema: { type: "string" } }, { name: "skillId", in: "query", schema: { type: "string" } }, { name: "status", in: "query", schema: { type: "string" } }, { name: "sessionType", in: "query", schema: { type: "string" } }, { name: "search", in: "query", schema: { type: "string" } }], responses: { 200: { description: "Session list", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Session" } } } } } } },
      post: { tags: ["Sessions"], summary: "Create a session (mentor/admin)", responses: { 201: { description: "Session created" } } },
    },
    "/api/sessions/mentor/me": {
      get: { tags: ["Sessions"], summary: "Get my mentor sessions", responses: { 200: { description: "My sessions" } } },
    },
    "/api/sessions/{id}": {
      get: { tags: ["Sessions"], summary: "Get session by ID", security: [], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Session data" } } },
      put: { tags: ["Sessions"], summary: "Update session (mentor/admin)", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Session updated" } } },
      delete: { tags: ["Sessions"], summary: "Delete session (mentor/admin)", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Session deleted" } } },
    },
    "/api/sessions/{id}/start": {
      put: { tags: ["Sessions"], summary: "Start a session (mentor)", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Session started" } } },
    },

    // ─── REQUESTS ──────────────────────────────────────────────────────────
    "/api/requests": {
      get: { tags: ["Requests"], summary: "List user requests", parameters: [{ name: "status", in: "query", schema: { type: "string" } }, { name: "page", in: "query", schema: { type: "integer" } }, { name: "limit", in: "query", schema: { type: "integer" } }], responses: { 200: { description: "Request list", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Request" } } } } } } },
      post: { tags: ["Requests"], summary: "Create a booking request", responses: { 201: { description: "Request created" } } },
    },
    "/api/requests/book": {
      post: { tags: ["Requests"], summary: "Book a session", responses: { 201: { description: "Booking created" } } },
    },
    "/api/requests/my-bookings": {
      get: { tags: ["Requests"], summary: "Get learner bookings", responses: { 200: { description: "My bookings" } } },
    },
    "/api/requests/mentor/bookings": {
      get: { tags: ["Requests"], summary: "Get mentor bookings", responses: { 200: { description: "Mentor bookings" } } },
    },
    "/api/requests/mentor/learners": {
      get: { tags: ["Requests"], summary: "Get mentor learners", responses: { 200: { description: "Mentor learners" } } },
    },
    "/api/requests/{id}/status": {
      put: { tags: ["Requests"], summary: "Update request status", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], requestBody: { content: { "application/json": { schema: { type: "object", properties: { requestStatus: { type: "string" } }, required: ["requestStatus"] } } } }, responses: { 200: { description: "Status updated" } } },
    },
    "/api/requests/{id}/start": {
      put: { tags: ["Requests"], summary: "Start session (mentor)", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Session started" } } },
    },
    "/api/requests/{id}": {
      delete: { tags: ["Requests"], summary: "Cancel a request", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Request deleted" } } },
    },

    // ─── PAYMENTS ──────────────────────────────────────────────────────────
    "/api/payments": {
      get: { tags: ["Payments"], summary: "List payments", responses: { 200: { description: "Payment list", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Payment" } } } } } } },
    },
    "/api/payments/create-order": {
      post: { tags: ["Payments"], summary: "Create a payment order", requestBody: { content: { "application/json": { schema: { type: "object", properties: { requestId: { type: "string" } }, required: ["requestId"] } } } }, responses: { 201: { description: "Order created" } } },
    },
    "/api/payments/verify-payment": {
      post: { tags: ["Payments"], summary: "Verify payment signature", requestBody: { content: { "application/json": { schema: { type: "object", properties: { orderId: { type: "string" }, paymentId: { type: "string" }, signature: { type: "string" }, requestId: { type: "string" } }, required: ["orderId", "paymentId", "signature", "requestId"] } } } }, responses: { 200: { description: "Payment verified" } } },
    },
    "/api/payments/refund": {
      post: { tags: ["Payments"], summary: "Process a refund", responses: { 200: { description: "Refund initiated" } } },
    },

    // ─── CHAT ──────────────────────────────────────────────────────────────
    "/api/chat/conversations": {
      get: { tags: ["Chat"], summary: "List conversations", responses: { 200: { description: "Conversation list" } } },
    },
    "/api/chat/unread-count": {
      get: { tags: ["Chat"], summary: "Get unread message count", responses: { 200: { description: "Unread count" } } },
    },
    "/api/chat/search": {
      get: { tags: ["Chat"], summary: "Search messages", parameters: [{ name: "q", in: "query", required: true, schema: { type: "string" } }], responses: { 200: { description: "Search results" } } },
    },
    "/api/chat/dm/{userId}": {
      get: { tags: ["Chat"], summary: "Get or create DM chat", parameters: [{ name: "userId", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "DM chat" } } },
    },
    "/api/chat/booking/{requestId}": {
      get: { tags: ["Chat"], summary: "Get or create booking chat", parameters: [{ name: "requestId", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Booking chat" } } },
    },
    "/api/chat/send": {
      post: { tags: ["Chat"], summary: "Send a message", requestBody: { content: { "application/json": { schema: { type: "object", properties: { chatId: { type: "string" }, content: { type: "string" }, messageType: { type: "string", default: "text" } }, required: ["chatId", "content"] } } } }, responses: { 201: { description: "Message sent" } } },
    },
    "/api/chat/upload": {
      post: { tags: ["Chat"], summary: "Upload a file to chat", responses: { 201: { description: "File uploaded" } } },
    },
    "/api/chat/{chatId}": {
      get: { tags: ["Chat"], summary: "Get chat details", parameters: [{ name: "chatId", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Chat data" } } },
    },
    "/api/chat/{chatId}/read": {
      patch: { tags: ["Chat"], summary: "Mark chat as read", parameters: [{ name: "chatId", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Marked as read" } } },
    },
    "/api/chat/{chatId}/messages/{messageId}/reaction": {
      post: { tags: ["Chat"], summary: "Toggle message reaction", parameters: [{ name: "chatId", in: "path", required: true, schema: { type: "string" } }, { name: "messageId", in: "path", required: true, schema: { type: "string" } }], requestBody: { content: { "application/json": { schema: { type: "object", properties: { reaction: { type: "string" } }, required: ["reaction"] } } } }, responses: { 200: { description: "Reaction toggled" } } },
    },
    "/api/chat/{chatId}/messages/{messageId}": {
      delete: { tags: ["Chat"], summary: "Delete a message", parameters: [{ name: "chatId", in: "path", required: true, schema: { type: "string" } }, { name: "messageId", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Message deleted" } } },
    },

    // ─── USERS ─────────────────────────────────────────────────────────────
    "/api/users": {
      get: { tags: ["Users"], summary: "List all users (admin)", responses: { 200: { description: "User list", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/User" } } } } } } },
    },
    "/api/users/search": {
      get: { tags: ["Users"], summary: "Search users", parameters: [{ name: "q", in: "query", required: true, schema: { type: "string" } }], responses: { 200: { description: "Search results" } } },
    },
    "/api/users/blocked": {
      get: { tags: ["Users"], summary: "Get blocked users", responses: { 200: { description: "Blocked users" } } },
    },
    "/api/users/{userId}/status": {
      put: { tags: ["Users"], summary: "Update user status (admin)", parameters: [{ name: "userId", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Status updated" } } },
    },
    "/api/users/{userId}/approve": {
      put: { tags: ["Users"], summary: "Approve user (admin)", parameters: [{ name: "userId", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "User approved" } } },
    },
    "/api/users/{userId}/block": {
      put: { tags: ["Users"], summary: "Block user (admin)", parameters: [{ name: "userId", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "User blocked" } } },
      post: { tags: ["Users"], summary: "Block interaction with user", parameters: [{ name: "userId", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "User blocked" } } },
    },
    "/api/users/{userId}/unblock": {
      put: { tags: ["Users"], summary: "Unblock user (admin)", parameters: [{ name: "userId", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "User unblocked" } } },
      post: { tags: ["Users"], summary: "Unblock interaction with user", parameters: [{ name: "userId", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "User unblocked" } } },
    },
    "/api/users/{userId}/presence": {
      get: { tags: ["Users"], summary: "Get user presence", parameters: [{ name: "userId", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Presence status" } } },
    },

    // ─── PROFILE ───────────────────────────────────────────────────────────
    "/api/profile": {
      get: { tags: ["Profile"], summary: "Get own profile", responses: { 200: { description: "Profile data", content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } } } } },
      put: { tags: ["Profile"], summary: "Update profile", requestBody: { content: { "multipart/form-data": { schema: { type: "object", properties: { name: { type: "string" }, bio: { type: "string" }, profileImage: { type: "string", format: "binary" } } } } } }, responses: { 200: { description: "Profile updated" } } },
    },
    "/api/profile/stats": {
      get: { tags: ["Profile"], summary: "Get profile stats", responses: { 200: { description: "Stats" } } },
    },
    "/api/profile/xp-history": {
      get: { tags: ["Profile"], summary: "Get XP history", responses: { 200: { description: "XP transactions" } } },
    },
    "/api/profile/public/{userId}": {
      get: { tags: ["Profile"], summary: "Get public profile", security: [], parameters: [{ name: "userId", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Public profile" } } },
    },
    "/api/profile/onboarding": {
      get: { tags: ["Profile"], summary: "Get onboarding status", responses: { 200: { description: "Onboarding data" } } },
    },
    "/api/profile/onboarding/dismiss": {
      put: { tags: ["Profile"], summary: "Dismiss onboarding", responses: { 200: { description: "Onboarding dismissed" } } },
    },

    // ─── REVIEWS ───────────────────────────────────────────────────────────
    "/api/reviews": {
      get: { tags: ["Reviews"], summary: "List reviews", parameters: [{ name: "mentorId", in: "query", schema: { type: "string" } }, { name: "learnerId", in: "query", schema: { type: "string" } }, { name: "page", in: "query", schema: { type: "integer" } }, { name: "limit", in: "query", schema: { type: "integer" } }], responses: { 200: { description: "Review list", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Review" } } } } } } },
      post: { tags: ["Reviews"], summary: "Create a review", requestBody: { content: { "application/json": { schema: { type: "object", properties: { sessionId: { type: "string" }, rating: { type: "number", minimum: 1, maximum: 5 }, comment: { type: "string" } }, required: ["sessionId", "rating"] } } } }, responses: { 201: { description: "Review created" } } },
    },
    "/api/reviews/{id}": {
      put: { tags: ["Reviews"], summary: "Update a review", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Review updated" } } },
      delete: { tags: ["Reviews"], summary: "Delete a review", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Review deleted" } } },
    },

    // ─── PROGRESS ──────────────────────────────────────────────────────────
    "/api/progress": {
      get: { tags: ["Progress"], summary: "Get my progress", responses: { 200: { description: "Progress data" } } },
    },
    "/api/progress/all": {
      get: { tags: ["Progress"], summary: "Get all progress (admin)", responses: { 200: { description: "All progress" } } },
    },

    // ─── SETTINGS ──────────────────────────────────────────────────────────
    "/api/settings": {
      get: { tags: ["Settings"], summary: "Get platform settings (admin)", responses: { 200: { description: "Settings" } } },
      put: { tags: ["Settings"], summary: "Update platform settings (admin)", responses: { 200: { description: "Settings updated" } } },
    },

    // ─── AI ────────────────────────────────────────────────────────────────
    "/api/ai/recommendations": {
      get: { tags: ["AI"], summary: "Get AI session recommendations", responses: { 200: { description: "Recommendations" } } },
    },
    "/api/ai/generate-title": {
      post: { tags: ["AI"], summary: "Generate session title via AI", responses: { 200: { description: "Generated title" } } },
    },
    "/api/ai/generate-description": {
      post: { tags: ["AI"], summary: "Generate session description via AI", responses: { 200: { description: "Generated description" } } },
    },
    "/api/ai/generate-outcomes": {
      post: { tags: ["AI"], summary: "Generate learning outcomes via AI", responses: { 200: { description: "Generated outcomes" } } },
    },
    "/api/ai/generate-tags": {
      post: { tags: ["AI"], summary: "Generate tags via AI", responses: { 200: { description: "Generated tags" } } },
    },
    "/api/ai/generate-roadmap": {
      post: { tags: ["AI"], summary: "Generate learning roadmap via AI", responses: { 200: { description: "Generated roadmap" } } },
    },
    "/api/ai/mentor-assistant": {
      post: { tags: ["AI"], summary: "AI mentor assistant chat", responses: { 200: { description: "AI response" } } },
    },
    "/api/ai/chat": {
      post: { tags: ["AI"], summary: "AI chat assistant", responses: { 200: { description: "AI response" } } },
    },
    "/api/ai/search": {
      post: { tags: ["AI"], summary: "AI-powered session search", responses: { 200: { description: "Search results" } } },
    },

    // ─── MENTOR APPLICATIONS ───────────────────────────────────────────────
    "/api/mentor-applications/apply": {
      post: { tags: ["Mentor Applications"], summary: "Apply to become a mentor", responses: { 201: { description: "Application submitted" } } },
    },
    "/api/mentor-applications/my-application": {
      get: { tags: ["Mentor Applications"], summary: "Get my application status", responses: { 200: { description: "Application data" } } },
    },
    "/api/mentor-applications/all": {
      get: { tags: ["Mentor Applications"], summary: "List all applications (admin)", responses: { 200: { description: "All applications" } } },
    },
    "/api/mentor-applications/{id}/approve": {
      put: { tags: ["Mentor Applications"], summary: "Approve application (admin)", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Application approved" } } },
    },
    "/api/mentor-applications/{id}/reject": {
      put: { tags: ["Mentor Applications"], summary: "Reject application (admin)", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Application rejected" } } },
    },
    "/api/mentor-applications/{id}/remove-mentor": {
      put: { tags: ["Mentor Applications"], summary: "Remove mentor role (admin)", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Mentor removed" } } },
    },
    "/api/mentor-applications/{id}/unblock": {
      put: { tags: ["Mentor Applications"], summary: "Unblock mentor (admin)", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Mentor unblocked" } } },
    },
    "/api/mentor-applications/{id}": {
      delete: { tags: ["Mentor Applications"], summary: "Delete application (admin)", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Application deleted" } } },
    },

    // ─── CERTIFICATES ──────────────────────────────────────────────────────
    "/api/certificates/download/{skillName}": {
      get: { tags: ["Certificates"], summary: "Download session certificate", parameters: [{ name: "skillName", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Certificate file" } } },
    },

    // ─── CALENDAR ──────────────────────────────────────────────────────────
    "/api/calendar/connect": {
      get: { tags: ["Calendar"], summary: "Connect Google Calendar", responses: { 302: { description: "Redirect to Google OAuth" } } },
    },
    "/api/calendar/callback": {
      get: { tags: ["Calendar"], summary: "Google OAuth callback", security: [], responses: { 200: { description: "Calendar connected" } } },
    },
    "/api/calendar/status": {
      get: { tags: ["Calendar"], summary: "Get calendar connection status", responses: { 200: { description: "Connection status" } } },
    },
    "/api/calendar/disconnect": {
      post: { tags: ["Calendar"], summary: "Disconnect Google Calendar", responses: { 200: { description: "Calendar disconnected" } } },
    },

    // ─── AVAILABILITY ──────────────────────────────────────────────────────
    "/api/availability/me": {
      get: { tags: ["Availability"], summary: "Get my availability (mentor)", responses: { 200: { description: "Availability data" } } },
      put: { tags: ["Availability"], summary: "Update my availability (mentor)", responses: { 200: { description: "Availability updated" } } },
    },
    "/api/availability/booked-slots": {
      get: { tags: ["Availability"], summary: "Get booked slots", parameters: [{ name: "sessionId", in: "query", required: true, schema: { type: "string" } }, { name: "date", in: "query", schema: { type: "string" } }], responses: { 200: { description: "Booked slots" } } },
    },
    "/api/availability/{mentorId}": {
      get: { tags: ["Availability"], summary: "Get mentor availability", security: [], parameters: [{ name: "mentorId", in: "path", required: true, schema: { type: "string" } }, { name: "date", in: "query", schema: { type: "string" } }], responses: { 200: { description: "Mentor availability" } } },
    },

    // ─── SESSION MATERIALS ─────────────────────────────────────────────────
    "/api/sessions/{sessionId}/materials": {
      get: { tags: ["Session Materials"], summary: "List session materials", security: [], parameters: [{ name: "sessionId", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Materials list" } } },
      post: { tags: ["Session Materials"], summary: "Upload material", parameters: [{ name: "sessionId", in: "path", required: true, schema: { type: "string" } }], responses: { 201: { description: "Material uploaded" } } },
    },
    "/api/sessions/{sessionId}/materials/{materialId}": {
      delete: { tags: ["Session Materials"], summary: "Delete material", parameters: [{ name: "sessionId", in: "path", required: true, schema: { type: "string" } }, { name: "materialId", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Material deleted" } } },
    },

    // ─── SIDEBAR ───────────────────────────────────────────────────────────
    "/api/sidebar/counts": {
      get: { tags: ["Sidebar"], summary: "Get sidebar notification counts", responses: { 200: { description: "Counts data" } } },
    },

    // ─── WALLET ────────────────────────────────────────────────────────────
    "/api/wallet": {
      get: { tags: ["Wallet"], summary: "Get wallet balance", responses: { 200: { description: "Wallet data" } } },
    },
    "/api/wallet/add-funds": {
      post: { tags: ["Wallet"], summary: "Add funds to wallet", requestBody: { content: { "application/json": { schema: { type: "object", properties: { amount: { type: "number" } }, required: ["amount"] } } } }, responses: { 200: { description: "Funds added" } } },
    },
    "/api/wallet/verify-funds": {
      post: { tags: ["Wallet"], summary: "Verify fund addition", responses: { 200: { description: "Funds verified" } } },
    },
    "/api/wallet/transactions": {
      get: { tags: ["Wallet"], summary: "Get wallet transactions", responses: { 200: { description: "Transactions" } } },
    },
    "/api/wallet/pay": {
      post: { tags: ["Wallet"], summary: "Pay with wallet balance", requestBody: { content: { "application/json": { schema: { type: "object", properties: { requestId: { type: "string" }, amount: { type: "number" } }, required: ["requestId", "amount"] } } } }, responses: { 200: { description: "Payment successful" } } },
    },

    // ─── EARNINGS ──────────────────────────────────────────────────────────
    "/api/earnings": {
      get: { tags: ["Earnings"], summary: "Get mentor earnings", responses: { 200: { description: "Earnings data" } } },
    },
    "/api/earnings/transactions": {
      get: { tags: ["Earnings"], summary: "Get earning transactions", responses: { 200: { description: "Transaction list" } } },
    },
    "/api/earnings/withdraw": {
      post: { tags: ["Earnings"], summary: "Request withdrawal", requestBody: { content: { "application/json": { schema: { type: "object", properties: { amount: { type: "number" } }, required: ["amount"] } } } }, responses: { 200: { description: "Withdrawal requested" } } },
    },

    // ─── BADGES ────────────────────────────────────────────────────────────
    "/api/badges": {
      get: { tags: ["Badges"], summary: "List all badges", responses: { 200: { description: "Badge list" } } },
    },
    "/api/badges/mine": {
      get: { tags: ["Badges"], summary: "Get my earned badges", responses: { 200: { description: "My badges" } } },
    },
    "/api/badges/{id}": {
      get: { tags: ["Badges"], summary: "Get badge by ID", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Badge data" } } },
    },

    // ─── LEADERBOARD ───────────────────────────────────────────────────────
    "/api/leaderboard/mentors": {
      get: { tags: ["Leaderboard"], summary: "Get mentor leaderboard", responses: { 200: { description: "Leaderboard" } } },
    },
    "/api/leaderboard/learners": {
      get: { tags: ["Leaderboard"], summary: "Get learner leaderboard", responses: { 200: { description: "Leaderboard" } } },
    },

    // ─── WISHLIST ──────────────────────────────────────────────────────────
    "/api/wishlist": {
      get: { tags: ["Wishlist"], summary: "Get my wishlist", responses: { 200: { description: "Wishlist" } } },
    },
    "/api/wishlist/toggle": {
      post: { tags: ["Wishlist"], summary: "Toggle session in wishlist", responses: { 200: { description: "Wishlist toggled" } } },
    },
    "/api/wishlist/check/{sessionId}": {
      get: { tags: ["Wishlist"], summary: "Check if session is wishlisted", parameters: [{ name: "sessionId", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Wishlist status" } } },
    },

    // ─── FOLLOWS ───────────────────────────────────────────────────────────
    "/api/follow/toggle": {
      post: { tags: ["Follows"], summary: "Toggle follow user", responses: { 200: { description: "Follow toggled" } } },
    },
    "/api/follow/followers/{userId}": {
      get: { tags: ["Follows"], summary: "Get user followers", security: [], parameters: [{ name: "userId", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Followers list" } } },
    },
    "/api/follow/following/{userId}": {
      get: { tags: ["Follows"], summary: "Get user following", security: [], parameters: [{ name: "userId", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Following list" } } },
    },
    "/api/follow/count/{userId}": {
      get: { tags: ["Follows"], summary: "Get follow counts", security: [], parameters: [{ name: "userId", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Count data" } } },
    },
    "/api/follow/status/{userId}": {
      get: { tags: ["Follows"], summary: "Get follow status", parameters: [{ name: "userId", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Follow status" } } },
    },
    "/api/follow/suggestions": {
      get: { tags: ["Follows"], summary: "Get follow suggestions", responses: { 200: { description: "Suggestions" } } },
    },

    // ─── FEED ──────────────────────────────────────────────────────────────
    "/api/feed": {
      get: { tags: ["Feed"], summary: "Get activity feed", responses: { 200: { description: "Feed data" } } },
    },

    // ─── NOTIFICATIONS ─────────────────────────────────────────────────────
    "/api/notifications": {
      get: { tags: ["Notifications"], summary: "Get notifications", responses: { 200: { description: "Notification list", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Notification" } } } } } } },
    },
    "/api/notifications/unread-count": {
      get: { tags: ["Notifications"], summary: "Get unread notification count", responses: { 200: { description: "Unread count" } } },
    },
    "/api/notifications/{id}/read": {
      patch: { tags: ["Notifications"], summary: "Mark notification as read", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Marked as read" } } },
    },
    "/api/notifications/read-all": {
      patch: { tags: ["Notifications"], summary: "Mark all notifications as read", responses: { 200: { description: "All marked as read" } } },
    },

    // ─── ANALYTICS ─────────────────────────────────────────────────────────
    "/api/analytics/mentor": {
      get: { tags: ["Analytics"], summary: "Get mentor analytics", responses: { 200: { description: "Analytics data" } } },
    },

    // ─── ADMIN ─────────────────────────────────────────────────────────────
    "/api/admin/analytics": {
      get: { tags: ["Admin"], summary: "Get platform analytics (admin)", responses: { 200: { description: "Analytics" } } },
    },
    "/api/admin/payments": {
      get: { tags: ["Admin"], summary: "Get all payments (admin)", parameters: [{ name: "status", in: "query", schema: { type: "string" } }, { name: "page", in: "query", schema: { type: "integer" } }, { name: "limit", in: "query", schema: { type: "integer" } }], responses: { 200: { description: "Payment list" } } },
    },
    "/api/admin/broadcast": {
      post: { tags: ["Admin"], summary: "Send a broadcast notification (admin)", requestBody: { content: { "application/json": { schema: { type: "object", properties: { message: { type: "string" }, targetType: { type: "string", enum: ["all", "role", "single"] }, targetRole: { type: "string" }, targetUserId: { type: "string" }, link: { type: "string" } }, required: ["message"] } } } }, responses: { 200: { description: "Broadcast sent" } } },
    },
    "/api/admin/broadcasts": {
      get: { tags: ["Admin"], summary: "List sent broadcasts (admin)", responses: { 200: { description: "Broadcast list" } } },
    },
    "/api/admin/broadcast/{id}": {
      put: { tags: ["Admin"], summary: "Update a broadcast (admin)", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Broadcast updated" } } },
      delete: { tags: ["Admin"], summary: "Delete a broadcast (admin)", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Broadcast deleted" } } },
    },

    // ─── DISPUTES ──────────────────────────────────────────────────────────
    "/api/disputes": {
      post: { tags: ["Disputes"], summary: "Create a dispute", requestBody: { content: { "application/json": { schema: { type: "object", properties: { requestId: { type: "string" }, reason: { type: "string" } }, required: ["requestId", "reason"] } } } }, responses: { 201: { description: "Dispute created" } } },
    },
    "/api/disputes/all": {
      get: { tags: ["Disputes"], summary: "List all disputes (admin)", responses: { 200: { description: "Dispute list" } } },
    },
    "/api/disputes/{id}": {
      get: { tags: ["Disputes"], summary: "Get dispute details", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Dispute data" } } },
      put: { tags: ["Disputes"], summary: "Resolve a dispute (admin)", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Dispute resolved" } } },
    },
  },
};

module.exports = { swaggerServe: swaggerUi.serve, swaggerSetup: swaggerUi.setup(spec) };
