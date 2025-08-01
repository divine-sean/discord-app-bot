// commands/note.js
import { SlashCommandBuilder, InteractionContextType } from 'discord.js';

const notes = new Map(); // Map<userId, Array<{ text: string, author: string, timestamp: number }>>

export default {
  data: new SlashCommandBuilder()
    .setName('note')
    .setDescription('Attach a private note to a user.')
    .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel)
    .addUserOption(option =>
      option.setName('user').setDescription('User to note').setRequired(true))
    .addStringOption(option =>
      option.setName('text').setDescription('Note text').setRequired(true)),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const text = interaction.options.getString('text');

    const note = {
      text,
      author: interaction.user.tag,
      timestamp: Date.now(),
    };

    if (!notes.has(user.id)) notes.set(user.id, []);
    notes.get(user.id).push(note);

    await interaction.reply({ content: `📝 Note added for ${user.tag}.`, ephemeral: true });
  },
};

export function getNotes(userId) {
  return notes.get(userId) || [];
}

export function removeNote(userId, index) {
  const userNotes = notes.get(userId);
  if (!userNotes || index < 1 || index > userNotes.length) return false;
  userNotes.splice(index - 1, 1);
  if (userNotes.length === 0) notes.delete(userId);
  return true;
}