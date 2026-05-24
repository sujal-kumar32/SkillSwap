const Skill = require("./skillModel");
const Category = require("../Categories/categoryModel");
const { uploadBuffer, destroyImage } = require("../../utilities/cloudinaryUpload");
const asyncHandler = require("../../utilities/asyncHandler");

// CREATE SKILL
const isAdmin = (req) => req.user?.roles?.includes("admin");

const normalizeName = (name) =>
  name.toLowerCase().replace(/[^a-zA-Z0-9]/g, "");

exports.createSkill = asyncHandler(async (req, res) => {

    const { name, categoryId, description, level, tags } = req.body;

    if (!name || !categoryId) {
      return res.status(400).json({
        success: false,
        message: "Name and categoryId are required",
      });
    }

    const trimmedName = name.trim();
    const normalized = normalizeName(trimmedName);

    const allSkills = await Skill.find({ categoryId }).lean();
    const duplicate = allSkills.find(
      (s) => normalizeName(s.name) === normalized,
    );

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: `"${name}" already exists in this category as "${duplicate.name}"`,
      });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    let thumbnail = { url: "", publicId: "" };
    if (req.file) {
      const result = await uploadBuffer(req.file.buffer, {
        public_id: `skill_${Date.now()}`,
      });
      thumbnail = { url: result.secure_url, publicId: result.public_id };
    }

    const parsedTags = typeof tags === "string" ? tags.split(",").map((t) => t.trim()).filter(Boolean) : Array.isArray(tags) ? tags : [];

    const skill = await Skill.create({
      name: trimmedName,
      categoryId,
      description: description?.trim() || "",
      level: ["beginner", "intermediate", "advanced", "all"].includes(level) ? level : "all",
      tags: parsedTags,
      thumbnail: thumbnail.url,
      thumbnailPublicId: thumbnail.publicId,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Skill created",
      data: skill,
    });

});

// GET ALL SKILLS
exports.getSkills = asyncHandler(async (req, res) => {

    const { search, sort, category, includeDeleted, level, tag } = req.query;
    const limit = req.query.limit ? Math.min(100, Math.max(1, parseInt(req.query.limit))) : 100000;
    const page = req.query.page ? Math.max(1, parseInt(req.query.page)) : 1;
    const skip = (page - 1) * limit;
    const adminUser = isAdmin(req);

    let filter = {};
    if (adminUser && includeDeleted === "true") {
      filter.isDeleted = true;
    } else {
      filter.$or = [{ isDeleted: false }, { isDeleted: { $exists: false } }];
    }

    if (!adminUser) {
      filter.status = "approved";
    }

    if (category) {
      filter.categoryId = category;
    }

    if (level && ["beginner", "intermediate", "advanced", "all"].includes(level)) {
      filter.level = level;
    }

    if (tag) {
      filter.tags = { $in: [tag.toLowerCase()] };
    }

    if (search) {
      const searchOr = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
      if (filter.$or) {
        filter.$and = [
          { $or: filter.$or },
          { $or: searchOr },
        ];
        delete filter.$or;
      } else {
        filter.$or = searchOr;
      }
    }

    let sortObj = {};
    if (sort === "latest" || sort === "newest") sortObj = { createdAt: -1 };
    else if (sort === "oldest") sortObj = { createdAt: 1 };
    else if (sort === "name") sortObj = { name: 1 };
    else sortObj = { createdAt: -1 };

    const [skills, total] = await Promise.all([
      Skill.find(filter).sort(sortObj).skip(skip).limit(limit)
        .populate("categoryId", "name")
        .populate("createdBy", "name")
        .lean(),
      Skill.countDocuments(filter),
    ]);

    res.json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: skills,
    });


});

// GET SINGLE SKILL
exports.getSkill = asyncHandler(async (req, res) => {
    const skill = await Skill.findById(req.params.id)
      .populate("categoryId", "name")
      .lean();

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: "Skill not found",
      });
    }

    const adminUser = isAdmin(req);
    const ownerUser = skill.createdBy?.toString() === req.user?.id;
    if (!adminUser && !ownerUser && (skill.isDeleted || skill.status !== "approved")) {
      return res.status(404).json({
        success: false,
        message: "Skill not found",
      });
    }

    res.json({
      success: true,
      data: skill,
    });

});

// UPDATE SKILL
exports.updateSkill = asyncHandler(async (req, res) => {

    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: "Skill not found",
      });
    }

    const isOwner = skill.createdBy?.toString() === req.user.id;
    if (!isAdmin(req) && !isOwner) {
      return res.status(403).json({ success: false, message: "Not authorized to update this skill" });
    }

    const { name, description, status, level, tags } = req.body;

    if (name) skill.name = name.trim();
    if (description !== undefined) skill.description = description.trim();
    if (level && ["beginner", "intermediate", "advanced", "all"].includes(level)) skill.level = level;
    if (tags !== undefined) {
      const parsedTags = typeof tags === "string" ? tags.split(",").map((t) => t.trim()).filter(Boolean) : Array.isArray(tags) ? tags : [];
      skill.tags = parsedTags;
    }
    if (status && isAdmin(req)) {
      const validStatuses = ["pending", "approved", "rejected"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status value",
        });
      }
      skill.status = status;
    }

    if (req.file) {
      if (skill.thumbnailPublicId) {
        await destroyImage(skill.thumbnailPublicId).catch(() => {});
      }
      const result = await uploadBuffer(req.file.buffer, {
        public_id: `skill_${Date.now()}`,
      });
      skill.thumbnail = result.secure_url;
      skill.thumbnailPublicId = result.public_id;
    }

    await skill.save();

    res.json({
      success: true,
      message: "Skill updated",
      data: skill,
    });

});

// DELETE SKILL (soft delete)
exports.deleteSkill = asyncHandler(async (req, res) => {

    const skill = await Skill.findById(req.params.id);
    if (!skill) {
      return res.status(404).json({
        success: false,
        message: "Skill not found",
      });
    }

    const isOwner = skill.createdBy?.toString() === req.user.id;
    if (!isAdmin(req) && !isOwner) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this skill" });
    }

    if (skill.thumbnailPublicId) {
      await destroyImage(skill.thumbnailPublicId).catch(() => {});
    }

    skill.isDeleted = true;
    skill.deletedAt = new Date();
    await skill.save();

    res.json({
      success: true,
      message: "Skill deleted",
    });

});
