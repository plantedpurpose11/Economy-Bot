
const { EmbedBuilder, version, Message, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType } = require("discord.js");
const Discord = require('discord.js');
const moment = require("moment");
require("moment-duration-format");
const os = require("os");
module.exports = {
  name: "stats",
  category: "Information",
  aliases: ["botstats", "botinfo", "info"],
  description: "Displays bot status.",

  run: async (client, message, args) => {
    const totalGuilds =
      client.guilds.cache.size;
    const totalMember =
      client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
    const totalChannel =
      client.channels.cache.size;
    let totalSeconds = client.uptime / 1000;
    let days = Math.floor(totalSeconds / 86400);
    totalSeconds %= 86400;
    let hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = Math.floor(totalSeconds % 60);

    let uptime = `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`;

    const ping = Date.now() - message.createdTimestamp;
    const latency = Math.abs(ping); // Ensure latency is positive
    const latencyFormatted = `${latency.toString().substring(0, 2)}`;
    const buttons = {
      Guild: new ButtonBuilder()
        .setLabel("Guild Info")
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("Guild"),
      System: new ButtonBuilder()
        .setLabel("System Info")
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("System")



    }
    buttons.Guild.setDisabled(true);
    const row = new ActionRowBuilder()
      .addComponents(
        buttons.Guild,
        buttons.System

      )
    const duration = moment.duration(client.uptime).format("\`D\` [days], \`H\` [hrs], \`m\` [mins], \`s\` [secs]");
    const embed = new EmbedBuilder()
      .setAuthor({ name: `Stats`, iconURL: client.user.displayAvatarURL() })
      .setFooter({ text: `Requested by ` + message.author.username, iconURL: message.author.displayAvatarURL() })
      .setColor("#00c7fe")
      .addFields({ name: "Servers Stats", value: `\`\`\`js\nTotal Server : ${totalGuilds}\nTotal Channel : ${totalChannel} \nTotal Member : ${totalMember}\`\`\``, inline: true, })
      .addFields({
        name: "Current Server",
        value: `\`\`\`js\nServer Name : ${message.guild.name}\nuserId : ${message.author.id}\nguildId : ${message.guild.id}\`\`\``, inline: true,
      });
    const embed2 = new EmbedBuilder()
      .setAuthor({ name: `Stats`, iconURL: client.user.displayAvatarURL() })
      .setFooter({ text: `Requested by ` + message.author.username, iconURL: message.author.displayAvatarURL() })
      .setColor("#00c7fe")
      .addFields({
        name: "System Info",

        value: `\`\`\`js\nNode.js : ${process.version}\nDiscord.js : ${version}\nLatency : ${latencyFormatted}ms\nUptime : ${uptime}\`\`\``, inline: true,
      });

    const msg = await message.reply({ embeds: [embed], components: [row] });
    const collector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 180e+2 });

    collector.on('collect', async i => {
      try {
        const cid = i.customId;
        switch (cid) {
          case "Guild": {
            buttons.System.setDisabled(false);
            buttons.Guild.setDisabled(true);
            msg.edit({ embeds: [embed], components: [row] });
            await i.deferUpdate().catch(() => { });
          } break;
          case "System": {
            buttons.System.setDisabled(true);
            buttons.Guild.setDisabled(false);
            msg.edit({ embeds: [embed2], components: [row] });
            await i.deferUpdate().catch(() => { }); // catch for promise rejection cases
          } break;
        }
      } catch (err) {
        console.log(err)
      }
    });

  }
}    