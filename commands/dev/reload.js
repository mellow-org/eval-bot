const {
  SlashCommandBuilder,
  AttachmentBuilder,
  codeBlock,
} = require("discord.js");

const { config } = require("../../config");
const { findCommandFile } = require("../../utils/scripts");

module.exports = {
  devOnly: true,
  data: new SlashCommandBuilder()
      .setName("reload")
      .setDescription("Reloads a command.")
      .addStringOption((option) =>
          option
              .setName("command")
              .setDescription("The command to reload.")
              .setRequired(true)
      ),

  /**
   * Executes the reload command.
   *
   * @function
   * @param {ChatInputCommandInteraction} ctx - The interaction.
   * @returns {Promise<void>}
   */
  async execute(ctx) {
      const interaction = ctx;
      const commandName = interaction.options
          .getString("command", true)
          .toLowerCase();

      /**
       * Finds the file path of the specified command.
       * @param {string} commandName - The name of the command to reload.
       * @returns {Promise<string|null>} The file path of the command, or null if not found.
       */
      const commandFilePath = await findCommandFile(commandName);
      if (!commandFilePath) {
          const embed = {
              color: config.colors.error,
              title: `Command Reload Error`,
              description: `There is no command with name \`${commandName}\`!`,
          };
          return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      const cachedCommand = require.cache[require.resolve(commandFilePath)];

      try {
          delete require.cache[require.resolve(commandFilePath)];
          const command = require(commandFilePath);

          interaction.client.commands.delete(command.data.name);
          interaction.client.commands.set(command.data.name, command);

          const embed = {
              color: config.colors.main,
              title: `Command Reloaded`,
              description: `Command \`${command.data.name}\` was reloaded successfully!`,
          };
          interaction.reply({ embeds: [embed], ephemeral: true });
      } catch (error) {
          console.error(`Error while reloading command \`${commandName}\`:`, error);

          const errorMessage = `There was an error while reloading command \`${commandName}\`:\n${codeBlock(
              "sh",
              error
          )}`;

          const buffer = Buffer.from(errorMessage, "utf-8");

          const attachment = new AttachmentBuilder(buffer, { name: "error.txt" });

          const errorEmbed = {
              color: config.colors.error,
              title: `Command Reload Error`,
              description: `An error occurred while reloading the command. The error details are attached as a text file.`,
          };

          interaction.reply({
              embeds: [errorEmbed],
              files: [attachment],
              ephemeral: true,
          });

          if (cachedCommand) {
              require.cache[require.resolve(commandFilePath)] = cachedCommand;
          }
      }
  },
};
