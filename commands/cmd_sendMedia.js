module.exports.config = {
	name: 'send-media',
	version: '1.0.0',
	hasPermssion: 2,
	commandCategory: 'system',
	usages: '<path>',
	description: 'send a media file from bot\'s storage',
	cooldowns: 5,
	hidden: true,
	envConfig: {
		requiredArgument: 1
	}
}

module.exports.run = function ({ api, args, event }) {
	
	const { threadID, messageID } = event;
	const fs = require('fs-extra');
	const file = args.join(' ');
	
	global.sendReaction.inprocess(api, event);

	try {
		const path = `${__dirname}/../../${file}`;
		return api.sendMessage(
			{
				body: '',
				attachment: fs.createReadStream(path)
			},
			threadID,
			(e) => {
				if (e) return;
				global.sendReaction.success(api, event);
			},
			messageID
		);
	} catch (err) {
		global.sendReaction.failed(api, event);
		return api.sendMessage(err, threadID, messageId);
	}
}