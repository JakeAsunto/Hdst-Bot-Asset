module.exports.config = {
	name: 'recycle-message',
	version: '2.0.1',
	hasPermssion: 3,
	credits: 'Analyzed by Hadestia',
	description: 'Enable or disable message resending.',
	commandCategory: 'group',
	aliases: [ 'resend', 'resent' ],
	usages: '',
	cooldowns: 0,
	dependencies: {
		'request': '',
		'fs-extra': '',
		'axios': ''
	}
}

module.exports.handleEvent = async function({ event, api, Users, textFormat }) {
	
	const { writeFileSync, createReadStream, unlinkSync } = global.nodemodule['fs-extra'];
	const { messageID, senderID, threadID, body } = event;
	const request = global.nodemodule.request;
	const axios = global.nodemodule.axios;
	
	global.logMessage || (global.logMessage = new Map);
	
	// if event is not unsent, just save those in our map array
	if (event.type != 'message_unsend') {
		return global.logMessage.set(messageID, { msgBody: body, attachment: event.attachments });
	}
	
	const thread_settings = global.data.threadData.get(threadID) || {};	

	if ((thread_settings.auto_resend_msg) && senderID != api.getCurrentUserID() && event.type == 'message_unsend') {
		
		const message = global.logMessage.get(messageID);
		const user = await api.getUserInfoV2(senderID); //(Users.getNameUser(senderID));

		if (!message) return;
		
		if (!message.attachment[0]) {
			return api.sendMessage(textFormat('events', 'eventAutoResendMessage', user.name, message.msgBody), threadID);
		}
		
		let index = 0;
		let sendedFile = [];
		
		let messageBody = {
			body: textFormat('events', 'eventAutoResendMessage', user.name, (message.msgBody == '') ? '' : message.msgBody),
			attachment: [],
			mentions: {
				tag: user.name,
				id: senderID
			}
		};
			
		for (var attch of message.attachment) {
			
			index += 1;
			const response = (await request.get(attch.url)).uri.pathname;
			const extension = response.substring(response.lastIndexOf('.') + 1);
			const path = `${__dirname}/../../cache/recycledContent${index}.${extension}`;
			const medias = (await axios.get(attch.url, { responseType: 'arraybuffer' })).data;
			
			writeFileSync(path, Buffer.from(medias, 'utf-8'));
			messageBody.attachment.push(createReadStream(path));
			sendedFile[sendedFile.length] = path;
		}
		
		return api.sendMessage(
			messageBody,
			threadID,
			() => {
				for (const file of sendedFile) {
					unlinkSync(file);
				}
			}
		);
	}
}

module.exports.run = async function({ api, event, Threads, textFormat }) {
	
	const { threadID, messageID } = event;
	let thread_settings = (await Threads.getData(threadID)).data;
	
	thread_settings.auto_resend_msg = !thread_settings.auto_resend_msg;
	
	await Threads.setData(threadID, { data: thread_settings });
	global.data.threadData.set(threadID, thread_settings);
	
	return api.sendMessage(textFormat('events', 'eventAutoResendSetState', (thread_settings.auto_resend_msg) ? 'on' : 'off'), threadID, messageID);
};