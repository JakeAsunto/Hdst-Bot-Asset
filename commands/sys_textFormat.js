module.exports.config = {
	name: 'text-format',
	version: '1.0.0',
	hasPermssion: 2,
	description: 'test textFormat util',
	commandCategory: 'system',
	usages: '',
	cooldowns: 0,
	credits: 'Hadestia'
}

module.exports.run = function ({ api, args, event }) {
	const { threadID, messageID } = event;
	const textFormat = require(`${__dirname}/../../json/textFormat.json`);
	
	return api.sendMessage(
		(textFormat[args[0]][args[1]]).toString(),
		threadID,
		messageID
	);
}