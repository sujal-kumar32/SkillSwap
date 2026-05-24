const Category = require("./categoryModel");
const asyncHandler = require("../../utilities/asyncHandler");

// TEMP image upload (replace with Cloudinary later)
const uploadImg = async (buffer) => {
  return "uploaded-image-placeholder";
};

exports.createCategory = asyncHandler(async (req, res) => {

    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    let imageUrl = "";
    if (req.file) {
      try {
        imageUrl = await uploadImg(req.file.buffer);
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
      image: imageUrl,
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });

});

exports.getAllCategories = asyncHandler(async (req, res) => {

    const { search, sort, status } = req.query;
    const limit = req.query.limit ? Math.min(100, Math.max(1, parseInt(req.query.limit))) : 100000;
    const page = req.query.page ? Math.max(1, parseInt(req.query.page)) : 1;
    const skip = (page - 1) * limit;

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
        category.image = await uploadImg(req.file.buffer);
      } catch (e) {
        return res.status(500).json({
          success: false,
          message: "Image upload failed",
        });
      }
    }

    await category.save();

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

    await Category.findByIdAndDelete(req.params.id);

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

    res.json({
      success: true,
      message: `Category ${
        category.status === "active" ? "activated" : "deactivated"
      } successfully`,
      data: category,
    });

});
