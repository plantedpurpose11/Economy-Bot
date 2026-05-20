const User = require("../../Schemas.js/userAccountCreation");
const Gem = require("../../Schemas.js/gemsSchema");
const {
  CommonAnimal,
  RareAnimal,
  LegendaryAnimal,
} = require("../../Schemas.js/userJungle");
const Hunter = require("../../Schemas.js/huntersSchema");
const Blacklist = require("../../Schemas.js/BlacklistSchema");
const { EmbedBuilder } = require("discord.js");

// Import animal configurations
const { commonAnimals } = require("../../../animalConfig/commonAnimals.json");
const { rareAnimals } = require("../../../animalConfig/rareAnimals.json");
const { legendaryAnimals } = require("../../../animalConfig/legendaryAnimals.json");

async function isUserBlacklisted(userId) {
  const entry = await Blacklist.findOne({ userId });
  return entry !== null; // If entry exists, user is blacklisted
}

const timeout = [];
module.exports = {
  name: "search",
  aliases: ["s"],

  run: async (client, message, args) => {
    const isBlacklisted = await isUserBlacklisted(message.author.id);
    if (isBlacklisted) {
      return message.reply("You are blacklisted and cannot use this command.");
    }

    const hunters = await Hunter.find({
      userId: message.author.id,
    });

    // Filter hunters with a level greater than 20
    const highLevelHunters = hunters.filter((hunter) => hunter.level > 115);

    if (highLevelHunters.length > 0) {
      const removedHunterIds = highLevelHunters.map((hunter) => hunter._id);

      const warnEmbed = new EmbedBuilder()
        .setColor("#ff0000")
        .setDescription(
          `Warning: ${
            highLevelHunters.length > 1 ? "Some hunters are" : "One hunter is"
          } old and has been removed!`
        );

      message.reply({ embeds: [warnEmbed] });

      // Remove hunters from the database
      await Hunter.deleteMany({ _id: { $in: removedHunterIds } });
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
      const user = await User.findOne({ userId: message.author.id });

      if (!user) {
        return message.reply(
          ":ribbon: **First use** `ep start` **to start your journey.**"
        );
      }

      const hunters = await Hunter.find({
        userId: message.author.id,
      });

      // Check if any hunter's health is below 25
      const lowHealthHunters = hunters.filter((hunter) => hunter.health < 25);

      if (lowHealthHunters.length > 0) {
        return message.reply(
          `Some of your hunters have health below 25. Please feed them before going on a hunt.`
        );
      }

      for (const hunter of hunters) {
        // Update hunter attributes
        hunter.health -= 3;
        hunter.xp += 10;

        // Check for level up
        if (hunter.xp >= 100) {
          hunter.level += 1;
          hunter.attack += 10;
          hunter.xp -= 100;

          // Save the updated hunter data
        }
        await hunter.save();
      }

      const userGems = await Gem.findOne({ userId: message.author.id });
      let numberOfAnimals = 1; // Default number of animals

      const beastCharmGem = userGems ? userGems.gems.find(
        (gem) => gem.gemType === "beastcharm" && gem.activated && gem.count > 0
      ) : null;
      if (beastCharmGem) {
        // Deduct gems for beast charm
        beastCharmGem.count -= 1; // Deduct one beast charm gem
        if (beastCharmGem.count === 0) {
          beastCharmGem.activated = false; // Deactivate the charm when the count reaches 0
        }

        numberOfAnimals = 12;

        // Save changes to the userGems object in the database
        await userGems.save(); // Set the number of animals after gem deduction
      } else if (hunters.length === 1) {
        numberOfAnimals = 2;
      } else if (hunters.length === 2) {
        numberOfAnimals = 3;
      } else if (hunters.length === 3) {
        numberOfAnimals = 4;
      } else if (hunters.length >= 4) {
        numberOfAnimals = 6;
      }

      const bountyBeastGem = userGems ? userGems.gems.find(
        (gem) => gem.gemType === "bountyboost" && gem.activated && gem.count > 0
      ) : null;

      let coinCost = 10; // Default cost for one animal

if (bountyBeastGem && bountyBeastGem.count > 0) {
  coinCost = 10; // If bountybeast gem is activated and count > 0, set the cost to 10 per search
  bountyBeastGem.count -= 1; // Deduct one bountybeast gem
  userGems.save();
  if (bountyBeastGem.count === 0) {
    bountyBeastGem.activated = false; // Deactivate the gem when the count reaches 0
  }
}

// Check the user's balance against the cost of hunting the set number of animals
if (user.balance < coinCost * numberOfAnimals) {
  return message.reply(
    "You don't have enough balance to go on a hunt for this many animals."
  );
}

user.balance -= coinCost * numberOfAnimals; // Multiply by numberOfAnimals for the total cost
await user.save();

      // Show "Searching for animals" message
      const searchingMessage = await message.reply(
        "<a:searching:1179742432116609025> Searching for animals..."
      );

      let animalsFound = [];
      let predatorsEdgeGem;

      for (let i = 0; i < numberOfAnimals; i++) {
        const { animal, rarity, level, attack } = getRandomAnimal();
      
        predatorsEdgeGem = userGems ? userGems.gems.find(
          (gem) =>
            gem.gemType === "predatorsedge" && gem.activated && gem.count > 0
        ) : null;
        // Check if PredatorsEdge gem is activated and has count
        if (predatorsEdgeGem && predatorsEdgeGem.activated) {
          predatorsEdgeGem.count -= 1; // Deduct one PredatorsEdge gem
      		userGems.save();
          if (predatorsEdgeGem.count === 0) {
            predatorsEdgeGem.activated = false; // Deactivate the gem when the count reaches 0
          }
          // If PredatorsEdge is activated, set minimum level and attack to 20
          const modifiedLevel = Math.max(level, 20);
          const modifiedAttack = Math.max(attack, 20);
          // Create an object with modified level and attack
          const modifiedAnimal = {
            name: animal.name,
            emoji: animal.emoji,
            rarity,
            level: modifiedLevel,
            attack: modifiedAttack,
          };
        
      
          // Push the modified animal into the animalsFound array
          animalsFound.push(modifiedAnimal);
        } else {
          // If PredatorsEdge is not activated, proceed with the obtained animal as is
          animalsFound.push({
            name: animal.name,
            emoji: animal.emoji,
            rarity,
            level,
            attack,
          });
        }
        let userInventory;
        const updateData = {
          $inc: { count: 1 },
          $set: {
            cowoncyValue: 0, // Set the appropriate cowoncy value based on rarity below
            level, // Save level in the database
            attack, // Save attack in the database
          },
          $setOnInsert: {
            userId: message.author.id,
            name: animal.name,
            emoji: animal.emoji,
          }, // Insert these details only if a new document is created
        };

        let existingAnimal;
        if (rarity === "Common") {
          existingAnimal = await CommonAnimal.findOne({
            userId: message.author.id,
            name: animal.name,
          });
          updateData.$set.cowoncyValue = 6;
        } else if (rarity === "Rare") {
          existingAnimal = await RareAnimal.findOne({
            userId: message.author.id,
            name: animal.name,
          });
          updateData.$set.cowoncyValue = 13;
        } else {
          existingAnimal = await LegendaryAnimal.findOne({
            userId: message.author.id,
            name: animal.name,
          });
          updateData.$set.cowoncyValue = 200;
          if (animal.image) {
            userInventory = await LegendaryAnimal.findOneAndUpdate(
              { userId: message.author.id, name: animal.name },
              {
                $set: { image: animal.image },
                $setOnInsert: updateData.$setOnInsert,
              },
              { upsert: true, new: true }
            );
          }
        }

        if (existingAnimal) {
          userInventory = await existingAnimal.updateOne({
            $inc: { count: 1, cowoncyValue: updateData.$set.cowoncyValue },
          });
        } else {
          if (rarity === "Common") {
            userInventory = await CommonAnimal.findOneAndUpdate(
              { userId: message.author.id, name: animal.name },
              updateData,
              { upsert: true, new: true }
            );
          } else if (rarity === "Rare") {
            userInventory = await RareAnimal.findOneAndUpdate(
              { userId: message.author.id, name: animal.name },
              updateData,
              { upsert: true, new: true }
            );
          } else {
            userInventory = await LegendaryAnimal.findOneAndUpdate(
              { userId: message.author.id, name: animal.name },
              updateData,
              { upsert: true, new: true }
            );
          }
        }
      }

      const foundAnimalsMsg = animalsFound
        .map((animal) => animal.emoji)
        .join(", ");

      let activatedGems = "";

      if (beastCharmGem && beastCharmGem.activated) {
        activatedGems += ` ${beastCharmGem.emoji}`;
      }

      if (bountyBeastGem && bountyBeastGem.activated) {
        activatedGems += ` ${bountyBeastGem.emoji}`;
      }

      if (predatorsEdgeGem && predatorsEdgeGem.activated) {
        activatedGems += ` ${predatorsEdgeGem.emoji}`;
      }

      let replyMessage = `You spent **${coinCost * numberOfAnimals}** <:ecopal:1183387676775284906> EP coins and found ${foundAnimalsMsg}!`;

      if (activatedGems !== "") {
        replyMessage += `\n\n**Activated Gems:**${activatedGems}`;
      }
       
      return searchingMessage.edit(replyMessage);
    } catch (err) {
      console.error("Error:", err);
      return message.reply("An error occurred while processing the hunt.");
    }
  },
};

function getRandomAnimal() {
  const randomValue = Math.random() * 100;
  let rarity, animal;

  if (randomValue >= 30 && randomValue < 99) {
    animal = commonAnimals[Math.floor(Math.random() * commonAnimals.length)];
    rarity = "Common";
  } else if (randomValue >= 0 && randomValue < 30) {
    animal = rareAnimals[Math.floor(Math.random() * rareAnimals.length)];
    rarity = "Rare";
  } else {
    animal = legendaryAnimals[Math.floor(Math.random() * legendaryAnimals.length)];
    rarity = "Legendary";
  }

  // Randomly generating level and attack based on rarity
  let level = 1;
  let attack = 1;

  if (rarity === "Common") {
    level = Math.floor(Math.random() * 4) + 1; // Reduced range for common animals
    attack = Math.floor(Math.random() * 6) + 1; // Reduced range for common animals
  } else if (rarity === "Rare") {
    level = Math.floor(Math.random() * 7) + 1;
    attack = Math.floor(Math.random() * 10) + 1;
  } else if (rarity === "Legendary") {
    level = Math.floor(Math.random() * 9) + 5;
    attack = Math.floor(Math.random() * 15) + 10;
  }

  return { animal, rarity, level, attack };
}
