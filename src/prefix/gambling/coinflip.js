const User = require("../../Schemas.js/userAccountCreation");
const Blacklist = require("../../Schemas.js/BlacklistSchema");
const Gem = require("../../Schemas.js/gemsSchema");
const emojis = require("../../../emojis.json");

async function isUserBlacklisted(userId) {
  const entry = await Blacklist.findOne({ userId });
  return entry !== null;
}

const timeout = [];

module.exports = {
  name: "coinflip",
  aliases: ["flip", "toss", "cf", "CF", "Coinflip"],
  description: "Flip a coin",
  usage: "coinflip <heads or tails> <amount>",

  run: async (client, message, args) => {
    const isBlacklisted = await isUserBlacklisted(message.author.id);
    if (isBlacklisted) {
      return message.reply("You are blacklisted and cannot use this command.");
    }

    try {
      const user = await User.findOne({ userId: message.author.id });
      const userGems = await Gem.findOne({ userId: message.author.id });

      const chanceCharmGem = userGems ? userGems.gems.find(
        (gem) => gem.gemType === "chancecharm" && gem.activated && gem.count > 0
      ) : null;

      const winChance = chanceCharmGem ? 0.6 : 0.5;

      if (timeout.includes(message.author.id)) {
        const reply = await message.reply({
          content: "You are on a cooldown. Please wait 7 seconds!",
          ephemeral: true,
        });

        setTimeout(() => {
          reply.delete().catch(console.error);
        }, 2000);

        return;
      }

      timeout.push(message.author.id);
      setTimeout(() => {
        timeout.shift();
      }, 7000);

      let choice = args[0]?.toLowerCase();
      let amount = parseInt(args[1]);

      if (!choice || !["heads", "tails", "h", "t"].includes(choice)) {
        return message.reply(
          "`Usage: ep cf 'heads' or 'tails' (or 'h' or 't') <coins>.`"
        );
      }

      if (["h", "t"].includes(choice)) {
        if (choice === "h") choice = "heads";
        else choice = "tails";
      }

      if (isNaN(amount)) {
        if (args[1]?.toLowerCase() === "all") {
          if (user.balance === 0) {
            return message.reply("You don't have any balance to bet!");
          }
          amount = user.balance > 200000 ? 200000 : user.balance;
        } else {
          return message.reply("Please enter a valid amount!");
        }
      } else if (amount < 1 || amount > 200000) {
        return message.reply(
          "Please enter a valid amount between 1 and 200,000 EP coins!"
        );
      }

      if (amount > user.balance) {
        return message.reply("You don't have enough balance for this bet!");
      }

      const reply = await message.reply(
        `${emojis.currencyGifEmoji} Flipping the coin... you choose **${choice}.** You bet **${amount.toLocaleString()}** ${emojis.currencyEmoji} EP coins.`
      );

      setTimeout(async () => {
        const result = Math.random() < winChance ? "heads" : "tails";
        const isWin = result === choice;

        const resultAmount = isWin ? amount : -amount;
        user.balance += resultAmount;
        await user.save();

        const outcome = isWin ? "You won!" : "You lost!";
        const newBalance = user.balance < 0 ? 0 : user.balance;

        let activatedGems = "";

        if (chanceCharmGem && chanceCharmGem.activated) {
          activatedGems += ` ${chanceCharmGem.emoji}`;
        }

        let activatedGemMessage = "";
        if (activatedGems !== "") {
          activatedGemMessage = `\n\n**Activated Gem**:${activatedGems}`;
        }

        await reply.edit(
          `${outcome}. The result was **${result}**. Your new balance is: **__${newBalance.toLocaleString()}__** ${emojis.currencyEmoji} EP coins.${activatedGemMessage}`
        );

        if (chanceCharmGem) {
          chanceCharmGem.count -= 1;

          if (chanceCharmGem.count === 0) {
            chanceCharmGem.activated = false;
          }

          userGems.save();
        }
      }, 2000);
    } catch (err) {
      console.error("Error:", err);
      message.reply("An error occurred while processing the coinflip.");
    }
  },
};
