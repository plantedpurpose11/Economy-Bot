const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { config } = require('../../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('security')
        .setDescription('View security guard details'),

    async execute(interaction, client) {
        const securityGuardEmoji = '👮'; 
        const securityGuardPrice = config.securityGuardPrice || '10000'; 

        // Create an embed with security guard details
        const embed = new EmbedBuilder()
            .setTitle('Security Guard')
            .setDescription(`${securityGuardEmoji} Purchase this security guard for **${securityGuardPrice}**.\n\nOnce purchased, no one can rob you!`)
            .setColor('#FFA500'); // You can change the color as desired

        // Send the embed in the channel
        await interaction.reply({ embeds: [embed] });
    },
};
