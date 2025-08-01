import { SlashCommandBuilder } from 'discord.js';
import { isOwner } from '../utils/isOwner.js';

export default {
  data: new SlashCommandBuilder()
    .setName('leave')
    .setDescription('Make the bot leave a server')
    .addStringOption(opt =>
      opt.setName('guild_id')
        .setDescription('The ID of the server to leave')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!isOwner(interaction.user.id)) {
      return interaction.reply({ content: 'You are not authorized to use this command.', ephemeral: true });
    }

    const guildId = interaction.options.getString('guild_id');
    const guild = interaction.client.guilds.cache.get(guildId);

    if (!guild) {
      return interaction.reply({ content: 'Guild not found or bot is not in it.', ephemeral: true });
    }

    try {
      await guild.leave();
      return interaction.reply({ content: `Left guild: ${guild.name} (${guild.id})`, ephemeral: true });
    } catch (err) {
      return interaction.reply({ content: `Failed to leave guild: ${err.message}`, ephemeral: true });
    }
  }
};
