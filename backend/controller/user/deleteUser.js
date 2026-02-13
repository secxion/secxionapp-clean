import userModel from "../../models/userModel.js";

async function deleteUser(req, res) {
  try {
    const { userIds } = req.body;

    if (!userIds || userIds.length === 0) {
      return res.status(400).json({
        message: "User IDs are required",
        error: true,
        success: false,
      });
    }

    const result = await userModel.deleteMany({ _id: { $in: userIds } });

    if (result.deletedCount > 0) {
      res.json({
        message: "Users deleted successfully",
        success: true,
        error: false,
      });
    } else {
      res.status(404).json({
        message: "No users found to delete",
        error: true,
        success: false,
      });
    }
  } catch (err) {
    res.status(500).json({
      message: err.message || "Internal server error",
      error: true,
      success: false,
    });
  }
}

export default deleteUser;
