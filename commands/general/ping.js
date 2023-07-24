const { SlashCommandBuilder, ChatInputCommandInteraction, ComponentType } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Get Lucy's latency information"),
    /**
   * @param {ChatInputCommandInteraction} ctx
   */
  async execute(ctx) {
    const timestamp = new Date();

    const getApiLatency = () => {
      return ctx.client.ws.ping;
    };

    let components = [
      {
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.Button,
            style: 1,
            label: "Refresh",
            customId: "refresh_ping",
          },
          {
            type: ComponentType.Button,
            style: 5,
            label: "Repository",
            url: "https://github.com/mellow-org/eval-bot",
          },
          {
            type: ComponentType.Button,
            style: 5,
            label: "Developer",
            url: "https://github.com/mellow-org", 
          },
        ],
      },
    ];

    const initialApiLatency = getApiLatency(); // Get the initial API latency

    await ctx.reply({
      embeds: [
        {
          title: "Pong!",
          fields: [
            {
              name: "API Latency",
              value: `${initialApiLatency}ms`,
              inline: true,
            },
            {
              name: "Bot Response Time",
              value: `${Date.now() - ctx.createdTimestamp}ms`,
              inline: true,
            },
          ],
          color: 0xCCFCFC,
          timestamp: timestamp.toISOString(),
          footer: {
            text: `Powered by @${ctx.client.user.username}`,
            icon_url: ctx.client.user.avatarURL(),
          },
        },
      ],
      components,
    });

    const filter = (interaction) => interaction.customId === "refresh_ping" && interaction.user.id === ctx.user.id;
    const collector = ctx.channel.createMessageComponentCollector({ filter, time: 15000 });

    collector.on("collect", async (interaction) => {
      const updatedApiLatency = getApiLatency(); // Get the updated API latency
      await interaction.update({
        embeds: [
          {
            title: "Pong!",
            fields: [
              {
                name: "API Latency",
                value: `${updatedApiLatency}ms`,
                inline: true,
              },
              {
                name: "Bot Response Time",
                value: `${Date.now() - interaction.createdTimestamp}ms`,
                inline: true,
              },
            ],
            color: 0xCCFCFC,
            timestamp: timestamp.toISOString(),
            footer: {
              text: `Powered by @${ctx.client.user.username}`,
              icon_url: ctx.client.user.avatarURL(),
            },
          },
        ],
      });
    });

    collector.on("end", (collected) => {
      // Disable the buttons after the collector ends
      components[0].components[0].disabled = true; // Disable Refresh button
      components[0].components[1].disabled = true; // Disable Repository button
      components[0].components[2].disabled = true; // Disable Developer button

      ctx.editReply({
        components,
      });
    });
  },
};

