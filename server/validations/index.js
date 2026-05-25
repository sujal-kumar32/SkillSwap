const Joi = require("joi");
const mongoose = require("mongoose");

const objectId = (message = "Invalid ID") =>
  Joi.string().custom((value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      return helpers.message(message);
    }
    return value;
  }, "ObjectId validation");

const auth = {
  register: Joi.object({
    name: Joi.string().trim().min(2).max(50).required().messages({
      "string.empty": "Name is required",
      "string.min": "Name must be at least 2 characters",
      "string.max": "Name cannot exceed 50 characters",
    }),
    email: Joi.string().trim().email().required().messages({
      "string.email": "Please provide a valid email",
      "string.empty": "Email is required",
    }),
    password: Joi.string().min(6).max(128).required().messages({
      "string.min": "Password must be at least 6 characters",
      "string.max": "Password cannot exceed 128 characters",
      "string.empty": "Password is required",
    }),
  }),

  login: Joi.object({
    email: Joi.string().trim().email().required().messages({
      "string.email": "Please provide a valid email",
      "string.empty": "Email is required",
    }),
    password: Joi.string().required().messages({
      "string.empty": "Password is required",
    }),
  }),

  changePassword: Joi.object({
    oldPassword: Joi.string().required().messages({
      "string.empty": "Current password is required",
    }),
    newPassword: Joi.string().min(6).max(128).required().messages({
      "string.min": "New password must be at least 6 characters",
      "string.max": "New password cannot exceed 128 characters",
      "string.empty": "New password is required",
    }),
  }),

  forgotPassword: Joi.object({
    email: Joi.string().trim().email().required().messages({
      "string.email": "Please provide a valid email",
      "string.empty": "Email is required",
    }),
  }),

  resetPassword: Joi.object({
    token: Joi.string().required().messages({
      "string.empty": "Reset token is required",
    }),
    password: Joi.string().min(6).max(128).required().messages({
      "string.min": "Password must be at least 6 characters",
      "string.max": "Password cannot exceed 128 characters",
      "string.empty": "Password is required",
    }),
  }),
};

const profile = {
  update: Joi.object({
    name: Joi.string().trim().min(2).max(100),
    email: Joi.string().trim().email(),
    bio: Joi.string().trim().max(5000).allow(""),
    interests: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()),
    goals: Joi.string().trim().max(2000).allow(""),
    learningGoals: Joi.string().trim().max(2000).allow(""),
    phone: Joi.string().allow(""),
    timezone: Joi.string().allow(""),
    skills: Joi.any(),
    coverImage: Joi.string().allow(""),
    linkedin: Joi.string().allow(""),
    github: Joi.string().allow(""),
    portfolio: Joi.string().allow(""),
    youtube: Joi.string().allow(""),
    twitter: Joi.string().allow(""),
    image: Joi.string().allow(""),
    profileImage: Joi.string().allow(""),
    profilePublicId: Joi.string().allow(""),
    oldPassword: Joi.string().allow(""),
    newPassword: Joi.string().allow("").min(6).max(128),
  }).min(1),
};

const skill = {
  create: Joi.object({
    name: Joi.string().trim().min(2).max(100).required().messages({
      "string.empty": "Skill name is required",
      "string.min": "Skill name must be at least 2 characters",
    }),
    description: Joi.string().trim().max(1000).allow(""),
    categoryId: Joi.string().required().messages({
      "string.empty": "Category is required",
    }),
  }),
  update: Joi.object({
    name: Joi.string().trim().min(2).max(100),
    description: Joi.string().trim().max(1000).allow(""),
    status: Joi.string().valid("pending", "approved", "rejected"),
    categoryId: Joi.string(),
  }).min(1),
};

const session = {
  create: Joi.object({
    title: Joi.string().trim().min(3).max(200).required().messages({
      "string.empty": "Session title is required",
      "string.min": "Title must be at least 3 characters",
    }),
    skillId: Joi.string().required().messages({
      "string.empty": "Skill is required",
    }),
    description: Joi.string().trim().max(2000).allow(""),
    price: Joi.number().min(0),
    date: Joi.date().allow(""),
    time: Joi.string().allow(""),
    duration: Joi.number().min(5),
    maxLearners: Joi.number().min(0),
    sessionType: Joi.string().valid("online", "offline"),
    meetLink: Joi.string().uri().allow(""),
    thumbnail: Joi.string().allow(""),
  }),
  update: Joi.object({
    title: Joi.string().trim().min(3).max(200),
    description: Joi.string().trim().max(2000).allow(""),
    price: Joi.number().min(0),
    status: Joi.string().valid("active", "completed", "cancelled"),
    date: Joi.date().allow(""),
    time: Joi.string().allow(""),
    duration: Joi.number().min(5),
    maxLearners: Joi.number().min(0),
    sessionType: Joi.string().valid("online", "offline"),
    meetLink: Joi.string().uri().allow(""),
  }).min(1),
};

const request = {
  create: Joi.object({
    sessionId: Joi.string().required().messages({
      "string.empty": "Session ID is required",
    }),
    note: Joi.string().trim().max(500).allow(""),
  }),
  updateStatus: Joi.object({
    status: Joi.string()
      .valid("pending", "accepted", "rejected", "completed", "cancelled")
      .required()
      .messages({
        "any.only": "Status must be one of: pending, accepted, rejected, completed, cancelled",
        "string.empty": "Status is required",
      }),
  }),
};

const payment = {
  create: Joi.object({
    requestId: Joi.string().required().messages({
      "string.empty": "Request ID is required",
    }),
    amount: Joi.number().min(0).required().messages({
      "number.base": "Amount must be a number",
      "number.min": "Amount cannot be negative",
    }),
    paymentMethod: Joi.string().valid("razorpay", "stripe", "upi", "card").messages({
      "any.only": "Payment method must be one of: razorpay, stripe, upi, card",
    }),
    transactionId: Joi.string().allow(""),
  }),
  createOrder: Joi.object({
    requestId: Joi.string().required().messages({
      "string.empty": "Request ID is required",
    }),
  }),
  verifyPayment: Joi.object({
    requestId: Joi.string().required(),
    orderId: Joi.string().required(),
    razorpayPaymentId: Joi.string().required(),
    razorpaySignature: Joi.string().required(),
  }),
};

const review = {
  create: Joi.object({
    session: Joi.string().trim().max(200).allow(""),
    mentor: Joi.string().trim().max(200).allow(""),
    sessionId: Joi.string().allow(""),
    mentorId: Joi.string().allow(""),
    rating: Joi.number().min(1).max(5).required().messages({
      "number.base": "Rating must be a number",
      "number.min": "Rating must be at least 1",
      "number.max": "Rating cannot exceed 5",
    }),
    comment: Joi.string().trim().max(1000).allow(""),
  }),
  update: Joi.object({
    rating: Joi.number().min(1).max(5),
    comment: Joi.string().trim().max(1000).allow(""),
  }).min(1),
};

const category = {
  create: Joi.object({
    name: Joi.string().trim().min(3).max(50).required().messages({
      "string.empty": "Category name is required",
      "string.min": "Category name must be at least 3 characters",
    }),
    icon: Joi.string().allow(""),
    description: Joi.string().trim().max(500).allow(""),
    displayOrder: Joi.number().min(0),
  }),
  update: Joi.object({
    name: Joi.string().trim().min(3).max(50),
    icon: Joi.string().allow(""),
    description: Joi.string().trim().max(500).allow(""),
    displayOrder: Joi.number().min(0),
  }).min(1),
};

module.exports = { auth, profile, skill, session, request, payment, review, category, objectId };
