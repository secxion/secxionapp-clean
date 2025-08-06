import Notification from "../../models/notificationModel.js";
import report from "../../models/report.js";
import PaymentRequest from "../../models/paymentRequestModel.js";
import userProduct from "../../models/userProduct.js";

export const createTransactionNotification = async (userId, amount, type, message, link, relatedObjectId, additionalData = {}) => {
  try {
    const notificationType = type === 'payment_completed' ? 'transaction:payment_completed' : `transaction:${type}`;
    const newNotificationData = {
      userId,
      amount,
      type: notificationType,
      message,
      link,
      relatedObjectId,
      isRead: false,
      ...additionalData,
    };

    if (type === 'rejected' && relatedObjectId) {
      const paymentRequest = await PaymentRequest.findById(relatedObjectId);
      if (paymentRequest && paymentRequest.rejectionReason) {
        newNotificationData.rejectionReason = paymentRequest.rejectionReason;
      }
      newNotificationData.onModel = 'PaymentRequest';
      newNotificationData.type = 'transaction:rejected';
    }

    const newNotification = new Notification(newNotificationData);
    await newNotification.save();
  } catch (error) {
    console.error('Error creating transaction notification:', error);
  }
};

export const createReportReplyNotification = async (userId, reportId, message, link) => {
  try {
    const newNotification = new Notification({
      userId,
      type: 'report_reply',
      message,
      link,
      relatedObjectId: reportId,
      onModel: 'Report',
      isRead: false,
    });
    await newNotification.save();
  } catch (error) {
    console.error('Error creating report reply notification:', error);
  }
};

export const createMarketUploadNotification = async (userId, userProductId, status, productName, cancelReason = null) => {
  try {
    console.log('createMarketUploadNotification - userId:', userId);
    console.log('createMarketUploadNotification - userProductId:', userProductId);
    console.log('createMarketUploadNotification - status:', status);
    console.log('createMarketUploadNotification - productName:', productName);
    console.log('createMarketUploadNotification - cancelReason:', cancelReason);

    const product = await userProduct.findById(userProductId).select('_id');

    let message = `Market ID "${product?._id || 'N/A'}" is now "${status.toUpperCase()}"`;
    if (status === 'CANCEL' && cancelReason) {
      message += ` due to: ${cancelReason}`;
    }

    const newNotification = new Notification({
      userId,
      type: `market_upload:${status}`,
      message,
      relatedObjectId: userProductId,
      onModel: 'userproduct',
      isRead: false,
      cancelReason: cancelReason,
    });

    console.log('createMarketUploadNotification - newNotification object:', newNotification);
    await newNotification.save();
    console.log('createMarketUploadNotification - Notification saved successfully:', newNotification);
  } catch (error) {
    console.error('Error creating market upload notification:', error);
  }
};

export const getUserTransactionNotifications = async (req, res) => {
  try {
    const userId = req.userId;

    const transactionNotifications = await Notification.find({
      userId,
      type: {
        $in: [
          'transaction:debit',
          'transaction:credit',
          'transaction:payment_completed',
          'transaction:withdrawal',
          'transaction:rejected',
          'transaction:eth_processed',
        ],
      },
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: transactionNotifications });
  } catch (error) {
    console.error('Error fetching user transaction notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction notifications.',
      error: error.message,
    });
  }
};


export const getUserReportNotifications = async (req, res) => {
  try {
    const userId = req.userId;
    const reportNotifications = await Notification.find({
      userId,
      onModel: 'Report',
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: reportNotifications });
  } catch (error) {
    console.error('Error fetching user report notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch report notifications.',
      error: error.message,
    });
  }
};

export const getMarketNotifications = async (req, res) => {
  try {
    const userId = req.userId;
    console.log(`Fetching market notifications for user ID: ${userId}`);
    const marketNotifications = await Notification.find({
      userId,
      onModel: 'userproduct',
      type: {
        $in: ['market_upload:DONE', 'market_upload:CANCEL', 'market_upload:PROCESSING'],
      },
    }).sort({ createdAt: -1 });

    console.log(`Market notifications found: ${marketNotifications.length}`);
    console.log('Market Notifications:', marketNotifications);

    res.status(200).json({ success: true, data: marketNotifications });
  } catch (error) {
    console.error('Error fetching market notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch market notifications.',
      error: error.message,
    });
  }
};

export const fetchReportDetails = async (req, res) => {
  try {
    const { reportId } = req.params;
    const reportDetails = await report.findById(reportId);

    if (!reportDetails) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    res.status(200).json({ success: true, data: reportDetails });
  } catch (error) {
    console.error('Error fetching report details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch report details.',
      error: error.message,
    });
  }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.userId;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found or does not belong to this user.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read.',
      data: notification,
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read.',
      error: error.message,
    });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.userId;

    const deletedNotification = await Notification.findOneAndDelete({
      _id: notificationId,
      userId,
    });

    if (!deletedNotification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found or does not belong to this user.',
      });
    }

    res.status(200).json({ success: true, message: 'Notification deleted successfully.' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification.',
      error: error.message,
    });
  }
};

export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.userId;
    const result = await Notification.updateMany({ userId, isRead: false }, { isRead: true });

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read.`,
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read.',
      error: error.message,
    });
  }
};

export const deleteAllNotifications = async (req, res) => {
  try {
    const userId = req.userId;
    const result = await Notification.deleteMany({ userId });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} notifications deleted.`,
    });
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete all notifications.',
      error: error.message,
    });
  }
};

export const getUnreadNotificationCount = async (req, res) => {
  try {
    const userId = req.userId;
    const count = await Notification.countDocuments({ userId, isRead: false });

    res.status(200).json({ success: true, count });
  } catch (error) {
    console.error('Error fetching unread notification count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread notification count.',
      error: error.message,
    });
  }
};

export const getNewNotifications = async (req, res) => {
  try {
    const userId = req.userId;
    const cutoffTime = new Date(Date.now() - 60 * 1000);
    const newNotifications = await Notification.find({
      userId,
      createdAt: { $gt: cutoffTime },
      isRead: false,
      type: {
        $in: [
          'report_reply',
          'transaction:debit',
          'transaction:credit',
          'transaction:payment_completed',
          'transaction:withdrawal',
          'transaction:rejected',
          'market_upload:DONE',
          'market_upload:CANCEL',
          'market_upload:PROCESSING',
          'transaction:eth_processed',
        ],
      },
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.status(200).json({ success: true, newNotifications });
  } catch (error) {
    console.error('Error fetching new notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch new notifications.',
      error: error.message,
    });
  }
};
