const { SlashCommandBuilder } = require('discord.js');
const Security = require('../../Schemas.js/securitySchema');
const UserAccount = require('../../Schemas.js/userAccountCreation');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('buysecurity')
        .setDescription('Purchase security guard'),

    async execute(interaction, client) {
        const userId = interaction.user.id;

        try {
            // Check if the user has an account
            let userAccount = await UserAccount.findOne({ userId });

            if (!userAccount) {
                return interaction.reply('You do not have an account.');
            }

            // Check the user's balance
            const balance = userAccount.balance;

            // Check if the user already has security
            const existingSecurity = await Security.findOne({ userId });

            if (existingSecurity) {
                return interaction.reply('You already have security.');
            }

            const securityPrice = 1000000; // Replace with the actual price
            if (balance < securityPrice) {
                return interaction.reply('You do not have enough coins to purchase security.');
            }

            // Deduct the price from the user's balance
            userAccount.balance -= securityPrice;
            await userAccount.save();

            // Add the security to the user's data
            const newSecurity = new Security({ userId, hasSecurity: true });
            await newSecurity.save();

            return interaction.reply('Security guard purchased successfully!');
        } catch (error) {
            console.error('Error while purchasing security:', error);
            return interaction.reply('There was an error processing your request.');
        }
    },
};
