const {
  Events,
  CommandInteraction,
  ChatInputCommandInteraction,
  ContextMenuCommandInteraction,
  ButtonInteraction,
  StringSelectMenuInteraction,
} = require("discord.js");
const { config } = require("../config");

module.exports = {
  name: Events.InteractionCreate,
  /**
   * Executes the appropriate command based on the provided interaction.
   * @param {CommandInteraction | ChatInputCommandInteraction | ContextMenuCommandInteraction | ButtonInteraction | StringSelectMenuInteraction} interaction - The interaction received from Discord
   */
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;
    const ctx = interaction;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      interaction.client.logger.error(
        `No command matching ${interaction.commandName} was found.`
      );
      return;
    }

    try {
      const respondedOrDeferred = interaction.deferred || interaction.replied;
      if (!respondedOrDeferred) {
        if (command.devOnly && !config.misc.developers.includes(ctx.user.id)) {
          return ctx.reply({
            embeds: [
              {
                title: "Interaction Restricted",
                description: `This interaction can only be ran by my developer.`,
                color: config.colors.error,
                timestamp: new Date().toISOString(),
              },
            ],
            ephemeral: true,
          });
        }
        await command.execute(ctx);
      } else {
        interaction.client.logger.info(
          `Interaction '${interaction.commandName}' was already replied or deferred. Skipping...`
        );
      }
    } catch (error) {
      interaction.client.logger.error(
        `Error executing ${interaction.commandName}:`
      );
      interaction.client.logger.error(error);

      await interaction.followUp({
        embeds: [
          {
            title: "Error Occurred",
            description:
              "An error occurred while executing the command. Please try again later.",
            color: config.colors.error,
            timestamp: new Date().toISOString(),
          },
        ],
        ephemeral: true,
      });
    }
  },
};
