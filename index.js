require("dotenv").config();
const { Client, Collection, GatewayIntentBits, ActivityType } = require("discord.js");
const fs = require("fs").promises;
const path = require("path");
const winston = require("winston");

const client = new Client({
  intents: [
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
  presence: {
    status: "idle",
    activities: [
      {
        name: "Cyberpunk 2077",
        type: ActivityType.Playing,
      },
    ],
  },
});

// Create a logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss"
    }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] [${level}]: ${message}`;
    })
  ),
  transports: [new winston.transports.Console()],
});

client.commands = new Collection();
client.logger = logger;

async function loadCommands() {
  const foldersPath = path.join(__dirname, "commands");
  const commandFolders = await fs.readdir(foldersPath);

  for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = (await fs.readdir(commandsPath)).filter((file) =>
      file.endsWith(".js")
    );

    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      try {
        const command = require(filePath);
        if ("data" in command && "execute" in command) {
          client.commands.set(command.data.name, command);
          logger.info(`Loaded command: ${command.data.name}`);
        } else {
          logger.warn(
            `The command at ${filePath} is missing a required "data" or "execute" property.`
          );
        }
      } catch (error) {
        logger.error(`Error loading command at ${filePath}:`, error);
      }
    }
  }
}

async function loadEvents() {
  const eventsPath = path.join(__dirname, "events");
  const eventFiles = (await fs.readdir(eventsPath)).filter((file) =>
    file.endsWith(".js")
  );

  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    try {
      const event = require(filePath);
      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
      } else {
        client.on(event.name, (...args) => event.execute(...args));
      }
      logger.info(`Loaded event: ${event.name}`);
    } catch (error) {
      logger.error(`Error loading event at ${filePath}:`, error);
    }
  }
}


(async () => {
  try {
    if (!process.env.token) {
      logger.error("No bot token provided in the environment variables.");
      return;
    }

    await loadCommands();
    await loadEvents();

    await client.login(process.env.token);
  } catch (error) {
    logger.error("Error during initialization:", error);
  }
})();

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  logger.error(`Uncaught Exception:\n ${error}`);
});