const { Events, Client } = require("discord.js");

/**
 * @author mellow-org
 * @since 1.0.0
 * @event ClientReady
 */

module.exports = {
  name: Events.ClientReady,
  once: true,
  /**
   * @param {Client} client 
   */
  execute(client) {
    client.logger.info(`Logged in as ${client.user.tag}`);
  },
};
