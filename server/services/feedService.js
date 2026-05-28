const Feed = require("../apis/Feed/feedModel");

const createFeedEvent = async (actorId, type, targetId = null, targetModel = null, metadata = {}) => {
  try {
    await Feed.create({
      actor: actorId,
      type,
      target: targetId,
      targetModel,
      metadata,
    });
  } catch (err) {
    console.error("Failed to create feed event:", err.message);
  }
};

module.exports = { createFeedEvent };
