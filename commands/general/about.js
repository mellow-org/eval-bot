const { SlashCommandBuilder, ChatInputCommandInteraction } = require("discord.js");
const { config } = require("../../config");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("about")
        .setDescription("Get information about the bot and its developers"),
        /**
     * Executes the about command.
     *
     * @function
     * @param {ChatInputCommandInteraction} ctx - The interaction.
     * @returns {Promise<void>}
     */
    async execute(ctx) {
        // Function to retrieve bot stats
        const getBotStats = () => {
            const guildsCount = ctx.client.guilds.cache.size;
            const usersCount = ctx.client.users.cache.size;
            const channelsCount = ctx.client.channels.cache.size;
            return { guilds: guildsCount, users: usersCount, channels: channelsCount };
        };

        // Home page components
        const homeComponents = [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        style: 2,
                        label: "About",
                        customId: "about_page",
                    },
                    {
                        type: 2,
                        style: 2,
                        label: "Credits",
                        customId: "credits_page",
                    },
                    {
                        type: 2,
                        style: 2,
                        label: "Stats",
                        customId: "stats_page",
                    },
                ],
            },
        ];

        // About page components
        const aboutComponents = [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        style: 2,
                        label: "Home",
                        customId: "home_page",
                    },
                ],
            },
        ];

        // Credits page components
        const creditsComponents = [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        style: 2,
                        label: "Home",
                        customId: "home_page",
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

        // Stats page components
        const statsComponents = [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        style: 2,
                        label: "Home",
                        customId: "home_page",
                    },
                ],
            },
        ];

        ctx.reply({
            embeds: [
                {
                    author: {
                        name: ctx.user.tag,
                        icon_url: ctx.user.avatarURL()
                    },
                    description: "This bot is designed to help Discord.js developers evaluate JavaScript code.",
                    color: config.colors.main,
                    footer: {
                        text: `Powered by @${ctx.client.user.username}`,
                        icon_url: ctx.client.user.avatarURL(),
                    },
                },
            ],
            components: homeComponents,
            ephemeral: true,
        });

        const collector = ctx.channel.createMessageComponentCollector({ time: 15000 });

        collector.on("collect", async (interaction) => {
            const { customId } = interaction;

            switch (customId) {
                case "about_page":
                    await interaction.update({
                        embeds: [
                            {
                                title: "About Eval Bot",
                                description: "This bot is designed to help Discord.js developers evaluate JavaScript code.",
                                color: config.colors.main,
                                footer: {
                                    text: `Powered by @${ctx.client.user.username}`,
                                    icon_url: ctx.client.user.avatarURL(),
                                },
                            },
                        ],
                        components: aboutComponents,
                    });
                    break;
                case "credits_page":
                    await interaction.update({
                        embeds: [
                            {
                                title: "Credits",
                                description: "This bot was developed by mellow-org.",
                                color: config.colors.main,
                                footer: {
                                    text: `Powered by @${ctx.client.user.username}`,
                                    icon_url: ctx.client.user.avatarURL(),
                                },
                            },
                        ],
                        components: creditsComponents,
                    });
                    break;
                case "stats_page":
                    const botStats = getBotStats();
                    await interaction.update({
                        embeds: [
                            {
                                title: "Bot Stats",
                                fields: [
                                    { name: "Servers", value: botStats.guilds, inline: true },
                                    { name: "Users", value: botStats.users, inline: true },
                                    { name: "Channels", value: botStats.channels, inline: true },
                                ],
                                color: config.colors.main,
                                footer: {
                                    text: `Powered by @${ctx.client.user.username}`,
                                    icon_url: ctx.client.user.avatarURL(),
                                },
                            },
                        ],
                        components: statsComponents,
                    });
                    break;
                default:
                    await interaction.update({
                        embeds: [
                            {
                                title: "About Eval Bot",
                                description: "This bot is designed to help Discord.js developers evaluate JavaScript code.",
                                color: config.colors.main,
                                footer: {
                                    text: `Powered by @${ctx.client.user.username}`,
                                    icon_url: ctx.client.user.avatarURL(),
                                },
                            },
                        ],
                        components: homeComponents,
                    });
            }
        });

        collector.on("end", () => {
            // Disable the buttons after the collector ends
            homeComponents[0].components.forEach((component) => {
                component.disabled = true;
            });
        });
    },
};
