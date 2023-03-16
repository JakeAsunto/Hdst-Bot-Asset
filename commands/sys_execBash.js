module.exports.config = {
	name: 'shell',
	version: '1.0.0',
	description: 'run shell command on the system.',
	hasPermssion: 2,
	credits: 'Hadestia',
	commandCategory: 'system',
	usages: '<command>',
	aliases: [ 'sh' ],
	cooldowns: 30,
	hidden: true,
	dependencies: {
		child_process: ''
	},
	envConfig: {
		requiredArgument: 2,
		inProcessReaction: true
	}
}

module.exports.run = async function ({ api, args, event, texrFormat }) {
	
	const { exec } = require('child_process');
	
	if (!event.senderID == global.config.ADMINBOT[0]) {
		return api.sendMessage(textFormat('cmd', 'cmdPermissionNotEnough', 'Bot owner'), event.threadID, event.messageID);
	}
	
	const command = args.join(' ');
	
	//global.sendReaction.loading
	await exec(
		command,
		(err, stdout, stderr) => {
			if (err) {
				global.sendReaction.failed(api, event);
				return api.sendMessage(textFormat('system', 'botBashError', err), event.threadID, event.messageID);
			}
			if (stderr) {
				global.sendReaction.failed(api, event);
				return api.sendMessage(textFormat('system', 'botBashStdError', stderr), event.threadID, event.messageID);
			}
			
			global.sendReaction.success(api, event);
			
			if (stdout) return api.sendMessage(textFormat('system', 'botBashStdOut', stdout), event.threadID, event.messageID);
		}
	);
}