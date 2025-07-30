import { SlashCommandBuilder, InteractionContextType } from 'discord.js';
import os from 'os';
import pidusage from 'pidusage';
import si from 'systeminformation';

export default {
  data: new SlashCommandBuilder()
    .setName('botinfo')
    .setDescription('Shows information about the bot')
    .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel),

  async execute(interaction) {
    const ping = Math.round(interaction.client.ws.ping);
    const totalCommands = interaction.client.commands.size;
    const uptimeSeconds = Math.floor(process.uptime());
    const uptime = `${Math.floor(uptimeSeconds / 3600)}h ${Math.floor((uptimeSeconds % 3600) / 60)}m ${uptimeSeconds % 60}s`;
    const loadAvg = os.loadavg().map(n => n.toFixed(2)).join(', ');
    const osInfo = `${os.type()} ${os.arch()} ${os.release()}`;
    const cpuModel = os.cpus()[0]?.model ?? 'Unknown CPU';

    // CPU usage of bot process
    const stats = await pidusage(process.pid);
    const cpuUsagePercent = stats.cpu.toFixed(2);

    // Get CPU temperature info
    let tempStr = 'Unavailable';
    try {
      const tempData = await si.cpuTemperature();
      if (tempData.main) {
        tempStr = `${tempData.main} °C`;
      }
    } catch {
      // ignore errors
    }

    const embed = {
      color: 0x0099ff,
      title: '🤖 Bot Information',
      fields: [
        { name: 'Ping', value: `${ping} ms`, inline: true },
        { name: 'CPU', value: cpuModel, inline: false },
        { name: 'CPU Usage', value: `${cpuUsagePercent}%`, inline: true },
        { name: 'CPU Temperature', value: tempStr, inline: true },
        { name: 'System Load (1m, 5m, 15m)', value: loadAvg, inline: true },
        { name: 'Operating System', value: osInfo, inline: false },
        { name: 'Commands Loaded', value: `${totalCommands}`, inline: true },
        { name: 'Uptime', value: uptime, inline: true },
      ],
      timestamp: new Date(),
      footer: { text: 'Bot Info' },
    };

    console.log("Bot info");
    await interaction.reply({ embeds: [embed] });
  },
};
