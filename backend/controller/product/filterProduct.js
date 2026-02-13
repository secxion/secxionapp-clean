import productModel from "../../models/productModel.js";

const filterProductController = async (req, res, next) => {
  try {
    const categoryList = req.body.category;
    const products = await productModel
      .find({ category: { $in: categoryList } })
      .lean();
    return res.status(200).json({
      data: products,
      message: "Products retrieved successfully.",
      error: false,
      success: true,
    });
  } catch (err) {
    err.message = "Could not filter products. Please try again.";
    next(err);
  }
};

export default filterProductController;
