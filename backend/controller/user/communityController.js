import CommunityPost from "../../models/CommunityPost.js";

export const getApprovedPostsController = async (req, res) => {
    try {
        const approvedPosts = await CommunityPost.find({ status: 'approved' })
            .populate('userId', 'name profilePic') 
            .populate('comments.userId', 'name profilePic')
            .populate('feedImage.userId', 'name profilePic')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: approvedPosts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const submitNewPostController = async (req, res) => {
    if (!req.userId) {
        return res.status(401).json({ message: "Unauthorized! Please login to post.", success: false });
    }

    const { content, feedImage } = req.body;

    if (!content) {
        return res.status(400).json({ message: "Post content is required.", success: false });
    }

    try {
        const newPost = new CommunityPost({
            userId: req.userId,
            content: content,
            feedImage: feedImage || '',
        });

        const savedPost = await newPost.save();
        res.status(201).json({ success: true, message: "Your post has been submitted for admin approval.", data: savedPost });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deletePostController = async (req, res) => {
    if (!req.userId) {
        return res.status(401).json({ message: "Unauthorized! Please login to delete your post.", success: false });
    }

    const { postId } = req.params;

    try {
        const post = await CommunityPost.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found.", success: false });
        }

        if (post.userId.toString() !== req.userId) {
            return res.status(403).json({ message: "You are not authorized to delete this post.", success: false });
        }

        await CommunityPost.findByIdAndDelete(postId);
        res.status(200).json({ message: "Post deleted successfully.", success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const addCommentController = async (req, res) => {
    if (!req.userId) {
        return res.status(401).json({ message: "Unauthorized! Please login to comment.", success: false });
    }

    const { postId } = req.params;
    const { content, feedImage } = req.body;

    if (!content) {
        return res.status(400).json({ message: "Comment content is required.", success: false });
    }

    try {
        const post = await CommunityPost.findByIdAndUpdate(
            postId,
            { $push: { comments: { userId: req.userId, content, feedImage } } },
            { new: true }
        ).populate('comments.userId', 'name profilePic');
        if (!post) {
            return res.status(404).json({ message: "Post not found.", success: false });
        }
        res.status(201).json({ message: "Comment added successfully.", success: true, data: post.comments.slice(-1)[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
