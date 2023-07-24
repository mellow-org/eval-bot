const {
  SlashCommandBuilder,
  AttachmentBuilder,
  codeBlock
} = require("discord.js");
const fs = require("fs").promises;
const path = require("path");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("reload")
    .setDescription("Reloads a command.")
    .addStringOption((option) =>
      option
        .setName("command")
        .setDescription("The command to reload.")
        .setRequired(true)
    ),
  async execute(ctx) {
    const interaction = ctx;
    const commandName = interaction.options
      .getString("command", true)
      .toLowerCase();

    const commandFilePath = await findCommandFile(commandName);
    if (!commandFilePath) {
      const embed = {
        color: 0xf0c8d8, // Pastel pink color
        title: `Command Reload Error`,
        description: `There is no command with name \`${commandName}\`!`,
      };
      return interaction.reply({ embeds: [embed] });
    }

    const cachedCommand = require.cache[require.resolve(commandFilePath)];

    try {
      delete require.cache[require.resolve(commandFilePath)];
      const command = require(commandFilePath);

      interaction.client.commands.delete(command.data.name);
      interaction.client.commands.set(command.data.name, command);

      const embed = {
        color: 0xadd8e6,
        title: `Command Reloaded`,
        description: `Command \`${command.data.name}\` was reloaded successfully!`,
      };
      interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(`Error while reloading command \`${commandName}\`:`, error);

      const errorMessage = `There was an error while reloading command \`${commandName}\`:\n${codeBlock(
        "sh",
        error
      )}`;

      const buffer = Buffer.from(errorMessage, "utf-8");

      const attachment = new AttachmentBuilder(buffer, { name: "error.txt" });

      const errorEmbed = {
        color: 0xffcccc,
        title: `Command Reload Error`,
        description: `An error occurred while reloading the command. The error details are attached as a text file.`,
      };

      interaction.reply({
        embeds: [errorEmbed],
        files: [attachment],
      });

      if (cachedCommand) {
        require.cache[require.resolve(commandFilePath)] = cachedCommand;
      }
    }
  },
};

async function findCommandFile(commandName) {
  const commandsDir = path.join(process.cwd(), "commands");
  const subdirectories = await fs.readdir(commandsDir, { withFileTypes: true });

  const rootFilePath = path.join(commandsDir, `${commandName}.js`);
  if (await fileExists(rootFilePath)) {
    return rootFilePath;
  }

  for (const subdir of subdirectories) {
    if (subdir.isDirectory()) {
      const subcommandsDir = path.join(commandsDir, subdir.name);
      const subFilePath = path.join(subcommandsDir, `${commandName}.js`);
      if (await fileExists(subFilePath)) {
        return subFilePath;
      }
    }
  }

  return null;
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch (error) {
    return false;
  }
}
