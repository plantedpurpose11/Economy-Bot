const Plant = require("../../Schemas.js/plantSchema");
const Farm = require("../../Schemas.js/farmSchema");
const Box = require("../../Schemas.js/boxSchema");
const Blacklist = require("../../Schemas.js/BlacklistSchema");
const User = require("../../Schemas.js/userAccountCreation");
const Gem = require("../../Schemas.js/gemsSchema");
const emojis = require("../../../emojis.json");

async function isUserBlacklisted(userId) {
  const entry = await Blacklist.findOne({ userId });
  return entry !== null; // If entry exists, user is blacklisted
}

var timeout = [];
module.exports = {
  name: "harvest",
  run: async (client, message, args) => {
    const isBlacklisted = await isUserBlacklisted(message.author.id);
    if (isBlacklisted) {
      return message.reply("You are blacklisted and cannot use this command.");
    }

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

    try {
      const userAccount = await User.findOne({ userId: message.author.id });

      if (!userAccount) {
        return message.reply("You don't have an account yet!");
      }

      const userId = message.author.id;

      const userPlants = await Plant.find({ userId });
      if (userPlants.length === 0) {
        return message.reply("You haven't planted any seeds yet.");
      }

      const userGems = await Gem.findOne({ userId: message.author.id });
      const rapidBloomGem = userGems ? userGems.gems.find(
        (gem) => gem.gemType === "rapidbloom" && gem.activated && gem.count > 0
      ) : null;

      const currentTime = new Date();
      const maturityTime =
        rapidBloomGem && rapidBloomGem.activated
          ? 1 * 60 * 60 * 1000
          : 2 * 60 * 60 * 1000;

      const readyForHarvest = userPlants.some((plant) => {
        const plantingTime = plant.plantTime.getTime();
        const timeElapsed = currentTime - plantingTime;
        return timeElapsed >= maturityTime;
      });

      if (!readyForHarvest) {
        return message.reply("Your plants are not yet ready for harvest.");
      }

      const userFarm = await Farm.findOne({ userId });
      if (!userFarm) {
        return message.reply("You need to have a farm to harvest.");
      }

      const seedsToAdd = {
        Carrot_Seeds: 0,
        Rose_Seeds: 0,
        Rice_Seeds: 0,
      };

      userPlants.forEach((plant) => {
        const { seedName, quantity } = plant;
        if (seedsToAdd.hasOwnProperty(seedName)) {
          seedsToAdd[seedName] += quantity;
        }
      });

      const seedEmojiMap = {
        Carrot_Seeds: {
          emoji: emojis.carrotBag,
          name: "carrot",
        },
        Rose_Seeds: { emoji: emojis.roseBag, name: "rose" },
        Rice_Seeds: { emoji: emojis.riceBag, name: "rice" },
      };

      let userBox = await Box.findOne({ userId });
      if (!userBox) {
        userBox = new Box({ userId, items: [] });
      }

      for (const seed in seedsToAdd) {
        const quantity = seedsToAdd[seed];
        if (quantity > 0) {
          const existingSeed = userBox.items.find((item) => item.name === seed);
          if (existingSeed) {
            existingSeed.quantity += quantity;
          } else {
            userBox.items.push({
              name: seed,
              quantity,
              emoji: seedEmojiMap[seed].emoji,
            });
          }
        }
      }

      await userBox.save();
      await Plant.deleteMany({ userId });

      return message.reply("Harvest successful! Items added to your box.");
    } catch (err) {
      console.error("Error during harvest:", err);
      return message.reply("An error occurred during the harvest.");
    }
  },
};
