import productModel from "../../models/productModel.js";

const getCategoryWiseProduct = async (req, res, next) => {
  try {
    const { category } = req?.body || req?.query;
    const product = await productModel.find({ category });
    res.json({
      data: product,
      message: "Product",
      success: true,
      error: false,
    });
  } catch (err) {
    err.message =
      "Could not fetch products for this category. Please try again.";
    next(err);
  }
};

export default getCategoryWiseProduct;
