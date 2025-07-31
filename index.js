import { Client, Collection, Events, GatewayIntentBits, REST, Routes, ActivityType } from 'discord.js';
import { config } from 'dotenv';
import fs from 'node:fs';
import fsPromises from 'node:fs/promises';
import path from 'node:path';

config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ],
});

let rollingStatuses = [];
let currentIndex = 0;
let rollingInterval;

async function loadStatusData() {
  try {
    const dataRaw = await fsPromises.readFile('./status.json', 'utf8');
    const data = JSON.parse(dataRaw);
    rollingStatuses = data.statuses || [];
    currentIndex = data.currentIndex || 0;
    console.log(`✅ Loaded ${rollingStatuses.length} rolling statuses from status.json`);
  } catch (err) {
    console.log('⚠️ Failed to load status.json, starting with empty statuses:', err.message);
    rollingStatuses = [];
    currentIndex = 0;
  }
}

async function saveStatusData() {
  try {
    await fsPromises.writeFile('./status.json', JSON.stringify({
      statuses: rollingStatuses,
      currentIndex
    }, null, 2));
  } catch (err) {
    console.error('Failed to save status.json:', err);
  }
}

function startRollingStatus(client, intervalMs = 30_000) {
  if (!rollingStatuses.length) {
    console.log('No statuses to rotate through.');
    return;
  }

  if (rollingInterval) clearInterval(rollingInterval);

  // Immediately set presence once on start
  setPresence(client);

  rollingInterval = setInterval(() => {
    currentIndex = (currentIndex + 1) % rollingStatuses.length;
    setPresence(client);
    saveStatusData(); // Save current index to file
  }, intervalMs);
}

function setPresence(client) {
  const status = rollingStatuses[currentIndex];
  if (!status) return;

  const activityType = ActivityType[status.type];
  if (activityType === undefined) {
    console.warn(`Unknown activity type "${status.type}", defaulting to PLAYING`);
  }

  client.user.setPresence({
    activities: [{
      name: status.text,
      type: activityType ?? ActivityType.Playing,
    }],
    status: 'online',
  });
}


client.commands = new Collection();

const commandsPath = path.join(process.cwd(), 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

const commands = [];
const registeredCommands = new Set();

// Map Discord command type numbers to human-readable names
const CommandTypeNames = {
  1: 'Slash Command',
  2: 'User Context Menu',
  3: 'Message Context Menu',
};

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const imported = await import(`file://${filePath}`);
  const cmds = imported.default;

  const commandsArray = Array.isArray(cmds) ? cmds : [cmds];

  for (const command of commandsArray) {
    if ('data' in command && 'execute' in command) {
      const cmdData = command.data.toJSON();
      const type = cmdData.type ?? 1; // Default to 1 (Slash Command) if missing
      const key = `${cmdData.name}#${type}`;

      if (registeredCommands.has(key)) {
        console.warn(`[WARNING] Duplicate command ignored: ${key} from ${filePath}`);
        continue;
      }

      registeredCommands.add(key);
      client.commands.set(cmdData.name, command);
      commands.push(cmdData);
    } else {
      console.warn(`[WARNING] The command at ${filePath} is missing "data" or "execute".`);
    }
  }
}

// Log commands and their types before registering
console.log('Commands to register:');
for (const cmd of commands) {
  const typeName = CommandTypeNames[cmd.type] || 'Unknown Type';
  console.log(`- ${cmd.name} (${typeName})`);
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

const useGuildCommands = process.env.USE_GUILD_COMMANDS === 'true';

client.on(Events.InteractionCreate, async interaction => {
  // Handle slash commands and user/message context menus
  if (
    !interaction.isChatInputCommand() &&
    !interaction.isUserContextMenuCommand() &&
    !interaction.isMessageContextMenuCommand()
  ) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: 'There was an error while executing this command.', ephemeral: true });
    }
  }

});

client.on('messageDelete', message => {
  import('./commands/snipe.js').then(mod => mod.trackDeleted(message));
});


client.once(Events.ClientReady, async c => {
  console.log(`Ready! Logged in as ${c.user.tag}`);

  await loadStatusData();
  startRollingStatus(client);
});

(async () => {
  try {-
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    if (useGuildCommands) {
      const guildId = process.env.GUILD_ID;
      if (!guildId) throw new Error('GUILD_ID is not defined in .env');

      await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId),
        { body: commands },
      );
      console.log('Successfully reloaded guild application commands.');
    } else {
      await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID),
        { body: commands },
      );
      console.log('Successfully reloaded global application commands.');
    }
  } catch (error) {
    console.error(error);
  }
})();


client.login(process.env.TOKEN);
