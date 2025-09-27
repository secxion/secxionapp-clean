import productModel from "../../models/productModel.js";
import uploadProductPermission from "../../helpers/permission.js";


async function updateProductController(req, res, next) {
  try {
    if (!uploadProductPermission(req.userId)) {
      const err = new Error("You do not have permission to update products.");
      err.status = 403;
      throw err;
    }
    const { _id, ...resBody } = req.body;
    if (!_id) {
      const err = new Error("Product ID (_id) is required.");
      err.status = 400;
      throw err;
    }
    const updatedProduct = await productModel.findByIdAndUpdate(
      _id,
      resBody,
      { new: true, runValidators: true }
    );
    if (!updatedProduct) {
      const err = new Error("Product not found.");
      err.status = 404;
      throw err;
    }
    res.json({
      message: "Product updated successfully.",
      data: updatedProduct,
      success: true,
      error: false,
    });
  } catch (err) {
    err.message = err.message || 'Could not update product. Please try again.';
    next(err);
  }
}

export default updateProductController;
