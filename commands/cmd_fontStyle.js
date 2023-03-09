module.exports.config = {
	name: 'font',
	version: '1.0.0',
	hasPermssion: 0,
	commandCategory: 'other',
	description: 'Replace string into specific font style',
	usages: '[ 1 - 6 ] < text | (replu message) >\n\nwhile:\n1 = bold sans\n2 = italic bold sans\n3 = bold serif\n4 = italic bold sarif\n5 = medieval bold\n6 = thin font1\n\n',
	aliases: [ 'style' ],
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
	
	if (!parseInt(type) || parseInt(type) > 6 || parseInt(type) < 1) {
		return api.sendMessage(textFormat('error', 'errOccured', 'Invalid type, type must be a number from 1 - 6'), threadID, (e, i) => {global.autoUnsend(e, i, 5)}, messageID);
	}
	
	const types = [
		'bold-sans',
		'bold-sans-italic',
		'bold-serif',
		'bold-serif-italic',
		'bold-medieval',
		'thin-font1'
	]
	
	const result = await global.fancyFont.get(message, types[type - 1]);
	api.sendMessage(result, threadID, messageID);
	return global.sendReaction.success(api, event);
}