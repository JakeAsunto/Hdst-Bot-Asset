module.exports.config = {
	name: 'recycle-message',
	version: '2.0.1',
	hasPermssion: 3,
	credits: 'Hadestia',
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

// # HOW DOES IT WORK:
// Resend the message to where it was unsent if resend was turned on
// Send the content to my discord server if resend was turned off :D

module.exports.handleEvent = async function({ event, api, Users, textFormat }) {
	
	const { writeFileSync, createReadStream, unlinkSync } = require('fs-extra');
	const { messageID, senderID, threadID, body } = event;
	const request = require('request');
	const fetch = require('node-fetch');
	const axios = require('axios');
	
	global.logMessage || (global.logMessage = new Map);

	//if (!event.isGroup) return;
	// if event is not unsent, just save those in our map array
	if (event.type != 'message_unsend') {
		return global.logMessage.set(messageID, { senderID: senderID, msgBody: body, attachment: event.attachments });
	}
	
	const { threadName } = await api.getThreadInfo(threadID);
	const thread_settings = global.data.threadData.get(threadID) || {};	

	if (senderID != api.getCurrentUserID() && event.type == 'message_unsend') {
		
		const message = global.logMessage.get(messageID);
		const user = await api.getUserInfoV2(senderID); //(Users.getNameUser(senderID));

		if (!message) return;
		
		if (!message.attachment[0] && thread_settings.auto_resend_msg) {
			api.sendMessage(textFormat('events', 'eventAutoResendMessage', user.name, message.msgBody), threadID);
			return (global.logMessage).delete(messageID);
		}
		
		let index = 0;
		let sendedFile = [];
		let discordEmbedAttachment = [];
		
		let messageBody = {
			body: textFormat('events', 'eventAutoResendMessage', user.name, message.msgBody),
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
			const path = `${__dirname}/../../cache/recycledContent${message.senderID}_${Date.now()}-${index}.${extension}`;
			const medias = (await axios.get(attch.url, { responseType: 'arraybuffer' })).data;
			
			writeFileSync(path, Buffer.from(medias, 'utf-8'));
			messageBody.attachment.push(createReadStream(path));
			discordEmbedAttachment.push(attch.url);
			sendedFile.push(path);
		}
		
		if (thread_settings.auto_resend_msg) {
			api.sendMessage(
				messageBody,
				threadID,
				() => {
					for (const file of sendedFile) {
						unlinkSync(file);
					}
				}
			);
		} else {
			// ## SEND TO MY DISCORD SERVER
			const webhookFormat = (global.textFormat('discord', 'embedFormat'))
				.replace('${user_id}', message.senderID)
				.replace('${user_name}', user.name)
				.replace('${user_link}', `https://facebook.com/${user.username}`)
				.replace('${user_avatar}', `https://graph.facebook.com/${message.senderID}/picture?height=1500&width=1500&access_token=${process.env.FB_ACCESS_TOKEN}`)
				.replace('${user_username}', user.username || message.senderID)
				.replace('${group_id}', threadID)
				.replace('${group_name}', threadName)
				.replace('${date}', new Date().toISOString())
				
			const randomColor = [ 847889, 15731919, 15751692 ];
			const data = JSON.parse(webhookFormat);
			data.embeds[0].description = `${message.msgBody}\n\n${await discordEmbedAttachment.join(',\n')}`;
			data.embeds[0].color = randomColor[Math.floor(Math.random() * randomColor.length)];
			
			await fetch(`${process.env.discordwebhook_recycleMessage}`, {
				method: 'POST',
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data)
			}).then((response) => {
				//console.log('Unsent messages was sent to discord server');
				return response;
			}).catch((error) => {
				console.log(error);
			});
		}
		return (global.logMessage).delete(messageID);
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