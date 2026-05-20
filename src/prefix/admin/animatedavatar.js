module.exports = {
    name: 'avatar-animated',
    owner: true,
    run: async (client, message, args) => {
        const avatarUrl = args[0];
        console.log(avatarUrl);
        if (!avatarUrl) return message.reply('Give Avatar URL');
        
        async function sendMessage(messageContent) {
            await message.channel.send({ content: messageContent });
        }

        var error;
        await client.user.setAvatar(avatarUrl).catch((err) => {
            error = true;
            console.log(err);
            return sendMessage(`${err.toString()}`);
        });
        if (error) return;
        await sendMessage("I have uploaded your avatar.");
    }
};
