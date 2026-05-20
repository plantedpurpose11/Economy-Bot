const axios = require('axios');
const { MessageEmbed, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'woof',
  description: 'Send random anime GIFs based on actions',
  usage: 'woof <mention_user>',
  run: async(client, message, args) => {
    const action = 'hug'; 

    if (args.length !== 1) {
      message.reply('Please use the correct format: woof <mention_user>.');
      return;
    }

    const taggedUser = message.mentions.users.first();

    if (!taggedUser) {
      message.reply('Please mention a user.');
      return;
    }

    const apiUrl = `https://nekos.life/api/v2/img/${action}`;
    
    try {
      const response = await axios.get(apiUrl);
      const gifUrl = response.data.url;

      const embed = new EmbedBuilder()
        .setColor('Random')
        .setDescription(`${taggedUser}, ${message.author} sent a ${action}!`)
        .setImage(gifUrl);

      message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      message.reply('Failed to fetch the GIF. Please try again later.');
    }
  },
};

