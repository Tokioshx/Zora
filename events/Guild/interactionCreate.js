const { Events, EmbedBuilder, ChannelType, ActionRowBuilder, ButtonBuilder, ModalBuilder, PermissionFlagsBits, ButtonStyle, TextInputBuilder, TextInputStyle, AttachmentBuilder } = require('discord.js');
const client = require('../../index');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

client.on(Events.InteractionCreate, async (interaction) => {
  if(interaction.isButton()) {
    if(interaction.customId === 'beli') {
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
          .setColor('DarkAqua')
          .setDescription('Sedang membuat tiket milikmu...')
        ],
        ephemeral: true
      });

      let data = await db.get(`tiketOrder_${interaction.user.id}`);
      if(data === 1) {
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
            .setColor('Red')
            .setDescription('Kamu sudah membuat tiket order sebelumnya! Silahkan hapus terlebih dahulu.')
          ],
          ephemeral: true
        });
      };
  
      await interaction.guild.channels.create({
        name: `${interaction.user.username}-order`,
        parent: '1073998705998442536',
        type: ChannelType.GuildText,
        permissionOverwrites: [
          {
            id: interaction.guild.roles.everyone,
            deny: PermissionFlagsBits.ViewChannel
          },
          {
            id: interaction.user.id,
            allow: PermissionFlagsBits.ViewChannel
          }
        ]
      }).then(async (channel) => {
        channel.send({
          embeds: [
            new EmbedBuilder()
            .setAuthor({ name: `Tiket Order ${interaction.user.username}` })
            .setColor('Navy')
            .setDescription('Isi sesuai format dibawah ini.\`\`\`\n✨ Paket:\n💳 Payment:\n📝 Pesan:\`\`\`')
            .setFooter({ text: 'Isi sesuai kebutuhan', iconURL: interaction.guild.iconURL({ forceStatic: true, extension: 'png' }) })
            .setTimestamp()
          ],
          components: [
            new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
              .setCustomId('tutup')
              .setLabel('Tutup')
              .setEmoji('🔒')
              .setStyle(ButtonStyle.Danger),
              new ButtonBuilder()
              .setCustomId('tutupAlasan')
              .setLabel('Tutup (Alasan)')
              .setEmoji('🔒')
              .setStyle(ButtonStyle.Danger),
              new ButtonBuilder()
              .setCustomId('tutupPetugas')
              .setEmoji('👮‍♂️')
              .setLabel('Tutup (Petugas)')
              .setStyle(ButtonStyle.Success)
            )
          ]
        });
  
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
            .setColor('Green')
            .setDescription(`Berhasil membuat tiket order di ${channel}!`)
          ],
          ephemeral: true
        });

        await db.set(`tiketOrder_${interaction.user.id}`, 1);
        await db.set(`tiketChannel_${channel.id}`, interaction.user.id);
      });
    };

    if(interaction.customId === 'tutup') {
      let data = await db.get(`tiketChannel_${interaction.channel.id}`);
      if(interaction.user.id !== data) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
            .setColor('Red')
            .setDescription('Button ini hanya bisa diklik oleh pemilik tiket!')
          ],
          ephemeral: true
        });
      };

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
          .setTitle('Konfirmasi Menutup')
          .setColor('DarkAqua')
          .setDescription('Klik button dibawah jika yakin ingin menutup tiket')
          .setFooter({ text: 'Terima kasih telah membuat tiket!', iconURL: interaction.guild.iconURL({ forceStatic: true, extension: 'png' }) })
        ],
        components: [
          new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
            .setCustomId('tutupYakin')
            .setEmoji('✔')
            .setLabel('Tutup')
            .setStyle(ButtonStyle.Primary)
          )
        ]
      });
    };

    if(interaction.customId === 'tutupYakin') {
      let data = await db.get(`tiketChannel_${interaction.channel.id}`);
      if(interaction.user.id !== data) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
            .setColor('Red')
            .setDescription('Button ini hanya bisa diklik oleh pemilik tiket!')
          ],
          ephemeral: true
        });
      };

      await interaction.channel.delete().then(async (channel) => {
        interaction.deferReply({ ephemeral: true });
        await db.delete(`tiketChannel_${channel.id}`);
        await db.delete(`tiketOrder_${interaction.user.id}`);
        await interaction.user.send({
          embeds: [
            new EmbedBuilder()
            .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ forceStatic: true, extension: 'png' }) })
            .setTitle('Tiket Ditutup')
            .setColor('Navy')
            .addFields(
              { name: 'Nama Tiket', value: `${channel.name}`, inline: true },
              { name: 'Pemilik Tiket', value: `${interaction.user}`, inline: true },
              { name: 'Penutup Tiket', value: `${interaction.user}`, inline: true },
              { name: 'Waktu ditutup', value: `<t:${Math.round(Date.now()/1000)}:F>`, inline: true },
              { name: 'Alasan', value: `Tidak diberi alasan` }
            )
            .setTimestamp()
          ]
        });
      });
    };

    if(interaction.customId === 'tutupAlasan') {
      let modal = new ModalBuilder()
      .setCustomId('tutupAlasanModal')
      .setTitle('Tutup');

      let alasan = new TextInputBuilder()
      .setCustomId('alasan')
      .setLabel('Alasan')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

      let pertanyaan = new ActionRowBuilder().addComponents(alasan);

      modal.addComponents(pertanyaan);

      await interaction.showModal(modal);
    };

    if(interaction.customId === 'tutupPetugas') {
      if(!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
            .setColor('Red')
            .setDescription('Button ini hanya bisa diklik oleh petugas!')
          ],
          ephemeral: true
        });
      };
  
      await interaction.channel.delete().then(async (channel) => {
        interaction.deferReply({ ephemeral: true });
        let user = await db.get(`tiketChannel_${channel.id}`);
        await interaction.guild.members.cache.get(`${user}`).send({
          embeds: [
            new EmbedBuilder()
            .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ forceStatic: true, extension: 'png' }) })
            .setTitle('Tiket Ditutup Petugas')
            .setColor('Navy')
            .addFields(
              { name: 'Nama Tiket', value: `${channel.name}`, inline: true },
              { name: 'Pemilik Tiket', value: `<@${user}>`, inline: true },
              { name: 'Penutup Tiket', value: `${interaction.user}`, inline: true },
              { name: 'Waktu ditutup', value: `<t:${Math.round(Date.now()/1000)}:F>`, inline: true },
              { name: 'Alasan', value: `Tidak diberi alasan` }
            )
            .setTimestamp()
          ]
        });
        await db.delete(`tiketChannel_${channel.id}`);
        await db.delete(`tiketOrder_${user}`);
      });
    };
  
    if(interaction.customId === 'komplen') {
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
          .setColor('DarkAqua')
          .setDescription('Sedang membuat tiket milikmu...')
        ],
        ephemeral: true
      });
  
      let data = await db.get(`tiketKomplen_${interaction.user.id}`);
      if(data === 1) {
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
            .setColor('Red')
            .setDescription('Kamu sudah membuat tiket komplain sebelumnya! Silahkan hapus terlebih dahulu.')
          ],
          ephemeral: true
        });
      };
  
      await interaction.guild.channels.create({
        name: `${interaction.user.username}-complain`,
        parent: '1073998705998442536',
        type: ChannelType.GuildText,
        permissionOverwrites: [
          {
            id: interaction.guild.roles.everyone,
            deny: PermissionFlagsBits.ViewChannel
          },
          {
            id: interaction.user.id,
            allow: PermissionFlagsBits.ViewChannel
          }
        ]
      }).then(async (channel) => {
        channel.send({
          embeds: [
            new EmbedBuilder()
            .setAuthor({ name: `Tiket Complain ${interaction.user.username}` })
            .setColor('Navy')
            .setDescription('Isi sesuai format dibawah ini.\`\`\`\n😞 Nama:\n💌 Alasan:\n📝 Harapan:\`\`\`')
            .setFooter({ text: 'Isi sesuai dengan komplain mu', iconURL: interaction.guild.iconURL({ forceStatic: true, extension: 'png' }) })
            .setTimestamp()
          ],
          components: [
            new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
              .setCustomId('tutupKomplen')
              .setLabel('Tutup')
              .setEmoji('🔒')
              .setStyle(ButtonStyle.Danger),
              new ButtonBuilder()
              .setCustomId('tutupAlasanKomplen')
              .setLabel('Tutup (Alasan)')
              .setEmoji('🔒')
              .setStyle(ButtonStyle.Danger),
              new ButtonBuilder()
              .setCustomId('tutupPetugasKomplen')
              .setEmoji('👮‍♂️')
              .setLabel('Tutup (Petugas)')
              .setStyle(ButtonStyle.Success)
            )
          ]
        });
  
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
            .setColor('Green')
            .setDescription(`Berhasil membuat tiket komplain di ${channel}!`)
          ],
          ephemeral: true
        });
  
        await db.set(`tiketKomplen_${interaction.user.id}`, 1);
        await db.set(`tiketChannel_${channel.id}`, interaction.user.id);
      });
    };
  
    if(interaction.customId === 'tutupKomplen') {
      let data = await db.get(`tiketChannel_${interaction.channel.id}`);
      if(interaction.user.id !== data) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
            .setColor('Red')
            .setDescription('Button ini hanya bisa diklik oleh pemilik tiket!')
          ],
          ephemeral: true
        });
      };
  
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
          .setTitle('Konfirmasi Menutup')
          .setColor('DarkAqua')
          .setDescription('Klik button dibawah jika yakin ingin menutup tiket')
          .setFooter({ text: 'Terima kasih telah membuat tiket!', iconURL: interaction.guild.iconURL({ forceStatic: true, extension: 'png' }) })
        ],
        components: [
          new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
            .setCustomId('tutupYakinKomplen')
            .setEmoji('✔')
            .setLabel('Tutup')
            .setStyle(ButtonStyle.Primary)
          )
        ]
      });
    };
  
    if(interaction.customId === 'tutupYakinKomplen') {
      let data = await db.get(`tiketChannel_${interaction.channel.id}`);
      if(interaction.user.id !== data) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
            .setColor('Red')
            .setDescription('Button ini hanya bisa diklik oleh pemilik tiket!')
          ],
          ephemeral: true
        });
      };
  
      await interaction.channel.delete().then(async (channel) => {
        interaction.deferReply({ ephemeral: true });
        await db.delete(`tiketChannel_${channel.id}`);
        await db.delete(`tiketKomplen_${interaction.user.id}`);
        await interaction.user.send({
          embeds: [
            new EmbedBuilder()
            .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ forceStatic: true, extension: 'png' }) })
            .setTitle('Tiket Ditutup')
            .setColor('Navy')
            .addFields(
              { name: 'Nama Tiket', value: `${channel.name}`, inline: true },
              { name: 'Pemilik Tiket', value: `${interaction.user}`, inline: true },
              { name: 'Penutup Tiket', value: `${interaction.user}`, inline: true },
              { name: 'Waktu ditutup', value: `<t:${Math.round(Date.now()/1000)}:F>`, inline: true },
              { name: 'Alasan', value: `Tidak diberi alasan` }
            )
            .setTimestamp()
          ]
        });
      });
    };
  
    if(interaction.customId === 'tutupAlasanKomplen') {
      let modal = new ModalBuilder()
      .setCustomId('tutupAlasanModalKomplain')
      .setTitle('Tutup');
  
      let alasan = new TextInputBuilder()
      .setCustomId('alasan')
      .setLabel('Alasan')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);
  
      let pertanyaan = new ActionRowBuilder().addComponents(alasan);
  
      modal.addComponents(pertanyaan);
  
      await interaction.showModal(modal);
    };
  
    if(interaction.customId === 'tutupPetugasKomplen') {
      if(!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
            .setColor('Red')
            .setDescription('Button ini hanya bisa diklik oleh petugas!')
          ],
          ephemeral: true
        });
      };
  
      await interaction.channel.delete().then(async (channel) => {
        interaction.deferReply({ ephemeral: true });
        let user = await db.get(`tiketChannel_${channel.id}`);
        await interaction.guild.members.cache.get(`${user}`).send({
          embeds: [
            new EmbedBuilder()
            .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ forceStatic: true, extension: 'png' }) })
            .setTitle('Tiket Ditutup Petugas')
            .setColor('Navy')
            .addFields(
              { name: 'Nama Tiket', value: `${channel.name}`, inline: true },
              { name: 'Pemilik Tiket', value: `<@${user}>`, inline: true },
              { name: 'Penutup Tiket', value: `${interaction.user}`, inline: true },
              { name: 'Waktu ditutup', value: `<t:${Math.round(Date.now()/1000)}:F>`, inline: true },
              { name: 'Alasan', value: `Tidak diberi alasan` }
            )
            .setTimestamp()
          ]
        });
        await db.delete(`tiketChannel_${channel.id}`);
        await db.delete(`tiketKomplen_${user}`);
      });
    };

    if(interaction.customId === 'feedback') {
      let modal = new ModalBuilder()
      .setCustomId('feedbackModal')
      .setTitle('Format Feedback');;

      let pesan = new TextInputBuilder()
      .setCustomId('pesan')
      .setLabel('Pesan Feedback')
      .setRequired(true)
      .setStyle(TextInputStyle.Paragraph)
      .setMinLength(10)
      .setMaxLength(1000);

      let rating = new TextInputBuilder()
      .setCustomId('rating')
      .setLabel('Rating Antara 1 - 5')
      .setMinLength(1)
      .setMaxLength(1)
      .setRequired(true)
      .setStyle(TextInputStyle.Short);

      let pertama = new ActionRowBuilder().addComponents(pesan);
      let kedua = new ActionRowBuilder().addComponents(rating)
      
      modal.addComponents(pertama, kedua);

      interaction.showModal(modal);
    };

    if(interaction.customId === 'verify') {
      if(interaction.member.roles.cache.has('1073858408060555284')) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
            .setColor('Red')
            .setDescription('Kamu sudah verifikasi dan tidak perlu mengklik button ini lagi!')
          ],
          ephemeral: true
        });
      };

      await interaction.member.roles.add('1073858408060555284');
      await interaction.member.roles.remove('1073934981577056396');
      interaction.reply({
        embeds: [
          new EmbedBuilder()
          .setColor('Green')
          .setDescription('Kamu berhasil verifikasi! Selamat belanja!')
        ],
        ephemeral: true
      });
    };
  };

  if(interaction.isModalSubmit()) {
    if(interaction.customId === 'tutupAlasanModal') {
      let alasan = interaction.fields.getTextInputValue('alasan');

      await interaction.channel.delete().then(async (channel) => {
        interaction.deferReply({ ephemeral: true });
        let user = await db.get(`tiketChannel_${channel.id}`);
        await interaction.guild.members.cache.get(`${user}`).send({
          embeds: [
            new EmbedBuilder()
            .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ forceStatic: true, extension: 'png' }) })
            .setTitle('Tiket Ditutup')
            .setColor('Navy')
            .addFields(
              { name: 'Nama Tiket', value: `${channel.name}`, inline: true },
              { name: 'Pemilik Tiket', value: `<@${user}>`, inline: true },
              { name: 'Penutup Tiket', value: `${interaction.user}`, inline: true },
              { name: 'Waktu ditutup', value: `<t:${Math.round(Date.now()/1000)}:F>`, inline: true },
              { name: 'Alasan', value: `${alasan}` }
            )
            .setTimestamp()
          ]
        });
        await db.delete(`tiketChannel_${channel.id}`);
        await db.delete(`tiketOrder_${user}`);
      });
    };

    if(interaction.customId === 'tutupAlasanModalKomplain') {
      let alasan = interaction.fields.getTextInputValue('alasan');

      await interaction.channel.delete().then(async (channel) => {
        interaction.deferReply({ ephemeral: true });
        let user = await db.get(`tiketChannel_${channel.id}`);
        await interaction.guild.members.cache.get(`${user}`).send({
          embeds: [
            new EmbedBuilder()
            .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ forceStatic: true, extension: 'png' }) })
            .setTitle('Tiket Ditutup')
            .setColor('Navy')
            .addFields(
              { name: 'Nama Tiket', value: `${channel.name}`, inline: true },
              { name: 'Pemilik Tiket', value: `<@${user}>`, inline: true },
              { name: 'Penutup Tiket', value: `${interaction.user}`, inline: true },
              { name: 'Waktu ditutup', value: `<t:${Math.round(Date.now()/1000)}:F>`, inline: true },
              { name: 'Alasan', value: `${alasan}` }
            )
            .setTimestamp()
          ]
        });
        await db.delete(`tiketChannel_${channel.id}`);
        await db.delete(`tiketKomplen_${user}`);
      });
    };

    if(interaction.customId === 'feedbackModal') {
      let pesan = interaction.fields.getTextInputValue('pesan');
      let rating = interaction.fields.getTextInputValue('rating');

      if(isNaN(rating)) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
            .setColor('Red')
            .setDescription('Harap berikan angka 1 - 5, bukan huruf atau simbol!')
          ],
          ephemeral: true
        });
      };

      if(rating == '1') {
        rating = '⭐'
      } else if(rating == '2') {
        rating = '⭐⭐'
      } else if(rating == '3') {
        rating = '⭐⭐⭐'
      } else if(rating == '4') {
        rating = '⭐⭐⭐⭐'
      } else if(rating == '5') {
        rating = '⭐⭐⭐⭐⭐'
      } else if(rating > 5) {
        rating = '⭐⭐⭐⭐⭐'
      } else if(rating < 1) {
        rating = '⭐'
      };

      interaction.guild.channels.cache.get('1073857949774118932').send({
        embeds: [
          new EmbedBuilder()
          .setAuthor({ name: `Feedback Dari ${interaction.user.tag}`, iconURL: interaction.guild.iconURL({ forceStatic: true, extension: 'png' }) })
          .setColor('Navy')
          .setThumbnail(interaction.user.displayAvatarURL({ forceStatic: true, extension: 'png' }))
          .setDescription(`Pembeli: ${interaction.user}\nRating: ${rating}\nPesan: ${pesan}`)
          .setFooter({ text: 'Terima kasih telah memberikan feedback!' })
          .setTimestamp()
        ]
      }).then(() => {
        interaction.reply({
          embeds: [
            new EmbedBuilder()
            .setColor('Green')
            .setDescription('Berhasil mengirim feedback ke channel <#1073857949774118932>!')
          ],
          ephemeral: true
        });
      });
    };
  };
});