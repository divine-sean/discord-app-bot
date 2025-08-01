// commands/note-remove.js
import { SlashCommandBuilder, InteractionContextType } from 'discord.js';
import { removeNote } from './note.js';

export default {
  data: new SlashCommandBuilder()
    .setName('note-remove')
    .setDescription('Remove a note from a user.')
    .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel)
    .addUserOption(option =>
      option.setName('user').setDescription('User to remove a note from').setRequired(true))
    .addIntegerOption(option =>
      option.setName('index').setDescription('Note number to remove (check /note-view)').setRequired(true)),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const index = interaction.options.getInteger('index');

    const success = removeNote(user.id, index);

    if (!success) {
      return interaction.reply({ content: `❌ Invalid index or no notes for ${user.tag}.`, ephemeral: true });
    }

    await interaction.reply({ content: `✅ Removed note #${index} for ${user.tag}.`, ephemeral: true });
  },
};
