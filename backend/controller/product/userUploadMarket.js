import userProduct from "../../models/userProduct.js";

async function UserUploadMarketController(req, res, next) {
  try {
    if (!req.userId) {
      const err = new Error("Unauthorized! Please login.");
      err.status = 401;
      throw err;
    }
    const newProduct = new userProduct({
      ...req.body,
      userId: req.userId,
    });
    const saveProduct = await newProduct.save();
    res.status(201).json({
      message: "Market uploaded successfully.",
      error: false,
      success: true,
      data: saveProduct,
    });
  } catch (err) {
    err.message = err.message || "Could not upload market. Please try again.";
    next(err);
  }
}

export default UserUploadMarketController;
