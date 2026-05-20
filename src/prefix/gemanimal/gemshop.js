const { MessageEmbed, MessageActionRow, MessageButton, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

// Sample data of premium animals
const premiumAnimals = [
  {
    name: 'Opalynx',
    level: 45,
    attack: 180,
    health: 250,
    xp: 200,
    emoji: "<:Opalynx:1194986387523522672>",
    price: 2000000,
    image: 'https://cdn.discordapp.com/attachments/1194628137892458588/1194664549899567294/Untitled_design_3.gif',
  },
  {
    name: 'Topaztail',
    level: 56,
    attack: 290,
    health: 160,
    xp: 220,
    emoji: "<:Topaztail:1194986394003718234>",
    price: 3500000,
    image: 'https://cdn.discordapp.com/attachments/1194628137892458588/1194664801591365732/Untitled_design_4.gif',
  },
  {
    name: 'Rubywing',
    level: 65,
    attack: 345,
    health: 160,
    xp: 390,
    emoji: "<:Rubywing:1194986382851063848>",
    price: 4500000,
    image: 'https://cdn.discordapp.com/attachments/1194628137892458588/1194665084706889789/Untitled_design_5.gif',
  },
  
  {
    name: 'Amethyssian',
    level: 86,
    attack: 385,
    health: 160,
    xp: 410,
    emoji: "<:Amethyssian:1194986347849588827>",
    price: 6000000,
    image: 'https://cdn.discordapp.com/attachments/1194628137892458588/1194667334367989830/Untitled_design_10.gif',
  },
  {
    name: 'Garnetbeak',
    level: 96,
    attack: 485,
    health: 860,
    xp: 220,
    emoji: "<:Garnetbeak:1194986352614322207>",
    price: 7500000,
    image: 'https://cdn.discordapp.com/attachments/1194628137892458588/1194667655089619064/Untitled_design_11.gif',
  },
  {
    name: 'Citrinoise',
    level: 126,
    attack: 885,
    health: 160,
    xp: 720,
    emoji: "<:Citrinoise:1194986377436217404>",
    price: 10000000,
    image: 'https://cdn.discordapp.com/attachments/1194628137892458588/1194668025987747930/Untitled_design_12.gif',
  },
  {
    name: 'Tanzanitear',
    level: 136,
    attack: 485,
    health: 1160,
    xp: 2120,
    emoji: "<:Tanzanitear:1194986318594322523>",
    price: 13000000,
    image: 'https://cdn.discordapp.com/attachments/1194628137892458588/1194668044518162502/Untitled_design_13.gif',
  },
  {
    name: 'Peridotalon',
    level: 236,
    attack: 785,
    health: 7160,
    xp: 6230,
    emoji: "<:Peridotalon:1194986364727459971>",
    price: 16000000,
    image: 'https://cdn.discordapp.com/attachments/1194628137892458588/1194668061324742776/Untitled_design_14.gif',
  },
  {
    name: 'Aquamarlion',
    level: 2236,
    attack: 1285,
    health: 4160,
    xp: 4220,
    emoji: "<:Aquamarlion:1194986330770395236>",
    price: 19000000,
    image: 'https://cdn.discordapp.com/attachments/1194628137892458588/1194668463919214612/Untitled_design_15.gif',
  },
  {
    name: 'Onyxfang',
    level: 3335,
    attack: 8545,
    health: 7160,
    xp: 2520,
    emoji: "<:Onyxfang:1194986359513960470>",
    price: 21000000,
    image: 'https://cdn.discordapp.com/attachments/1194628137892458588/1194668486006419466/Untitled_design_16.gif',
  },
  
  {
    name: 'Moonstaria',
    level: 5566,
    attack: 4485,
    health: 9160,
    xp: 9220,
    emoji: "<:Moonstaria:1194986308502818866>",
    price: 31000000,
    image: 'https://cdn.discordapp.com/attachments/1194628137892458588/1194668544697307246/Untitled_design_18.gif',
  },
  {
    name: 'Larimarlynx',
    level: 6676,
    attack: 9885,
    health: 10160,
    xp: 20220,
    emoji: "<:Larimarlynx:1194986322486644746>",
    price: 45000000,
    image: 'https://cdn.discordapp.com/attachments/1194628137892458588/1194668562900590683/Untitled_design_19.gif',
  },
  {
    name: 'Alexandriteer',
    level: 9959,
    attack: 8455,
    health: 33200,
    xp: 63660,
    emoji: "<:Alexandriteer:1194986336382373919>",
    price: 50000000,
    image: 'https://cdn.discordapp.com/attachments/1194628137892458588/1194668584190881952/Untitled_design_20.gif',
  },
  // Add more animals as needed
];
const TradePremium = new Map();

module.exports = {
  name: 'market',
  run: async (client, message, args) => {
    let index = 0; // To keep track of the current animal being displayed
    
    // Function to display the animal's details
    const displayAnimal = (index, userId) => {
      const userId2 = message.author.id;
    TradePremium.set(userId2, true);
      const animal = premiumAnimals[index];
      const embed = new EmbedBuilder()
        .setAuthor({ name: `Gem Animal: ${animal.name}`, iconURL: message.author.displayAvatarURL({
            format: "png",
            dynamic: true,
            size: 128,
          }) })
        // .setTitle(`Premium Animal: ${animal.name}`)
        .setColor('#eabea9')
        .setDescription(`<:black_dragon:1195254886053462067> **Level:** ${animal.level}\n<:black_dragon:1195254886053462067> **Attack:** ${animal.attack}\n<:black_dragon:1195254886053462067> **Emoji:** ${animal.emoji}\n<:black_dragon:1195254886053462067> **Health:** ${animal.health}\n<:black_dragon:1195254886053462067> **XP:** ${animal.xp}\n<:black_dragon:1195254886053462067> **Price:** **${animal.price.toLocaleString()}**`)
        .setThumbnail(animal.image);

      // const ability = new EmbedBuilder()
      //   .setTitle(`Ability: ${animal.ability}`)
      //   .setColor('#eabea9')


      return { embed };
    };

    const { embed } = displayAnimal(index);
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('previous')
          .setLabel('Previous')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('next')
          .setLabel('Next')
          .setStyle(ButtonStyle.Primary),
      );

    const messageComponents = await message.channel.send({ embeds: [embed], components: [row] });

    const filter = (interaction) => {
      return interaction.user.id === message.author.id;
    };

    const collector = messageComponents.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async (interaction) => {
      const { user } = interaction;
      const userId3 = user.id;
      const customIdSelect3 = TradePremium.get(userId3);
      if (customIdSelect3 !== true) {
        await message.reply({
          content: `${user} This select menu is only for the original user.`,
          ephemeral: true,
        });
        return;
      }
      if (interaction.customId === 'next') {
        index = (index + 1) % premiumAnimals.length;
      } else if (interaction.customId === 'previous') {
        index = (index - 1 + premiumAnimals.length) % premiumAnimals.length;
      }

      const { embed: newEmbed } = displayAnimal(index);
      await interaction.update({ embeds: [newEmbed] });
    });

    collector.on('end', async () => {
        row.components.forEach((component) => {
        
          component.setDisabled(true);
        });

        await messageComponents.edit({ components: [row] });
  
        // Disable buttons after 30 seconds
        setTimeout(async () => {
          row.components.forEach((component) => {
            component.setDisabled(true);
          });
          await messageComponents.edit({ components: [row] });
        }, 30000);
      });
  },
};
