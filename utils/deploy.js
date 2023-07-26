const { REST, Routes } = require("discord.js");
const fs = require("fs").promises;
const path = require("path");
const { config } = require("../config");
const { logger } = require("./scripts");

const commands = [];
const foldersPath = path.join(process.cwd(), "commands");

async function loadCommands() {
  try {
    const commandFolders = await fs.readdir(foldersPath);
    for (const folder of commandFolders) {
      const commandsPath = path.join(foldersPath, folder);
      const commandFiles = await fs.readdir(commandsPath);
      for (const file of commandFiles) {
        if (file.endsWith(".js")) {
          const filePath = path.join(commandsPath, file);
          const command = require(filePath);
          if ("data" in command && "execute" in command) {
            commands.push(command.data.toJSON());
            logger.info(`Loaded command: ${command.data.name}`);
          } else {
            logger.warn(
              `The command at ${filePath} is missing a required "data" or "execute" property.`
            );
          }
        }
      }
    }
  } catch (error) {
    logger.error("Error loading commands:", error);
  }
}

async function deployCommands() {
  try {
    logger.info(`Started refreshing ${commands.length} application (/) commands.`);

    // Construct and prepare an instance of the REST module
    const rest = new REST({ version: "10" }).setToken(config.client.token);

    // Deploy the commands
    const data = await rest.put(
      Routes.applicationCommands(config.client.ID),
      { body: commands }
    );

    logger.info(`Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    logger.error("Error deploying commands:", error);
  }
}

(async () => {
  try {
    await loadCommands();
    await deployCommands();
  } catch (error) {
    logger.error("Error while deploying:", error);
  }
})();
