const config = require('../../../config.json');

const Blacklist = require('../../Schemas.js/BlacklistSchema');
const User = require('../../Schemas.js/userAccountCreation');

module.exports = {
  name: 'blacklistadd',
  description: 'Add user to the blacklist',
  run: async (client, message, args) => {
    if (!isAdmin(message.author.id)) {
      return message.reply('You do not have permission to use this command.');
    }

    const userId = args[0];
    const reason = args.slice(1).join(' ');

    if (!userId || !reason) {
      return message.reply('Usage: `blacklistadd <userId> <reason>`');
    }

    try {
      const user = await User.findOne({ userId });
      if (!user) {
        return message.reply('User account does not exist.');
      }

      const existingEntry = await Blacklist.findOne({ userId });
      if (existingEntry) {
        return message.reply('User is already in the blacklist.');
      }

      await Blacklist.create({ userId, reason });

      const userObj = await client.users.fetch(userId);
      userObj.send(`You have been blacklisted from using certain features. Reason: ${reason}`);

      return message.reply(`User with ID **${userId}** (${user.userName}) added to the blacklist with reason: ${reason}`);
    } catch (error) {
      console.error('Error:', error);
      return message.reply('An error occurred while adding the user to the blacklist.');
    }
  },
};

function isAdmin(userId) {
  const adminUserIds = config.adminIds; 
  return adminUserIds.includes(userId);
}
