const { EmbedBuilder } = require("discord.js");
const User = require("../../Schemas.js/userAccountCreation"); // Adjust the path based on your file structure
const PremiumAnimal = require("../../Schemas.js/PremiumAnimalSchema"); // Adjust the path for the premium animal schema

// Sample data of premium animals
const premiumAnimals = [
  {
    name: "Opalynx",
    level: 45,
    attack: 180,
    health: 250,
    xp: 200,
    emoji: "<:Opalynx:1194986387523522672>",
    price: 2000000,
    image:
      "https://cdn.discordapp.com/attachments/1194628137892458588/1194664549899567294/Untitled_design_3.gif",
  },
  {
    name: "Topaztail",
    level: 56,
    attack: 290,
    health: 160,
    xp: 220,
    emoji: "<:Topaztail:1194986394003718234>",
    price: 3500000,
    image:
      "https://cdn.discordapp.com/attachments/1194628137892458588/1194664801591365732/Untitled_design_4.gif",
  },
  {
    name: "Rubywing",
    level: 65,
    attack: 345,
    health: 160,
    xp: 390,
    emoji: "<:Rubywing:1194986382851063848>",
    price: 4500000,
    image:
      "https://cdn.discordapp.com/attachments/1194628137892458588/1194665084706889789/Untitled_design_5.gif",
  },

  {
    name: "Amethyssian",
    level: 86,
    attack: 385,
    health: 160,
    xp: 410,
    emoji: "<:Amethyssian:1194986347849588827>",
    price: 6000000,
    image:
      "https://cdn.discordapp.com/attachments/1194628137892458588/1194667334367989830/Untitled_design_10.gif",
  },
  {
    name: "Garnetbeak",
    level: 96,
    attack: 485,
    health: 860,
    xp: 220,
    emoji: "<:Garnetbeak:1194986352614322207>",
    price: 7500000,
    image:
      "https://cdn.discordapp.com/attachments/1194628137892458588/1194667655089619064/Untitled_design_11.gif",
  },
  {
    name: "Citrinoise",
    level: 126,
    attack: 885,
    health: 160,
    xp: 720,
    emoji: "<:Citrinoise:1194986377436217404>",
    price: 10000000,
    image:
      "https://cdn.discordapp.com/attachments/1194628137892458588/1194668025987747930/Untitled_design_12.gif",
  },
  {
    name: "Tanzanitear",
    level: 136,
    attack: 485,
    health: 1160,
    xp: 2120,
    emoji: "<:Tanzanitear:1194986318594322523>",
    price: 13000000,
    image:
      "https://cdn.discordapp.com/attachments/1194628137892458588/1194668044518162502/Untitled_design_13.gif",
  },
  {
    name: "Peridotalon",
    level: 236,
    attack: 785,
    health: 7160,
    xp: 6230,
    emoji: "<:Peridotalon:1194986364727459971>",
    price: 16000000,
    image:
      "https://cdn.discordapp.com/attachments/1194628137892458588/1194668061324742776/Untitled_design_14.gif",
  },
  {
    name: "Aquamarlion",
    level: 2236,
    attack: 1285,
    health: 4160,
    xp: 4220,
    emoji: "<:Aquamarlion:1194986330770395236>",
    price: 19000000,
    image:
      "https://cdn.discordapp.com/attachments/1194628137892458588/1194668463919214612/Untitled_design_15.gif",
  },
  {
    name: "Onyxfang",
    level: 3335,
    attack: 8545,
    health: 7160,
    xp: 2520,
    emoji: "<:Onyxfang:1194986359513960470>",
    price: 21000000,
    image:
      "https://cdn.discordapp.com/attachments/1194628137892458588/1194668486006419466/Untitled_design_16.gif",
  },

  {
    name: "Moonstaria",
    level: 5566,
    attack: 4485,
    health: 9160,
    xp: 9220,
    emoji: "<:Moonstaria:1194986308502818866>",
    price: 31000000,
    image:
      "https://cdn.discordapp.com/attachments/1194628137892458588/1194668544697307246/Untitled_design_18.gif",
  },
  {
    name: "Larimarlynx",
    level: 6676,
    attack: 9885,
    health: 10160,
    xp: 20220,
    emoji: "<:Larimarlynx:1194986322486644746>",
    price: 45000000,
    image:
      "https://cdn.discordapp.com/attachments/1194628137892458588/1194668562900590683/Untitled_design_19.gif",
  },
  {
    name: "Alexandriteer",
    level: 9959,
    attack: 8455,
    health: 33200,
    xp: 63660,
    emoji: "<:Alexandriteer:1194986336382373919>",
    price: 50000000,
    image:
      "https://cdn.discordapp.com/attachments/1194628137892458588/1194668584190881952/Untitled_design_20.gif",
  },
  // Add more animals as needed
];
module.exports = {
  name: "buy",
  run: async (client, message, args) => {
    const animalName = args[0];

    if (!animalName) {
      return message.channel.send("Please provide an animal name to buy.");
    }

    const animalToBuy = premiumAnimals.find(
      (animal) => animal.name.toLowerCase() === animalName.toLowerCase()
    );

    if (!animalToBuy) {
      return message.channel.send("This animal is not available for purchase.");
    }

    const userId = message.author.id;

    // Fetch user data from the database
    let user = await User.findOne({ userId });

    if (!user) {
      return message.reply("You don't have an account yet!");
    }

    // Fetch the count of the specified animal for the user
    const existingAnimalCount = await PremiumAnimal.countDocuments({
      userId,
      name: animalToBuy.name,
    });

    // Check if the user already has the maximum allowed number of this animal
    const maxAllowedCount = 5;

    if (existingAnimalCount >= maxAllowedCount) {
      return message.channel.send(
        `You already have the maximum allowed (${maxAllowedCount}) number of ${animalToBuy.name}.`
      );
    }

    // Check if the user has enough balance to buy the animal
    if (user.balance < animalToBuy.price) {
      return message.channel.send(
        "You do not have enough balance to buy this animal."
      );
    }

    // If enough balance and not at the maximum count, deduct the price and update user's balance
    user.balance -= animalToBuy.price;
    await user.save();

    // Add the purchased animal details to the premium schema
    const newPremiumAnimal = new PremiumAnimal({
      name: animalToBuy.name,
      price: animalToBuy.price,
      xp: animalToBuy.xp,
      emoji: animalToBuy.emoji,
      level: animalToBuy.level,
      attack: animalToBuy.attack,
      health: animalToBuy.health,
      image: animalToBuy.image,
      userId: userId, 
    });

    await newPremiumAnimal.save();

    // Send a success message to the user
    const embed = new EmbedBuilder()
      .setTitle("Purchase Successful")
      .setDescription(
        `You've successfully purchased **${
          animalToBuy.name
        }** for **${animalToBuy.price.toLocaleString()}** coins.`
      );

    message.reply({ embeds: [embed] });
  },
};
