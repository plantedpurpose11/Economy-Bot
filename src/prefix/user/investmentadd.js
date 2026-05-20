const { Lottery, UserLotteryEntry } = require("../../Schemas.js/lotterySchema");
const User = require("../../Schemas.js/userAccountCreation");
const { EmbedBuilder } = require("discord.js");
const Blacklist = require('../../Schemas.js/BlacklistSchema');
const emojis = require("../../../emojis.json");

async function isUserBlacklisted(userId) {
  const entry = await Blacklist.findOne({ userId });
  return entry !== null; // If entry exists, user is blacklisted
}

const MAX_LOTTERY_ADDITION = 100000; // Maximum amount a user can add to the lottery
const LOTTERY_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
// const LOTTERY_DURATION = 1 * 60 * 1000; // 1 minute in milliseconds

const timeout = [];

module.exports = {
  name: "addinvestment",
  aliases: ["ainv"],
  description: "Add funds to the invesment",

  run: async (client, message, args) => {
    const isBlacklisted = await isUserBlacklisted(message.author.id);
    if (isBlacklisted) {
      return message.reply("You are blacklisted and cannot use this command.");
    }

    //command cooldown top
    if (timeout.includes(message.author.id))
      return await message.reply({
        content: "You are on a cooldown. wait 7 seconds!",
        ephemeral: true,
      });

    //command cooldown
    timeout.push(message.author.id);
    setTimeout(() => {
      timeout.shift();
    }, 7000);

    try {
      const amountToAdd = parseInt(args[0]);

      const user = await User.findOne({ userId: message.author.id });

      if (!user) {
        return message.reply(`${emojis.level} **First use** \`ep start\` **to start your journey.**`);
      }

      if (user.balance < amountToAdd) {
        return message.reply(
          `${emojis.error} You don't have enough balance to add to the investment.`
        );
      }

      if (isNaN(amountToAdd) || amountToAdd <= 0) {
        return message.reply(
          `${emojis.error} Please provide a valid amount to add to the investment.`
        );
      }

      const currentTime = Date.now();

      let currentLottery = await Lottery.findOne({
        endTime: { $gt: currentTime },
      });

      if (!currentLottery) {
        const endTime = new Date(currentTime + LOTTERY_DURATION);

        const newLottery = new Lottery({
          startTime: currentTime,
          endTime: endTime,
          totalAmount: 0, // Initializing total amount for the new lottery
        });

        currentLottery = await newLottery.save();
      }

      if (amountToAdd > MAX_LOTTERY_ADDITION) {
        return message.reply(`${emojis.error} The maximum you can add is **${MAX_LOTTERY_ADDITION.toLocaleString()}** ${emojis.currencyEmoji} EP coins.`);
      }

      let userEntry = await UserLotteryEntry.findOne({
        userId: message.author.id,
      });

      if (userEntry) {
        // If the user already entered, update the existing entry
        if (userEntry.amountAdded >= MAX_LOTTERY_ADDITION) {
          return message.reply(
            `${emojis.error} You have already reached the maximum limit for adding funds to the investment.`
          );
        }
        // Calculate the remaining amount the user can add to reach the maximum limit
        const remainingAmountToAdd =
          MAX_LOTTERY_ADDITION - userEntry.amountAdded;

        if (amountToAdd > remainingAmountToAdd) {
          return message.reply(
            `${emojis.error} You can only add **__${remainingAmountToAdd.toLocaleString()}__** ${emojis.currencyEmoji} EP coins to reach the maximum limit.`
          );
        }

        userEntry.amountAdded += amountToAdd;
        userEntry.chancesOfWinning =
          userEntry.amountAdded / MAX_LOTTERY_ADDITION;
        await userEntry.save();
      } else {
        // If it's the first entry, create a new UserLotteryEntry
        userEntry = new UserLotteryEntry({
          userId: message.author.id,
          amountAdded: amountToAdd,
          chancesOfWinning: amountToAdd / MAX_LOTTERY_ADDITION,
        });
        await userEntry.save();
      }

      // Update total amount in the lottery globally
      currentLottery.totalAmount += amountToAdd;
      await currentLottery.save();

      // Deduct the amount from the user's balance
      user.balance -= amountToAdd;
      await user.save();

      // Calculate remaining time in hours, minutes, and seconds
      const remainingTime = currentLottery.endTime - currentTime;
      const remainingHours = Math.floor(remainingTime / (60 * 60 * 1000));
      const remainingMinutes = Math.floor(
        (remainingTime % (60 * 60 * 1000)) / (60 * 1000)
      );
      const remainingSeconds = Math.floor((remainingTime % (60 * 1000)) / 1000);

      const embed = new EmbedBuilder()
        .setTitle(`${emojis.investment} Investment Details`)
        .setDescription(
          `${emojis.success} You added \`\`\`${amountToAdd.toLocaleString()}\`\`\` ${emojis.currencyEmoji} EP coins to the investment.\n` +
          `${emojis.time} Remaining time: \`\`\`${remainingHours} hours, ${remainingMinutes} minutes, ${remainingSeconds} seconds\`\`\`\n` +
          `${emojis.wallet} Your total added amount: \`\`\`${userEntry.amountAdded.toLocaleString()}\`\`\` ${emojis.currencyEmoji} EP coins\n` +
          `${emojis.bank} Total investment pool: \`\`\`${currentLottery.totalAmount.toLocaleString()}\`\`\` ${emojis.currencyEmoji} EP coins\n` +
          `${emojis.chart} Your Shares: \`\`\`${(userEntry.chancesOfWinning * 100).toFixed(2)}%\`\`\``
        )
        .setColor(0x00ff00);

      message.channel.send({ embeds: [embed] });
    } catch (err) {
      console.error("Error:", err);
      return message.reply(
        `${emojis.maintenance} An error occurred while processing the investment addition.`
      );
    }
  },
};
