module.exports.config = {
	name: 'avatar',
	version: '1.0.0',
	hasPermssion: 0,
	cooldowns: 20,
	commandCategory: 'edited images/meme',
	description: 'Generate personalized avatar by giving information needed.',
	usages: '< avatar ID (1-800) > | < color name > | < name > | < signature >\nsample: "$avatar 1 | pink | hadestia | hdst"',
	envConfig: {
		requiredArgument: 3,
		inProcessReaction: true
	},
	dependencies: {
		'axios': '',
		'fs-extra': ''
	},
	credits: 'Joshua Sy for API'
}

module.exports.run = async function ({ api, args, event, returns, textFormat, Prefix }) {
	
	const { threadID, messageID, senderID } = event;
	const axios = require('axios');
	const fs = require('fs-extra');
	
	const division = (args.join(' ')).split(/\s\|\s|\| | \| |\|| \|/g);
	let id = parseInt(division[0]);
	const in_synText = textFormat('error', 'errOccured', 'Avatar ID must be a number ranges 1 - 800');

	if (!id) {
		global.sendReaction.failed(api, event);
		api.sendMessage(in_synText, threadID, messageID);
		return returns.remove_usercooldown();
	} else if (id < 1 || id > 800) {
		global.sendReaction.failed(api, event);
		api.sendMessage(in_synText, threadID, messageID);
		return returns.remove_usercooldown();
	}
	
	const link = encodeURI(`https://api.reikomods.repl.co/canvas/avtwibu?id=${id - 1}&color=${division[1]}&name=${division[2]}&subname=${division[3]}`);
	const path = `${__dirname}/../../cache/${(link.split('/')).pop()}.png`;
	const avatar = (await axios.get(link, { responseType: 'arraybuffer' })).data;
	
	fs.writeFileSync(path, Buffer.from(avatar, 'utf-8'));
	return api.sendMessage(
		{
			body: '',
			attachment: fs.createReadStream(path)
		},
		threadID,
		async (e, i) => {
			if (fs.existsSync(path)) {
				fs.unlinkSync(path);
			}
			if (e) {
				global.sendReaction.failed(api, event);
				global.logModuleErrorToAdmin(e, __filename, event);
				return api.sendMessage(textFormat('error', 'errCmdExceptionError', e), threadID, messageID);
			}
			global.sendReaction.success(api, event);
		},
		messageID
	);
			
}