import { SlashCommandBuilder, InteractionContextType } from 'discord.js';

const portalQuotes = [
  "The cake is a lie.",
  "I'm not a cake expert, but this seems safe.",
  "This was a triumph. I'm making a note here: HUGE SUCCESS.",
  "Still alive.",
  "I'm afraid you're about to become the immediate past president of the Aperture Science 'Intelligence' quotient.",
  "You monster.",
  "Look at you still trying to figure it out.",
  "We do what we must because we can.",
  "This next test is impossible.",
  "Remember when the platform was sliding into the fire pit and I said 'Goodbye' and you were like 'No way!'",
];

export default {
  data: new SlashCommandBuilder()
    .setName('portalquote')
    .setDescription('Get a random Portal / Portal 2 quote')
    .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM),

  async execute(interaction) {
    const quote = portalQuotes[Math.floor(Math.random() * portalQuotes.length)];
    await interaction.reply(`🎮 Portal Quote:\n"${quote}"`);
  }
};
