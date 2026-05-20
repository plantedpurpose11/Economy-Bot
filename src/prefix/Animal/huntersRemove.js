
const {
  CommonAnimal,
  RareAnimal,
  LegendaryAnimal,
} = require("../../Schemas.js/userJungle");
const Hunter = require("../../Schemas.js/huntersSchema");
const Blacklist = require("../../Schemas.js/BlacklistSchema");
const User = require('../../Schemas.js/userAccountCreation');

async function isUserBlacklisted(userId) {
  const entry = await Blacklist.findOne({ userId });
  return entry !== null; // If entry exists, user is blacklisted
}

const timeout = [];
module.exports = {
  name: "hunterremove",
  description: "Remove an animal from hunters and add to inventory",
  aliases: ['hr'],
  usage: "hunterremove <animal_name>",
  run: async (client, message, args) => {

    const isBlacklisted = await isUserBlacklisted(message.author.id);
    if (isBlacklisted) {
      return message.reply("You are blacklisted and cannot use this command.");
    }


    const userAccount = await User.findOne({ userId: message.author.id });

    if (!userAccount) {
      return message.reply(":ribbon: **First use** `ep start` **to start your journey.**");
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
      if (args.length !== 1) {
        return message.reply("Please provide the name of the animal.");
      }

      const animalName = args[0].toLowerCase();

      const hunterAnimal = await Hunter.findOneAndDelete({
        userId: message.author.id,
        name: animalName,
      });

      if (!hunterAnimal) {
        return message.reply("This animal is not in your hunters.");
      }

      let userAnimal;
      switch (hunterAnimal.rarity) {
        case "common":
          userAnimal = await CommonAnimal.findOneAndUpdate(
            { userId: message.author.id, name: animalName },
            { $inc: { count: 1 } },
            { new: true, upsert: true }
          );
          break;
        case "rare":
          userAnimal = await RareAnimal.findOneAndUpdate(
            { userId: message.author.id, name: animalName },
            { $inc: { count: 1 } },
            { new: true, upsert: true }
          );
          break;
        case "legendary":
          userAnimal = await LegendaryAnimal.findOneAndUpdate(
            { userId: message.author.id, name: animalName },
            { $inc: { count: 1 }, $set: { image: hunterAnimal.image } }, // Transfer the image
            { new: true, upsert: true }
          );
          break;
        default:
          break;
      }

      // Assuming 'emoji', 'image', and other fields are available in hunterAnimal schema
      const { emoji, xp, level, attack, health } = hunterAnimal;

      // Save the removed hunter's details to user's inventory schema
      // For example, if it's a LegendaryAnimal schema:
      if (userAnimal) {
        userAnimal.emoji = emoji;
        userAnimal.xp = xp;
        userAnimal.level = level;
        userAnimal.attack = attack;
        userAnimal.health = health;

    
        await userAnimal.save();
      }

      return message.reply(
        `Removed **${hunterAnimal.rarity}** animal **${hunterAnimal.name}** from hunters and added it back to your inventory.`
      );
    } catch (err) {
      console.error("Error:", err);
      return message.reply(
        "An error occurred while removing the animal from hunters."
      );
    }
  },
};
