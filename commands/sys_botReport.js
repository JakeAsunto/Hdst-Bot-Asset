module.exports.config = {
	name: 'bot-report',
	version: '1.0.11',
	hasPermssion: 0,
	credits: 'Hadestia',
	description: 'Report a bot issue directly to the developer',
	commandCategory: 'system',
	usages: '< message >',
	aliases: [ 'report', 'callad' ],
	cooldowns: 600,
	envConfig: {
		requiredArgument: 1
	}
}

module.exports.run = async function ({api, args, event, textFormat}) {
	
	const message = args.join(' ');
	const sender = await api.getUserInfoV2(event.senderID);
	const group = (event.isGroup) ? await global.data.threadInfo.get(event.threadID) : {};
	
	for (const admin of global.config.ADMINBOT) {
		await api.sendMessage(
			textFormat('events', 'eventBotReportSendToAdmin', message, sender.name, group.threadName || 'Direct Message', event.threadID, event.messageID),
			admin,
			(err, info) => {
				if (err) {
					global.sendReaction.failed(api, event);
					return api.sendMessage(textFormat('error', 'errOccured', err), event.threadID, event.messageID);
				}
				global.sendReaction.success(api, event);
				return api.sendMessage(textFormat('events', 'eventBotReportSendToRespondent'), event.threadID, event.messageID);
			}
		);
	}
}