const {
    SlashCommandBuilder,
    AttachmentBuilder,
    codeBlock,
    ChatInputCommandInteraction,
    Component
} = require("discord.js");
const { inspect } = require("util");
const { config } = require("../../config");

/**
 * @author mellow-org
 * @since 1.0.0
 */

module.exports = {
    category: "developer",
    devOnly: true,
    data: new SlashCommandBuilder()
        .setName("eval")
        .setDescription("Evaluates arbitrary JavaScript code.")
        .addStringOption((option) =>
            option
                .setName("code")
                .setDescription("The JavaScript code to evaluate.")
                .setRequired(true)
        )
        .addBooleanOption((option) =>
            option
                .setName("ephemeral")
                .setDescription("Whether the reply should be ephemeral or not, defaults to true.")
        ),

    /**
     * Executes the eval command.
     *
     * @function
     * @param {ChatInputCommandInteraction} ctx - The interaction.
     * @returns {Promise<void>}
     */
    async execute(ctx) {
        const code = ctx.options.getString("code");
        const ephemeralOption = ctx.options.getBoolean("ephemeral") ?? true;

        try {
            const { guild, channel, user, member, client } = ctx;

            let evaled = await eval(code);
            let string = inspect(evaled);
            string = string.replace(client.token, "<Client.token>");
            let page = 0;

            /**
             * Divides a string into parts of a specified length.
             * @param {string} str - The input string.
             * @param {number} len - The maximum length of each part.
             * @returns {string[]} An array of string parts.
             */
            function getParts(str, len) {
                const res = [];
                while (str.length) {
                    res.push(`${str.substring(0, len)}`);
                    str = str.substring(len);
                }
                return res;
            }

            const descrip = getParts(string, 2040);
            const embe = {
                title: "Code Evaluation",
                color: config.colors.main,
                timestamp: new Date().toISOString(),
            };

            if (descrip.length > 1) {
                embe.description = `\`\`\`js\n${descrip[0]}\`\`\``;
                embe.footer = { text: `Page 1 of ${descrip.length}` };
                let row = {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            style: 1,
                            label: "First",
                            custom_id: "ffff",
                        },
                        {
                            type: 2,
                            style: 3,
                            label: "Backward",
                            custom_id: "prev",
                        },
                        {
                            type: 2,
                            style: 4,
                            label: "Close",
                            custom_id: "home",
                        },
                        {
                            type: 2,
                            style: 3,
                            label: "Forward",
                            custom_id: "next",
                        },
                        {
                            type: 2,
                            style: 1,
                            label: "Last",
                            custom_id: "last",
                        },
                    ],
                };
                
                let utilbuttons = {
                    "type": 1,
                    "components": [
                        {
                            "type": 2,
                            "style": 2,
                            "label": "Download",
                            "custom_id": "download_menu"
                        }
                    ]
                }

                let downloadbuttons = {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            style: 2,
                            label: "Download All Pages",
                            custom_id: "downloadallpages",
                        },
                        {
                            type: 2,
                            style: 2,
                            label: "Download Page",
                            custom_id: "downloadpage",
                        },
                        {
                            type: 2,
                            style: 2,
                            label: "View All Pages",
                            custom_id: "viewallpages",
                        },
                    ],
                };

                const msg = await ctx.reply({
                    embeds: [embe],
                    components: [row, utilbuttons],
                    ephemeral: ephemeralOption,
                });

                const collector = msg.createMessageComponentCollector({
                    time: 120000,
                });

                collector.on("collect", async (x) => {
                    x.deferUpdate();

                    switch (x.customId) {
                        case "prev":
                            collector.resetTimer();
                            page--;
                            if (page < 0) page = descrip.length - 1;
                            embe.description = `\`\`\`js\n${descrip[page]}\`\`\``;
                            embe.footer = { text: `Page ${page + 1} of ${descrip.length}` };
                            msg.edit({ embeds: [embe], components: [row, utilbuttons] });
                            break;
                        case "next":
                            collector.resetTimer();
                            page++;
                            if (page >= descrip.length) page = 0;
                            embe.description = `\`\`\`js\n${descrip[page]}\`\`\``;
                            embe.footer = { text: `Page ${page + 1} of ${descrip.length}` };
                            msg.edit({ embeds: [embe], components: [row, utilbuttons] });
                            break;
                        case "ffff":
                            collector.resetTimer();
                            page = 0;
                            embe.description = `\`\`\`js\n${descrip[page]}\`\`\``;
                            embe.footer = { text: `Page 1 of ${descrip.length}` };
                            msg.edit({ embeds: [embe], components: [row, utilbuttons] });
                            break;
                        case "last":
                            collector.resetTimer();
                            page = descrip.length - 1;
                            embe.description = `\`\`\`js\n${descrip[page]}\`\`\``;
                            embe.footer = {
                                text: `Page ${descrip.length} of ${descrip.length}`,
                            };
                            msg.edit({ embeds: [embe], components: [row, utilbuttons] });
                            break;
                        case "download_menu":
                            collector.resetTimer();
                            ctx.followUp({ content: " ", components: [downloadbuttons], ephemeral: true });
                            break;
                        case "downloadpage":
                            collector.resetTimer();
                            const codeFile = new AttachmentBuilder(
                                Buffer.from(descrip[page]),
                                { name: "code.js" }
                            );
                            await ctx.followUp({ files: [codeFile], ephemeral: true });
                            break;
                        case "downloadallpages":
                            collector.resetTimer();
                            const allpagesFile = new AttachmentBuilder(
                                Buffer.from(descrip.join("")),
                                { name: "code.js" }
                            );
                            await ctx.followUp({ files: [allpagesFile], ephemeral: true });
                            break;
                        case "viewallpages":
                            collector.resetTimer();
                            for (let index = 0; index < descrip.length; index++) {
                                const pageEmbed = {
                                    title: `Page ${index + 1} of ${descrip.length}`,
                                    description: codeBlock("js", descrip[index]),
                                    color: config.colors.main,
                                    timestamp: new Date().toISOString(),
                                };
                                await ctx.followUp({ embeds: [pageEmbed], ephemeral: true });
                            }
                            break;
                        default:
                            collector.stop();
                            msg
                                .delete({ reason: "Finished evaluating code" })
                                .catch(() => { });
                    }
                });

                collector.on("end", async (x) => {
                    row.components = row.components.map((c) => ({ ...c, disabled: true }));
                    utilbuttons.components = utilbuttons.components.map((c) => ({ ...c, disabled: true }));
                    msg.edit({ components: [row, utilbuttons] }).catch(() => { });
                });
            } else {
                embe.description = `\`\`\`js\n${descrip[0]}\`\`\``;
                ctx.reply({
                    embeds: [embe],
                    ephemeral: ephemeralOption,
                });
            }
        } catch (err) {
            if (typeof err === "string") {
                err = err
                    .replace(/`/g, "`" + String.fromCharCode(8203))
                    .replace(/@/g, "@" + String.fromCharCode(8203));
            }
            console.log(err);
            if (err.length > 1970) err = err.slice(0, 1970) + "....";
            if (ctx.replied || ctx.deferred) {
                await ctx.followUp({
                    content: `\`\`\`\js\n${err}\n\`\`\``,
                    ephemeral: ephemeralOption,
                });
            } else {
                await ctx.reply({
                    content: `\`\`\`\js\n${err}\n\`\`\``,
                    ephemeral: ephemeralOption,
                });
            }
        }
    },
};
