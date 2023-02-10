module.exports.config = {
	name: 'bold-font',
	version: '1.0.0',
	hasPermssion: 0,
	commandCategory: 'other',
	description: 'Replace string into specific font style',
	usages: '[ 1 | 2 | ... | 5 ] < text >\nwhile:\n1 = bold sans\n2 = italic bold sans\n3 = bold serif\4 = italic bold sarif\5 = medieval bold',
	aliases: [ 'bold' ],
	cooldowns: 5,
	envConfig: {
		requiredArgument: 2
	}
}

module.exports.run = async function ({ api, args, event, returns, textFormat }) {
	
	const { threadID, messageID } = event;
	
	const type = args.shift();
	const message = args.join(' ');
	
	if (!parseInt(type) || parseInt(type) > 5 || parseInt(type) < 1) {
		return api.sendMessage(textFormat('error', 'errOccured', 'Invalid type, type should be a number from 1 - 5'), threadID, messageID);
	}
	
	const types = [
		'bold-sans',
		'bold-sans-italic',
		'bold-serif',
		'bold-serif-italic',
		'bold-medieval'
	]
	
	const result = await global.fancyFont(message, types[type - 1]);
	return api.sendMessage(result, threadID, messageID);
}