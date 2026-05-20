const { MessageAttachment, AttachmentBuilder } = require('discord.js');
const { Image } = require('canvafy');

module.exports = {
  name: 'beautiful',
  description: 'Create a beautiful image with your avatar or the mentioned user\'s avatar.',
  run: async (client, message, args) => {
    try {
      let avatarURL;

      if (args.length === 0) {
        // If no mention, use the message author's avatar
        avatarURL = message.author.displayAvatarURL({ format: 'png', dynamic: true, size: 512 });
      } else if (message.mentions.users.size > 0) {
        // If there's a mention, use the mentioned user's avatar
        const mentionedUser = message.mentions.users.first();
        avatarURL = mentionedUser.displayAvatarURL({ format: 'png', dynamic: true, size: 512 });
      } else {
        // Invalid usage
        return message.channel.send('Invalid usage. Use `beautifull` or `beautifull @user`.');
      }

      // Generate a beautiful image with the avatar
      const beautifulImage = await Image.beautiful(avatarURL);

      // Send the beautiful image as a reply
      message.reply({
        files: [new AttachmentBuilder(beautifulImage, 'beautiful.png')],
      });
    } catch (error) {
      console.error('Error creating beautiful image:', error);
      message.channel.send('An error occurred while creating the beautiful image.');
    }
  },
};
