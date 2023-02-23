const client = require('../../index');
const { Events, ActivityType } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

client.on(Events.ClientReady, async () => {
  console.log(`${client.user.tag} is up and ready to go!`);
  let testi = await db.get('testimoni');
  client.user.setActivity(`Testi ${testi} | Order Now!`, { type: ActivityType.Playing });
  setTimeout(() => {
    client.user.setActivity(`Testi ${testi} | Order Now!`, { type: ActivityType.Playing });
  }, 5000);
});