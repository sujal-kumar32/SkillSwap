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
    imagePublicId: String,

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

categorySchema.pre("findOneAndDelete", async function () {
  const categoryId = this.getFilter()._id;
  await Promise.all([
    mongoose.model("Skill").updateMany(
      { categoryId },
      { $unset: { categoryId: "" } },
    ),
    mongoose.model("Session").updateMany(
      { categoryId },
      { $unset: { categoryId: "" } },
    ),
  ]);
});

module.exports = mongoose.model("Category", categorySchema);
