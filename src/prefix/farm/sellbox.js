const User = require("../../Schemas.js/userAccountCreation");
const Blacklist = require("../../Schemas.js/BlacklistSchema");
const Box = require("../../Schemas.js/boxSchema"); // Import the Box schema
const Gem = require("../../Schemas.js/gemsSchema");
const emojis = require("../../../emojis.json");

async function isUserBlacklisted(userId) {
  const entry = await Blacklist.findOne({ userId });
  return entry !== null; // If entry exists, user is blacklisted
}

var timeout = [];
module.exports = {
  name: "sellbox",
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
      const user = await User.findOne({ userId: message.author.id });

      if (!user) {
        return message.reply("You don't have an account yet!");
      }

      // Fetch the user's box
      const userBox = await Box.findOne({ userId: message.author.id });
      if (!userBox || userBox.items.length === 0) {
        return message.reply("Your box is empty.");
      }
      const userGems = await Gem.findOne({ userId: message.author.id });
      const harvestAmplifierGem = userGems ? userGems.gems.find(
        (gem) =>
          gem.gemType === "harvestamplifier" && gem.activated && gem.count > 0
      ) : null;

      // Mapping seed types to their respective sell prices
      const seedSellPrices = {
        Carrot_Seeds: 3000,
        Potato_Seeds: 1500,
        Rice_Seeds: 1000,
        // Add other seed types and their default prices here
      };

      let totalPrice = 0;

      // Calculate modified prices based on the HarvestAmplifier gem
      userBox.items.forEach((item) => {
        const sellPrice = seedSellPrices[item.name];
        let modifiedSellPrice = sellPrice || 0;

        if (harvestAmplifierGem && harvestAmplifierGem.activated) {
          // Modify prices based on the gem activation
          modifiedSellPrice *= 2; // Doubling the price for all seed types
        }

        totalPrice += modifiedSellPrice * item.quantity;
      });

      // Deduct the gem count if it's activated
      if (harvestAmplifierGem && harvestAmplifierGem.activated) {
        harvestAmplifierGem.count -= 1;
        if (harvestAmplifierGem.count === 0) {
          harvestAmplifierGem.activated = false; // Deactivate gem if count reaches 0
        }
        await userGems.save();
      }
      user.balance += totalPrice;
      await user.save();
      await userBox.remove();

      return message.reply(
        `You sold your **box** for **${totalPrice.toLocaleString()}** ${emojis.currencyEmoji} Ep coins.`
      );
    } catch (err) {
      console.error("Error:", err);
      message.reply("An error occurred while selling your box contents.");
    }
  },
};
