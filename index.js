import { Client, Collection, Events, GatewayIntentBits, REST, Routes } from 'discord.js';
import { config } from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';

config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
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

(async () => {
    try {
        if (useGuildCommands) {
            if (!process.env.GUILD_ID) {
                throw new Error('GUILD_ID environment variable is required when USE_GUILD_COMMANDS=true');
            }
            console.log('Registering commands in guild and global (fast testing).');
            rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: commands }
            )
            await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
                { body: commands }
            );
            console.log('Guild commands updated.');
        } else {
            // Register global commands...
            console.log('Registering global commands and also updating guild commands for fast testing.');

            if (!process.env.GUILD_ID) {
                throw new Error('GUILD_ID environment variable is required for guild commands update.');
            }

            await Promise.all([
                rest.put(
                    Routes.applicationCommands(process.env.CLIENT_ID),
                    { body: commands }
                )
            ]);

            console.log('Global and guild commands updated.');
        }
    } catch (error) {
        console.error(error);
    }
})();


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

client.once(Events.ClientReady, c => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.login(process.env.TOKEN);
