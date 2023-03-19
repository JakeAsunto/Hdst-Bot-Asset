module.exports.config = {
	name: 'roll',
	version: '1.0.0',
	hasPermssion: 0,
	commandCategory: 'games',
	credits: 'Hadestia',
	cooldowns: 0,
	description: 'A simple rolling dice game, will return a random number from 1 - 6 or a random number up to the given range.',
	usages: '[ range(number) ]'
}

module.exports.run = function ({ api, args, event, textFormat }) {
	
	const { threadID, messageID } = event;
	const pick = Math.floor(Math.random() * 6);
		
	if (args.length > 0) {
		if (!parseInt(args[0])) {
			return api.sendMessage(pick, threadID, messageID);
		}
		const newPick = Math.floor(Math.random() * parseInt(args[0]));
		return api.sendMessage(newPick, threadID, messageID);
	} else {
		return api.sendMessage(pick, threadID, messageID);
	}
}