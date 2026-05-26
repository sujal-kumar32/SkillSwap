const { google } = require("googleapis");

function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );
}

function getAuthUrl() {
  const oauth2Client = getOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/calendar.events"],
  });
}

async function getTokensFromCode(code) {
  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

async function refreshAccessToken(refreshToken) {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  const { credentials } = await oauth2Client.refreshAccessToken();
  return credentials;
}

async function createCalendarEvent({
  accessToken,
  refreshToken,
  summary,
  description,
  startDateTime,
  endDateTime,
  timeZone = "UTC",
  attendeeEmails = [],
}) {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  const event = {
    summary,
    description,
    start: { dateTime: startDateTime, timeZone },
    end: { dateTime: endDateTime, timeZone },
    attendees: attendeeEmails.map((email) => ({ email })),
    reminders: {
      useDefault: false,
      overrides: [
        { method: "email", minutes: 60 },
        { method: "popup", minutes: 30 },
      ],
    },
  };

  const response = await calendar.events.insert({
    calendarId: "primary",
    requestBody: event,
    sendUpdates: "all",
  });

  return response.data;
}

async function deleteCalendarEvent({ accessToken, refreshToken, eventId }) {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });
  await calendar.events.delete({ calendarId: "primary", eventId, sendUpdates: "all" });
}

module.exports = {
  getAuthUrl,
  getTokensFromCode,
  refreshAccessToken,
  createCalendarEvent,
  deleteCalendarEvent,
};
