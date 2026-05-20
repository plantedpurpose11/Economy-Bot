const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { config } = require('../../../config.json');


module.exports = {
    data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('Gives bot stats.'),
    async execute (interaction, client) {

        const name = "EcoPaL";
        const icon = `${client.user.displayAvatarURL()}`;
        let servercount = await client.guilds.cache.reduce((a,b) => a+b.memberCount, 0)

        let totalSeconds = (client.uptime / 1000);
        let days = Math.floor(totalSeconds / 86400);
        totalSeconds %= 86400;
        let hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = Math.floor(totalSeconds % 60);

        let uptime = `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`;

        let ping = `${Date.now() - interaction.createdTimestamp}ms.`;
        const botInviteLink = process.env.botInviteLink;
        const supportServer = config.supportServer

        const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
            .setLabel('Support Server')
            .setStyle(ButtonStyle.Link)
            .setURL(supportServer),

            new ButtonBuilder()
            .setLabel('Invite Me')
            .setStyle(ButtonStyle.Link)
            .setURL(botInviteLink)

        )

        const embed = new EmbedBuilder()
        .setColor('#00c7fe')
        .setAuthor({ name: name, iconURL: icon })
        .setThumbnail(`${icon}`)
        .setTimestamp()
        .addFields({ name: 'Server Numbers', value: `${client.guilds.cache.size}`, inline: true})
        .addFields({ name: 'Server Members', value: `${servercount}`, inline: true})
        .addFields({ name: 'Latency', value: `${ping}`, inline: true})
        .addFields({ name: 'Uptime', value: `\`\`\`${uptime}\`\`\``, inline: true})


        await interaction.reply({ embeds: [embed], components: [row] });
    }
}