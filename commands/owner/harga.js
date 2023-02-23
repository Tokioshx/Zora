const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'harga',
  run: async (client, message) => {
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

    message.channel.send({
      embeds: [
        new EmbedBuilder()
        .setAuthor({ name: 'List Harga Jasa Buat Bot', iconURL: message.guild.iconURL({ forceStatic: true, extension: 'png' }) })
        .setColor('Navy')
        .setThumbnail(message.guild.iconURL({ forceStatic: true, extension: 'png' }))
        .setDescription('**Paket Commands:**\n1. Paket Basic : Rp. 5,000.\nBisa request 10 perintah dalam 1 bot.\n\n2. Paket Medium : Rp. 10,000.\nBisa request 20 perintah dalam 1 bot.\n3. Paket High : Rp. 15,000.\nBisa request 30 Perintah dalam 1 bot.\n\n4. Paket Premium : Rp. 20.000\nBisa request 40 perintah dalam 1 bot.\n\n5. Paket Donatur : Rp. 25,000\nBisa request 50 perintah dalam 1 bot.\n\n**Paket Fitur:**\n1. Harga Rp. 3.000 per fitur.\nVerifikasi (button/reaction), menghapus pesan yang tidak pantas, spy message (semua pesan yang ada di server akan ke tersimpan di channel lain), auto role ketika join server, welcome & goodbye (bisa pilih 1 atau keduanya), message edit log, message delete log.\n\n2. Harga Rp. 5.000 per fitur.\nReaction roles (button/reaction), sistem tiket.\n\n**Payment Method:**\n1. Trakteer (Tax Rp. 1,000).\n2. Transfer Gopay.\n3. TopUp Gopay (Tax Rp. 2,000)')
        .setFooter({ text: 'Terakhir kali diupdate' })
        .setTimestamp()
      ]
    });
  },
};