const {
  CommonAnimal,
  RareAnimal,
  LegendaryAnimal,
} = require("../../Schemas.js/userJungle");
const User = require("../../Schemas.js/userAccountCreation");
const Hunter = require("../../Schemas.js/huntersSchema");
const JunglePoints = require("../../Schemas.js/junglePointsSchema");
const PremiumAnimal = require("../../Schemas.js/PremiumAnimalSchema");
const emojis = require("../../../emojis.json");

function toSuperscript(number) {
  const superscripts = "⁰¹²³⁴⁵⁶⁷⁸⁹";
  return number
    .toString()
    .split("")
    .map((digit) => superscripts[digit])
    .join("");
}

const Blacklist = require("../../Schemas.js/BlacklistSchema");

async function isUserBlacklisted(userId) {
  const entry = await Blacklist.findOne({ userId });
  return entry !== null; // If entry exists, user is blacklisted
}

var timeout = [];

module.exports = {
  name: "jungle",
  aliases: ["j"],
  description: "Display user jungle",

  run: async (client, message, args) => {
    const isBlacklisted = await isUserBlacklisted(message.author.id);
    if (isBlacklisted) {
      return message.reply("You are blacklisted and cannot use this command.");
    }

    if (timeout.includes(message.author.id)) {
      return await message.reply({
        content: "You are on a cooldown. Wait 10 seconds!",
        ephemeral: true,
      });
    }

    timeout.push(message.author.id);
    setTimeout(() => {
      timeout.shift();
    }, 10000);

    try {
      const user = await User.findOne({ userId: message.author.id });

      if (!user) {
        return message.reply("You don't have an account yet!");
      }

      const commonAnimals = await CommonAnimal.find({
        userId: message.author.id,
      });
      const rareAnimals = await RareAnimal.find({ userId: message.author.id });
      const legendaryAnimals = await LegendaryAnimal.find({
        userId: message.author.id,
      });
      const preimiumAnimal = await PremiumAnimal.find({
        userId: message.author.id,
      });

      // Function to chunk the animals
      const chunkAnimals = (animals) => {
        const chunks = [];
        for (let i = 0; i < animals.length; i += 7) {
          chunks.push(animals.slice(i, i + 7).join(""));
        }
        return chunks.join("\n:black_medium_square:");
      };

      // Function to format animals
      const formatAnimals = (animalType, animals) => {
        const formattedAnimals =
          animals.length === 0
            ? ["?????"]
            : animals.map(
                (animal) => `${animal.emoji} ${toSuperscript(animal.count)}`
              );

        return `**${animalType}** : ${chunkAnimals(formattedAnimals)}\n`;
      };

      // Formatting animals
      const commonFormattedAnimals = formatAnimals(
        emojis.commonAnimal,
        commonAnimals
      );
      const rareFormattedAnimals = formatAnimals(
        emojis.rareAnimal,
        rareAnimals
      );
      const legendaryFormattedAnimals = formatAnimals(
        emojis.legendaryAnimal,
        legendaryAnimals
      );
      const preimiumAnimals = await PremiumAnimal.find({
        userId: message.author.id,
      });

      // Function to format premium animals
      const formatPremiumAnimals = async (animalType, animals) => {
        // Create an object to store counts for each unique animal name along with its emoji
        const animalDetails = {};

        // Populate the object with counts and emojis for each unique animal name
        animals.forEach((animal) => {
          if (!animalDetails[animal.name]) {
            animalDetails[animal.name] = {
              emoji: animal.emoji,
              count: 0,
            };
          }
          animalDetails[animal.name].count++;
        });

        // Create a formatted string with emoji and count for each unique animal name
        let formattedAnimals = `**${animalType}** : `;
        for (const [name, { emoji, count }] of Object.entries(
          animalDetails
        )) {
          formattedAnimals += `${emoji} ${toSuperscript(count)} `;
        }

        return formattedAnimals;
      };

      const premiumFormattedAnimals = await formatPremiumAnimals(
        emojis.premiumAnimal,
        preimiumAnimals
      );

      // Inventory message
      let inventoryMessage = `✨ **${message.author.username}'s** Jungle 🎀:\n\n`;

      // Concatenating formatted animals
      inventoryMessage += commonFormattedAnimals;
      inventoryMessage += "=========================\n";
      inventoryMessage += rareFormattedAnimals;
      inventoryMessage += "=========================\n";
      inventoryMessage += legendaryFormattedAnimals;
      inventoryMessage += "=========================\n";
      inventoryMessage += premiumFormattedAnimals;

      // Calculate total points based on animal counts

      // Fetch the counts for each type of animal
      const commonCount = commonAnimals.reduce(
        (total, animal) => total + animal.count,
        0
      );
      const rareCount = rareAnimals.reduce(
        (total, animal) => total + animal.count,
        0
      );
      const legendaryCount = legendaryAnimals.reduce(
        (total, animal) => total + animal.count,
        0
      );
      const premiumCount = legendaryAnimals.reduce(
        (total, animal) => total + animal.count,
        0
      );

      // Calculate the total cowoncy based on the counts
      const totalPoints =
        commonCount * 6 +
        rareCount * 13 +
        legendaryCount * 200 +
        premiumCount * 1600;

      // Fetch active hunters for the user
      const activeHunters = await Hunter.find({ userId: message.author.id });

      let userPoints = await JunglePoints.findOne({
        userId: message.author.id,
      });

      if (!userPoints) {
        userPoints = new JunglePoints({
          userId: message.author.id,
          totalPoints,
        });
      } else {
        userPoints.totalPoints = totalPoints;
      }

      await userPoints.save();

      if (activeHunters.length > 0) {
        const activeHuntersList = activeHunters
          .slice(0, 4) // Show up to 4 active hunters
          .map((hunter) => hunter.emoji)
          .join(" | ");

        inventoryMessage += `\n\n**Active Hunters:** ${activeHuntersList}`;
      }

      inventoryMessage += `\n\n**Total Points:** **__${totalPoints.toLocaleString()}__**`;

      // Chunking the inventory message into chunks of 1800 characters
      const chunkSize = 1800;
      const inventoryChunks = [];
      let currentChunk = "";
      let currentLength = 0;

      // Pushing chunks
      for (const chunk of inventoryMessage.split("\n")) {
        if (currentLength + chunk.length <= chunkSize) {
          currentChunk += chunk + "\n";
          currentLength += chunk.length;
        } else {
          inventoryChunks.push(currentChunk);
          currentChunk = chunk + "\n";
          currentLength = chunk.length;
        }
      }

      // Push the remaining chunk
      if (currentChunk !== "") {
        inventoryChunks.push(currentChunk);
      }

      // Sending messages in chunks
      for (const chunk of inventoryChunks) {
        await message.channel.send(chunk);
      }
    } catch (err) {
      console.error("Error:", err);
      return message.reply("An error occurred while fetching your jungle.");
    }
  },
};
