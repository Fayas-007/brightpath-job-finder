const Notification = require("../models/Notification");

exports.getMyNotifications = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 12, 30);
    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ recipient: req.user._id })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate("job", "title")
        .populate("application", "status")
        .lean(),
      Notification.countDocuments({ recipient: req.user._id, read: false }),
    ]);

    res.json({ notifications, unreadCount });
  } catch (err) {
    console.error("getMyNotifications error:", err);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ message: "Notification marked as read", notification });
  } catch (err) {
    console.error("markNotificationRead error:", err);
    res.status(500).json({ message: "Failed to update notification" });
  }
};

exports.markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { read: true }
    );

    res.json({ message: "Notifications marked as read" });
  } catch (err) {
    console.error("markAllNotificationsRead error:", err);
    res.status(500).json({ message: "Failed to update notifications" });
  }
};
