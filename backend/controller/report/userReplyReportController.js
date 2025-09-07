import Report from "../../models/report.js";

const userReplyReportController = async (req, res) => {
    try {
        const { id } = req.params;
        const { userReply, userReplyImage } = req.body;

        // Validate input
        if (!id) {
            return res.status(400).json({ success: false, message: "Report ID is required." });
        }
        if (!userReply && (!userReplyImage || userReplyImage.length === 0)) {
            return res.status(400).json({ success: false, message: "Reply text or image is required." });
        }

        // Fetch the report
        const report = await Report.findById(id);
        if (!report) {
            return res.status(404).json({ success: false, message: "Report not found." });
        }

        // Add the reply to the report's chat history
        const reply = {
            sender: "user",
            message: userReply || "",
            image: userReplyImage || [],
            createdAt: new Date(),
        };
        report.chatHistory.push(reply);

        // Save the updated report
        await report.save();

        res.status(200).json({ success: true, message: "Reply submitted successfully." });
    } catch (error) {
        console.error("Error in userReplyReportController:", error);
        res.status(500).json({ success: false, message: "Failed to submit reply." });
    }
};

export default userReplyReportController;