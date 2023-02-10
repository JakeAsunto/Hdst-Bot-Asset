module.exports.config = {
	name: 'get-id',
	version: '1.0.4',
	hasPermssion: 0,
	description: 'get the ID of your account or other users by replying or mentioning',
	usages: '< thread | (type reply) | (mention(s))>',
	commandCategory: 'tools',
	cooldowns: 5,
	credits: 'Hadestia',
	aliases: [ 'uid', 'id' ]
}

module.exports.run = async function({ api, args, event, textFormat }) {
	
	const { threadID,  messageID, senderID, mentions } = event;
	const axios = require('axios');
	
	// if request was thread
	if (args.length > 0) {
		if (args[0] == 'thread') {
			return api.sendMessage(threadID, threadID, messageID);
		} else if (args[0].indexOf('https://') !== -1) {
			try {
				return await axios.get(`https://api-dien.HdstTeam.repl.co/finduid?url=${encodeURI(args[0])}`).then(res => {
					return api.sendMessage(res.data.id, threadID, messageID);
				}).catch(err => {
					return api.sendMessage(err)
				});
			} catch (e) {
				console.log(e);
				return api.sendMessage(e, threadID, messageID);
			}
		}
	}
	
	// handle reply event
	if (event.type == 'message_reply') {
		
		return api.sendMessage(event.messageReply.senderID, threadID, (err, info) => { global.autoUnsend(err, info, 5) }, messageID);
		
	}
	
	// handle Normal execution
	if (Object.keys(mentions).length == 0) {
		
		return api.sendMessage(
			`${event.senderID}`, threadID, (err, info) => { global.autoUnsend(err, info, 5) }, messageID
		);
		
	// handle mentions
	} else {
		
		let messageListBody = '';
		
		if (Object.keys(mentions).length > 1) {
		
			for (let i = 0; i < Object.keys(mentions).length; i++) {
			
				const name = Object.values(mentions)[i].replace('@', '');
				const id = Object.keys(mentions)[i];
			
				const body = textFormat('tool', 'getIdMentions', name, id);
				messageListBody = messageListBody + body + '\n';
			}
		
			let messageBody = textFormat('tool', 'getIdMentionsFormat', messageListBody);
		
			return api.sendMessage(messageBody, threadID, messageID);
		} else {
			
			const name = Object.values(mentions)[0].replace('@', '');
			const id = Object.keys(mentions)[0]
			
			return api.sendMessage(id, threadID, (err, info) => { global.autoUnsend(err, info, 5) }, messageID);
		}
	}
}