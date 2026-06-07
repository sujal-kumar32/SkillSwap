const AdminAuditLog = require("../../models/AdminAuditLog");
const Category = require("./categoryModel");
const asyncHandler = require("../../utilities/asyncHandler");
const getPagination = require("../../utilities/paginate");
const { uploadBuffer, destroyImage } = require("../../utilities/cloudinaryUpload");

exports.createCategory = asyncHandler(async (req, res) => {

    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    let image = { url: "", publicId: "" };
    if (req.file) {
      try {
        const result = await uploadBuffer(req.file.buffer, {
          public_id: `category_${Date.now()}`,
        });
        image = { url: result.secure_url, publicId: result.public_id };
      } catch (e) {
        return res.status(500).json({
          success: false,
          message: "Image upload failed",
        });
      }
    }

    const category = await Category.create({
      name: name.trim(),
      description: description?.trim() || "",
      image: image.url,
      imagePublicId: image.publicId,
    });

    await AdminAuditLog.create({
      adminId: req.user.id,
      action: "create_category",
      targetModel: "Category",
      targetId: category._id,
      details: `Category created (${category.name})`,
      ip: req.ip || req.connection?.remoteAddress,
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });

});

exports.getAllCategories = asyncHandler(async (req, res) => {

    const { search, sort, status } = req.query;
    const { page, limit, skip } = getPagination(req.query);

    let filter = { status: status || "active" };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
      ];
    }

    let sortObj = {};
    if (sort === "name") sortObj = { name: 1 };
    else sortObj = { displayOrder: 1 };

    const [categories, total] = await Promise.all([
      Category.find(filter).sort(sortObj).skip(skip).limit(limit).lean(),
      Category.countDocuments(filter),
    ]);

    res.json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: categories,
    });

});

exports.getCategory = asyncHandler(async (req, res) => {

    const category = await Category.findById(req.params.id).lean();

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.json({
      success: true,
      data: category,
    });

});

exports.updateCategory = asyncHandler(async (req, res) => {

    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const { name, description } = req.body;

    if (name && name.trim() !== category.name) {
      const exists = await Category.findOne({
        name: name.trim(),
        _id: { $ne: req.params.id },
      });

      if (exists) {
        return res.status(400).json({
          success: false,
          message: "Category already exists",
        });
      }

      category.name = name.trim();
    }

    if (description !== undefined) {
      category.description = description.trim();
    }

    if (req.file) {
      try {
        if (category.imagePublicId) {
          await destroyImage(category.imagePublicId).catch(() => {});
        }
        const result = await uploadBuffer(req.file.buffer, {
          public_id: `category_${Date.now()}`,
        });
        category.image = result.secure_url;
        category.imagePublicId = result.public_id;
      } catch (e) {
        return res.status(500).json({
          success: false,
          message: "Image upload failed",
        });
      }
    }

    await category.save();

    await AdminAuditLog.create({
      adminId: req.user.id,
      action: "update_category",
      targetModel: "Category",
      targetId: category._id,
      details: `Category updated (${category.name})`,
      ip: req.ip || req.connection?.remoteAddress,
    });

    res.json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });

});

exports.deleteCategory = asyncHandler(async (req, res) => {

    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    if (category.imagePublicId) {
      await destroyImage(category.imagePublicId).catch(() => {});
    }

    const catName = category.name;
    await Category.findByIdAndDelete(req.params.id);

    await AdminAuditLog.create({
      adminId: req.user.id,
      action: "delete_category",
      targetModel: "Category",
      targetId: req.params.id,
      details: `Category deleted (${catName})`,
      ip: req.ip || req.connection?.remoteAddress,
    });

    res.json({
      success: true,
      message: "Category deleted successfully",
    });

});

exports.toggleStatus = asyncHandler(async (req, res) => {

    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    category.status = category.status === "active" ? "inactive" : "active";

    await category.save();

    await AdminAuditLog.create({
      adminId: req.user.id,
      action: "update_category",
      targetModel: "Category",
      targetId: category._id,
      details: `Category ${category.status === "active" ? "activated" : "deactivated"} (${category.name})`,
      ip: req.ip || req.connection?.remoteAddress,
    });

    res.json({
      success: true,
      message: `Category ${
        category.status === "active" ? "activated" : "deactivated"
      } successfully`,
      data: category,
    });

});
