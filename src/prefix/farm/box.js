
const Box = require("../../Schemas.js/boxSchema");
const { MessageEmbed, EmbedBuilder } = require("discord.js");
const User = require('../../Schemas.js/userAccountCreation');

module.exports = {
  name: "box",
  run: async (client, message, args) => {
    try {
      const userAccount = await User.findOne({ userId: message.author.id });

      if (!userAccount) {
        return message.reply(":ribbon: **First use** `ep start` **to start your journey.**");
      }
      const userId = message.author.id;

      // Fetch the user's box
      const userBox = await Box.findOne({ userId });
      if (!userBox || userBox.items.length === 0) {
        return message.reply("Your box is empty.");
      }

      // Mapping seeds to their respective sell prices
      const seedSellPrices = {
        Carrot_Seeds: 3000,
        Potato_Seeds: 1500,
        Rice_Seeds: 1000,
      };

      let totalPrice = 0;

      // Calculate total price based on seeds in the box
      userBox.items.forEach((item) => {
        const sellPrice = seedSellPrices[item.name];
        if (sellPrice) {
          totalPrice += sellPrice * item.quantity;
        }
      });

      // Create an embed to display the box contents and total price
      const boxEmbed = new EmbedBuilder()
        .setColor("#ffcc00")
        
        .setTitle(`**${message.author.username}'s** Box`)
        .setDescription("Items available for sale:")
        .setFooter({text: 'For Sell:', value: "ep sellbox"});

      // Construct the fields for the embed to show items in the user's box
      userBox.items.forEach((item) => {
        const sellPrice = seedSellPrices[item.name];
        if (sellPrice) {
          boxEmbed.addFields(
            {name:`${item.emoji}`, value: `x${item.quantity}`},
            {name:`Price:`, value: `${sellPrice.toLocaleString()} EP`}
          );
        }
      });

      // Add total price to the embed
      boxEmbed.addFields(
        {name:"Total Price for Sale",
        value:`Total: **__${totalPrice.toLocaleString()}__** EP`}
      );

      // Send the embed with the user's box contents and total price
      return message.reply({ embeds: [boxEmbed] });
    } catch (err) {
      console.error("Error fetching box contents:", err);
      return message.reply(
        "An error occurred while fetching your box contents."
      );
    }
  },
};
