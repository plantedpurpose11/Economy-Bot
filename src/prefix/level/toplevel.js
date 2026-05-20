const Level = require('../../Schemas.js/levelSchema');
const { Top } = require('canvafy');

module.exports = {
  name: 'toplevel',
  description: 'Display the top 10 users globally based on their levels.',
  run: async (client, message, args) => {
    try {
      const topUsers = await Level.find({}).sort({ level: -1 }).limit(10);

      if (topUsers.length > 0) {
        const usersData = await Promise.all(topUsers.map(async (user, index) => {
          // Fetch Discord user data
          let member;
          try {
            member = await client.users.fetch(user.userId);
          } catch (error) {
            console.error(`User not found: ${user.userId}`);
            return null;
          }

          // Use the username and avatar of the member
          const username = member.username;
          const avatar = member.displayAvatarURL({ format: 'png', dynamic: true, size: 128 });

          return {
            top: index + 1,
            avatar: avatar,
            tag: `${username}`,
            score: user.level, // Assuming level is the score
          };
        }));

        // Filter out null entries (users not found)
        const filteredUsersData = usersData.filter(user => user !== null);

        const top = await new Top()
          .setOpacity(0.6)
          .setScoreMessage('Level:')
          .setabbreviateNumber(false)
          .setBackground('image', 'https://i.ibb.co/kGVsBgN/botbanner.png')
          .setColors({ box: '#212121', username: '#ffffff', score: '#ffffff', firstRank: '#f7c716', secondRank: '#9e9e9e', thirdRank: '#94610f' })
          .setUsersData(filteredUsersData)
          .build();

        message.reply({
          files: [{
            attachment: top,
            name: `top-${message.member.id}.png`,
          }],
        });
      } else {
        message.channel.send('No users found.');
      }
    } catch (error) {
      console.error('Error fetching top users:', error);
      message.channel.send('An error occurred while fetching top users.');
    }
  },
};
