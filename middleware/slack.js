const { WebClient } = require("@slack/web-api");
const token = process.env.SLACK_BOT_TOKEN;
const web = new WebClient(token);

console.warn = () => {};

const PRIORITY = {
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

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

  sendErrorMessage: async (message, name, priority) => {
    try {
      await web.chat.postMessage({
        channel: "#errors",
        attachments: [
          {
            color: "#f00",
            title: `🚨 ${name} failed`,
            text: message,
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
    } catch (e) {
      console.error();
    }
  },
};

module.exports = { slack, PRIORITY };
