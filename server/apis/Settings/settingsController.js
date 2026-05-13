const Setting = require("./settingsModel");

const getDefaults = () => ({
  siteName: "SkillSwap",
  siteDescription: "A platform for skill sharing and mentorship.",
  contactEmail: "admin@skillswap.com",
  maxLearnersPerSession: 30,
  defaultSessionDuration: 60,
  enableRegistration: true,
  platformFee: 0,
  currency: "INR",
  timezone: "Asia/Kolkata",
});

exports.getSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create(getDefaults());
    }
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const allowed = Object.keys(getDefaults());
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({ ...getDefaults(), ...updates });
    } else {
      Object.assign(settings, updates);
      await settings.save();
    }
    res.json({ success: true, message: "Settings updated", data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
