const Notification = require("../apis/Notification/notificationModel");
const User = require("../apis/Users/userModel");

let _io = null;

function setSocketIO(io) {
  _io = io;
}

async function sendNotification(recipientId, actorId, type, message, link = "") {
  try {
    const notification = await Notification.create({
      recipient: recipientId,
      actor: actorId,
      type,
      message,
      link,
    });

    if (_io) {
      let actorData = null;
      if (actorId) {
        const actor = await User.findById(actorId).select("name profileImage").lean();
        if (actor) actorData = { name: actor.name, profileImage: actor.profileImage };
      }
      _io.to(`user:${recipientId}`).emit("notification", {
        _id: notification._id,
        type,
        message,
        link,
        read: false,
        createdAt: notification.createdAt,
        actor: actorData,
      });
    }

    if (_io) {
      const count = await Notification.countDocuments({ recipient: recipientId, read: false });
      _io.to(`user:${recipientId}`).emit("unread_count", count);
      _io.to(`user:${recipientId}`).emit("sidebar_update");
    }

    return notification;
  } catch (err) {
    console.error("Failed to send notification:", err.message);
  }
}

module.exports = { sendNotification, setSocketIO };
