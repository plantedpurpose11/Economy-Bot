var timeout = [];

module.exports = {
  name: "ping",
  description: "This is the ping command.",

  run: async (client, message, args) => {
    // Command cooldown
    if (timeout.includes(message.author.id)) {
      return await message.reply({
        content: "You are on a cooldown. Wait 10 seconds!",
        ephemeral: true,
      });
    }

    timeout.push(message.author.id);
    setTimeout(() => {
      timeout.shift();
    }, 10000);

    const ping = Date.now() - message.createdTimestamp;
    const latency = Math.abs(ping); // Ensure latency is positive
    const latencyFormatted = `${latency.toString().substring(0, 2)}ms`; // Display only the first two digits
    const emoji = "⏱️"; // You can use any emoji you prefer

    message.reply(`${emoji} Pong! Latency is ${latencyFormatted} ${emoji}`);
  },
};
