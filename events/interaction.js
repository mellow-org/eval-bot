const { Events, CommandInteraction, ChatInputCommandInteraction, ContextMenuCommandInteraction, ButtonInteraction, StringSelectMenuInteraction, Client } = require("discord.js");

module.exports = {
  name: Events.InteractionCreate,
  /**
   * Executes the appropriate command based on the provided interaction.
   * @param {Client} client - The bot client
   * @param {CommandInteraction | ChatInputCommandInteraction | ContextMenuCommandInteraction | ButtonInteraction | StringSelectMenuInteraction} interaction - The interaction received from Discord
   */
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      interaction.client.logger.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    try {
      const respondedOrDeferred = interaction.deferred || interaction.replied;
      if (!respondedOrDeferred) {
        const ctx = interaction;
        await command.execute(ctx);
      } else {
        interaction.client.logger.info(`Interaction '${interaction.commandName}' was already replied or deferred. Skipping...`);
      }
    } catch (error) {
      interaction.client.logger.error(`Error executing ${interaction.commandName}:`);
      interaction.client.logger.error(error);

      await interaction.reply({
        embeds: [
          {
            title: "An Error Occurred",
            description: "An error occurred while executing the command. Please try again later.",
            color: 0xF2C9C9, // Pastel red color
          },
        ],
        ephemeral: true,
      });
    }
  },
};
