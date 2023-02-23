const client = require('../../index');
const { Events, EmbedBuilder } = require('discord.js');

client.on(Events.MessageCreate, async (message) => {
  let prefix = client.config.prefix;
  if(message.author.bot || !message.guild || !message.content.toLowerCase().startsWith(prefix)) return;

  const [cmd, ...args] = message.content.slice(prefix.length).trim().split(/ +/g);

  const command = client.commands.get(cmd.toLowerCase()) || client.commands.find(c => c.aliases?.includes(cmd.toLowerCase()));

  if(!command) return;
  await command.run(client, message, args).catch((error) => {
    console.log(error);
    message.channel.send({
      embeds: [
        new EmbedBuilder()
        .setColor('Red')
        .setDescription('Looks like something went wrong with the commands, please try again soon.')
      ]
    });
  });
});