const Pocket = require("../../Schemas.js/PocketSchema");
const Hunter = require("../../Schemas.js/huntersSchema");
const User = require('../../Schemas.js/userAccountCreation');
const Blacklist = require('../../Schemas.js/BlacklistSchema');

// Function to check if a user is blacklisted
async function isUserBlacklisted(userId) {
  const entry = await Blacklist.findOne({ userId });
  return entry !== null; // If entry exists, user is blacklisted
}

module.exports = {
  name: "feed",
  run: async (client, message, args) => {
    const isBlacklisted = await isUserBlacklisted(message.author.id);
    if (isBlacklisted) {
      return message.reply("You are blacklisted and cannot use this command.");
    }
    try {
      // Fetch the user's hunters
      const userHunters = await Hunter.find({ userId: message.author.id });

      let needFood = false;


      const userAccount = await User.findOne({ userId: message.author.id });

      if (!userAccount) {
        return message.reply(":ribbon: **First use** `ep start` **to start your journey.**");
      }

      // Check if any hunter has health less than 100
      for (const hunter of userHunters) {
        if (hunter.health < 100) {
          needFood = true;
          break;
        }
      }

      // If any hunter needs food
      if (needFood) {
        // Fetch user's pocket
        const userPocket = await Pocket.findOne({ userId: message.author.id });

        if (!userPocket || userPocket.items.length === 0) {
          return message.reply(
            "You need food! Please buy some from the shop using `ep shop`."
          );
        }

        let totalFoodNeeded = 0;

        // Calculate total food needed for all hunters
        for (const hunter of userHunters) {
          const healthDeficit = 100 - hunter.health;

          // If hunter needs food to reach full health
          if (healthDeficit > 0) {
            // Adjust quantity of food needed
            totalFoodNeeded += healthDeficit <= 5 ? 3 : 6;
          }
        }

        let foodInPocket = 0;

        // Calculate total food in the user's pocket
        for (const item of userPocket.items) {
          if (item.name === "Hunters Food") {
            foodInPocket = item.quantity;
            break;
          }
        }

        // If food in pocket is insufficient
        if (foodInPocket < totalFoodNeeded) {
          const additionalFoodNeeded = totalFoodNeeded - foodInPocket;
          return message.reply(
            `You need ${additionalFoodNeeded} more food! Please buy some from the shop using \`ep shop\`.`
          );
        }

        // Adjust hunter health and deduct food from pocket
        for (const hunter of userHunters) {
          const healthDeficit = 100 - hunter.health;

          if (healthDeficit > 0) {
            let foodToConsume = healthDeficit <= 5 ? 3 : 6;

            // Adjust food consumption if it exceeds pocket quantity
            if (foodToConsume > foodInPocket) {
              foodToConsume = foodInPocket;
            }

            // Update hunter health and deduct food from pocket
            hunter.health += healthDeficit;
            foodInPocket -= foodToConsume;
          }
        }

        // Update the user's pocket with remaining food quantity
        userPocket.items = userPocket.items.map((item) => {
          if (item.name === "Hunters Food") {
            item.quantity = foodInPocket; // Update with remaining food quantity
          }
          return item;
        });

        // Save updated pocket data
        await userPocket.save();

        // Save updated hunter data
        for (const hunter of userHunters) {
          await hunter.save();
        }

        return message.reply("Hunters fed successfully!");
      } else {
        return message.reply(
          "All your hunters are healthy! No need to feed them."
        );
      }
    } catch (error) {
      console.error("Error:", error);
      return message.reply("An error occurred while feeding your hunters.");
    }
  },
};
