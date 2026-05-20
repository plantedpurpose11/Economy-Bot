const { SlashCommandBuilder, EmbedBuilder, embedLength } = require('discord.js');
const config = require('../../../config.json');
let timeout = [];

module.exports = {
    data: new SlashCommandBuilder()
    .setName('report')
    .setDescription('Report the bugs & issues of EcoPaL.')
    .addStringOption(option => option.setName('message').setDescription('Please write the issue you want to report.').setRequired(true)),
    async execute (interaction, client) {
        

        if (timeout.includes(interaction.user.id)) return await interaction.reply({ content: 'You are on a cooldown, try again in 1 minute.', ephemeral: true})


        const { options, guild } = interaction; 
        const guildId = guild.id;
        const message = options.getString('message');
        const user = interaction.user;
        const tag = user.tag;
        const name = guild;
        const reportChannel = config.REPORT_CHANNEL;
        const channel = await client.channels.cache.get(reportChannel); 
        const supportServer = config.supportServer;
        
        
        embed = new EmbedBuilder()
        .setColor('#00c7fe')
        .setTitle('EcoPaL Reports')
        .addFields({ name: 'Server Name:', value: `${name}`})
        .addFields({ name: 'Server ID:', value: `${guildId}`})
        .addFields({ name: 'Send By:', value: `${tag} | ${user.id}`})
        .setDescription(`Report Message: ${message}`)
        
        

        dmEmbed = new EmbedBuilder()
        .setColor('#00c7fe')
        .setDescription(`Your report is submitted, please join [support server](${supportServer}) so you never miss an updates. Thanks!`)

        embed1 = new EmbedBuilder()
        .setColor('#00c7fe')
        .setDescription(`✅ Successfully Submitted your report.`)

        
        await channel.send({ embeds: [embed]});
        await interaction.reply({ embeds: [embed1] });
        await user.send({ embeds: [dmEmbed] }).catch(err => {
            return;
        });
        
        timeout.push(interaction.user.id);
        setTimeout(() => {
            timeout.shift();
        }, 60000)

    }
}