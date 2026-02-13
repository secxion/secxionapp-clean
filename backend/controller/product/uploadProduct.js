import uploadProductPermission from "../../helpers/permission.js";
import productModel from "../../models/productModel.js";

async function UploadProductController(req, res, next) {
  try {
    const sessionUserId = req.userId;
    if (!uploadProductPermission(sessionUserId)) {
      const err = new Error("You do not have permission to upload products.");
      err.status = 403;
      throw err;
    }
    const uploadProduct = new productModel(req.body);
    const saveProduct = await uploadProduct.save();
    res.status(201).json({
      message: "Product uploaded successfully.",
      error: false,
      success: true,
      data: saveProduct,
    });
  } catch (err) {
    err.message = err.message || "Could not upload product. Please try again.";
    next(err);
  }
}

export default UploadProductController;
