const {
  CommonAnimal,
  RareAnimal,
  LegendaryAnimal,
  PreimiumAnimal,
} = require("../../Schemas.js/userJungle");
const User = require("../../Schemas.js/userAccountCreation");
const sellCooldown = new Set();
const {
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  EmbedBuilder,
} = require("discord.js");
// Function to handle the offer acceptance
const handleOfferAcceptance = async (
  message,
  animal,
  randomOffer,
  animalName
) => {
  const userId = message.author.id;
  const currentTime = Date.now();

  if (sellCooldown.has(userId)) {
    const timeLeft = (sellCooldown.get(userId) + 600000 - currentTime) / 1000; // Calculating time left in seconds
    return message.reply(
      `You can only sell an animal once every 30 minutes. Please wait ${timeLeft} seconds before selling again.`
    );
  }
  const user = await User.findOne({ userId });
  if (user) {
    // Increase user's balance by the offer amount
    user.balance += randomOffer;
    await user.save();
  }

  // Remove the animal from the jungle
  let jungleAnimal;
  if (animal.rarity === "common") {
    jungleAnimal = await CommonAnimal.findOne({ userId, name: animalName });
  } else if (animal.rarity === "rare") {
    jungleAnimal = await RareAnimal.findOne({ userId, name: animalName });
  } else if (animal.rarity === "legendary") {
    jungleAnimal = await LegendaryAnimal.findOne({ userId, name: animalName });
  }

  if (jungleAnimal) {
    if (jungleAnimal.count === 1) {
      await jungleAnimal.remove(); // Remove the animal if count is 1
    } else {
      // Reduce the count by 1 and update level and attack properties
      await jungleAnimal.updateOne({
        $inc: { count: -1 },
        $set: { level: 10, attack: 10 }, // Update level and attack to 10 (modify as needed)
      });
    }
  }

  // Send a confirmation message
  message.reply(
    `You've accepted the offer! Animal removed from your jungle. You received **${randomOffer}** EP coins.`
  );
};

const refusalMessages = [
  "I'm sorry, but we're not interested in buying this animal.",
  "Unfortunately, we're unable to purchase this animal right now.",
  "Our store isn't currently looking for this type of animal.",
  "Apologies, this animal doesn't fit our current requirements.",
  "We're currently not accepting offers for this animal.",
  "I'm afraid this animal doesn't meet our current needs.",
  "Sorry, we're not in the market for this animal at the moment.",
  "Regrettably, we're unable to consider this animal for purchase.",
  "We're currently overstocked with similar animals.",
  "This animal doesn't align with our current demand.",
];

const highLevelOfferMessages = [
  `I can offer you **${
    Math.floor(Math.random() * (500000 - 300000 + 1)) + 300000
  }** EP coins for your high-level animal!`,
  `I can give you **${
    Math.floor(Math.random() * (500000 - 300000 + 1)) + 300000
  }** EP coins for your high-level animal!`,
  // Add more offer messages here
];

const moderateLevelOfferMessages = [
  `I can offer you **${
    Math.floor(Math.random() * (300000 - 250000 + 1)) + 250000
  }** EP coins for your moderate-level animal!`,
  `Your moderate-level animal is worth **${
    Math.floor(Math.random() * (300000 - 250000 + 1)) + 250000
  }** EP coins!`,
  `The value of your moderate-level animal is **${
    Math.floor(Math.random() * (300000 - 250000 + 1)) + 250000
  }** EP coins!`,
  `I'd like to buy your moderate-level animal for **${
    Math.floor(Math.random() * (300000 - 250000 + 1)) + 250000
  }** EP coins!`,
  `For your moderate-level animal, I propose **${
    Math.floor(Math.random() * (300000 - 250000 + 1)) + 250000
  }** EP coins!`,
  `Here's my offer: **${
    Math.floor(Math.random() * (300000 - 250000 + 1)) + 250000
  }** EP coins for your moderate-level animal!`,
  `The market value for your moderate-level animal is **${
    Math.floor(Math.random() * (300000 - 250000 + 1)) + 250000
  }** EP coins!`,
  `Your moderate-level animal's price is **${
    Math.floor(Math.random() * (300000 - 250000 + 1)) + 250000
  }** EP coins!`,
  `Considering your moderate-level animal, I suggest **${
    Math.floor(Math.random() * (300000 - 250000 + 1)) + 250000
  }** EP coins!`,
  `I'm interested in purchasing your moderate-level animal for **${
    Math.floor(Math.random() * (300000 - 250000 + 1)) + 250000
  }** EP coins!`,
  // Add more messages as needed
];

const lowerModerateLevelOfferMessages = [
  `I can give you **${
    Math.floor(Math.random() * (250000 - 150000 + 1)) + 150000
  }** EP coins for your lower-moderate-level animal!`,
  `For your lower-moderate-level animal, I offer **${
    Math.floor(Math.random() * (250000 - 150000 + 1)) + 150000
  }** EP coins!`,
  `The value of your lower-moderate-level animal is **${
    Math.floor(Math.random() * (250000 - 150000 + 1)) + 150000
  }** EP coins!`,
  `I'd like to buy your lower-moderate-level animal for **${
    Math.floor(Math.random() * (250000 - 150000 + 1)) + 150000
  }** EP coins!`,
  `Here's my offer: **${
    Math.floor(Math.random() * (250000 - 150000 + 1)) + 150000
  }** EP coins for your lower-moderate-level animal!`,
  `The market value for your lower-moderate-level animal is **${
    Math.floor(Math.random() * (250000 - 150000 + 1)) + 150000
  }** EP coins!`,
  `Your lower-moderate-level animal's price is **${
    Math.floor(Math.random() * (250000 - 150000 + 1)) + 150000
  }** EP coins!`,
  `Considering your lower-moderate-level animal, I suggest **${
    Math.floor(Math.random() * (250000 - 150000 + 1)) + 150000
  }** EP coins!`,
  `I'm interested in purchasing your lower-moderate-level animal for **${
    Math.floor(Math.random() * (250000 - 150000 + 1)) + 150000
  }** EP coins!`,
  `The estimated value of your lower-moderate-level animal is **${
    Math.floor(Math.random() * (250000 - 150000 + 1)) + 150000
  }** EP coins!`,
  // Add more messages as needed
];

module.exports = {
  name: "sell",
  run: async (client, message, args) => {
    if (sellCooldown.has(message.author.id)) {
      return message.reply(
        "You can only try to sell an animal once every 30 minutes."
      );
    }

    const userId = message.author.id;
    const animalName = args.join(" ").toLowerCase();

if (!animalName) {
  return message.reply("Provide Animal Name!");
}

const formattedAnimalName = animalName.replace(/\\_/g, "_");

const commonAnimal = await CommonAnimal.findOne({
  userId,
  $or: [
    { name: formattedAnimalName },
    { name: animalName },
    { name: formattedAnimalName.replace(/_/g, " ") },
    { name: animalName.replace(/_/g, " ") },
  ],
}).lean();

const rareAnimal = await RareAnimal.findOne({
  userId,
  $or: [
    { name: formattedAnimalName },
    { name: animalName },
    { name: formattedAnimalName.replace(/_/g, " ") },
    { name: animalName.replace(/_/g, " ") },
  ],
}).lean();

const legendaryAnimal = await LegendaryAnimal.findOne({
  userId,
  $or: [
    { name: formattedAnimalName },
    { name: animalName },
    { name: formattedAnimalName.replace(/_/g, " ") },
    { name: animalName.replace(/_/g, " ") },
  ],
}).lean();

const animal = commonAnimal || rareAnimal || legendaryAnimal;

if (!animal) {
  return message.reply(`You don't have a **${animalName}**.`);
}

if (animal.level < 45) {
  return message.reply("We only buy animals that are level 45 or higher.");
}

let response = "I'm sorry, but we're not interested in buying this animal.";
let offerAccepted = false;
let offerTimer;

if (animal.level >= 95) {
  const randomOfferIndex = Math.floor(Math.random() * highLevelOfferMessages.length);
  // const randomOffer = Math.floor(Math.random() * (500000 - 300000 + 1)) + 300000;

  response = highLevelOfferMessages[randomOfferIndex];
  randomOffer = parseInt(response.match(/\d+/)[0]); 
  const offerEmbed = new EmbedBuilder()
        .setTitle("Offer for your Animal")
        .setDescription(response)
        .setColor("#ff0000"); // You can set a color for the embed

      const acceptButton = new ButtonBuilder()
        .setCustomId("accept_button")
        .setLabel("Accept")
        .setStyle(ButtonStyle.Primary);
      const row = new ActionRowBuilder().addComponents(acceptButton);

      const offerMessage = await message.reply({
        embeds: [offerEmbed],
        components: [row],
      });

      const collector = message.channel.createMessageComponentCollector({
        filter: (interaction) =>
          interaction.customId === "accept_button" &&
          interaction.message.id === offerMessage.id,
        time: 30000,
      });

      collector.on("collect", async (interaction) => {
        if (interaction.customId === "accept_button") {
          offerAccepted = true;
          clearTimeout(offerTimer);

          await handleOfferAcceptance(message, animal, randomOffer, animalName);

          await interaction.update({
            content: "Offer accepted! Animal removed from your jungle.",
            components: [],
          });
          // Set the user in cooldown
          sellCooldown.add(userId);
          setTimeout(() => {
            sellCooldown.delete(userId);
          }, 600000); // 30 minutes cooldown (in milliseconds)
        }
      });

      collector.on("end", async (collected, reason) => {
        if (reason === "time" && !offerAccepted) {
          await offerMessage.edit({
            embeds: [offerEmbed.setDescription("This offer has expired.")],
            components: [], // Remove the components
          });
        }
      });
} else if (animal.level >= 70) {
  const randomOfferIndex = Math.floor(Math.random() * moderateLevelOfferMessages.length);
  // const randomOffer = Math.floor(Math.random() * (300000 - 250000 + 1)) + 250000;
  response = moderateLevelOfferMessages[randomOfferIndex];
  randomOffer = parseInt(response.match(/\d+/)[0]); 

  const offerEmbed = new EmbedBuilder()
        .setTitle("Offer for your Animal")
        .setDescription(response)
        .setColor("#ff0000"); // You can set a color for the embed

      const acceptButton = new ButtonBuilder()
        .setCustomId("accept_button")
        .setLabel("Accept")
        .setStyle(ButtonStyle.Primary);
      const row = new ActionRowBuilder().addComponents(acceptButton);

      const offerMessage = await message.reply({
        embeds: [offerEmbed],
        components: [row],
      });

      const collector = message.channel.createMessageComponentCollector({
        filter: (interaction) =>
          interaction.customId === "accept_button" &&
          interaction.message.id === offerMessage.id,
        time: 30000,
      });

      collector.on("collect", async (interaction) => {
        if (interaction.customId === "accept_button") {
          offerAccepted = true;
          clearTimeout(offerTimer);

          await handleOfferAcceptance(message, animal, randomOffer, animalName);

          await interaction.update({
            content: "Offer accepted! Animal removed from your jungle.",
            components: [],
          });
          // Set the user in cooldown
          sellCooldown.add(userId);
          setTimeout(() => {
            sellCooldown.delete(userId);
          }, 600000); // 30 minutes cooldown (in milliseconds)
        }
      });

      collector.on("end", async (collected, reason) => {
        if (reason === "time" && !offerAccepted) {
          await offerMessage.edit({
            embeds: [offerEmbed.setDescription("This offer has expired.")],
            components: [], // Remove the components
          });
        }
      });
} else if (animal.level >= 45) {

      const randomOfferIndex = Math.floor(
        Math.random() * lowerModerateLevelOfferMessages.length
      );
      // const randomOffer =
      //   Math.floor(Math.random() * (250000 - 150000 + 1)) + 150000;
      response = lowerModerateLevelOfferMessages[randomOfferIndex];
      randomOffer = parseInt(response.match(/\d+/)[0]); 

      const offerEmbed = new EmbedBuilder()
        .setTitle("Offer for your Animal")
        .setDescription(response)
        .setColor("#ff0000"); // You can set a color for the embed

      const acceptButton = new ButtonBuilder()
        .setCustomId("accept_button")
        .setLabel("Accept")
        .setStyle(ButtonStyle.Primary);
      const row = new ActionRowBuilder().addComponents(acceptButton);

      const offerMessage = await message.reply({
        embeds: [offerEmbed],
        components: [row],
      });

      const collector = message.channel.createMessageComponentCollector({
        filter: (interaction) =>
          interaction.customId === "accept_button" &&
          interaction.message.id === offerMessage.id,
        time: 30000,
      });

      collector.on("collect", async (interaction) => {
        if (interaction.customId === "accept_button") {
          offerAccepted = true;
          clearTimeout(offerTimer);

          await handleOfferAcceptance(message, animal, randomOffer, animalName);

          await interaction.update({
            content: "Offer accepted! Animal removed from your jungle.",
            components: [],
          });
          // Set the user in cooldown
          sellCooldown.add(userId);
          setTimeout(() => {
            sellCooldown.delete(userId);
          }, 600000); // 30 minutes cooldown (in milliseconds)
        }
      });

      collector.on("end", async (collected, reason) => {
        if (reason === "time" && !offerAccepted) {
          await offerMessage.edit({
            embeds: [offerEmbed.setDescription("This offer has expired.")],
            components: [], // Remove the components
          });
        }
      });
    }
  },
};
