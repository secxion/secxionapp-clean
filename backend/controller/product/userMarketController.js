import userProduct from "../../models/userProduct.js";
import userModel from "../../models/userModel.js";
import { updateWalletBalance } from "../wallet/walletController.js";
import { createMarketUploadNotification } from "../notifications/notificationsController.js";

const fetchUserDetails = async (userId) => {
    try {
        const user = await userModel
            .findById(userId)
            .select("name email profilePic role");
        return user;
    } catch (err) {
        console.error("Error fetching user details:", err);
        return null;
    }
};

export const getAllUserMarkets = async (req, res) => {
    try {
        const userMarkets = await userProduct.find().sort({ createdAt: -1 });

        const marketsWithUserDetails = await Promise.all(
            userMarkets.map(async (market) => {
                const userDetails = await fetchUserDetails(market.userId);
                return {
                    ...market.toObject(),
                    userDetails,
                };
            })
        );

        res.json({
            message: "Fetched all user markets successfully",
            success: true,
            error: false,
            data: marketsWithUserDetails,
        });
    } catch (err) {
        console.error("Error fetching user markets:", err);
        res.status(400).json({
            message: err.message || err,
            error: true,
            success: false,
        });
    }
};

export const updateMarketStatus = async (req, res) => {
    try {
        const { status, cancelReason, crImage } = req.body;
        const { id } = req.params;

        if (!status) {
            return res.status(400).json({
                message: "Status is required",
                error: true,
                success: false,
            });
        }

        const existingMarket = await userProduct.findById(id);
        if (!existingMarket) {
            return res.status(404).json({
                message: "Market not found",
                error: true,
                success: false,
            });
        }

        const previousStatus = existingMarket.status;

        const updateData = { status };

        if (status === "CANCEL") {
            if (!cancelReason) {
                return res.status(400).json({
                    message: "Cancel reason is required when status is CANCEL",
                    error: true,
                    success: false,
                });
            }
            updateData.cancelReason = cancelReason;
            if (crImage) {
                updateData.crImage = crImage;
            }
        } else if (status === "DONE") {
            updateData.cancelReason = null;
            updateData.crImage = null;

            const userId = existingMarket.userId;
            const amountToCredit = parseFloat(existingMarket.calculatedTotalAmount) || 0;

            const walletUpdateResult = await updateWalletBalance(
                userId,
                amountToCredit,
                "credit",
                "Product Approved and Completed",
                existingMarket._id,
                "userproduct"
            );

            if (!walletUpdateResult.success) {
                console.error("Error updating wallet after marking market as DONE:", walletUpdateResult.error);
            }
        } else if (status === "PROCESSING") {
            updateData.cancelReason = null;
            updateData.crImage = null;
        }

        const updatedMarket = await userProduct.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedMarket) {
            return res.status(404).json({
                message: "Market not found",
                error: true,
                success: false,
            });
        }

        if (status !== previousStatus) {
            await createMarketUploadNotification(
                updatedMarket.userId,
                updatedMarket._id,
                status,
                updatedMarket.productName,
                cancelReason
            );
        }

        res.json({
            message: "Market status updated successfully",
            success: true,
            error: false,
            data: updatedMarket,
        });
    } catch (err) {
        console.error("Error updating market status:", err);
        res.status(400).json({
            message: err.message || err,
            error: true,
            success: false,
        });
    }
};
