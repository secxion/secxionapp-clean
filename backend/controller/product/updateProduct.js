import productModel from "../../models/productModel.js";
import uploadProductPermission from "../../helpers/permission.js";

async function updateProductController(req, res) {
  try {
    if (!uploadProductPermission(req.userId)) {
      throw new Error("Permission denied");
    }

    const { _id, ...resBody } = req.body;

    if (!_id) {
      throw new Error("Product ID (_id) is required");
    }

    const updatedProduct = await productModel.findByIdAndUpdate(
      _id,
      resBody,
      { new: true, runValidators: true } 
    );

    if (!updatedProduct) {
      return res.status(404).json({
        message: "Product not found",
        data: null,
        success: false,
        error: true,
      });
    }

    res.json({
      message: "Update successfully",
      data: updatedProduct,
      success: true,
      error: false,
    });
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(400).json({
      message: err.message || err,
      error: true,
      success: false,
    });
  }
}

export default updateProductController;
