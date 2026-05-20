const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const translate = require('translate-google');



module.exports = {
    data: new SlashCommandBuilder()
    .setName('translate')
    .setDescription('Use the translation system to translate individual words or even entire sentences.')

    .addStringOption(stringOption => stringOption
        .setName('text')
        .setDescription('What do you want to translate?')

        .setRequired(true))
    .addStringOption(stringOption => stringOption
        .setName('to')
        .setDescription('What language do you want to translate it into?')

        .setRequired(true)

        .addChoices(
            {
                name: 'Afrikaans',
                value: 'af',
            },
            {
                name: 'Albanian',
                value: 'sq',
            },
            {
                name: 'Arabic',
                value: 'ar',
            },
            {
                name: 'Armenian',
                value: 'hy',
            },
            {
                name: 'Azerbaijani',
                value: 'az',
            },
            {
                name: 'Basque',
                value: 'eu',
            },
            {
                name: 'Belarusian',
                value: 'be',
            },
            {
                name: 'Bengali',
                value: 'bn',
            },
            {
                name: 'Bosnian',
                value: 'bs',
            },
            {
                name: 'Bulgarian',
                value: 'bg',
            },
            {
                name: 'Croatian',
                value: 'hr',
            },
            {
                name: 'Czech',
                value: 'cs',
            },
            {
                name: 'English',
                value: 'en',
            },
            {
                name: 'Georgian',
                value: 'ka',
            },
            {
                name: 'German',
                value: 'de',
            },
            
            {
                name: 'Italian',
                value: 'it',
            },
            {
                name: 'Latin',
                value: 'la',
            },
            {
                name: 'Polish',
                value: 'pl',
            },
            {
                name: 'Romanian',
                value: 'ro',
            },
            {
                name: 'Russian',
                value: 'ru',
            },
            {
                name: 'Hindi',
                value: 'hi'
            },
            {
                name: 'Urdu',
                value: 'ur'
            },
            
            {
                name: 'Turkish',
                value: 'tr',
            }
        ))
        .addBooleanOption(option =>
            option
                .setName('hidden')
                .setDescription('Should the response be hidden?')
                .setRequired(false)
        ),
        async execute(interaction) {
            const { options } = interaction;
            const text = options.getString('text');
            const to = options.getString('to');
            const hidden = options.getBoolean('hidden') || false; // Default to false if not provided
    
            await interaction.deferReply({ ephemeral: hidden });
            // await interaction.deferReply({ ephemeral: true });
            await interaction.editReply(
                {
                    content: 'Your message is being translated, please wait…'
                }
            );
            try {
                const translatedText = await translate(text, { to });
                // const response = hidden ? { ephemeral: true } : { ephemeral: false };
    
                const embed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle('Translation Result')
                    .setDescription(`Original: ${text}\nTranslated: **${translatedText}**`)
                    .setFooter({ text:`Translated to: ${to.toUpperCase()}`});
    
                await interaction.editReply({ content: '', embeds: [embed] });
            } catch (error) {
                console.error(error);
                await interaction.editReply('There was an error while translating.');
            }
        },
    };