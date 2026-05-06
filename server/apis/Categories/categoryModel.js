const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },

    icon: String,

    image: String,

    description: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

categorySchema.pre("save", function () {
  if (this.name && this.isModified("name")) {
    const baseSlug = this.name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    this.slug = `${baseSlug}-${Date.now()}`;
  }
});

module.exports = mongoose.model("Category", categorySchema);
