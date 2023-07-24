const {
    SlashCommandBuilder,
    AttachmentBuilder,
    codeBlock,
    ChatInputCommandInteraction
} = require("discord.js");
const { inspect } = require("util");
const { disableComponents } = require("../../functions");

module.exports = {
    category: "developer",
    devOnly: true,
    data: new SlashCommandBuilder()
        .setName("eval")
        .setDescription("Evaluates arbitrary JavaScript code.")
        .addStringOption((option) =>
            option.setName("code").setDescription("The JavaScript code to evaluate.")
        ),
    /**
     * 
     * @param {ChatInputCommandInteraction} ctx 
     * @returns 
     */
    async execute(ctx) {
        const code = ctx.options.getString("code");

        if (!code) {
            return ctx.reply({
                content: "Please provide some code to evaluate!",
                ephemeral: true,
            });
        }

        try {
            const { guild, channel, user, member, client } = ctx;

            let evaled = await eval(code);
            let string = inspect(evaled);
            let page = 0;

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
                color: 0xf0c8d8,
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
                            label: "Prev",
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
                            label: "Next",
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
                    ephemeral: true,
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
                            embe.description = `\`\`\`js\n${descrip[0]}\`\`\``;
                            embe.footer = { text: `Page 1 of ${descrip.length}` };
                            msg.edit({ embeds: [embe], components: [row, utilbuttons] });
                            break;
                        case "last":
                            collector.resetTimer();
                            embe.description = `\`\`\`js\n${descrip[descrip.length - 1]
                                }\`\`\``;
                            embe.footer = {
                                text: `Page ${descrip.length} of ${descrip.length}`,
                            };
                            msg.edit({ embeds: [embe], components: [row, utilbuttons] });
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
                            descrip.forEach(async (page, index) => {
                                const pageEmbed = {
                                    title: `Page ${index + 1} of ${descrip.length}`,
                                    description: codeBlock("js", page),
                                    color: 0xf0c8d8,
                                    timestamp: new Date().toISOString(),
                                };
                                await ctx.followUp({ embeds: [pageEmbed], ephemeral: true });
                            });
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
                    msg.edit({ components: [row, utilbuttons] }).catch(() => {});
                });
            } else {
                embe.description = `\`\`\`js\n${descrip[0]}\`\`\``;
                ctx.reply({
                    embeds: [embe],
                    ephemeral: true,
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
                    ephemeral: true,
                });
            } else {
                await ctx.reply({
                    content: `\`\`\`\js\n${err}\n\`\`\``,
                    ephemeral: true,
                });
            }
        }
    },
};
