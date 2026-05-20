const Blacklist = require('../../Schemas.js/BlacklistSchema');
const User = require('../../Schemas.js/userAccountCreation');
const config = require('../../../config.json');

module.exports = {
  name: 'blacklistremove',
  description: 'Remove user from the blacklist',
  run: async (client, message, args) => {
    if (!isAdmin(message.author.id)) {
      return message.reply('You do not have permission to use this command.');
    }

    const userId = args[0];

    if (!userId) {
      return message.reply('Usage: `blacklistremove <userId>`');
    }

    try {
      const user = await User.findOne({ userId });
      if (!user) {
        return message.reply('User account does not exist.');
      }

      const existingEntry = await Blacklist.findOne({ userId });
      if (!existingEntry) {
        return message.reply('User is not in the blacklist.');
      }

      await Blacklist.findOneAndDelete({ userId });

      const userObj = await client.users.fetch(userId);
      userObj.send('You have been removed from the blacklist.');

      return message.reply(`User with ID **${userId}** (${user.userName}) removed from the blacklist.`);
    } catch (error) {
      console.error('Error:', error);
      return message.reply('An error occurred while removing the user from the blacklist.');
    }
  },
};

function isAdmin(userId) {
  
  const adminUserIds = config.adminIds; 
  return adminUserIds.includes(userId);
}
