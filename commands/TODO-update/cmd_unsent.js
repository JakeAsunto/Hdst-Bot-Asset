module.exports.config = {
	name: 'unsent',
	version: '1.0.3',
	hasPermssion: 2,
	credits: 'Hadestia',
	description: 'unsent bot message by replying on the target message.',
	commandCategory: 'system',
	aliases: [ 'unsend', 'remove' ],
	usages: '<!reply base command!>',
	cooldowns: 0
};

module.exports.run = function({ api, event, textFormat }) {
	
	// if not reply
	if (event.type != 'message_reply') {
		global.sendReaction.failed(api, event);
		return api.sendMessage(textFormat('system', 'botUnsentMissingReply'), event.threadID, event.messageID);
	}
	
	if (event.messageReply.senderID != global.botUserID) {
		global.sendReaction.failed(api, event);
		return api.sendMessage(textFormat('system', 'botCantUnsent'), event.threadID, event.messageID);
	}
	
	global.sendReaction.success(api, event);
	return api.unsendMessage(event.messageReply.messageID);
}