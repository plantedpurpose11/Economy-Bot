const Gems = require("../../Schemas.js/gemsSchema");
const User = require("../../Schemas.js/userAccountCreation");
const emojis = require("../../../emojis.json");

const gemsArray = [
  {
    name: "BeastCharm",
    emoji: emojis.beastCharm,
    price: 120000,
    description:
      "If you have activated this gem, you will get 12 animals every time you search for animals.",
  },
  {
    name: "BountyBoost",
    emoji: emojis.bountyBoost,
    price: 150000,
    description:
      "If this gem is active then you can search more animals in 10 EP Coins.",
  },
  {
    name: "RapidBloom",
    emoji: emojis.rapidBloom,
    price: 230000,
    description:
      "If this gem is active then the growth time of your plant will be less.",
  },
  {
    name: "ChanceCharm",
    emoji: emojis.chanceCharm,
    price: 175000,
    description:
      "If this gem is active then when you coinflip your win chances will increase by 10%.",
  },
  {
    name: "PredatorsEdge",
    emoji: emojis.predatorsEdge,
    price: 35000,
    description:
      "If this gem is active then you will get good levels and attack animals.",
  },
  {
    name: "HarvestAmplifier",
    emoji: emojis.harvestAmplifier,
    price: 360000,
    description:
      "If this gem is active, you will get more sell price when you sell your boxes.",
  },
  // Add more gems here
];
 
module.exports = {
  name: "buygem",
  aliases: ["bg"],

  run: async (client, message, args) => {
    try {
      const gemName = args.join(" ").toLowerCase(); // Get the gem name from the command
      const user = message.author;

      // Check if the user has an account
      const userAccount = await User.findOne({ userId: user.id });
      if (!userAccount) {
        return message.reply("You don't have an account. Use `ep start` to create one.");
      }

      // Find the gem in the gemsArray (replace this with your method to fetch gem details)
      const gem = gemsArray.find((gem) => gem.name.toLowerCase() === gemName);
      if (!gem) {
        return message.reply("That gem isn't available in the market.");
      }

      // Check if the user has enough balance to buy the gem
      if (userAccount.balance < gem.price) {
        return message.reply(`You don't have enough balance to buy this gem. You need ${gem.price.toLocaleString()} ${emojis.currencyEmoji} EP coins.`);
      }

      // Check if the user already owns this gem
      const userGems = userAccount.gems || [];
      const existingGem = userGems.find((userGem) => userGem.gemType === gemName);

      if (existingGem) {
        // If the user already has this gem, increment the count by 10
        existingGem.count += 10;
        userAccount.balance -= gem.price;
      } else {
        // If the user doesn't have this gem, add it to their collection with a count of 10
        userGems.push({
          gemType: gemName,
          emoji: gem.emoji, // Save the gem emoji
          count: 10,
        });

        // Deduct the gem price from the user's balance
        userAccount.balance -= gem.price;
      }

      // Update the user's gems and balance in the database
      await User.findOneAndUpdate(
        { userId: user.id },
        { balance: userAccount.balance, gems: userGems }
      );

      // Update the Gems schema with the purchased gem if it's not already there
      let userGemsDoc = await Gems.findOne({ userId: user.id });
      if (!userGemsDoc) {
        userGemsDoc = new Gems({
          userId: user.id,
          gems: [],
        });
      }

      const gemToUpdate = userGemsDoc.gems.find((g) => g.gemType === gemName);
      if (gemToUpdate) {
        gemToUpdate.count += 10; // Increment the count by 10 if the gem already exists
      } else {
        userGemsDoc.gems.push({
          gemType: gemName,
          emoji: gem.emoji,
          count: 10, // Set the count to 10 for the newly purchased gem
        });
      }
      await userAccount.save();
      await userGemsDoc.save();

      return message.reply(`You have successfully purchased **${gemName}** ${gem.emoji} for ${gem.price.toLocaleString()} ${emojis.currencyEmoji} EP coins.`);
    } catch (err) {
      console.error("Error:", err);
      return message.reply("An error occurred while processing your purchase.");
    }
  },
};