import Report from "../../models/report.js";
import { createReportReplyNotification } from "../notifications/notificationsController.js";

const sendChatMessageController = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, image } = req.body;

    if (!message && !image) {
      return res.status(400).json({
        message: "Message cannot be empty (text or image required).",
        success: false,
        error: true,
      });
    }

    const report = await Report.findById(id);
    if (!report) {
      return res
        .status(404)
        .json({ message: "Report not found.", success: false, error: true });
    }

    report.chatHistory.push({
      sender: "admin",
      message: message || "",
      image: image || "",
      createdAt: new Date(),
    });

    await report.save();

    let notificationError = null;
    try {
      await createReportReplyNotification(
        report.userId,
        report._id.toString(),
        message
          ? `New reply from moderator: ${message}`
          : "New image reply from moderator.",
        `/reports/${report._id}`,
      );
    } catch (error) {
      notificationError = error;
      console.error("Error creating report reply notification:", error);
    }

    if (notificationError) {
      console.warn(
        "Report message sent successfully, but notification creation failed.",
        notificationError,
      );
      return res.json({
        message:
          "Message sent successfully, but there was an issue creating the notification.",
        success: true,
        error: false,
        notificationError: {
          message:
            notificationError.message || "Failed to create notification.",
          details: notificationError,
        },
      });
    }

    return res.json({
      message: "Message sent successfully.",
      success: true,
      error: false,
    });
  } catch (error) {
    console.error("Error sending admin message:", error);
    return res.status(500).json({
      message: "Failed to send message.",
      success: false,
      error: true,
      details: error.message,
    });
  }
};

export default sendChatMessageController;
