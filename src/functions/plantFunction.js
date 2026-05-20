const Plant = require('../Schemas.js/plantSchema');
const User = require('../Schemas.js/userAccountCreation');

module.exports = (client) => {
  client.checkSeedHarvest = async () => {
    try {
      const currentTime = new Date();
      const twoHoursAgo = new Date(currentTime.getTime() - 2 * 60 * 60 * 1000);

      const plantsReadyForHarvest = await Plant.find({
        plantTime: { $lte: twoHoursAgo },
        harvested: false, 
      });

      if (plantsReadyForHarvest.length === 0) {
        return;
      }

      for (const plant of plantsReadyForHarvest) {
        const user = await User.findOne({ userId: plant.userId });
        if (!user) {
          continue;
        }

        const userDiscord = await client.users.fetch(plant.userId);
        userDiscord.send(`👨‍🌾 Your planted seeds (${plant.seedName}) are ready for harvest!`);

        plant.harvested = true;
        await plant.save();
      }
    } catch (err) {
      console.error("Error while checking seed harvest:", err);
    }
  };
};
