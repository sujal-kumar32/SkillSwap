const jwt = require("jsonwebtoken");
const { google } = require("googleapis");
const CalendarToken = require("./calendarTokenModel");
const User = require("../Users/userModel");
const asyncHandler = require("../../utilities/asyncHandler");
const {
  getAuthUrl,
  getTokensFromCode,
} = require("../../utilities/calendarService");

exports.connect = asyncHandler(async (req, res) => {
  const state = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET, { expiresIn: "10m" });
  const url = getAuthUrl() + `&state=${encodeURIComponent(state)}`;
  res.json({ success: true, url });
});

exports.callback = asyncHandler(async (req, res) => {
  const { code, state } = req.query;
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

  if (!code) {
    return res.redirect(`${clientUrl}/settings?calendar=error`);
  }

  let userId;
  try {
    const decoded = jwt.verify(state, process.env.JWT_SECRET);
    userId = decoded.id;
  } catch {
    return res.redirect(`${clientUrl}/settings?calendar=error`);
  }

  const user = await User.findById(userId).select("email");
  if (!user) {
    return res.redirect(`${clientUrl}/settings?calendar=error`);
  }

  try {
    const tokens = await getTokensFromCode(code);

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
    );
    oauth2Client.setCredentials({ access_token: tokens.access_token });
    const people = google.people({ version: "v1", auth: oauth2Client });
    const profile = await people.people.get({
      resourceName: "people/me",
      personFields: "emailAddresses",
    });
    const calendarEmail = profile.data.emailAddresses?.[0]?.value;

    if (!calendarEmail || calendarEmail.toLowerCase() !== user.email.toLowerCase()) {
      return res.redirect(`${clientUrl}/settings?calendar=error`);
    }

    await CalendarToken.findOneAndUpdate(
      { userId },
      {
        userId,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        scope: tokens.scope,
        tokenType: tokens.token_type,
        expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        calendarEmail,
      },
      { upsert: true, new: true },
    );

    res.redirect(`${clientUrl}/settings?calendar=connected`);
  } catch (err) {
    console.error("Calendar callback error:", err.message);
    res.redirect(`${clientUrl}/settings?calendar=error`);
  }
});

exports.status = asyncHandler(async (req, res) => {
  const token = await CalendarToken.findOne({ userId: req.user.id }).lean();
  if (!token) {
    return res.json({ success: true, connected: false });
  }
  res.json({
    success: true,
    connected: true,
    email: token.calendarEmail,
    connectedAt: token.createdAt,
  });
});

exports.disconnect = asyncHandler(async (req, res) => {
  await CalendarToken.deleteOne({ userId: req.user.id });
  res.json({ success: true, message: "Calendar disconnected" });
});
