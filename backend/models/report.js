import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        email: { type: String, required: true },
        name: { type: String, required: true },
        category: { type: String, required: true },
        message: { type: String, required: true },
        image: { type: String, default: "" },
        adminReply: { type: String, default: "" },
        adminReplyImage: { type: String, default: "" },
        status: { type: String, enum: ["Pending", "Resolved", "Rejected"], default: "Pending" },
        chatHistory: [
            {
                sender: { type: String, enum: ["admin", "user"], required: true },
                message: { type: String, default: "" },
                image: { type: String, default: "" },
                createdAt: { type: Date, default: Date.now },
            },
        ],
        autoReply: { type: String, default: "wait for reply..." },
    },
    { timestamps: true }
);

export default mongoose.model("Report", reportSchema);
