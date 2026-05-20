// Assuming you have models for CommonAnimal, RareAnimal, LegendaryAnimal, and User
const { CommonAnimal, RareAnimal, LegendaryAnimal } = require("../../Schemas.js/userJungle");
const User = require('../../Schemas.js/userAccountCreation');
const config = require('../../../config.json');

module.exports = {
  name: 'inventoryremove',
  description: 'Remove inventory of a user',
  run: async (client, message, args) => {
    if (!isAdminOrOwner(message.author.id)) {
      return message.reply('You do not have permission to use this command.');
    }

    const userId = args[0];

    if (!userId) {
      return message.reply("`inventoryremove <userId>`");
    }

    try {
      const user = await User.findOne({ userId });
      
      if (!user) {
        return message.reply('User not found.');
      }

      const isInventoryEmpty = await CommonAnimal.findOne({ userId }) === null &&
                               await RareAnimal.findOne({ userId }) === null &&
                               await LegendaryAnimal.findOne({ userId }) === null;

      if (isInventoryEmpty) {
        return message.reply(`The inventory for user **${user.userName}** (ID: ${userId}) is already empty.`);
      }

      await CommonAnimal.deleteMany({ userId });
      await RareAnimal.deleteMany({ userId });
      await LegendaryAnimal.deleteMany({ userId });

      return message.reply(`Inventory removed successfully for user **${user.userName}** (ID: ${userId}).`);
    } catch (error) {
      console.error('Error:', error);
      return message.reply('An error occurred while removing inventory.');
    }
  },
};

function isAdminOrOwner(userId) {
  
  const adminUserIds = config.adminIds; 
  return adminUserIds.includes(userId);
}
