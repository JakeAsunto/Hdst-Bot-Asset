module.exports.config = {
	name: 'shutdown',
	version: '1.0.3',
	hasPermssion: 2,
	description: 'shutdown this bot.',
	commandCategory: 'system',
	usage: '',
	cooldowns: 60,
	credits: 'Hadestia'
}

module.exports.run = function ({ api, args, event, textFormat }) {
	const { threadID, messageID } = event;
	const response = textFormat('system', 'botShutdown');
	
	return api.sendMessage(
		response,
		threadID,
		(err, info) => {
			if (err) {
				api.sendMessage(textFormat('system', 'botShutdownError'), threadID, messageID);
			}
			api.logout();
		},
		messageID
	);
}