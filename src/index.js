const Commando = require('discord.js-commando'),
      oneLine  = require('common-tags').oneLine,
      path     = require('path'),
      env      = process.env;

if (env.NODE_ENV === 'development') require('dotenv').config(); // read environment variables from .env if we're in development

const dbFile = (env.OPENSHIFT_DATA_DIR ? path.join(env.OPENSHIFT_DATA_DIR, 'settings.sqlite3') : path.join(__dirname, 'settings.sqlite3'));
const webConfig = {
    webPort: env.OPENSHIFT_NODEJS_PORT || 8080,
    webIp: env.OPENSHIFT_NODEJS_IP || '127.0.0.1'
};
const client = new Commando.Client({owner: env.DISCORD_OWNER_ID, commandPrefix: env.DEFAULT_PREFIX});

// define our mediaPlayer object
client.mediaPlayer = require('./util/mediaPlayer.js');



client
	.on('error', console.error)
	.on('warn', console.warn)
	//.on('debug', console.log)
	.on('ready', () => {
		console.log(`Client ready; logged in as ${client.user.username}#${client.user.discriminator} (${client.user.id})`);
	})
	.on('disconnect', () => { console.warn('Disconnected!'); })
	.on('reconnecting', () => { console.warn('Reconnecting...'); })
	.on('commandError', (cmd, err) => {
		if(err instanceof Commando.FriendlyError) return;
		console.error(`Error in command ${cmd.groupID}:${cmd.memberName}`, err);
	})
	.on('commandBlocked', (msg, reason) => {
		console.log(oneLine`
			Command ${msg.command ? `${msg.command.groupID}:${msg.command.memberName}` : ''}
			blocked; ${reason}
		`);
	})
	.on('commandPrefixChange', (guild, prefix) => {
		console.log(oneLine`
			Prefix ${prefix === '' ? 'removed' : `changed to ${prefix || 'the default'}`}
			${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
		`);
	})
	.on('commandStatusChange', (guild, command, enabled) => {
		console.log(oneLine`
			Command ${command.groupID}:${command.memberName}
			${enabled ? 'enabled' : 'disabled'}
			${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
		`);
	})
	.on('groupStatusChange', (guild, group, enabled) => {
		console.log(oneLine`
			Group ${group.id}
			${enabled ? 'enabled' : 'disabled'}
			${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
		`);
	})
	// TODO: Refactor voiceStateUpdate event to properly leave empty channels
    .on('voiceStateUpdate', (oldMember, newMember) => {
		// if (oldMember.voiceChannel && oldMember.voiceChannel.members.size === 1) {
		// 	return client.music.streamDispatcher.end();
		// }
	});
    

// client.setProvider(
//     sqlite.open(dbFile).then(db => new Commando.SQLiteProvider(db))
// ).catch(console.error);

client.registry
    .registerGroups([
        ['fun', 'Fun Stuff'],
        ['music', 'Music Streaming']
    ])
    .registerDefaults()
    .registerCommandsIn(path.join(__dirname, 'commands'));

client.login(env.DISCORD_TOKEN);