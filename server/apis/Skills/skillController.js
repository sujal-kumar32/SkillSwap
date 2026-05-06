const Skill = require("./skillModel");
const Category = require("../Categories/categoryModel");

// CREATE SKILL
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const isAdmin = (req) => req.user?.roles?.includes("admin");

exports.createSkill = async (req, res) => {
  try {
    const { name, categoryId, description } = req.body;

    if (!name || !categoryId) {
      return res.status(400).json({
        success: false,
        message: "Name and categoryId are required",
      });
    }

    const trimmedName = name.trim();
    const existingSkill = await Skill.findOne({
      name: { $regex: `^${escapeRegex(trimmedName)}$`, $options: "i" },
    });

    if (existingSkill) {
      return res.status(409).json({
        success: false,
        message: "A skill with this name already exists",
      });
    }

    // check category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const skill = await Skill.create({
      name: trimmedName,
      categoryId,
      description: description?.trim() || "",
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Skill created",
      data: skill,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// GET ALL SKILLS
exports.getSkills = async (req, res) => {
  try {
    const { category, includeDeleted } = req.query;
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

    const skills = await Skill.find(filter)
      .populate("categoryId", "name")
      .populate("createdBy", "name")
      .lean();

    res.json({
      success: true,
      total: skills.length,
      data: skills,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// GET SINGLE SKILL
exports.getSkill = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// UPDATE SKILL
exports.updateSkill = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: "Skill not found",
      });
    }

    const { name, description, status } = req.body;

    if (name) skill.name = name.trim();
    if (description !== undefined) skill.description = description.trim();
    if (status) {
      const validStatuses = ["pending", "approved", "rejected"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status value",
        });
      }
      skill.status = status;
    }

    await skill.save();

    res.json({
      success: true,
      message: "Skill updated",
      data: skill,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// DELETE SKILL (soft delete)
exports.deleteSkill = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) {
      return res.status(404).json({
        success: false,
        message: "Skill not found",
      });
    }

    skill.isDeleted = true;
    skill.deletedAt = new Date();
    await skill.save();

    res.json({
      success: true,
      message: "Skill deleted",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
