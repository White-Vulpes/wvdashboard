const { WebClient } = require("@slack/web-api");
const token = process.env.SLACK_BOT_TOKEN;
const web = new WebClient(token);

const PRIORITY = {
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

console.warn = () => {};

const slack = {
  sendMessage: async (channel, message) => {
    try {
      await web.chat.postMessage({
        channel,
        ...message,
      });
    } catch (error) {
      console.error("Error sending message to Slack: ", error);
    }
  },

  sendErrorMessage: async (e, name, priority) => {
    try {
      await web.chat.postMessage({
        channel: "#errors",
        attachments: [
          {
            color: "#f00",
            title: `🚨 ${name} failed`,
            text: e.message,
            fields: [
              { value: "\u200B", short: false },
              {
                title: "Priority",
                value: priority,
                short: true,
              },
            ],
            footer: "Error Timestamp",
            ts: Math.floor(Date.now() / 1000),
          },
        ],
      });
    } catch (error) {
      console.error(e);
    }
  },
};

module.exports = { slack, PRIORITY };
