module.exports = {
    name: 'calculate',
    aliases: ['calc'],
    description: 'Perform mathematical calculations.',
    run: async (client, message, args) => {
      let input = args.join(' ');
  
      // Replace 'x' with '*'
      input = input.replace(/x/g, '*');
  
      try {
        const result = eval(input);
  
        if (isNaN(result) || !isFinite(result)) {
          message.reply('Invalid expression or operation.');
        } else {
          message.reply(`The result of **${args.join(' ')}** is: 🧮 **${result.toLocaleString()}**`);
        }
      } catch (error) {
        message.reply('There was an error while evaluating the expression.');
      }
    },
  };
  