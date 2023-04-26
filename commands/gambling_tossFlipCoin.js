module.exports.config = {
	name: 'flip',
	version: '1.0.0',
	hasPermssion: 0,
	commandCategory: 'gambling',
	credits: 'Hadestia',
	cooldowns: 0,
	description: 'A toss coin game same as "toss" but with the involvement of money.',
	usages: '<bet> [heads/tails]',
	envConfig: {
		requiredArgument: 2,
		needGroupData: true
	}
}

module.exports.run = function ({ api, args, event, Utils, Threads }) {
	
	const { threadID, messageID } = event;
	const outcomes = {
		
		
	return api.sendMessage(pick, threadID, messageID);
}