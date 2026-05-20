// Import necessary modules
const { MessageAttachment, AttachmentBuilder } = require("discord.js");
const Canvas = require("canvas");
const { createCanvas, loadImage, CanvasRenderingContext2D } = Canvas;

// Replace these with your actual schemas
const Hunter = require("../../Schemas.js/huntersSchema");
const Blacklist = require("../../Schemas.js/BlacklistSchema");
const User = require("../../Schemas.js/userAccountCreation");
const config = require("../../../config.json");
const emojis = require("../../../emojis.json");

async function isUserBlacklisted(userId) {
  const entry = await Blacklist.findOne({ userId });
  return entry !== null; // If entry exists, user is blacklisted
}

const timeout = [];
module.exports = {
  name: "hunters",
  description: "Show the user's hunters",
  aliases: ["h"],
  usage: "hunters",
  run: async (client, message, args) => {
    const isBlacklisted = await isUserBlacklisted(message.author.id);
    if (isBlacklisted) {
      return message.reply("You are blacklisted and cannot use this command.");
    }

    const userAccount = await User.findOne({ userId: message.author.id });

    if (!userAccount) {
      return message.reply("You don't have an account yet!");
    }

    // Command cooldown top
    if (timeout.includes(message.author.id))
      return await message.reply({
        content: "You are on a cooldown. Wait 7 seconds!",
        ephemeral: true,
      });

    // Command cooldown
    timeout.push(message.author.id);
    setTimeout(() => {
      timeout.shift();
    }, 7000);

    // Fetch user's hunters
    try {
      const userHunters = await Hunter.find({ userId: message.author.id });

      if (!userHunters || userHunters.length === 0) {
        return message.reply("You don't have any animals in your hunters.");
      }

      const canvas = createCanvas(700, 300); // Reduced canvas height
      const ctx = canvas.getContext("2d");

      // Draw custom background
      const background = await loadImage(config.images.hunters.background);
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

      // Define box dimensions and positions
      const boxWidth = canvas.width / 2 - 20;
      const boxHeight = canvas.height / 2 - 20;

      // Loop through user's hunters and draw each hunter's details in the boxes
      let offsetX = 10;
      let offsetY = 10;

      for (let i = 0; i < Math.min(4, userHunters.length); i++) {
        const hunter = userHunters[i];

        // Draw a box with border radius for each hunter's details
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.lineJoin = "round";
        ctx.roundRect(offsetX, offsetY, boxWidth, boxHeight, 5);
        ctx.fill();
        ctx.stroke();

        // Load frame image
        const frame = await loadImage(config.images.hunters.frame);

        // Apply frame to each hunter
        ctx.drawImage(
          frame,
          offsetX + 10,
          offsetY + 20,
          boxWidth - 200,
          boxHeight - 35
        );

        if (hunter.rarity === "legendary" && hunter.image) {
          try {
            const image = await loadImage(hunter.image);

            // Draw the hunter's image on top of the frame for legendary hunters
            ctx.drawImage(
              image,
              offsetX + 20,
              offsetY + 30,
              boxWidth - 220,
              boxHeight - 55
            );
          } catch (error) {
            console.error("Error loading image:", error);
          }
        } else {
          // Draw default image for rare or common hunters
          const altImage = await loadImage(config.images.hunters.defaultAnimal);
          ctx.drawImage(
            altImage,
            offsetX + 20,
            offsetY + 30,
            boxWidth - 220,
            boxHeight - 55
          );
        }

        // Draw hunter details inside a black box with white text
        ctx.fillStyle = "black";
        ctx.fillRect(offsetX, offsetY + boxHeight - 50, boxWidth, 50);

        // Draw the hunter's level along with a warning emoji if the level exceeds 110
        ctx.fillText(
          `Level: ${hunter.level}`,
          offsetX + 10,
          offsetY + boxHeight - 30
        );

        if (hunter.level > 110) {
          const warningEmoji = await loadImage(config.images.hunters.warningIcon);

          ctx.drawImage(
            warningEmoji,
            offsetX + 100,
            offsetY + boxHeight - 40,
            20,
            20
          );
        }

        // Draw hunter details in white text
        ctx.fillStyle = "white";
        ctx.font = "bold 12px Arial";
        ctx.fillText(
          `Name: ${hunter.name}`,
          offsetX + 10,
          offsetY + boxHeight - 30
        );
        ctx.fillText(
          `Level: ${hunter.level}`,
          offsetX + 10,
          offsetY + boxHeight - 15
        );
        ctx.fillText(
          `XP: ${hunter.xp.toLocaleString()}`,
          offsetX + boxWidth / 2,
          offsetY + boxHeight - 30
        );
        ctx.fillText(
          `Attack: ${hunter.attack}`,
          offsetX + boxWidth / 3,
          offsetY + boxHeight - 15
        );
        ctx.fillText(
          `Health: ${hunter.health}`,
          offsetX + boxWidth - 100,
          offsetY + boxHeight - 30
        );
        ctx.fillText(
          `Type: ${hunter.rarity}`,
          offsetX + boxWidth - 120,
          offsetY + boxHeight - 15
        );

        offsetX += boxWidth + 10;

        if (i === 1) {
          offsetY += boxHeight + 10;
          offsetX = 10;
        }
      }

      // Convert the canvas to an attachment
      const attachment = new AttachmentBuilder(
        canvas.toBuffer(),
        "hunters.png"
      );

      // Send the image back to the user
      return message.reply({ files: [attachment] });
    } catch (error) {
      console.error("Error:", error);
      return message.reply("An error occurred while fetching your hunters.");
    }
  },
};

// Helper function for creating rounded rectangles
CanvasRenderingContext2D.prototype.roundRect = function (
  x,
  y,
  width,
  height,
  radius
) {
  this.beginPath();
  this.moveTo(x + radius, y);
  this.arcTo(x + width, y, x + width, y + height, radius);
  this.arcTo(x + width, y + height, x, y + height, radius);
  this.arcTo(x, y + height, x, y, radius);
  this.arcTo(x, y, x + width, y, radius);
  this.closePath();
};
