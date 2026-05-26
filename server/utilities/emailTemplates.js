function welcomeEmail(name) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Welcome to SkillSwap, ${name}!</h2>
      <p>You're now part of a community where learners and mentors grow together.</p>
      <ul>
        <li>Explore sessions taught by expert mentors</li>
        <li>Create and share your own skills</li>
        <li>Track your progress every step of the way</li>
      </ul>
      <p style="margin-top: 24px;">
        <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/workspace"
           style="background:#2563eb;color:#fff;padding:12px 28px;border-radius:50px;text-decoration:none;display:inline-block;">
          Get Started
        </a>
      </p>
      <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;" />
      <small style="color: #9ca3af;">SkillSwap — Learn. Teach. Grow.</small>
    </div>
  `;
}

function bookingRequestMentorNotification(mentorName, learnerName, sessionTitle) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #2563eb;">New Booking Request!</h2>
      <p>Hi <strong>${mentorName}</strong>,</p>
      <p><strong>${learnerName}</strong> has requested to join your session <strong>"${sessionTitle}"</strong>.</p>
      <p>Review and respond to the request from your dashboard.</p>
      <p style="margin-top: 24px;">
        <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/mentor/bookings"
           style="background:#2563eb;color:#fff;padding:12px 28px;border-radius:50px;text-decoration:none;display:inline-block;">
          View Bookings
        </a>
      </p>
      <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;" />
      <small style="color: #9ca3af;">SkillSwap — Learn. Teach. Grow.</small>
    </div>
  `;
}

function bookingStatusUpdateLearner(learnerName, sessionTitle, status) {
  const isApproved = status === "accepted";
  const headline = isApproved ? "Booking Confirmed!" : "Booking Update";
  const emoji = isApproved ? "&#x2705;" : "&#x274C;";
  const message = isApproved
    ? `Your request for session <strong>"${sessionTitle}"</strong> has been accepted by the mentor.`
    : `Unfortunately, your request for session <strong>"${sessionTitle}"</strong> was ${status}.`;

  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: ${isApproved ? "#059669" : "#dc2626"};">${emoji} ${headline}</h2>
      <p>Hi <strong>${learnerName}</strong>,</p>
      <p>${message}</p>
      <p style="margin-top: 24px;">
        <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/learner/bookings"
           style="background:#2563eb;color:#fff;padding:12px 28px;border-radius:50px;text-decoration:none;display:inline-block;">
          View My Bookings
        </a>
      </p>
      <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;" />
      <small style="color: #9ca3af;">SkillSwap — Learn. Teach. Grow.</small>
    </div>
  `;
}

function mentorApplicationApproved(name) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #059669;">Congratulations! &#x1F389;</h2>
      <p>Hi <strong>${name}</strong>,</p>
      <p>Your mentor application has been <strong>approved</strong>! You can now create sessions and start sharing your skills with learners.</p>
      <p style="margin-top: 24px;">
        <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/mentor/sessions"
           style="background:#059669;color:#fff;padding:12px 28px;border-radius:50px;text-decoration:none;display:inline-block;">
          Create a Session
        </a>
      </p>
      <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;" />
      <small style="color: #9ca3af;">SkillSwap — Learn. Teach. Grow.</small>
    </div>
  `;
}

function mentorApplicationRejected(name, adminRemarks) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Mentor Application Update</h2>
      <p>Hi <strong>${name}</strong>,</p>
      <p>Your mentor application has been <strong>rejected</strong>.</p>
      ${adminRemarks ? `<p><strong>Reason:</strong> ${adminRemarks}</p>` : ""}
      <p>You can review the feedback and apply again with improvements.</p>
      <p style="margin-top: 24px;">
        <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/workspace"
           style="background:#2563eb;color:#fff;padding:12px 28px;border-radius:50px;text-decoration:none;display:inline-block;">
          Go to Dashboard
        </a>
      </p>
      <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;" />
      <small style="color: #9ca3af;">SkillSwap — Learn. Teach. Grow.</small>
    </div>
  `;
}

function certificateCompleted(name, skillName, mentorName) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #1e293b, #334155); padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
        <h1 style="color: #c9a848; margin: 0; font-size: 22px;">SKILLSWAP</h1>
        <p style="color: #94a3b8; margin: 8px 0 0;">Certificate of Completion</p>
      </div>
      <div style="background: #fff; border: 1px solid #e5e7eb; border-top: none; padding: 32px; border-radius: 0 0 16px 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="font-size: 48px; margin-bottom: 8px;">&#x1F3C6;</div>
          <h2 style="color: #059669; margin: 0;">Congratulations, ${name}!</h2>
        </div>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">
          You've successfully completed all sessions for <strong style="color: #0d6efd;">${skillName}</strong>
          with mentor <strong>${mentorName}</strong>. Your certificate is attached to this email.
        </p>
        <div style="background: #f0fdf4; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; font-size: 14px; color: #059669;">
            <strong>Skill:</strong> ${skillName}<br/>
            <strong>Mentor:</strong> ${mentorName}
          </p>
        </div>
        <p style="color: #64748b; font-size: 14px;">Keep learning and growing with SkillSwap!</p>
        <div style="text-align: center; margin-top: 24px;">
          <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/learner/progress"
             style="background:#0d6efd;color:#fff;padding:12px 32px;border-radius:50px;text-decoration:none;display:inline-block;font-weight:600;">
            View Your Progress
          </a>
        </div>
      </div>
      <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;" />
      <small style="color: #9ca3af; display: block; text-align: center;">SkillSwap — Learn. Teach. Grow.</small>
    </div>
  `;
}

function passwordResetEmail(name, resetLink) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Reset Your Password</h2>
      <p>Hi <strong>${name}</strong>,</p>
      <p>We received a request to reset your password. Click the button below to set a new one. This link expires in 1 hour.</p>
      <p style="margin-top: 24px;">
        <a href="${resetLink}"
           style="background:#2563eb;color:#fff;padding:12px 28px;border-radius:50px;text-decoration:none;display:inline-block;">
          Reset Password
        </a>
      </p>
      <p style="margin-top: 16px;">If you didn't request this, you can safely ignore this email.</p>
      <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;" />
      <small style="color: #9ca3af;">SkillSwap — Learn. Teach. Grow.</small>
    </div>
  `;
}

function emailVerification(name, verifyLink) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Verify Your Email Address</h2>
      <p>Hi <strong>${name}</strong>,</p>
      <p>Thanks for joining SkillSwap! Please verify your email address by clicking the button below. This link expires in 24 hours.</p>
      <p style="margin-top: 24px;">
        <a href="${verifyLink}"
           style="background:#2563eb;color:#fff;padding:12px 28px;border-radius:50px;text-decoration:none;display:inline-block;">
          Verify Email
        </a>
      </p>
      <p style="margin-top: 16px;">If you didn't create an account, you can safely ignore this email.</p>
      <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;" />
      <small style="color: #9ca3af;">SkillSwap — Learn. Teach. Grow.</small>
    </div>
  `;
}

module.exports = { welcomeEmail, emailVerification, bookingRequestMentorNotification, bookingStatusUpdateLearner, mentorApplicationApproved, mentorApplicationRejected, certificateCompleted, passwordResetEmail };
