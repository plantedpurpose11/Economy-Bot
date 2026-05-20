const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  PermissionsBitField,
  Permissions,
  StringSelectMenuBuilder,
  MessageManager,
  ModalBuilder,
  ButtonBuilder,
  ButtonStyle,
  Embed,
  Collection,
  Events,
  MessageEmbed,
} = require(`discord.js`);
const fs = require("fs");
const config = require('./../config.json');
const emojis = require('./../config/emojis.json');
const path = require("path");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});
const { EventEmitter } = require('events');

// Create an instance of EventEmitter
const myEmitter = new EventEmitter();

// Set the maximum number of listeners to 500
myEmitter.setMaxListeners(0);



client.commands = new Collection();
client.prefix = new Collection();

require("dotenv").config();

const functions = fs
  .readdirSync("./src/functions")
  .filter((file) => file.endsWith(".js"));
const eventFiles = fs
  .readdirSync("./src/events")
  .filter((file) => file.endsWith(".js"));
const commandFolders = fs.readdirSync("./src/commands");
const prefixFolders = fs
  .readdirSync("./src/prefix", { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => dirent.name);

for (const folder of prefixFolders) {
  const folderPath = path.join(__dirname, `./prefix/${folder}`);
  const commandFiles = fs
    .readdirSync(folderPath)
    .filter((file) => file.endsWith(".js"));

  for (const file of commandFiles) {
    const command = require(path.join(folderPath, file));
    client.prefix.set(command.name, command);
  }
}

(async () => {
  for (file of functions) {
    require(`./functions/${file}`)(client);
  }
  client.handleEvents(eventFiles, "./src/events");
  client.handleCommands(commandFolders, "./src/commands");
  client.login(process.env.token);
})();
const ChannelsDisable = require("./Schemas.js/channelDisable");
const commandInProgress = new Map(); 
const userSelectMenuMap = new Map();

client.on("messageCreate", async (message) => {
  const prefix = config.prefix;
  const content = message.content.toLowerCase();
  
  if (!content.startsWith(prefix) || message.author.bot) return;

  const args = content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  let command = client.prefix.get(commandName);

  if (!command) {
    command = Array.from(client.prefix.values()).find(
      (cmd) => cmd.aliases && cmd.aliases.includes(commandName)
    );
  }

  if (command) {
    try {
      const userId = message.author.id;

      if (commandInProgress.get(userId)) {
        return message.reply("You already have a command in progress. Please wait for it to finish.");
      }

      commandInProgress.set(userId, true);

      if (commandName === "enable") {
        return command.run(client, message, args);
      }
        if (commandName === "help") {
        userSelectMenuMap.set(userId, true);

      }

      const disabledChannel = await ChannelsDisable.findOne({
        channelId: message.channel.id,
      });

      if (disabledChannel) {
        return;
      }

      await command.run(client, message, args);

      if (commandName === "coinflip" || commandName === "cf") {
        commandInProgress.set(userId, "coinflip"); 

        setTimeout(() => {
          commandInProgress.delete(userId);
        }, 5000);
      } else if (commandName === "deposit") {
        const coinflipInProgress = commandInProgress.get(userId);
        if (coinflipInProgress === "coinflip") {
          await wait(5000); 
          await command.run(client, message, args); 
        }
      }
    } catch (error) {
      console.error(error);
      message.reply("There was an error executing that command.");
    } finally {
      const userId = message.author.id;
      setTimeout(() => {
        commandInProgress.delete(userId);
      }, 3000);
    }
  }
});

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


const prefix = config.prefix;
const channelId = config.commandLogs; 


client.on("messageCreate", async (message) => {
  const content = message.content.toLowerCase(); 
  if (!content.startsWith(prefix.toLowerCase()) || message.author.bot) return;

  const args = content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  const commandDetailsEmbed = new EmbedBuilder()
    .setTitle("Command Details")
    .setColor("#008000"); 

  
  commandDetailsEmbed.addFields(
    { name: "Username", value: message.author.username },
    { name: "User ID", value: message.author.id },
    { name: "Server", value: message.guild.name },
    { name: "Server ID", value: message.guild.id },
    { name: "Command Used", value: command }
  );

  const channel = client.channels.cache.get(channelId);
  if (channel) {
    channel.send({ embeds: [commandDetailsEmbed] });
  }
});

//level
// ============= level
const canvafy = require("canvafy");
// ============= level
const User = require("./Schemas.js/userAccountCreation");
const Level = require("./Schemas.js/levelSchema");

const xpPerLevel = (level) => {
  let xp = 1; 
  return xp;
};
const cooldowns = new Map();

client.on("messageCreate", async (message) => {
  const content = message.content.toLowerCase();
  if (!content.startsWith(prefix.toLowerCase()) || message.author.bot) return;

  let user = await Level.findOne({ userId: message.author.id });

  if (!user) {
    user = await Level.create({
      userId: message.author.id,
      xp: 0,
      level: 1,
    });
  }

  user.xp += xpPerLevel(user.level); 

  const xpToLevelUp = 20 + (user.level - 1) * 20;
  const xpNeeded = xpToLevelUp;

  if (user.xp >= xpNeeded) {
    if (cooldowns.has(message.author.id)) {
      const expirationTime = cooldowns.get(message.author.id);
      const timeDifference = expirationTime - Date.now();

      if (timeDifference > 0) {
        return;
      }
    }

    if (user.xp >= xpNeeded) {
      user.xp -= xpNeeded;
      user.level++;

      const cooldownTime = 60000; 
      cooldowns.set(message.author.id, Date.now() + cooldownTime);

      const balanceToAdd =
        user.level === 2 ? 15000 : 15000 + (user.level - 2) * 5000;

      const updatedUserBalance = await User.findOneAndUpdate(
        { userId: message.author.id },
        { $inc: { balance: balanceToAdd } },
        { upsert: true, new: true }
      );

      const oldLevel = user.level - 1;
      const levelUpBackgroundImage = config.levelUpBackgroundImage; 

      const levelUp = await new canvafy.LevelUp()
        .setAvatar(
          message.author.displayAvatarURL({
            format: "png",
            dynamic: true,
            size: 128,
          })
        ) 
        .setBackground(
          "image",
          levelUpBackgroundImage
        )
        .setUsername(`${message.author.username}`)
        .setBorder("#000000")
        .setAvatarBorder("#ff0000")
        .setOverlayOpacity(0.7)
        .setLevels(oldLevel, user.level) 
        .build();

      message.reply({
        content: `Congratulations! You received **${balanceToAdd.toLocaleString()}** ${emojis.currency.ecopal} ep coins!`,
        files: [
          {
            attachment: levelUp,
            name: `levelup-${message.member.id}.png`,
          },
        ],
      });

      user.xp = 0; 
      user.save();
    }
  } else {
    await user.save();
  }
});
//====================help

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isStringSelectMenu()) return;

  const menu = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("select")
      .setPlaceholder("Select Category")
      .addOptions(
        {
          label: "Main Menu",
          description: "Shows you main menu",
          emoji: emojis.menu.orange_book,
          value: `hmenu`,
        },
        {
          label: "Farming",
          description: "Shows you farming commamds",
          emoji: emojis.menu.farming,
          value: `farming`,
        },
        {
          label: "Trading",
          description: "Shows you Trading commands",
          emoji: emojis.menu.trading,
          value: `trading`,
        },
        {
          label: "Hunters",
          description: "Shows you Hunters commands",
          emoji: emojis.menu.hunters,
          value: `hunters`,
        },
        {
          label: "Investment",
          description: "Shows you investment commamds",
          emoji: emojis.menu.investment,
          value: `investment`,
        },
        {
          label: "Jungle",
          description: "Shows you jungle commamds",
          emoji: emojis.menu.jungle,
          value: `jungle`,
        },

        {
          label: "Level",
          description: "Shows you Level commands",
          emoji: emojis.menu.level,
          value: `level`,
        },
        {
          label: "Shop",
          description: "Shows you Shop commands",
          emoji: emojis.menu.shop,
          value: `shop`,
        },
        {
          label: "Action",
          description: "Shows you Action commands",
          emoji: emojis.menu.action,
          value: `action`,
        },
        {
          label: "Give",
          description: "Shows you give commands",
          emoji: emojis.menu.give,
          value: `give`,
        },
        {
          label: "Fight",
          description: "Shows you fight commands",
          emoji: emojis.menu.fight,
          value: `fight`,
        },
        {
          label: "Bank",
          description: "Shows you bank commands",
          emoji: emojis.menu.bank,
          value: `bank`,
        },
        {
          label: "Gems",
          description: "Shows you gems commands",
          emoji: emojis.menu.gem,
          value: `gems`,
        },
        {
          label: "Gamble",
          description: "Shows you gamble commands",
          emoji: emojis.menu.gambling,
          value: `gamble`,
        }
      )
  );

  const user = interaction.user;
  const icon = user.displayAvatarURL();
  const tag = user.tag;
  const helpMenuImage = config.helpMenuImage;

  const hmenu = new EmbedBuilder()
    .setColor("#00c7fe")
    .setDescription(
      `**EcoPaL** is a Discord Bot that offers various features to enhance your server experience. So invite the bot to your server and enhance your server experience with **EcoPaL**.`
    )
    .addFields(
      {
        name: `${emojis.categories.economy} : __Economy__`,
        value: `- ${emojis.menu.farming} : Farming
        - ${emojis.menu.trading} : Trading
        - ${emojis.menu.investment} : Investment
        - ${emojis.menu.bank} : Bank
        - ${emojis.menu.gambling} : Gamble`,
        inline: false
      },
      {
        name: `${emojis.categories.activities} : __Activities__`,
        value: `- ${emojis.menu.hunters} : Hunters
        - ${emojis.menu.jungle} : Jungle
        - ${emojis.menu.action} : Action
        - ${emojis.menu.fight} : Fight`,
        inline: false
      },
      {
        name: `${emojis.categories.utilities} : __Utilities__`,
        value: `- ${emojis.menu.level} : Level
        - ${emojis.menu.shop} : Shop
        - ${emojis.menu.give} : Give
        - ${emojis.menu.gem} : Gems`,
        inline: false
      }
    )
    .setThumbnail(`${icon}`)
    .setImage(
      helpMenuImage
    )
    .setTimestamp();

  const bth = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel(`Back`)
      .setCustomId(`bth`)
      .setStyle(ButtonStyle.Danger)
  );
  const btns = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel(`Prefix Commands`)
      .setCustomId(`pcmds`)
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setLabel(`Command List`)
      .setCustomId(`clist`)
      .setStyle(ButtonStyle.Primary)
  );

  if (!interaction.isButton()) return;
  if (interaction.customId === "pcmds") {
    await interaction.update({ embeds: [pcmds], components: [btns, bth] });
  }
  if (interaction.customId === "bth") {
    await interaction.update({ embeds: [hmenu], components: [menu, btns] });
  }
  if (interaction.customId === "clist") {
    await interaction.update({ embeds: [allcmds], components: [btns, bth] });
  }
});

// true - ’true’ for all resources downloaded through our platform
// 525030 - Downloader’s user ID
// EthicalProgrammer - Downloader’s username
// 50469 - Downloaded resource ID
// 164826 - Downloaded resource version
// 1735300806 - Download epoch timestamp
// 50846d932300aac67d67029e05f185db - A secondary unique hash representing the download *

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isStringSelectMenu()) return;
  if (interaction.customId == "premium_animals") return;
  if (interaction.customId == "animalSelection") return;
  const userRun = interaction.user;
  const icon = userRun.displayAvatarURL();
  const tag = userRun.tag;
  const selectedValue = interaction.values[0];

  const { user } = interaction;
  const userId = user.id;

  const customIdSelect = userSelectMenuMap.get(userId);
  if (customIdSelect !== true) {
    await interaction.reply({
      content: "This select menu is only for the original user.",
      ephemeral: true,
    });
    return;
  }
  const helpMenuImage = config.helpMenuImage;

  
  const hmenu = new EmbedBuilder()
    .setColor("#00c7fe")
    .setDescription(
      `**EcoPaL** is a Discord Bot that offers various features to enhance your server experience. So invite the bot to your server and enhance your server experience with **EcoPaL**.`
    )
    .addFields(
      {
        name: `${emojis.categories.economy} : __Economy__`,
        value: `- ${emojis.menu.farming} : Farming
        - ${emojis.menu.trading} : Trading
        - ${emojis.menu.investment} : Investment
        - ${emojis.menu.bank} : Bank
        - ${emojis.menu.gambling} : Gamble`,
        inline: false
      },
      {
        name: `${emojis.categories.activities} : __Activities__`,
        value: `- ${emojis.menu.hunters} : Hunters
        - ${emojis.menu.jungle} : Jungle
        - ${emojis.menu.action} : Action
        - ${emojis.menu.fight} : Fight`,
        inline: false
      },
      {
        name: `${emojis.categories.utilities} : __Utilities__`,
        value: `- ${emojis.menu.level} : Level
        - ${emojis.menu.shop} : Shop
        - ${emojis.menu.give} : Give
        - ${emojis.menu.gem} : Gems`,
        inline: false
      }
    )
    .setThumbnail(`${icon}`)
    .setImage(
      helpMenuImage
    )
    .setTimestamp();

  const farming = new EmbedBuilder()
    .setColor("#00c7fe")
    .setTitle("Farming Commands")
    .addFields({
      name: `${emojis.commands.question} buyfarm | \`ep bf\``,
      value: `${emojis.commands.info} *to buy your farm.*`,
    })
    .addFields({
      name: `${emojis.commands.question} sellfarm | \`ep sf\``,
      value: `${emojis.commands.info} *to sell your farm*`,
    })
    .addFields({
      name: `${emojis.commands.question} shop | \`ep shop\``,
      value: `${emojis.commands.info} *to to buy seeds for plants.*`,
    })
    .addFields({
      name: `${emojis.commands.question} box | \`ep b\``,
      value: `${emojis.commands.info} *to see your harvesting items.*`,
    })
    .addFields({
      name: `${emojis.commands.question} sellbox | \`ep sb\``,
      value: `${emojis.commands.info} *to sell your harvested items.*`,
    })
    .addFields({
      name: `${emojis.commands.question} pocket | \`ep p\``,
      value: `${emojis.commands.info} *to see your items.*`,
    })
    .addFields({
      name: `${emojis.commands.question} farm | \`ep f\``,
      value: `${emojis.commands.info} *to see your farm details.*`,
    })
    .addFields({
      name: `${emojis.commands.question} plant | \`ep plant <seed_name>\``,
      value: `${emojis.commands.info} *to plant your seeds*`,
    })
    .addFields({
      name: `${emojis.commands.question} harvest | \`ep harvest\``,
      value: `${emojis.commands.info} *to harvest your seeds.*`,
    })
    .setTimestamp();

  const trading = new EmbedBuilder()
    .setColor("#00c7fe")
    .setTitle("Trading Commands")
    .addFields({
      name: `${emojis.commands.question} trade | \`ep t\``,
      value: `${emojis.commands.info} *for the list of commands.*`,
    })
    .addFields({
      name: `${emojis.commands.question} details | \`ep d\``,
      value: `${emojis.commands.info} *to see your animal details*`,
    })
    .addFields({
      name: `${emojis.commands.question} Usage`,
      value:
        `${emojis.commands.info} *ep trade <mention> <animal> <coins>*`,
    })

    .setTimestamp();

  const hunters = new EmbedBuilder()
    .setColor("#00c7fe")
    .setTitle("Hunter Commands")
    .addFields({
      name: `${emojis.commands.question} huntersadd | \`ep ha\``,
      value: `${emojis.commands.info} *to add your animals to hunters.*`,
    })
    .addFields({
      name: `${emojis.commands.question} hunterremove | \`ep hr\``,
      value:
        `${emojis.commands.info} *to remove your animal from hunters.*`,
    })
    .addFields({
      name: `${emojis.commands.question} shop | \`ep shop\``,
      value: `${emojis.commands.info} *to buy your hunters food.*`,
    })
    .addFields({
      name: `${emojis.commands.question} feed | \`ep feed\``,
      value: `${emojis.commands.info} *to feed your hunters.*`,
    })
    .addFields({
      name: `${emojis.commands.question} hunter | \`ep h\``,
      value: `${emojis.commands.info} *to see your hunter details.*`,
    })
    .addFields({
      name: `${emojis.commands.question} jungle | \`ep j\``,
      value: `${emojis.commands.info} *to see your jungle*`,
    })
    .addFields({
      name: `${emojis.commands.question} search | \`ep s\``,
      value: `${emojis.commands.info} *search for animals.*`,
    })

    .setTimestamp();

  const investment = new EmbedBuilder()
    .setColor("#00c7fe")
    .setTitle("Investment Commands")
    .addFields({
      name: `${emojis.commands.question} investmentadd | \`ep ainv\``,
      value: `${emojis.commands.info} *to buy some shares.*`,
    })
    .addFields({
      name: `${emojis.commands.question} investment | \`ep i\``,
      value: `${emojis.commands.info} *to check your investment details.*`,
    })
    .setTimestamp();

  const jungle = new EmbedBuilder()
    .setColor("#00c7fe")
    .addFields({
      name: `${emojis.commands.question} search | \`ep s\``,
      value: `${emojis.commands.info} *to search for animals.*`,
    })
    .addFields({
      name: `${emojis.commands.question} jungle | \`ep j\``,
      value: `${emojis.commands.info} *to see your animals.*`,
    })
    .addFields({
      name: `${emojis.commands.question} topjungle | \`ep topj\``,
      value: `${emojis.commands.info} *to see top jungle owners.*`,
    });

  const level = new EmbedBuilder()
    .setColor("#00c7fe")
    .addFields({
      name: `${emojis.commands.question} level | \`ep lvl\``,
      value: `${emojis.commands.info} *to see your level.*`,
    })
    .addFields({
      name: `${emojis.commands.question} level <@mention> | \`ep lvl <@user>\``,
      value: `${emojis.commands.info} *to see others level.*`,
    })
    .addFields({
      name: `${emojis.commands.question} buywallpaper | \`ep buywallpaper <name>\``,
      value: `${emojis.commands.info} *to buy wallpaper.*`,
    })
    .addFields({
      name: `${emojis.commands.question} setwallpaper | \`ep setwallpaper <name>\``,
      value: `${emojis.commands.info} *to set wallpaper.*`,
    })
    .addFields({
      name: `${emojis.commands.question} vwallpaper | \`ep vwallpaper <name>\``,
      value: `${emojis.commands.info} *to view wallpaper.*`,
    })
    .addFields({
      name: `${emojis.commands.question} Description`,
      value:
        `${emojis.commands.info} *When you run commands and play with the bot you get points and level up.*`,
    })
    .setTimestamp();

  const shop = new EmbedBuilder()
    .setColor("#00c7fe")
    .addFields({
      name: `${emojis.commands.question} shop | \`ep shop\``,
      value: `${emojis.commands.info} *to buy items.*`,
    })
    .addFields({
      name: `${emojis.commands.question} pocket | \`ep p\``,
      value: `${emojis.commands.info} *to see your items.*`,
    })
    .addFields({
      name: `${emojis.commands.question} Description`,
      value:
        `${emojis.commands.info} *You can buy seeds and hunters food from the shop*`,
    });

  const action = new EmbedBuilder()
    .setColor("#00c7fe")
    .addFields({
      name: `${emojis.commands.question} kiss`,
      value: `${emojis.commands.info} *to kiss your love ones.*`,
    })
    .addFields({
      name: `${emojis.commands.question} hug`,
      value: `${emojis.commands.info} *to hug your friends.*`,
    })
    .addFields({
      name: `${emojis.commands.question} slap`,
      value: `${emojis.commands.info} *to slap your kids.*`,
    })
    .addFields({
      name: `${emojis.commands.question} cuddle`,
      value: `${emojis.commands.info} *to cuddle with your love.*`,
    })
    .addFields({
      name: `${emojis.commands.question} pat`,
      value: `${emojis.commands.info} *to pat your friend.*`,
    })
    .addFields({
      name: `${emojis.commands.question} ship | \`ep ship @mention\``,
      value: `${emojis.commands.info} *to check your love percentage.*`,
    })
    .addFields({
      name: `${emojis.commands.question} calc | \`ep calc <number>\``,
      value: `${emojis.commands.info} *to check your love percentage.*`,
    })
    .setTimestamp();

  const give = new EmbedBuilder()
    .setColor("#00c7fe")
    .addFields({
      name: `${emojis.commands.question} give`,
      value:
        `${emojis.commands.info} *to share your ep coins with others.*`,
    })
    .setTimestamp();

  const fight = new EmbedBuilder()
    .setColor("#00c7fe")
    .addFields({
      name: `${emojis.commands.question} fight | \`ep fight\``,
      value:
        `${emojis.commands.info} *to fight with others using your hunters.*`,
    })
    .addFields({
      name: `${emojis.commands.question} hunters | \`ep h\``,
      value: `${emojis.commands.info} *to see your hunters details.*`,
    })
    .setTimestamp();

  const bank = new EmbedBuilder()
    .setColor("#00c7fe")
    .addFields({
      name: `${emojis.commands.question} openbank | \`ep openbank\``,
      value:
        `${emojis.commands.info} *to submit your bank details.*`,
    })
    .addFields({
      name: `${emojis.commands.question} bank | \`ep bank\``,
      value: `${emojis.commands.info} *to check your bank details.*`,
    })
    .addFields({
      name: `${emojis.commands.question} deposit | \`ep deposit <coin>\``,
      value: `${emojis.commands.info} *to deposit your coins to bank.*`,
    })
    .addFields({
      name: `${emojis.commands.question} withdraw | \`ep withdraw\``,
      value: `${emojis.commands.info} *to withdraw your coins from bank.*`,
    })
    .addFields({
      name: `${emojis.commands.question} transfer | \`ep transfer <acount_no>\``,
      value: `${emojis.commands.info} *to trasnfer coins to other bank account.*`,
    })
    .setTimestamp();
    
    const gems = new EmbedBuilder()
    .setColor("#00c7fe")
    .addFields({
      name: `${emojis.commands.question} gem | \`ep gem\``,
      value:
        `${emojis.commands.info} *to see available gems to buy.*`,
    })
    .addFields({
      name: `${emojis.commands.question} buygem | \`ep bg\``,
      value:
        `${emojis.commands.info} *to buy available gems.*`,
    })
    .addFields({
      name: `${emojis.commands.question} gem | \`ep gem\``,
      value:
        `${emojis.commands.info} *to see available gems to buy.*`,
    })
    .addFields({
      name: `${emojis.commands.question} gem | \`ep gem\``,
      value:
        `${emojis.commands.info} *to see available gems to buy.*`,
    })
    .addFields({
      name: `${emojis.commands.question} activategem | \`ep ag\``,
      value:
        `${emojis.commands.info} *to activate your gems.*`,
    })
    .setTimestamp();

    const gamble = new EmbedBuilder()
    .setColor("#00c7fe")
    .addFields({
      name: `${emojis.commands.question} slots | \`ep slots <coins>\``,
      value:
        `${emojis.commands.info} *to slots your coins*`,
    })
    .addFields({
      name: `${emojis.commands.question} coinflip | \`ep cf h/t <coins>\``,
      value:
        `${emojis.commands.info} *to coinflip your coins*`,
    })
    .setTimestamp();

  if (selectedValue === "farming") {
    interaction.update({ embeds: [farming] });
  } else if (selectedValue === "trading") {
    interaction.update({ embeds: [trading] });
  } else if (selectedValue === "hunters") {
    interaction.update({ embeds: [hunters] });
  } else if (selectedValue === "investment") {
    interaction.update({ embeds: [investment] });
  } else if (selectedValue === "jungle") {
    interaction.update({ embeds: [jungle] });
  } else if (selectedValue === "level") {
    interaction.update({ embeds: [level] });
  } else if (selectedValue === "shop") {
    interaction.update({ embeds: [shop] });
  } else if (selectedValue === "action") {
    interaction.update({ embeds: [action] });
  } else if (selectedValue === "give") {
    interaction.update({ embeds: [give] });
  } else if (selectedValue === "fight") {
    interaction.update({ embeds: [fight] });
  } else if (selectedValue === "hmenu") {
    interaction.update({ embeds: [hmenu] });
  } else if (selectedValue === "bank") {
    interaction.update({ embeds: [bank] });
  } else if (selectedValue === "gems") {
    interaction.update({ embeds: [gems]})
  } else if (selectedValue === "gamble") {
    interaction.update({ embeds: [gamble]})
  }
});

// ================Guild join

const guildJoin = config.guildJoinLogs;

client.on("guildCreate", async (guild) => {
  try {
    const owner = await guild.fetchOwner();
    const guildIcon = guild.iconURL({ dynamic: true }) || ""; 
    const embed = new EmbedBuilder()
      .setTitle("Bot Added to Server")
      .setColor("#008000")
      .setDescription(`${emojis.status.success} Bot was added to **${guild.name}**`)
      .setThumbnail(guildIcon) 
      .addFields(
        { name: "Member Count", value: guild.memberCount.toString() },
        { name: "Server Owner", value: owner.user.tag }
      );

    const channel = client.channels.cache.get(guildJoin);
    if (channel) {
      channel.send({ embeds: [embed] });
    } else {
      console.log("Guild join channel not found.");
    }
  } catch (error) {
    const channel = client.channels.cache.get(guildJoin);
    channel.send("Failed to fetch details.");
  }
});

// vote

const voteChannelId = config.voteChannelID; 

client.on("messageCreate", async (message) => {
  if (
    message.channel.id === voteChannelId &&
    message.content.includes(`voted for <@${config.clientId}>!`)
  ) {
    const mention = message.content.match(/<@!?(?<userId>\d+)>/);
    if (!mention || !mention.groups.userId) {
      return message.channel.send("User mention not found.");
    }

    const userId = mention.groups.userId;

    const user = await User.findOne({ userId });

    if (!user) {
      return message.channel.send("User account not found.");
    }

    user.balance += config.votePrize;
    await user.save();

    const userToUpdate = await client.users.fetch(userId);
    userToUpdate.send(
      `${emojis.status.success} Thanks for voting! Added 25,000 EP coins ${emojis.currency.ecopal} to your account.`
    );

    message.reply(
      `${emojis.status.success} Added 25,000 EP ${emojis.currency.ecopal} coins to **${userToUpdate.username}'s** account.`
    );
  }
});

//  =====================Model Bank
// Command handler for opening a bank account
const { TextInputBuilder, TextInputStyle } = require("discord.js");

// Assuming you have the BankAccount model and necessary setup

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton()) return;

  if (interaction.customId === "openBank") {
    const modal = new ModalBuilder()
      .setCustomId("openBankModal")
      .setTitle("Open Bank Account");

    const name = new TextInputBuilder()
      .setCustomId("name")
      .setRequired(true)
      .setLabel("Provide us your name.")
      .setPlaceholder("Type your username here.")
      .setStyle(TextInputStyle.Short);

    const accountName = new TextInputBuilder()
      .setCustomId("accountname")
      .setRequired(true)
      .setLabel("Provide us your Account name.")
      .setPlaceholder("Type your account name here.")
      .setStyle(TextInputStyle.Short);

    const pinCode = new TextInputBuilder()
      .setCustomId("pincode")
      .setRequired(true)
      .setMaxLength(5)
      .setMaxLength(5)
      .setPlaceholder("Type your strong pin code.")
      .setLabel("Provide us your Account pin code.")
      .setStyle(TextInputStyle.Short);

    const firstActionRow = new ActionRowBuilder().addComponents(name);
    const secondActionRow = new ActionRowBuilder().addComponents(accountName);
    const thirdActionRow = new ActionRowBuilder().addComponents(pinCode);

    modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);
    interaction.showModal(modal);

    // await interaction.reply({
    //   content: 'Opening Bank Account...',
    // });
  }
});
const BankAccount = require("./Schemas.js/bankSchema");

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isModalSubmit()) return;

  if (interaction.customId === "openBankModal") {
    const name = interaction.fields.getTextInputValue("name");
    const accountName = interaction.fields.getTextInputValue("accountname");
    const pinCode = interaction.fields.getTextInputValue("pincode");

    // Create a new bank account entry with 'approved' set to false by default
    const bankAccount = new BankAccount({
      username: name,
      accountName,
      pinCode,
      userId: interaction.user.id, // Assuming you store user IDs
      approved: false, // Set 'approved' to false by default
    });

    try {
      await bankAccount.save();
      await interaction.reply({
        content:
          `${emojis.status.success} Bank account details submitted successfully! You will have to wait for the bank manager to approve your account.`,
        components: [], 
      });

      const channelToSend = client.channels.cache.get(config.bankSubmissionChannel); 

      if (channelToSend) {
        const embed = new EmbedBuilder()
          .setTitle("New Bank Account Submission")
          .setDescription(`Submitted by: <@${interaction.user.id}>`)
          .addFields(
            { name: "Username", value: name },
            { name: "Account Name", value: accountName },
            { name: "User ID", value: interaction.user.id },
            { name: "Pin Code", value: pinCode }
          );

        await channelToSend.send({ embeds: [embed] });
      }
    } catch (err) {
      console.error(err);
      await interaction.editReply({
        content:
          "An error occurred while opening the bank account. Please try again later.",
        components: [], 
      });
    }
  }
});

//Withdraw

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton()) return;

  if (interaction.customId === "enter_pin") {
    // Create a pin code input model here
    const withdrawModal = new ModalBuilder()
      .setCustomId("withdraw")
      .setTitle("Withdraw Pin Code");

    const pincode = new TextInputBuilder()
      .setCustomId("pinCodeUser")
      .setRequired(true)
      .setLabel("Provide us your pin code.")
      .setPlaceholder("Type your pincode here.")
      .setStyle(TextInputStyle.Short);

    const WithdrawAmount = new TextInputBuilder()
      .setCustomId("withdrawamount")
      .setRequired(true)
      .setLabel("Enter Withdraw Amount.")
      .setPlaceholder("Type your amount here.")
      .setStyle(TextInputStyle.Short);

    const modelpincode = new ActionRowBuilder().addComponents(pincode);
    const WithdrawAmountCode = new ActionRowBuilder().addComponents(
      WithdrawAmount
    );

    withdrawModal.addComponents(modelpincode, WithdrawAmountCode);
    interaction.showModal(withdrawModal);

    
  }
});
const BankAccounts = require("./Schemas.js/bankSchema");
const UserAccount = require("./Schemas.js/userAccountCreation");


client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isModalSubmit() || interaction.customId !== "withdraw") {
    return;
  }

  const userAccount = await UserAccount.findOne({ userId: interaction.user.id });

  if (!userAccount) {
    return interaction.reply(":ribbon: **First use** `ep start` **to start your journey.**");
  }

  const enteredPin = interaction.fields.getTextInputValue("pinCodeUser");
  const amount = parseFloat(interaction.fields.getTextInputValue("withdrawamount"));

  try {
    const bankAccount = await BankAccounts.findOne({ userId: interaction.user.id, pinCode: enteredPin });

    if (!bankAccount) {
      return interaction.reply("Incorrect pin code. Withdrawal canceled.");
    }

    if (isNaN(amount) || amount <= 0) {
      return interaction.reply("Please provide a valid amount to withdraw.");
    }

    if (bankAccount.bankBalance < amount) {
      const insufficientEmbed = new EmbedBuilder()
        .setColor("#ff0000")
        .setDescription(
          `Insufficient balance in your bank account for a withdrawal of ${amount.toLocaleString()} coins.`
        );

      return interaction.reply({
        embeds: [insufficientEmbed],
        components: [],
      });
    }

    userAccount.balance += amount;
    bankAccount.bankBalance -= amount;

    await userAccount.save();
    await bankAccount.save();

    const successEmbed = new EmbedBuilder()
      .setColor("#00ff00")
      .setDescription(
        `Successfully withdrew ${amount.toLocaleString()} coins from your bank account.`
      );

    return interaction.reply({ embeds: [successEmbed], components: [] });
  } catch (err) {
    console.error("Error:", err);
    return interaction.reply("An error occurred while processing your request.");
  }
});
