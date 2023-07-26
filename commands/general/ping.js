const { SlashCommandBuilder, ChatInputCommandInteraction } = require("discord.js");
const { config } = require("../../config");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Get some latency information"),

    /**
     * Executes the ping command.
     *
     * @function
     * @param {ChatInputCommandInteraction} ctx - The interaction.
     * @returns {Promise<void>}
     */
    async execute(ctx) {
        const timestamp = new Date();

        /**
         * Retrieves the API latency.
         * @returns {number} The API latency in milliseconds.
         */
        const getApiLatency = () => {
            return ctx.client.ws.ping;
        };

        let components = [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        style: 1,
                        label: "Refresh",
                        customId: "refresh_ping",
                    },
                    {
                        type: 2,
                        style: 5,
                        label: "Repository",
                        url: "https://github.com/mellow-org/eval-bot",
                    },
                    {
                        type: 2,
                        style: 5,
                        label: "Developer",
                        url: "https://github.com/mellow-org",
                    },
                ],
            },
        ];

        const initialApiLatency = getApiLatency();

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
                    color: config.colors.main,
                    timestamp: timestamp.toISOString(),
                    footer: {
                        text: `Powered by @${ctx.client.user.username}`,
                        icon_url: ctx.client.user.avatarURL(),
                    },
                },
            ],
            components,
            ephemeral: true,
        });

        const filter = (interaction) => interaction.customId === "refresh_ping" && interaction.user.id === ctx.user.id;
        const collector = ctx.channel.createMessageComponentCollector({ filter, time: 15000 });

        collector.on("collect", async (interaction) => {
            const updatedApiLatency = getApiLatency();
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
                        color: config.colors.main,
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
            components[0].components[0].disabled = true;
            components[0].components[1].disabled = true;
            components[0].components[2].disabled = true;

            ctx.editReply({
                components,
            });
        });
    },
};
