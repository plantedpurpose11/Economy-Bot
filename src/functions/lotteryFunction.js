const { Lottery, UserLotteryEntry } = require('../Schemas.js/lotterySchema');
const User = require('../Schemas.js/userAccountCreation');
const Emojis = require('../../emojis.json');

module.exports = (client) => {
  client.checkLottery = async () => {
    try {
      const currentLottery = await Lottery.findOne({
        endTime: { $lte: Date.now() }, // Find lotteries whose end time is before or equal to the current time
      });

      if (!currentLottery) {
        // console.log("No ongoing lotteries.");
        return;
      }

      const allEntries = await UserLotteryEntry.find();

      if (allEntries.length === 0) {
        console.log("No entries found for the lottery.");
        return;
      }

      const randomIndex = Math.floor(Math.random() * allEntries.length);
      const winner = allEntries[randomIndex];

      const winningUser = await User.findOne({ userId: winner.userId });
      if (!winningUser) {
        // console.log("Winner not found.");
        return;
      }

      const participants = allEntries.filter(entry => entry.userId !== winner.userId);

      for (const participant of participants) {
        try {
          const user = await client.users.fetch(participant.userId);
          await user.send(`Unfortunately, your shares gone down and your all money gone. Better luck next time!`);
        } catch (error) {
          // Error sending message to user
          // Handle the error or perform any necessary actions
        }
      }

      winningUser.balance += currentLottery.totalAmount;
      await winningUser.save();

      // Notify the winner via DM
      const user = await client.users.fetch(winningUser.userId);
      const currencyEmoji = Emojis.currencyEmoji;
      user.send(`🎉 Congratulations! You've won the lottery. **${currentLottery.totalAmount}** ${currencyEmoji} EP Coin has been added to your balance.`);

      await UserLotteryEntry.deleteMany({});
      //   console.log("Lottery entries deleted.");

      await Lottery.findByIdAndDelete(currentLottery._id);
      //   console.log("Current lottery deleted.");
    } catch (err) {
      console.error("Error while checking the lottery:", err);
      // Handle any errors during the lottery check process
    }
  };
};