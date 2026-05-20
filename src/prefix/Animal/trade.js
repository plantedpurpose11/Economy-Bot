const {
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  ButtonStyle,
  Embed,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
} = require("discord.js");
const User = require("../../Schemas.js/userAccountCreation");
const {
  CommonAnimal,
  RareAnimal,
  LegendaryAnimal,
} = require("../../Schemas.js/userJungle");
const Blacklist = require("../../Schemas.js/BlacklistSchema");
const emojis = require("../../../emojis.json");

async function isUserBlacklisted(userId) {
  const entry = await Blacklist.findOne({ userId });
  return entry !== null; // If entry exists, user is blacklisted
}
const timeout = [];

module.exports = {
  name: "trade",
  aliases: ["t"],
  description: "Trade with others",

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
        content: "You are on a cooldown. wait 10 seconds!",
        ephemeral: true,
      });

    //command cooldown
    timeout.push(message.author.id);
    setTimeout(() => {
      timeout.shift();
    }, 10000);

    const userMention = message.mentions.users.first();
    const animalName = args[1];
    const amount = parseInt(args[2]); // Parse amount to an integer

    // Check if the mentioned user is the message author
    if (userMention && userMention.id === message.author.id) {
      return message.reply("You can't trade with yourself!");
    }

    if (!animalName || isNaN(amount)) {
      return message.reply(
        "Usage: `ep trade <user_mention> <animal_name> <amount>`"
      );
    }
    // Check if the user has the specified animal
    const userHasAnimal = await checkUserHasAnimal(
      message.author.id,
      animalName
    );
    if (!userHasAnimal) {
      return message.reply("You do not have this animal to trade.");
    }

    // Get the animal details and price
    const animalDetails = await getAnimalDetails(animalName);

    // Create an embed showing the trade details
    const tradeEmbed = new EmbedBuilder()
      .setTitle("Trade Offer")
      .setDescription(
        `Offering ${animalDetails.name} ${animalDetails.emoji} for **__${amount}__** ${emojis.currencyEmoji} EP coins.`
      )
      .setColor("#0099ff");

    // Create buttons for confirm and cancel
    const confirmButton = new ButtonBuilder()
      .setCustomId("confirm_trade")
      .setLabel("Confirm")
      .setStyle(ButtonStyle.Success);

    const cancelButton = new ButtonBuilder()
      .setCustomId("cancel_trade")
      .setLabel("Cancel")
      .setStyle(ButtonStyle.Danger);

    // Create an action row for buttons
    const actionRow = new ActionRowBuilder().addComponents(
      confirmButton,
      cancelButton
    );

    // Send the trade offer as an embed with buttons
    const tradeMessage = await message.reply({
      embeds: [tradeEmbed],
      components: [actionRow],
      ephemeral: true,
    });

    // Create a collector to handle button clicks
    const filter = (buttonInteraction) =>
      buttonInteraction.user.id === userMention.id;
    const collector = message.channel.createMessageComponentCollector({
      filter,
      time: 15000,
    });

    collector.on("collect", async (buttonInteraction) => {
      if (buttonInteraction.customId === "confirm_trade") {
        const user = await User.findOne({ userId: message.author.id });
        const otherUser = await User.findOne({ userId: userMention.id });

        if (!otherUser) {
          await buttonInteraction.reply({
            content: "The mentioned user is invalid or not found.",
            ephemeral: true,
          });
          return;
        }

        if (otherUser.balance < amount) {
          await buttonInteraction.reply({
            content: "You do not have enough cowoncy for this trade.",
            ephemeral: true,
          });
          return;
        }

        if (otherUser.balance < amount) {
          await buttonInteraction.reply({
            content: `The other user does not have enough cowoncy for this trade.`,
          });
          return;
        }

        // Deduct cowoncy from the other user's balance and add to the user's balance
        otherUser.balance -= amount;
        user.balance += amount;

        // Add the animal to the other user's inventory
        await addToInventory(userMention.id, animalDetails);

        // Remove the animal from the current user's inventory
        await removeFromInventory(message.author.id, animalDetails);

        await user.save();
        await otherUser.save();

        await buttonInteraction.reply({
          content: `Trade successful! ${animalDetails.name} traded for **__${amount}__** ${emojis.currencyEmoji} EP coins.`,
        });
      } else if (buttonInteraction.customId === "cancel_trade") {
        await buttonInteraction.reply({
          content: "Trade cancelled.",
        });
      }
      collector.stop();
    });

    collector.on("end", async () => {
      // Remove buttons after interaction
      await tradeMessage.edit({ components: [] }).catch(console.error);
    });
  },
};

// Check if the user has the specified animal
async function checkUserHasAnimal(userId, animalName) {
  try {
    const commonAnimal = await CommonAnimal.findOne({
      userId,
      name: animalName,
    });
    const rareAnimal = await RareAnimal.findOne({ userId, name: animalName });
    const legendaryAnimal = await LegendaryAnimal.findOne({
      userId,
      name: animalName,
    });
    if (commonAnimal || rareAnimal || legendaryAnimal) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error checking user inventory:", error);
    return false;
  }
}
//get animal details
async function getAnimalDetails(name) {
  try {
    const commonAnimal = await CommonAnimal.findOne({ name });
    const rareAnimal = await RareAnimal.findOne({ name });
    const legendaryAnimal = await LegendaryAnimal.findOne({ name });

    if (commonAnimal) {
      return commonAnimal;
    } else if (rareAnimal) {
      return rareAnimal;
    } else if (legendaryAnimal) {
      return legendaryAnimal;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching animal details:", error);
    return null;
  }
}

async function addToInventory(userId, animalDetails) {
  try {
    const {
      name,
      emoji,
      count,
      cowoncyValue,
      rarity,
      image,
      level,
      xp,
      attack,
      health,
    } = animalDetails;

    let existingAnimal;
    switch (rarity) {
      case "common":
        existingAnimal = await CommonAnimal.findOne({ userId, name });
        break;
      case "rare":
        existingAnimal = await RareAnimal.findOne({ userId, name });
        break;
      case "legendary":
        existingAnimal = await LegendaryAnimal.findOne({ userId, name });
        break;
      default:
        console.error("Invalid animal rarity:", rarity);
        return false;
    }

    if (existingAnimal) {
      // If the recipient already has this animal, update its details
      existingAnimal.count += 1;
      existingAnimal.level = level; // Update level
      existingAnimal.xp = xp; // Update XP
      existingAnimal.attack = attack; // Update attack
      existingAnimal.health = health; // Update health
      await existingAnimal.save();
    } else {
      // Otherwise, add a new entry for the animal
      switch (rarity) {
        case "common":
          existingAnimal = new CommonAnimal({
            userId,
            name,
            emoji,
            count: 1,
            cowoncyValue,
            level,
            xp,
            attack,
            health,
          });
          break;
        case "rare":
          existingAnimal = new RareAnimal({
            userId,
            name,
            emoji,
            count: 1,
            cowoncyValue,
            level,
            xp,
            attack,
            health,
          });
          break;
        case "legendary":
          existingAnimal = new LegendaryAnimal({
            userId,
            name,
            emoji,
            image,
            count: 1,
            cowoncyValue,
            level,
            xp,
            attack,
            health,
          });
          break;
      }
      await existingAnimal.save();
    }
    return true;
  } catch (error) {
    console.error("Error adding animal to inventory:", error);
    return false;
  }
}

async function removeFromInventory(userId, animalDetails) {
  try {
    const { name } = animalDetails;

    let animalToRemove;
    switch (animalDetails.rarity) {
      case "common":
        animalToRemove = await CommonAnimal.findOne({ userId, name });
        break;
      case "rare":
        animalToRemove = await RareAnimal.findOne({ userId, name });
        break;
      case "legendary":
        animalToRemove = await LegendaryAnimal.findOne({ userId, name });
        break;
      default:
        console.error("Invalid animal rarity:", animalDetails.rarity);
        return false;
    }

    if (animalToRemove) {
      // If the user has this animal, decrement the count
      if (animalToRemove.count > 1) {
        animalToRemove.count -= 1;
        await animalToRemove.save();
      } else {
        // If there is only one instance, remove it from the inventory
        switch (animalDetails.rarity) {
          case "common":
            await CommonAnimal.findOneAndRemove({ userId, name });
            break;
          case "rare":
            await RareAnimal.findOneAndRemove({ userId, name });
            break;
          case "legendary":
            await LegendaryAnimal.findOneAndRemove({ userId, name });
            break;
        }
      }
      return true;
    } else {
      return false; // Animal not found in inventory
    }
  } catch (error) {
    console.error("Error removing animal from inventory:", error);
    return false;
  }
}
