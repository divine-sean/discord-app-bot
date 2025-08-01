import { SlashCommandBuilder, InteractionContextType } from 'discord.js';

const portalQuotes = [
  "The cake is a lie.",
  "This was a triumph. I'm making a note here: HUGE SUCCESS.",
  "Still alive.",
  "I'm afraid you're about to become the immediate past president of the being alive club.",
  "You monster.",
  "We do what we must because we can.",
  "The Enrichment Center regrets to inform you that this next test is impossible. Make no attempt to solve it.",
  "Remember when the platform was sliding into the fire pit and I said 'Goodbye' and you were like 'No way!'",
  "I am NOT! A MORON!",
  "Well, how about now? NOW WHO'S A MORON? Could a MORON PUNCH! YOU! INTO! THIS! PIT? Huh? Could a moron do THAT! .... Uh oh"
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
