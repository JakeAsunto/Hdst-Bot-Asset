module.exports.config = {
	name: 'get-id',
	version: '1.0.4',
	hasPermssion: 0,
	description: 'get the ID of the current Group/Account or other users by replying or mentioning',
	usages: '< user link | (@reply) | (@mention(s))>',
	commandCategory: 'other',
	cooldowns: 5,
	credits: 'Hadestia',
	aliases: [ 'id', 'uid', 'tid', 'thread', 'group' ]
}

module.exports.run = async function({ api, args, event, alias, Utils }) {
	
	const { threadID,  messageID, senderID, mentions } = event;
	const axios = require('axios');
	
	if (['tid', 'thread', 'group'].includes(alias)) {
		return api.sendMessage(threadID, threadID, messageID);
	}
	
	// handle reply event
	if (event.type == 'message_reply') {
		return api.sendMessage(event.messageReply.senderID, threadID, (err, info) => { Utils.autoUnsend(err, info, 5) }, messageID);
	}
	
	// handle Normal execution
	if (Object.keys(mentions).length == 0) {
		return api.sendMessage(`${event.senderID}`, threadID, (err, info) => { Utils.autoUnsend(err, info, 5) }, messageID);
	// handle mentions
	} else {
		
		let messageListBody = '';
		if (Object.keys(mentions).length > 1) {
		
			for (let i = 0; i < Object.keys(mentions).length; i++) {
				const name = Object.values(mentions)[i].replace('@', '');
				const id = Object.keys(mentions)[i];
				const body = Utils.textFormat('tool', 'getIdMentions', name, id);
				messageListBody = messageListBody + body + '\n';
			}
		
			let messageBody = Utils.textFormat('tool', 'getIdMentionsFormat', messageListBody);
			return api.sendMessage(messageBody, threadID, messageID);
			
		} else {
			
			const name = Object.values(mentions)[0].replace('@', '');
			const id = Object.keys(mentions)[0]
			return api.sendMessage(id, threadID, (err, info) => { Utils.autoUnsend(err, info, 5) }, messageID);
			
		}
	}
}