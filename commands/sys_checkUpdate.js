module.exports.config = {
	name: 'check-update',
	version: '1.0.6',
	hasPermssion: 2,
	commandCategory: 'system',
	aliases: [ 'update', 'bot-update' ],
	description: 'check available update for bot',
	cooldowns: 5,
	hidden: true,
	credits: 'Hadestia'
}

module.exports.run = async function ({ api, args, event, textFormat }) {
	
	const axios = require('axios');
	
	const assets = require(`${__dirname}/../../json/!asset-update.json`);
	await axios(`${global.config.REPO}json/!asset-update.json`).then(res => {
		if (res.data.VERSION !== global.BOT_VERSION) {
			return api.sendMessage(
				textFormat('system', 'botUpdatesFound', res.data.VERSION, res.data.CHANGELOGS),
				event.threadID,
				event.messageID
			);
		}
		return api.sendMessage(
			`${textFormat('system', 'botUpdatesUpToDate')} current version was ${global.BOT_VERSION}`,
			event.threadID,
			event.messageID
		);
	}).catch(e => {
		return api.sendMessage(
			textFormat('system', 'botVersionFetchingFailed'),
			event.threadID,
			event.messageID
		);
	});
}