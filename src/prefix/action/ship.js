const canvafy = require("canvafy");
const config = require("../../../config.json");

module.exports = {
  name: "ship",

  run: async (client, message, args) => {
    let member = message.mentions.members.first();
    if (!member) {
      return message.reply({ content: "Please tag someone." });
    } else if (member.id === message.author.id) {
      return message.reply({ content: "Please mention someone else." });
    }
    const ship = await new canvafy.Ship()
      .setAvatars(
        message.author.displayAvatarURL({
          forceStatic: true,
          extension: "png",
        }),
        member.user.displayAvatarURL({ forceStatic: true, extension: "png" })
      )
      .setBackground(
        "image",
        config.images.shipBackground
      )
      .setBorder("#f0f0f0")
      .setOverlayOpacity(0.5)
      .build();

    message.reply({
      files: [
        {
          attachment: ship,
          name: `ship-${message.member.id}.png`,
        },
      ],
    });
  },
};
