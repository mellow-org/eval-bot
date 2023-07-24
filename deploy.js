require("dotenv").config();
const { REST, Routes } = require("discord.js");
const fs = require("fs").promises;
const path = require("path");
const { green, yellow, red } = require("colorette");

const commands = [];
const foldersPath = path.join(__dirname, "commands");

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
            console.log(
              `${green("[INFO]")} Loaded command: ${command.data.name}`
            );
          } else {
            console.log(
              `${yellow(
                "[WARNING]"
              )} The command at ${filePath} is missing a required "data" or "execute" property.`
            );
          }
        }
      }
    }
  } catch (error) {
    console.error(`${red("[ERROR]")} Error loading commands:`, error);
  }
}

async function deployCommands() {
  try {
    console.log(
      `${green("[INFO]")} Started refreshing ${
        commands.length
      } application (/) commands.`
    );

    // Construct and prepare an instance of the REST module
    const rest = new REST({ version: "10" }).setToken(process.env.token);

    // Deploy the commands
    const data = await rest.put(
      Routes.applicationCommands(process.env.clientID),
      { body: commands }
    );

    console.log(
      `${green("[INFO]")} Successfully reloaded ${
        data.length
      } application (/) commands.`
    );
  } catch (error) {
    console.error(`${red("[ERROR]")} Error deploying commands:`, error);
  }
}

(async () => {
  try {
    await loadCommands();
    await deployCommands();
  } catch (error) {
    console.error(`${red("[ERROR]")} Error while deploying:`, error);
  }
})();
