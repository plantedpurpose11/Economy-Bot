
const { MessageEmbed, EmbedBuilder } = require("discord.js");
const Pocket = require("../../Schemas.js/PocketSchema");
const Plant = require("../../Schemas.js/plantSchema");
const Farm = require("../../Schemas.js/farmSchema");
const User = require("../../Schemas.js/userAccountCreation");
const Blacklist = require("../../Schemas.js/BlacklistSchema");

// Function to check if a user is blacklisted
async function isUserBlacklisted(userId) {
  const entry = await Blacklist.findOne({ userId });
  return entry !== null; // If entry exists, user is blacklisted
}

var timeout = [];
module.exports = {
  name: "plant",
  run: async (client, message, args) => {
    const isBlacklisted = await isUserBlacklisted(message.author.id);
    if (isBlacklisted) {
      return message.reply("You are blacklisted and cannot use this command.");
    }

    // Command cooldown check
    if (timeout.includes(message.author.id)) {
      const reply = await message.reply({
        content: "You are on a cooldown. Please wait 7 seconds!",
        ephemeral: true,
      });

      // Delete the cooldown message after 2 seconds
      setTimeout(() => {
        reply.delete().catch(console.error);
      }, 2000);

      return;
    }

    // Apply cooldown
    timeout.push(message.author.id);
    setTimeout(() => {
      timeout.shift();
    }, 7000);

    try {
      const userAccount = await User.findOne({ userId: message.author.id });

      if (!userAccount) {
        return message.reply("You don't have an account yet!");
      }
      const seedName = args[0]?.toLowerCase().trim(); // Get the seed name in lowercase and trimmed
      // Check if the seed name is provided
      if (!seedName) {
        return message.reply("Please provide a seed name to plant.");
      }

      // Check if the user has the specified seed in their pocket
      const userPocket = await Pocket.findOne({ userId: message.author.id });
      if (
        !userPocket ||
        !userPocket.items.some(
          (item) => item.name.toLowerCase().trim() === seedName
        )
      ) {
        return message.reply("You don't have this seed in your pocket.");
      }

      // Check if the user has a farm
      const userFarm = await Farm.findOne({ userId: message.author.id });
      if (!userFarm) {
        return message.reply(
          "You don't have a farm. Buy a farm to plant seeds."
        );
      }
      // Check if the user has already planted seeds of the same type
      const existingPlants = await Plant.findOne({
        userId: message.author.id,
      });
      if (existingPlants) {
        return message.reply(`You've already planted seeds.`);
      }
      // Check the type of farm and its seed capacity
      let spacing = 0;
      if (userFarm.farmType === "Small Farm") {
        spacing = 10; // Assuming small farm has a spacing of 10 seeds
      } else if (userFarm.farmType === "Medium Farm") {
        spacing = 20; // Assuming medium farm has a spacing of 20 seeds
      } else if (userFarm.farmType === "Large Farm") {
        spacing = 40; // Assuming large farm has a spacing of 40 seeds
      }

      const seed = userPocket.items.find(
        (item) => item.name.toLowerCase().trim() === seedName
      );
      // Check if the user has enough seeds considering the farm's capacity
      if (seed.quantity < spacing) {
        return message.reply(
          "You don't have enough seeds to plant in your farm."
        );
      }

      // Plant the seeds
      const currentTime = new Date();
      const plantTime = currentTime.getTime(); // Get current time to store in Plant Schema

      // Store plant information in Plant Schema
      const newPlant = new Plant({
        userId: message.author.id,
        seedName: seed.name,
        quantity: spacing,
        plantTime: plantTime,
      });

      await newPlant.save();

      // Reduce the quantity of seeds from the user's pocket
      seed.quantity -= spacing;
      await userPocket.save();

      // Create an embed to display the planting information
      const plantingEmbed = new EmbedBuilder()
        .setColor("#34c759")
        .setTitle("Planting Success")
        .setDescription(`You have planted ${spacing} ${seed.name}.`)
        .setTimestamp();

      return message.reply({ embeds: [plantingEmbed] });
    } catch (err) {
      console.error("Error:", err);
      return message.reply("An error occurred while processing the planting.");
    }
  },
};
