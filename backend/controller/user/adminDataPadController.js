import DataPad from "../../models/dataPad.js";
import userModel from "../../models/userModel.js";

// Helper function to fetch user details
const fetchAdminUserDetails = async (userId) => {
  try {
    const user = await userModel.findById(userId).select("name email");
    return user;
  } catch (err) {
    console.error("Error fetching admin user details:", err);
    return null;
  }
};

// Controller to get all user DataPad entries (for admin)
export const getAllUserDataPadsForAdmin = async (req, res) => {
  try {
    const allDataPads = await DataPad.find().sort({ createdAt: -1 });

    const usersWithData = {};

    for (const entry of allDataPads) {
      const userId = entry.userId.toString();

      if (!usersWithData[userId]) {
        const userDetails = await fetchAdminUserDetails(entry.userId);
        if (userDetails) {
          usersWithData[userId] = {
            _id: userDetails._id,
            name: userDetails.name,
            email: userDetails.email,
            datapadEntries: [],
          };
        }
      }

      if (usersWithData[userId]) {
        usersWithData[userId].datapadEntries.push({
          _id: entry._id,
          title: entry.title,
          content: entry.content,
          media: entry.media,
          createdAt: entry.createdAt,
          updatedAt: entry.updatedAt,
        });
      }
    }

    const usersWithDataArray = Object.values(usersWithData);

    res.json({
      message: "Fetched all user DataPad entries for admin successfully",
      success: true,
      error: false,
      data: usersWithDataArray,
    });
  } catch (err) {
    console.error("Error fetching all user DataPad entries for admin:", err);
    res.status(500).json({
      message: err.message || "Failed to fetch user DataPad entries for admin",
      error: true,
      success: false,
    });
  }
};
