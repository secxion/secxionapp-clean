import CommunityPost from '../../models/CommunityPost.js';

export const getPendingPostsController = async (req, res) => {
    try {
        const pendingPosts = await CommunityPost.find({ status: 'pending' })
            .populate('userId', 'name profilePicture')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: pendingPosts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const approvePostController = async (req, res) => {
    const { postId } = req.params;
    try {
        const updatedPost = await CommunityPost.findByIdAndUpdate(
            postId,
            { status: 'approved', rejectionReason: '' },
            { new: true }
        );
        if (!updatedPost) {
            return res.status(404).json({ message: "Post not found.", success: false });
        }
        res.status(200).json({ message: "Post approved successfully.", success: true, data: updatedPost });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const rejectPostController = async (req, res) => {
    const { postId } = req.params;
    const { reason } = req.body;

    if (!reason) {
        return res.status(400).json({ message: "Rejection reason is required.", success: false });
    }

    try {
        const updatedPost = await CommunityPost.findByIdAndUpdate(
            postId,
            { status: 'rejected', rejectionReason: reason },
            { new: true }
        );
        if (!updatedPost) {
            return res.status(404).json({ message: "Post not found.", success: false });
        }
        res.status(200).json({ message: "Post rejected successfully.", success: true, data: updatedPost });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
