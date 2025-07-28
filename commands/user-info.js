import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('user-info')
    .setDescription('Displays info about you!'),
  
  async execute(interaction) {
    const user = interaction.user;
    const member = interaction.member;

    await interaction.reply({
      embeds: [
        {
          color: 0x5865F2,
          title: `User Info: ${user.username}`,
          thumbnail: { url: user.displayAvatarURL({ dynamic: true }) },
          fields: [
            { name: 'Username', value: `${user.tag}`, inline: true },
            { name: 'User ID', value: user.id, inline: true },
            ...(member?.joinedAt
              ? [{ name: 'Joined Server', value: `<t:${Math.floor(member.joinedAt.getTime() / 1000)}:R>`, inline: true }]
              : []),
            { name: 'Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
          ],
          timestamp: new Date().toISOString(),
          footer: { text: `Requested by ${user.username}` },
        },
      ],
    });
  }
};
