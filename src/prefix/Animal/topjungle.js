const JunglePoints = require('../../Schemas.js/junglePointsSchema');
const User = require('../../Schemas.js/userAccountCreation');

module.exports = {
  name: 'topjungle',
  aliases: ['topj'],
  description: 'Display top users based on jungle points',

  run: async (client, message, args) => {
    try {
      const topUsers = await JunglePoints.find({})
        .sort({ totalPoints: -1 }) // Sort by totalPoints in descending order
        .limit(15); // Get the top 15 users

      if (!topUsers.length) {
        return message.channel.send('No users found!');
      }

      let leaderboard = ':palm_tree: **Top 15 Jungle Leaders** :palm_tree:\n\n';

      for (let i = 0; i < topUsers.length; i++) {
        const user = topUsers[i];
        const userInfo = await User.findOne({ userId: user.userId });

        if (userInfo) {
          const username = userInfo.userName;
          leaderboard += `\`${i + 1}. ${username}: ${user.totalPoints.toLocaleString()} points\`\n`;
        }
      }

      message.channel.send(leaderboard);
    } catch (err) {
      console.error('Error:', err);
      message.reply('An error occurred while fetching the jungle leaderboard.');
    }
  },
};
