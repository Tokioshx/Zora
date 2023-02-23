const client = require('../../index');
const { Events } = require('discord.js');

client.on(Events.GuildMemberAdd, async (member) => {
  if(member.guild.id === '1073857319760298024') {
    await member.roles.add('1073934981577056396');
  };
});