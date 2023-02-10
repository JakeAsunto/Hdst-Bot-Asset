module.exports.config = {
	name: 'bold-font',
	version: '1.0.0',
	hasPermssion: 0,
	commandCategory: 'other',
	description: 'Replace string into specific font style',
	usages: '[ 1 - 5 ] < text | (replu message) >\n\nwhile:\n1 = bold sans\n2 = italic bold sans\n3 = bold serif\n4 = italic bold sarif\n5 = medieval bold\n\n',
	aliases: [ 'bold' ],
	cooldowns: 5,
	credits: 'Hadestia',
	envConfig: {
		requiredArgument: 1
	}
}

module.exports.run = async function ({ api, args, event, returns, textFormat }) {
	
	const { threadID, messageID } = event;
	
	const type = args.shift();
	
	if (event.type === 'message_reply') {
		var message = event.messageReply.body;
	} else {
		if (args.length === 0) return returns.invalid_usage();
		var message = args.join(' ');
	}
	
	if (!parseInt(type) || parseInt(type) > 5 || parseInt(type) < 1) {
		return api.sendMessage(textFormat('error', 'errOccured', 'Invalid type, type must be a number from 1 - 5'), threadID, (e, i) => {global.autoUnsend(e, i, 5)}, messageID);
	}
	
	const types = [
		'bold-sans',
		'bold-sans-italic',
		'bold-serif',
		'bold-serif-italic',
		'bold-medieval'
	]
	
	const result = await global.fancyFont.get(message, types[type - 1]);
	return api.sendMessage(result, threadID, messageID);
}