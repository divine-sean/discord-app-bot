import { SlashCommandBuilder } from 'discord.js';
import { isOwner } from '../utils/isOwner.js';

export default {
  data: new SlashCommandBuilder()
    .setName('eval')
    .setDescription('Execute JavaScript code')
    .addStringOption(opt =>
      opt.setName('code')
        .setDescription('The JavaScript code to run')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!isOwner(interaction.user.id)) {
      return interaction.reply({ content: 'You are not authorized to use this command.', ephemeral: true });
    }

    const input = interaction.options.getString('code');
    try {
      const result = await eval(`(async () => { ${input} })()`);
      const output = typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result);
      return interaction.reply({ content: `\`\`\`js\n${output.slice(0, 1900)}\n\`\`\`` });
    } catch (err) {
      return interaction.reply({ content: `\`\`\`js\n${err.stack?.slice(0, 1900) || err}\n\`\`\`` });
    }
  }
};
