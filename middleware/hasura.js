const { slack, PRIORITY } = require("./slack");

const url = "https://white-vulpes.hasura.app/v1/graphql";
const adminSecret = process.env.X_HASURA_ADMIN_SECRET;

const hasura = {
  fetchAdminQueries: async (query, variables) => {
    try {
      const result = await fetch(url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-hasura-admin-secret": adminSecret,
        },
        body: JSON.stringify({
          query: query,
          variables: variables,
        }),
      });

      return await result.json();
    } catch (e) {
      slack.sendErrorMessage(e, "hasura.fetchAdminQueries", PRIORITY.HIGH);
    }
  },
};

module.exports = hasura;
