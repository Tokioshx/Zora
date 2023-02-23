const { EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
  name: 'testimoni',
  aliases: ['testi'],
  run: async (client, message, args) => {
    if(message.author.id !== client.config.developer) {
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
          .setColor('Red')
          .setDescription("You don't have the privilage to use this command!")
        ]
      }).then((msg) => {
        setTimeout(() => {
          msg.delete();
        }, 5000);
      });
    };

    let member = message.mentions.members.first();
    if(!member) {
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
          .setColor('Red')
          .setDescription('Please mention someone to set as customer')
        ]
      }).then((msg) => {
        setTimeout(() => {
          msg.delete();
        }, 5000);
      });
    };

    let img = message.attachments.first();
    if(!img) {
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
          .setColor('Red')
          .setDescription('Please input a image to continue the command')
        ]
      }).then((msg) => {
        setTimeout(() => {
          msg.delete();
        }, 5000);
      });
    };

    let content = args.slice(1).join(' ').split(' | ');
    if(!content[0]) {
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
          .setColor('Red')
          .setDescription('Please mention the product')
        ]
      }).then((msg) => {
        setTimeout(() => {
          msg.delete();
        }, 5000);
      });
    };

    if(!content[1]) {
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
          .setColor('Red')
          .setDescription('Please mention the payment and price')
        ]
      }).then((msg) => {
        setTimeout(() => {
          msg.delete();
        }, 5000);
      });
    };

    await db.add('testimoni', 1);
    let data = await db.get('testimoni');
    client.channels.cache.get('1073857937832951898').send({
      embeds: [
        new EmbedBuilder()
        .setAuthor({ name: `Testimoni ke ${data}`, iconURL: message.guild.iconURL({ forceStatic: true, extension: 'png' }) })
        .setThumbnail(member.user.displayAvatarURL({ forceStatic: true, extension: 'png' }))
        .setColor('Random')
        .setDescription(`Buyer: ${member}\nProduct: ${content[0]}\nPayment & Price: ${content[1]}`)
        .setImage(img ? img.proxyURL : null)
        .setFooter({ text: 'Thank you for trusting us!' })
        .setTimestamp()
      ]
    }).then(() => {
      member.roles.add('1073858435189313556');
      message.channel.send({
        embeds: [
          new EmbedBuilder()
          .setColor('Navy')
          .setDescription('Successfuly send a testimoni to <#1073857937832951898>!')
        ]
      });
    });
  },
};