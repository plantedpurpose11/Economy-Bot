// Assuming the necessary models are imported here: User, CommonAnimal, RareAnimal, LegendaryAnimal
const {
  CommonAnimal,
  RareAnimal,
  LegendaryAnimal,
} = require("../../Schemas.js/userJungle");
const User = require("../../Schemas.js/userAccountCreation");
const { EmbedBuilder } = require("discord.js");
const Blacklist = require("../../Schemas.js/BlacklistSchema");
const emojis = require("../../../emojis.json");

async function isUserBlacklisted(userId) {
  const entry = await Blacklist.findOne({ userId });
  return entry !== null; // If entry exists, user is blacklisted
}
const timeout = [];

module.exports = {
  name: "details",
  description: "Display details of an owned animal",
  usage: "details <animal_name>",
  run: async (client, message, args) => {
    const isBlacklisted = await isUserBlacklisted(message.author.id);
    if (isBlacklisted) {
      return message.reply("You are blacklisted and cannot use this command.");
    }

    const userAccount = await User.findOne({ userId: message.author.id });

    if (!userAccount) {
      return message.reply("You don't have an account yet!");
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

    if (args.length !== 1) {
      return message.reply("Please provide the name of the animal.");
    }

    const animalName = args[0].toLowerCase(); // Convert to lowercase for consistency

    try {
      let animalData;
      let animalType;

      const userAnimalCommon = await CommonAnimal.findOne({
        userId: message.author.id,
        name: animalName,
      });
      const userAnimalRare = await RareAnimal.findOne({
        userId: message.author.id,
        name: animalName,
      });
      const userAnimalLegendary = await LegendaryAnimal.findOne({
        userId: message.author.id,
        name: animalName,
      });

      if (userAnimalCommon) {
        animalData = userAnimalCommon;
        animalType = "Common";
      } else if (userAnimalRare) {
        animalData = userAnimalRare;
        animalType = "Rare";
      } else if (userAnimalLegendary) {
        animalData = userAnimalLegendary;
        animalType = "Legendary";
      } else {
        return message.reply("You do not own this animal.");
      }

      
        const embed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle(`${animalType} Animal Details`)
        .setTimestamp()
        .setDescription(
          `${emojis.animalName} : **Name:** ${animalData.name}\n` +
          `${emojis.animalInfo} : **Animal:** ${animalData.emoji}\n` +
          `:diamond_shape_with_a_dot_inside: : **XP:** ${animalData.xp.toLocaleString()}\n` +
          `${emojis.animalLevel} : **Level:** ${animalData.level}\n` +
          `${emojis.animalAttack} : **Attack:** ${animalData.attack}\n` +
          `${emojis.animalHealth} : **Health:** ${animalData.health}`
        );
      if (animalType === "Legendary") {
        embed.setThumbnail(animalData.image); // Assuming image field contains the URL of the image
      }

      return message.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Error:", error);
      return message.reply("An error occurred while fetching animal details.");
    }
  },
};
