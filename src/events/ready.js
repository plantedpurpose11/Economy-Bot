
const mongoose = require('mongoose');
const mongodbURL = process.env.MONGODBURL;

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log('Ready!');


        setInterval(client.checkLottery, 5000);
        setInterval(client.checkSeedHarvest, 5000);


        if (!mongodbURL) return;

        await mongoose.connect(mongodbURL || "", {
            keepAlive: true,
            useNewUrlParser: true,
            useUnifiedTopology: true
        })

        if (mongoose.connect) {
            console.log("MongoDB Connected!")
        }


        const activity = [
            'Subscribe to Ethical Programmer',
            'Make sure to like & share',
            'do /ping to pong!'
        ]

        setInterval(() => {
            let userCount = client.guilds.cache.reduce((a,b) => a+b.memberCount, 0)

            // const userCount = client.users.cache.size; // Get the total number of users the bot can see
            const serverCount = client.guilds.cache.size; // Get the total number of servers the bot is in

            // const botStatus = activity[Math.floor(Math.random() * activity.length)];
            const botStatus = `on ${serverCount} servers.`;
            // client.user.setPresence({ status: 'online', activities: [{ name: `${botStatus}`, type: 'STREAMING', url: 'https://www.twitch.tv/your-channel' }]});
            client.user.setPresence({ status: 'online', activities: [{ name: `${botStatus}` }]});
        }, 3000)


        



        async function pickPresence () {
            const option = Math.floor(Math.random() * statusArray.length);

            try {
                await client.user.setPresence({
                    activities: [
                        {
                            name: statusArray[option].content,
                            type: statusArray[option].type,

                        },
                    
                    ],

                    status: statusArray[option].status
                })
            } catch (error) {
                console.error(error);
            }
        }
    },
};