const User = require("../../Schemas.js/userAccountCreation");
const Blacklist = require("../../Schemas.js/BlacklistSchema");
const { MessageEmbed, EmbedBuilder } = require("discord.js");
const emojis = require("../../../emojis.json");

async function isUserBlacklisted(userId) {
  const entry = await Blacklist.findOne({ userId });
  return entry !== null; // If entry exists, user is blacklisted
}

const fruits = [
  "🍒", "🫐", "🍊", "🍋", "🍇", "🍉", "🍒", "🍊", "🍋", "🍏",
  "🍇", "🍉", "🍒", "🍊", "🍋", "🍇", "🍉", "🍒", "🍊", "🍋",
  "🍇", "🍉"
]; // List of fruit emojis

var timeout = [];

module.exports = {
  name: "slots",
  description: "Play a slots game by betting EP coins",
  aliases: ["s"],
  usage: "slots <amount>",

  run: async (client, message, args) => {
    const isBlacklisted = await isUserBlacklisted(message.author.id);
    if (isBlacklisted) {
      return message.reply("You are blacklisted and cannot use this command.");
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
        return message.reply("You don't have an account yet!");
      }

      let amount = 0;

      if (args[0] && args[0].toLowerCase() === 'all') {
        if (user.balance <= 0) {
          return message.reply("You don't have any balance to play slots!");
        } else if (user.balance > 200000) {
          amount = 200000;
        } else {
          amount = user.balance;
        }
      } else {
        amount = parseInt(args[0]);

        if (isNaN(amount) || amount <= 0) {
          return message.reply("Please enter a valid amount to bet.");
        }

        if (amount > 200000) {
          return message.reply(
            `The maximum bet amount is 200,000 ${emojis.currencyEmoji} EP coins.`
          );
        }

        if (amount > user.balance) {
          return message.reply("You don't have enough balance for this bet!");
        }
      }

      const randomIndex = Math.floor(Math.random() * fruits.length);
      const selectedFruit = fruits[randomIndex];

      // Ensure the first two slots match the selected fruit
      const slot1 = selectedFruit;
      const slot2 = selectedFruit;

      // Select the third slot randomly
      const slot3 = fruits[Math.floor(Math.random() * fruits.length)];

      const embed = new EmbedBuilder()
        .setTitle("Slots")
        .setDescription(`**[${emojis.slotsSpinning}] [${emojis.slotsSpinning}] [${emojis.slotsSpinning}]**`)
        .setColor("#ffdd57");

      const slotsMessage = await message.reply({ embeds: [embed] });

      setTimeout(async () => {
        await slotsMessage.edit({
          embeds: [embed.setDescription(`**[${slot1}] [${emojis.slotsSpinning}] [${emojis.slotsSpinning}]**`)],
        });

        setTimeout(async () => {
          await slotsMessage.edit({
            embeds: [embed.setDescription(`**[${slot1}] [${slot2}] [${emojis.slotsSpinning}]**`)],
          });

          setTimeout(async () => {
            await slotsMessage.edit({
              embeds: [
                embed.setDescription(`**[${slot1}] [${slot2}] [${slot3}]**`),
              ],
            });

            const isWin = slot1 === slot2 && slot2 === slot3; // Win if all three slots match

            if (isWin) {
              const winAmount = amount * 3; // Triple the bet for a win
              user.balance += winAmount;
              await user.save();
              embed.setDescription(
                `${emojis.slotsWin} Congratulations! You won **__${winAmount.toLocaleString()}__** ${emojis.currencyEmoji} EP coins in the slots.`
              );
              embed.setColor("#57f287");
            } else {
              user.balance -= amount; // Lose
              await user.save();
              embed.setDescription(
                `${emojis.slotsLose} Oh no! You lost **__${amount.toLocaleString()}__** ${emojis.currencyEmoji} EP coins in the slots!`
              );
              embed.setColor("#f25757");
            }
            await slotsMessage.edit({ embeds: [embed] });
          }, 1000); // Delay before revealing the final result
        }, 500); // Delay for the second slot
      }, 500); // Delay for the first slot
    } catch (err) {
      console.error("Error:", err);
      message.reply("An error occurred while processing the slots game.");
    }
  },
};
