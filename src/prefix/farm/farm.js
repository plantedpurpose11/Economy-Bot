
const { MessageEmbed, EmbedBuilder } = require("discord.js");
const Plant = require("../../Schemas.js/plantSchema");
const User = require("../../Schemas.js/userAccountCreation");
const Farm = require('../../Schemas.js/farmSchema');
const Blacklist = require('../../Schemas.js/BlacklistSchema');
const Gem = require('../../Schemas.js/gemsSchema')
// Function to check if a user is blacklisted
async function isUserBlacklisted(userId) {
  const entry = await Blacklist.findOne({ userId });
  return entry !== null; // If entry exists, user is blacklisted
}

var timeout = [];
module.exports = {
  name: "farm",
  aliases: ['f'],
  run: async (client, message, args) => {
    const isBlacklisted = await isUserBlacklisted(message.author.id);
    if (isBlacklisted) {
      return message.reply("You are blacklisted and cannot use this command.");
    }
    try {
      const userAccount = await User.findOne({ userId: message.author.id });

      if (!userAccount) {
        return message.reply(":ribbon: **First use** `ep start` **to start your journey.**");
      }

      const userId = message.author.id;

      // Fetch all plants of the user from the Plant schema
      const userPlants = await Plant.find({ userId });

      if (userPlants.length === 0) {
        return message.reply("You have no plants currently.");
      }
      const farm = await Farm.findOne({ userId: message.author.id });

      // Define farm type and spacing based on the user's farm type
      const farmType = farm.farmType;
      let spacing = 0;

      if (farmType === "Small Farm") {
        spacing = 10;
      } else if (farmType === "Medium Farm") {
        spacing = 20;
      } else if (farmType === "Large Farm") {
        spacing = 40;
      }

      // Prepare farm details for the embed
      const farmDetails = await Promise.all(userPlants.map(async (plant) => {
        const currentTime = new Date();
        const timeElapsed = currentTime - plant.plantTime;
        let timeToGrow = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
let userGems = await Gem.findOne({ userId: message.author.id });

if (userGems) {
  const rapidBloomGem = userGems.gems.find(
    (gem) => gem.gemType === "rapidbloom" && gem.activated && gem.count > 0
  );

  // Rest of your code continues as before...
    if (rapidBloomGem && rapidBloomGem.activated) {
          timeToGrow = 1 * 60 * 60 * 1000; // 1 hour in milliseconds
        }
  
  // Update gem count and activation status only if the gem exists
  if (rapidBloomGem && rapidBloomGem.count > 0) {
    rapidBloomGem.count -= 1; // Reduce gem count by 1 when planting seeds
    if (rapidBloomGem.count === 0) {
      rapidBloomGem.activated = false; // Deactivate the gem when count reaches 0
    }
  }

  // Save the updated gem details only if userGems exists
  await userGems.save(); // Save the updated gem details
}
        const progress = Math.min((timeElapsed / timeToGrow) * 100, 100);
  
        const hours = Math.floor((timeToGrow - timeElapsed) / (1000 * 60 * 60));
        const minutes = Math.floor(((timeToGrow - timeElapsed) % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor(((timeToGrow - timeElapsed) % (1000 * 60)) / 1000);
  
        
        return {
          seedName: plant.seedName,
          progress: `${progress.toFixed(2)}%`,
          timeRemaining: `${hours}h ${minutes}m ${seconds}s`,
          readyToHarvest: progress >= 100, // Check if the plant is ready to harvest
        };

      }));

      // Create and send the embed message
      const embed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle("Your Farm Details")
      
        .setDescription(`Farm details for user **${userAccount.userName}**\nFarm Type: **${farmType}**\nSpacing: **${spacing}**`)
        .addFields(
          farmDetails.map((plant) => ({
            name: `Seed: ${plant.seedName}`,
            value: `Growth Progress: **${plant.progress}**\nTime Remaining: **${
              plant.readyToHarvest ? "Ready for Harvest" : plant.timeRemaining
            }**`,
            inline: false,
          }))
        )
        .setTimestamp();

      return message.channel.send({ embeds: [embed] });
    } catch (err) {
      console.error("Error while fetching farm details:", err);
      return message.reply("An error occurred while fetching farm details.");
    }
  },
};
