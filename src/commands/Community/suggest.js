const { SlashCommandBuilder, EmbedBuilder, embedLength } = require('discord.js');
const config = require('../../../config.json');
let timeout = [];

module.exports = {
    data: new SlashCommandBuilder()
    .setName('suggest')
    .setDescription('Suggest us how to make the bot better')
    .addStringOption(option => option.setName('message').setDescription('Write your suggestion here.').setRequired(true)),
    async execute (interaction, client) {
        

        if (timeout.includes(interaction.user.id)) return await interaction.reply({ content: 'You are on a cooldown, try again in 1 minute.', ephemeral: true})


        const { options, guild } = interaction; 
        const guildId = guild.id;
        const message = options.getString('message');
        const user = interaction.user;
        const tag = user.tag;
        const name = guild;
        const suggestionChannel = config.suggestionChannel;
        const channel = await client.channels.cache.get(suggestionChannel); 
        const supportServer = config.supportServer;
        
        embed = new EmbedBuilder()
        .setColor('#00c7fe')
        .setTitle('EcoPaL Suggestions')
        .addFields({ name: 'Server Name:', value: `${name}`})
        .addFields({ name: 'Server ID:', value: `${guildId}`})
        .addFields({ name: 'Send By:', value: `${tag} | ${user.id}`})
        .setDescription(`Suggestion: ${message}`)
        

        dmEmbed = new EmbedBuilder()
        .setColor('#00c7fe')
        .setDescription(`Your Suggestion is submitted, please join [support server](${supportServer}) so you never miss an updates. Thanks!`)

        embed1 = new EmbedBuilder()
        .setColor('#00c7fe')
        .setDescription(`✅ Successfully Submitted your suggestion.`)

        
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