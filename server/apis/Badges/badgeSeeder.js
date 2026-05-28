const Badge = require("./badgeModel");

const badgeDefinitions = [
  { name: "First Step", key: "first_step", description: "Complete your first session", icon: "fa-shoe-prints", category: "learner", requirement: { type: "sessions_completed", count: 1 }, color: "#10b981" },
  { name: "Keen Learner", key: "keen_learner", description: "Complete 5 sessions", icon: "fa-book-open", category: "learner", requirement: { type: "sessions_completed", count: 5 }, color: "#0ea5e9" },
  { name: "Dedicated", key: "dedicated", description: "Complete 10 sessions", icon: "fa-fire", category: "learner", requirement: { type: "sessions_completed", count: 10 }, color: "#f59e0b" },
  { name: "Scholar", key: "scholar", description: "Complete 25 sessions", icon: "fa-graduation-cap", category: "learner", requirement: { type: "sessions_completed", count: 25 }, color: "#8b5cf6" },
  { name: "Bookworm", key: "bookworm", description: "Complete 50 sessions", icon: "fa-scroll", category: "learner", requirement: { type: "sessions_completed", count: 50 }, color: "#6366f1" },
  { name: "Ultra Scholar", key: "ultra_scholar", description: "Complete 75 sessions", icon: "fa-user-graduate", category: "learner", requirement: { type: "sessions_completed", count: 75 }, color: "#a855f7" },
  { name: "Knowledge Seeker", key: "knowledge_seeker", description: "Complete 100 sessions", icon: "fa-book", category: "learner", requirement: { type: "sessions_completed", count: 100 }, color: "#7c3aed" },
  { name: "Polymath", key: "polymath", description: "Complete sessions in 3 different skills", icon: "fa-brain", category: "learner", requirement: { type: "skills_completed", count: 3 }, color: "#ec4899" },
  { name: "Skill Collector", key: "skill_collector", description: "Complete sessions in 5 different skills", icon: "fa-layer-group", category: "learner", requirement: { type: "skills_completed", count: 5 }, color: "#06b6d4" },
  { name: "Critic", key: "critic", description: "Leave 5 reviews", icon: "fa-star-half-alt", category: "learner", requirement: { type: "reviews_left", count: 5 }, color: "#f97316" },
  { name: "Wordsmith", key: "wordsmith", description: "Leave 20 reviews", icon: "fa-pen-fancy", category: "learner", requirement: { type: "reviews_left", count: 20 }, color: "#06b6d4" },
  { name: "Reviewer Elite", key: "reviewer_elite", description: "Leave 50 reviews", icon: "fa-star", category: "learner", requirement: { type: "reviews_left", count: 50 }, color: "#dc2626" },
  { name: "Perfectionist", key: "perfectionist", description: "Complete a skill at 100%", icon: "fa-check-double", category: "learner", requirement: { type: "skill_100", count: 1 }, color: "#14b8a6" },
  { name: "Triple Crown", key: "triple_crown", description: "Complete 3 skills at 100%", icon: "fa-crown", category: "learner", requirement: { type: "skill_100", count: 3 }, color: "#fbbf24" },
  { name: "Grandmaster", key: "grandmaster", description: "Complete 5 skills at 100%", icon: "fa-crown", category: "learner", requirement: { type: "skill_100", count: 5 }, color: "#d97706" },
  { name: "Rising Mentor", key: "rising_mentor", description: "Complete 5 sessions as mentor", icon: "fa-chart-line", category: "mentor", requirement: { type: "mentor_sessions_completed", count: 5 }, color: "#3b82f6" },
  { name: "Established Mentor", key: "established_mentor", description: "Complete 30 sessions as mentor", icon: "fa-chalkboard", category: "mentor", requirement: { type: "mentor_sessions_completed", count: 30 }, color: "#2563eb" },
  { name: "Super Mentor", key: "super_mentor", description: "Complete 50 sessions as mentor", icon: "fa-star", category: "mentor", requirement: { type: "mentor_sessions_completed", count: 50 }, color: "#f59e0b" },
  { name: "Mentor Extraordinaire", key: "mentor_extraordinaire", description: "Complete 100 sessions as mentor", icon: "fa-chalkboard-user", category: "mentor", requirement: { type: "mentor_sessions_completed", count: 100 }, color: "#7c3aed" },
  { name: "Elite Mentor", key: "elite_mentor", description: "Complete 200 sessions as mentor", icon: "fa-crown", category: "mentor", requirement: { type: "mentor_sessions_completed", count: 200 }, color: "#d97706" },
  { name: "Popular", key: "popular", description: "Get 10 bookings", icon: "fa-users", category: "mentor", requirement: { type: "bookings_received", count: 10 }, color: "#8b5cf6" },
  { name: "Popular Mentor", key: "popular_mentor", description: "Get 50 bookings", icon: "fa-user-group", category: "mentor", requirement: { type: "bookings_received", count: 50 }, color: "#059669" },
  { name: "Five Star", key: "five_star", description: "Maintain 5.0 average rating (min 5 reviews)", icon: "fa-gem", category: "mentor", requirement: { type: "avg_rating", count: 5 }, color: "#14b8a6" },
  { name: "Respected", key: "respected", description: "Maintain 4.5+ average rating (min 10 reviews)", icon: "fa-handshake", category: "mentor", requirement: { type: "min_rating", count: 45 }, color: "#0d9488" },
  { name: "Century", key: "century", description: "Earn 100 XP", icon: "fa-trophy", category: "general", requirement: { type: "xp_earned", count: 100 }, color: "#0ea5e9" },
  { name: "XP Hunter", key: "xp_hunter", description: "Earn 500 XP", icon: "fa-trophy", category: "general", requirement: { type: "xp_earned", count: 500 }, color: "#8b5cf6" },
  { name: "XP Legend", key: "xp_legend", description: "Earn 1000 XP", icon: "fa-crown", category: "general", requirement: { type: "xp_earned", count: 1000 }, color: "#fbbf24" },
  { name: "XP Master", key: "xp_master", description: "Earn 2500 XP", icon: "fa-trophy", category: "general", requirement: { type: "xp_earned", count: 2500 }, color: "#16a34a" },
  { name: "XP Champion", key: "xp_champion", description: "Earn 5000 XP", icon: "fa-star", category: "general", requirement: { type: "xp_earned", count: 5000 }, color: "#ca8a04" },
  { name: "XP God", key: "xp_god", description: "Earn 10000 XP", icon: "fa-crown", category: "general", requirement: { type: "xp_earned", count: 10000 }, color: "#dc2626" },
  { name: "Rising Star", key: "rising_star", description: "Get 10 followers", icon: "fa-star", category: "general", requirement: { type: "followers_count", count: 10 }, color: "#0ea5e9" },
  { name: "Popular", key: "followers_50", description: "Get 50 followers", icon: "fa-user-group", category: "general", requirement: { type: "followers_count", count: 50 }, color: "#8b5cf6" },
  { name: "Influencer", key: "influencer", description: "Get 100 followers", icon: "fa-users", category: "general", requirement: { type: "followers_count", count: 100 }, color: "#f59e0b" },
  { name: "Community Legend", key: "community_legend", description: "Get 500 followers", icon: "fa-crown", category: "general", requirement: { type: "followers_count", count: 500 }, color: "#dc2626" },
];

async function seedBadges() {
  try {
    for (const badge of badgeDefinitions) {
      await Badge.findOneAndUpdate(
        { key: badge.key },
        { $set: badge },
        { upsert: true, returnDocument: "after" },
      );
    }
    const count = await Badge.countDocuments();
    console.log(`Seeded ${count} badges`);
  } catch (err) {
    console.error("Badge seeding failed:", err.message);
  }
}

module.exports = { seedBadges, badgeDefinitions };
