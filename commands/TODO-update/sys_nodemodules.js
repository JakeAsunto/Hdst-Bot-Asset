module.exports.config = {
	name: 'node-modules',
	version: '1.0.0',
	description: 'Get the list of all node modules',
	cooldowns: 5,
	usage: '',
	hidden: true,
	hasPermssion: 2,
	commandCategory: 'system',
	credits: 'Hadestia'
}

module.exports.run = function ({ api, event }) {
	
	const { threadID, messageID } = event;
	
	let msg = '';
	
	for (const name of global.nodemodule) {
		msg += 'name' + '\n';
	}
	
	api.sendMessage(msg, threadID, messageID);
}