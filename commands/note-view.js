// commands/note-view.js
import { SlashCommandBuilder, InteractionContextType } from 'discord.js';
import { getNotes } from './note.js';

export default {
  data: new SlashCommandBuilder()
    .setName('note-view')
    .setDescription('View notes attached to a user.')
    .setContexts(InteractionContextType.Guild)
    .addUserOption(option =>
      option.setName('user').setDescription('User to view notes for').setRequired(true)),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const userNotes = getNotes(user.id);

    if (!userNotes.length) {
      return interaction.reply({ content: `❌ No notes found for ${user.tag}.`, ephemeral: true });
    }

    const formatted = userNotes
      .map((note, i) =>
        `**${i + 1}.** ${note.text}\n↳ *by ${note.author} <t:${Math.floor(note.timestamp / 1000)}:R>*`)
      .join('\n\n');

    await interaction.reply({
      embeds: [{
        title: `🗒️ Notes for ${user.tag}`,
        description: formatted,
        color: 0x2f3136,
      }],
      ephemeral: true,
    });
  },
};
