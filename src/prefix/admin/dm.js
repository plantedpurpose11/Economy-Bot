const config = require('../../../config.json');


module.exports = {
    name: 'dm',
    description: 'Send a direct message to a user',
    usage: 'dm <user ID> <message>',
    run: async (client, message, args) => {
      const adminIDs = config.adminIds; 
      
      if (!adminIDs.includes(message.author.id)) {
        return message.reply('You do not have permission to use this command.');
      }
  
      const userId = args[0];
      const user = await client.users.fetch(userId);
      if (!user) {
        return message.reply('User not found!');
      }
  
      const dmMessage = args.slice(1).join(' ');
      try {
        await user.send(dmMessage);
        message.reply(`Successfully sent a DM to ${user.tag}: ${dmMessage}`);
      } catch (error) {
        console.error('Error sending DM:', error);
        message.reply(`Failed to send a DM to ${user.tag}.`);
      }
    },
  };
  