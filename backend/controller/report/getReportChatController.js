import Report from "../../models/report.js";

const getReportChatController = async (req, res) => {
    try {
        const { id } = req.params;

        const report = await Report.findById(id).select('chatHistory name');

        if (!report) {
            return res.status(404).json({ message: "Report not found.", success: false, error: true });
        }

        res.json({ message: "Chat history fetched.", success: true, error: false, data: report.chatHistory, userName: report.name });

    } catch (error) {
        console.error("Error fetching chat history:", error);
        res.status(500).json({ message: "Failed to fetch chat history.", success: false, error: true, details: error.message });
    }
};

export default getReportChatController;