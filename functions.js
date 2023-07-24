const Discord = require("discord.js");

async function disableComponents(msg_to_manage) {
    let msg = msg_to_manage;
    const rows = msg.components.map(({ components }) => ({
      components: components.map((component) => {
        switch (component.type) {
          case 2:
            return Discord.ButtonBuilder.from(component)
              .setDisabled(true)
              .setCustomId(`disabled_${component.customId}`);
          case 3:
            return Discord.StringSelectMenuBuilder.from(component)
              .setDisabled(true)
              .setCustomId(`disabled_${component.customId}`);
          default:
            return component;
        }
      }),
    }));
    await msg.edit({ components: rows });
  }

module.exports = { disableComponents };