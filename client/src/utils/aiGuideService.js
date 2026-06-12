import Apiservices from "../../Apiservices";

export const aiGuide = {
  getWelcome: async () => {
    const res = await Apiservices.guideWelcome();
    return res.data?.data || null;
  },

  sendMessage: async (message, onboardingStatus, conversationHistory = []) => {
    const res = await Apiservices.guideChat(message, {
      onboardingStatus,
      conversationHistory,
    });
    return res.data?.data || null;
  },

  updateOnboarding: async (status) => {
    const res = await Apiservices.updateOnboardingStatus(status);
    return res.data;
  },
};
