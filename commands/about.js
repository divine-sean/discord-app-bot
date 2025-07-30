import { SlashCommandBuilder, EmbedBuilder, InteractionContextType } from 'discord.js';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf-8'));

// 🔧 Clean up Git URL (handle ssh:// or git+ssh://)
const gitUrl = pkg.repository.url
  .replace(/^git\+ssh:\/\//, 'https://')
  .replace(/^ssh:\/\//, 'https://')
  .replace(/git@github.com:/, 'https://github.com/')
  .replace(/\.git$/, '');

export default {
  data: new SlashCommandBuilder()
    .setName('about')
    .setDescription('Shows information about this bot.')
    .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle(`${pkg.name} v${pkg.version}`)
      .setDescription(pkg.description)
      .setColor(0x5865F2)
      .setAuthor({ name: pkg.author })
      .addFields(
        { name: 'Source Code', value: `[GitHub Repo](${gitUrl})`, inline: false },
        { name: 'Issues', value: `[Report Bugs](${pkg.bugs.url})`, inline: false },
        { name: 'Homepage', value: pkg.homepage, inline: false }
      )
      .setFooter({ text: 'Built with discord.js' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
