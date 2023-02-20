module.exports.config = {
	name: 'setbio',
	version: '1.0.2',
	hasPermssion: 2,
	credits: 'Hadestia',
	description: 'Change bot\'s biography',
	commandCategory: 'system',
	usages: '[text]',
	cooldowns: 10
}
  
module.exports.run = async ({ api, event, args, textFormat }) => {
	
	let content = (args.length > 0) ? args.join(' ').replace('\n', '\n') : textFormat('system', 'botDefaultBio', global.config.PREFIX);
	
	api.changeBio(
		content,
		(e) => {
			if (e) return api.sendMessage(textFormat('error', 'errOccured', e), event.threadID, event.messageID);
			return api.sendMessage(textFormat('system', 'botChangedBio', content), event.threadID, event.messgaeID);
		}
    );
}