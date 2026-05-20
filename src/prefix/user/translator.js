const translate = require('translate-google');
const { MessageEmbed } = require('discord.js');
const { EmbedBuilder } = require('@discordjs/builders');
module.exports = {
    name: "translate",
    aliases: ['tl'],
    run: async (client, message, args) => {
        const textToTranslate = args.join(' ');
        if (!textToTranslate) {
            return message.reply('Please provide text!')
        }
        try {
            // Detect the language of the input text
            const detectedLanguage = await translate(textToTranslate, { from: 'auto', to: 'en' });

            // Check if the detected language is English
            if (detectedLanguage && detectedLanguage.from === 'en') {
                return message.channel.send(textToTranslate);
            }

            // Translate non-English text to English
            const translatedText = await translate(textToTranslate, { to: 'en' });

            const embed = new EmbedBuilder()
                // .setColor('#0099ff')
                .setTitle('Translated Message')
                .addFields(
                    { name: 'Original', value: textToTranslate },
                    { name: 'Translated (to English)', value: translatedText }
                )
                .setFooter({ text: `/translate to translate into 20+ languages.`})

            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Translation error:', error);
            message.channel.send('There was an error while translating.');
        }
    }
};