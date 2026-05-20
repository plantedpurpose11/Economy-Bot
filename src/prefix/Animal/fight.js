const {
  MessageEmbed,
  ButtonStyle,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
} = require("discord.js");
const Hunter = require("../../Schemas.js/huntersSchema");
const UserAccount = require("../../Schemas.js/userAccountCreation");
const Blacklist = require("../../Schemas.js/BlacklistSchema");
const emoji = require('../../../emojis.json');

async function isUserBlacklisted(userId) {
  const entry = await Blacklist.findOne({ userId });
  return entry !== null; // If entry exists, user is blacklisted
}

const healthEmoji = ":anatomical_heart:";
const animationFrames = ["▁▂▃▄▅▆▇█", "▏▎▍▌▋▊▉█"];

const timeout = [];

module.exports = {
  name: "fight",
  description: "Challenge someone to a fight!",
  run: async (client, message, args) => {
    const isBlacklisted = await isUserBlacklisted(message.author.id);
    if (isBlacklisted) {
      return message.reply("You are blacklisted and cannot use this command.");
    }

    const userAccount = await UserAccount.findOne({
      userId: message.author.id,
    });

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

    const userMention = message.mentions.users.first();
    if (!userMention || userMention.id === message.author.id) {
      return message.reply("Please mention a user to challenge.");
    }

    const challengerHunters = await Hunter.find({ userId: message.author.id });
    const opponentHunters = await Hunter.find({ userId: userMention.id });

    // Check if any hunter's health is 25 or lower
    const hunterLowHealth = challengerHunters.find(
      (hunter) => hunter.health <= 25
    );
    const opponentHuntersLowHealth = opponentHunters.find(
      (hunter) => hunter.health <= 25
    );

    if (hunterLowHealth || opponentHuntersLowHealth) {
      const lowHealthEmbed = new EmbedBuilder()
        .setColor("#ff0000")
        .setTitle("Attention: Low Hunter Health")
        .setDescription(
          `One or more of your hunters have low health (${healthEmoji}).`
        )
        .addFields({
          name: "Action Required",
          value: `Before engaging in a fight, feed your hunters to restore their health.`,
        });

      return message.reply({ embeds: [lowHealthEmbed] });
    }

    if (!challengerHunters.length || !opponentHunters.length) {
      if (!challengerHunters.length) {
        message.reply("You don't have any hunters to fight!");
      }
      if (!opponentHunters.length) {
        message.channel.send(
          `${userMention} doesn't have any hunters to fight!`
        );
      }
      return;
    }

    const askConfirmation = async (message, opponent) => {
      const confirmationEmbed = new EmbedBuilder()
        .setTitle("Fight Confirmation")
        .setDescription(`${opponent}, do you accept the fight?`);

      const acceptButton = new ButtonBuilder()
        .setCustomId("accept_fight")
        .setLabel("Accept")
        .setStyle(ButtonStyle.Success);

      const declineButton = new ButtonBuilder()
        .setCustomId("decline_fight")
        .setLabel("Decline")
        .setStyle(ButtonStyle.Danger);

      const row = new ActionRowBuilder().addComponents(
        acceptButton,
        declineButton
      );

      return await message.channel.send({
        embeds: [confirmationEmbed],
        components: [row],
      });
    };

    const confirmationMessage = await askConfirmation(message, userMention);

    const filter = (interaction) => {
      return interaction.user.id === userMention.id;
    };

    const collector = confirmationMessage.createMessageComponentCollector({
      filter,
      time: 15000, // Time in milliseconds to wait for a response
    });

    collector.on("collect", async (interaction) => {
      const loserAccount = await UserAccount.findOne({
        userId: userMention.id,
      });

      const challengerAccount = await UserAccount.findOne({
        userId: message.author.id,
      });

      if (interaction.customId === "accept_fight") {
        if (loserAccount.balance < 1000 || challengerAccount.balance < 1000) {
          return await interaction.reply({
            content: `Sorry, ${userMention}! You don't have enough balance to start the fight.`,
            ephemeral: true,
          });
        }

        const winner = determineWinner(challengerHunters, opponentHunters);
        await interaction.update({
          content: `Fight! Fight! Fight!`,
          components: [],
        });
        await displayFight(message, userMention, winner);
        await handleFightOutcome(message, winner);
        collector.stop(); // Stop collecting responses
      } else if (interaction.customId === "decline_fight") {
        await interaction.update({
          content: `${userMention} declined the fight.`,
          components: [],
        });
        collector.stop(); // Stop collecting responses
      }
    });

    collector.on("end", () => {
      if (!confirmationMessage.deleted) {
        confirmationMessage.edit({ components: [] }).catch(console.error);
      }
    });

    function determineWinner(challengerHunters, opponentHunters) {
      let challengerTotalPower = 0;
      let opponentTotalPower = 0;

      for (const hunter of challengerHunters) {
        challengerTotalPower += hunter.level * 2 + hunter.attack;
      }

      for (const hunter of opponentHunters) {
        opponentTotalPower += hunter.level * 2 + hunter.attack;
      }

      if (challengerTotalPower > opponentTotalPower) {
        return message.author;
      } else if (challengerTotalPower < opponentTotalPower) {
        return userMention;
      } else {
        return null; // It's a draw
      }
    }

    async function handleFightOutcome(message, winner) {
      if (winner) {
        const loserHunters =
          winner === message.author ? opponentHunters : challengerHunters;

        for (const hunter of loserHunters) {
          if (hunter.health > 10) {
            hunter.health -= 10;
          } else {
            hunter.health = 0; // Health cannot be negative
          }
          await hunter.save();
        }

        const winnerUser =
          winner === message.author ? message.author : userMention;
        const winnerAccount = await UserAccount.findOne({
          userId: winnerUser.id,
        });
        winnerAccount.balance += 700;
        await winnerAccount.save();

        const loserUser =
          winner !== message.author ? message.author : userMention;
        const loserAccount = await UserAccount.findOne({
          userId: loserUser.id,
        });
        loserAccount.balance -= 1000;
        await loserAccount.save();

        await message.reply({
          content: `${winner} wins the fight! They earned **__700__** ${emoji.currencyEmoji} EP Coins. ${loserUser} lost and had **1000** ${emoji.currencyEmoji} EP Coins deducted.`,
        });
      } else {
        await message.reply({ content: "It's a draw!" });
      }
    }

        // Display Fight Function and getHealthBars Function

        async function displayFight(message, opponent, winner) {
          const challengerHunters = await Hunter.find({ userId: message.author.id });
          const opponentHunters = await Hunter.find({ userId: opponent.id });
          const challengerTotalHealth = calculateTotalHealth(challengerHunters);
          const opponentTotalHealth = calculateTotalHealth(opponentHunters);

          const healthBars = getHealthBars(
            challengerTotalHealth,
            opponentTotalHealth
          );

          function calculateTotalHealth(hunters) {
            let totalHealth = 0;
            for (const hunter of hunters) {
              totalHealth += hunter.health;
            }
            return totalHealth;
          }

          function getHealthBars(challengerHealth, opponentHealth) {
            const maxHealth = Math.max(challengerHealth, opponentHealth);

            const challengerPercentage = Math.floor(
              (challengerHealth / maxHealth) * 100
            );
            const opponentPercentage = Math.floor(
              (opponentHealth / maxHealth) * 100
            );

            const challengerProgress = Math.ceil((challengerPercentage / 100) * 10);
            const opponentProgress = Math.ceil((opponentPercentage / 100) * 10);

            const challengerRemaining = 10 - challengerProgress;
            const opponentRemaining = 10 - opponentProgress;

            const challengerBar = `${healthEmoji.repeat(
              challengerProgress
            )}${animationFrames[0].charAt(
              challengerRemaining
            )} ${challengerPercentage}%`;
            const opponentBar = `${healthEmoji.repeat(
              opponentProgress
            )}${animationFrames[0].charAt(
              opponentRemaining
            )} ${opponentPercentage}%`;

            return { challengerBar, opponentBar };
          }

         // Get hunter emojis
      const challengerEmojis = challengerHunters.map((hunter) => hunter.emoji);
      const opponentEmojis = opponentHunters.map((hunter) => hunter.emoji);

          const embed = new EmbedBuilder()
            .setTitle("Fight!")
            .setDescription(`${opponent}, the battle is on!\nLet's get ready!`)
            .addFields({
              name: "Challenger Hunters:",
              value: challengerEmojis.join(" | "),
            })
            .addFields({
              name: "Opponent Hunters:",
              value: opponentEmojis.join(" | "),
            })
            .addFields(
              { name: "Challenger Health:", value: healthBars.challengerBar },
              { name: "Opponent Health:", value: healthBars.opponentBar }
            )
            .setColor("#0099ff");

          

          const sentMessage = await message.channel.send({
            content: opponent.toString(),
            embeds: [embed],
            // components: [],
          });

          // Pre-fight animations
          const updateEmbed = async (healthBars, animationIndex) => {
            const preFightEmbed = new EmbedBuilder()
              .setTitle("Fight!")
              .setDescription(`${opponent}, the battle is on!\nLet's get ready!`)
              .addFields({
                name: "Challenger Hunters:",
                value: challengerEmojis.join(" | "),
              })
              .addFields({
                name: "Opponent Hunters:",
                value: opponentEmojis.join(" | "),
              })
              .addFields(
                { name: "Challenger Health:", value: healthBars.challengerBar },
                { name: "Opponent Health:", value: healthBars.opponentBar }
              )
              .setColor("#0099ff");

            preFightEmbed.setDescription(`Animating the pre-fight scene...`);
            preFightEmbed.addFields({
              name: "Animation Frames:",
              value: `${animationFrames[animationIndex % animationFrames.length]}`,
            });

            await sentMessage.edit({
              content: opponent.toString(),
              embeds: [preFightEmbed],
            });
          };

          // Run pre-fight animations (adjust the number of iterations as needed)
          for (let i = 0; i < 3; i++) {
            await updateEmbed(healthBars, i);
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }

          // Health deduction animation for the less powerful opponent
          if (healthBars.challengerBar !== healthBars.opponentBar) {
            const deductionEmbed = new EmbedBuilder()
              .setTitle("Fight!")
              .setDescription(
                `${opponent}, the battle is on!\n${opponent}'s health is decreasing!`
              )
              .addFields(
                { name: "Challenger Health:", value: healthBars.challengerBar },
                { name: "Opponent Health:", value: healthBars.opponentBar }
              )
              .setColor("#ff0000");

            await sentMessage.edit({
              content: opponent.toString(),
              embeds: [deductionEmbed],
            });
            await new Promise((resolve) => setTimeout(resolve, 1500));
          }

          return sentMessage;
        }

        function getHealthBars(
          challengerHealth,
          maxChallengerHealth,
          opponentHealth,
          maxOpponentHealth
        ) {
          const healthEmoji = ":anatomical_heart:";
          const animationFrames = ["▁▂▃▄▅▆▇█", "▏▎▍▌▋▊▉█"];

          const challengerPercentage = Math.floor(
            (challengerHealth / maxChallengerHealth) * 100
          );
          const opponentPercentage = Math.floor(
            (opponentHealth / maxOpponentHealth) * 100
          );

          const challengerProgress = Math.ceil((challengerPercentage / 100) * 10);
          const opponentProgress = Math.ceil((opponentPercentage / 100) * 10);

          const challengerRemaining = 10 - challengerProgress;
          const opponentRemaining = 10 - opponentProgress;

          const challengerBar = `${healthEmoji.repeat(
            challengerProgress
          )}${animationFrames[0].charAt(
            challengerRemaining
          )} ${challengerPercentage}%`;
          const opponentBar = `${healthEmoji.repeat(
            opponentProgress
          )}${animationFrames[0].charAt(opponentRemaining)} ${opponentPercentage}%`;

          return { challengerBar, opponentBar };
        }
      },
    };

   