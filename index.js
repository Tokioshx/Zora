const { Client, GatewayIntentBits, Collection } = require('discord.js');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});
module.exports = client;

client.commands = new Collection();
client.config = require('./handler/config.js');

require('./handler')(client);

client.login(client.config.token);