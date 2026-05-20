

const Hunter = require('../../Schemas.js/huntersSchema');
const { CommonAnimal, RareAnimal, LegendaryAnimal } = require('../../Schemas.js/userJungle');
const Blacklist = require("../../Schemas.js/BlacklistSchema");
const User = require("../../Schemas.js/userAccountCreation");

async function isUserBlacklisted(userId) {
  const entry = await Blacklist.findOne({ userId });
  return entry !== null; // If entry exists, user is blacklisted
}

const timeout = [];
module.exports = {
  name: 'huntersadd',
  description: 'Add an animal from inventory to hunters',
  aliases: ['ha'],
  usage: 'hunters add <animal_name>',
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
      const existingHunters = await Hunter.find({ userId: message.author.id });
      if (existingHunters.length >= 4) {
        return message.reply('You have already added the maximum number of animals to your hunters.');
      }

      if (args.length !== 1) {
        return message.reply('Please provide the name of the animal.');
      }

      const animalName = args[0].toLowerCase();
     

      let animalData;
      let rarity;

      let userAnimalCommon = await CommonAnimal.findOne({ userId: message.author.id, name: animalName });
      let userAnimalRare = await RareAnimal.findOne({ userId: message.author.id, name: animalName });
      let userAnimalLegendary = await LegendaryAnimal.findOne({ userId: message.author.id, name: animalName });

      if (userAnimalCommon && userAnimalCommon.count === 1) {
        await CommonAnimal.findOneAndDelete({ userId: message.author.id, name: animalName });
        animalData = userAnimalCommon;
        rarity = 'common';
      } else if (userAnimalCommon && userAnimalCommon.count > 1) {
        userAnimalCommon.count -= 1;
        await userAnimalCommon.save();
        animalData = userAnimalCommon;
        rarity = 'common';
      } else if (userAnimalRare && userAnimalRare.count === 1) {
        await RareAnimal.findOneAndDelete({ userId: message.author.id, name: animalName });
        animalData = userAnimalRare;
        rarity = 'rare';
      } else if (userAnimalRare && userAnimalRare.count > 1) {
        userAnimalRare.count -= 1;
        await userAnimalRare.save();
        animalData = userAnimalRare;
        rarity = 'rare';
      } else if (userAnimalLegendary && userAnimalLegendary.count === 1) {
        await LegendaryAnimal.findOneAndDelete({ userId: message.author.id, name: animalName });
        animalData = userAnimalLegendary;
        rarity = 'legendary';
      } else if (userAnimalLegendary && userAnimalLegendary.count > 1) {
        userAnimalLegendary.count -= 1;
        await userAnimalLegendary.save();
        animalData = userAnimalLegendary;
        rarity = 'legendary';
      } else {
        return message.reply('You do not own this animal.');
      }

      // Check if the user already has this animal in their hunters
      const alreadyAdded = existingHunters.find(hunter => hunter.name === animalName);
      if (alreadyAdded) {
        return message.reply(`You have already added **${rarity}** animal **${animalData.name}** to your hunters.`);
      }

      // Create the hunter entry
      await Hunter.create({
        userId: message.author.id,
        name: animalData.name,
        emoji: animalData.emoji,
        count: animalData.count,
        cowoncyValue: animalData.cowoncyValue,
        rarity,
        xp: animalData.xp,
        level: animalData.level,
        health: animalData.health,
        attack: animalData.attack,
        image: animalData.image || '',
      });

      return message.reply(`Added **${rarity}** animal **${animalData.name}** to the hunters.`);
    } catch (error) {
      console.error('Error:', error);
      return message.reply('An error occurred while adding the animal to the hunters.');
    }
  },
};
