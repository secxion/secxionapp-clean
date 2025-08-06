import Report from "../../models/report.js";

const userReplyReportController = async (req, res) => {
    try {
        const { id } = req.params;
        const { userReply, userReplyImage } = req.body;
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized", success: false, error: true });
        }

        if (!userReply && !userReplyImage) {
            return res.status(400).json({ message: "Reply cannot be empty (text or image required).", success: false, error: true });
        }

        const report = await Report.findById(id);
        if (!report) {
            return res.status(404).json({ message: "Report not found.", success: false, error: true });
        }

        report.chatHistory.push({
            sender: 'user',
            message: userReply || '',
            image: userReplyImage || '',
        });

        await report.save();

        res.json({ message: "Reply sent successfully.", success: true, error: false });

    } catch (error) {
        console.error("Error handling user reply:", error);
        res.status(500).json({ message: "Failed to submit reply.", success: false, error: true, details: error.message });
    }
};

export default userReplyReportController;