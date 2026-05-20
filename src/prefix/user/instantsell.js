const { CommonAnimal, RareAnimal, LegendaryAnimal } = require("../../Schemas.js/userJungle");
const User = require("../../Schemas.js/userAccountCreation");
const Blacklist = require('../../Schemas.js/BlacklistSchema');
const emojis = require("../../../emojis.json");

async function isUserBlacklisted(userId) {
  const entry = await Blacklist.findOne({ userId });
  return entry !== null; // If entry exists, user is blacklisted
}

const timeout = [];
module.exports = {
  name: "instantsell",
  aliases: ["isell"],
  description: "Sell animals instantly",

  run: async (client, message, args) => {
    const isBlacklisted = await isUserBlacklisted(message.author.id);
    if (isBlacklisted) {
      return message.reply("You are blacklisted and cannot use this command.");
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
    
    const arg = args[0]; // Get the argument for the type of animals to sell
    
    // Check if the argument is valid ("c", "r", "l", or "all")
    if (!["c", "r", "l", "all"].includes(arg)) {
      return message.reply(`${emojis.error} Please provide a valid argument: 'c', 'r', 'l', or 'all'.`);
    }
    
    try {
      const user = await User.findOne({ userId: message.author.id });
      
      if (!user) {
        return message.reply(`${emojis.level} **First use** \`ep start\` **to start your journey.**`);
      }
      
      let totalCowoncyEarned = 0;
      const sellingMessage = await message.reply(`${emojis.loading} Selling your animals...`);
      
      if (arg === "all") {
        const allCommon = await CommonAnimal.find({ userId: message.author.id, count: { $gt: 1 } });
        const allRare = await RareAnimal.find({ userId: message.author.id, count: { $gt: 1 } });
        const allLegendary = await LegendaryAnimal.find({ userId: message.author.id, count: { $gt: 1 } });
        totalCowoncyEarned += await sellAnimals(allCommon, user, 10);
        totalCowoncyEarned += await sellAnimals(allRare, user, 18);
        totalCowoncyEarned += await sellAnimals(allLegendary, user, 500);
      } else {
        let animalType, earnings;
        switch (arg) {
          case "c":
            animalType = CommonAnimal;
            earnings = 10;
            break;
          case "r":
            animalType = RareAnimal;
            earnings = 18;
            break;
          case "l":
            animalType = LegendaryAnimal;
            earnings = 500;
            break;
          default:
            break;
        }
        const allAnimals = await animalType.find({ userId: message.author.id, count: { $gt: 1 } });
        totalCowoncyEarned += await sellAnimals(allAnimals, user, earnings);
      }

      await user.save();

      if (totalCowoncyEarned === 0) {
        await sellingMessage.edit(`${emojis.error} No animals were sold.`);
        return;
      }

      const updatedMessage = `${emojis.success} You sold all ${arg === "c" ? "common" : arg === "r" ? "rare" : arg === "l" ? "legendary" : "animals"} and earned **__${totalCowoncyEarned}__** ${emojis.currencyEmoji} EP coins!`;
      await sellingMessage.edit(updatedMessage);
    } catch (err) {
      console.error("Error:", err);
      return message.reply(`${emojis.maintenance} An error occurred while selling animals.`);
    }
  },
};

// Function to handle selling of animals
async function sellAnimals(animalList, user, cowoncyValue) {
  let totalEarnings = 0;
  for (const animal of animalList) {
    if (animal.count > 1) {
      const extraCount = animal.count - 1;
      const earnings = extraCount * cowoncyValue;
      user.balance += earnings;
      totalEarnings += earnings;
      animal.count = 1; // Keep one of the animals after selling extras
      animal.cowoncyValue = cowoncyValue; // Update the cowoncyValue after selling
      await animal.save();
    }
  }
  return totalEarnings;
}
