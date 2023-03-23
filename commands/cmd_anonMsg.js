const reference = require(`${__dirname}/../../json/textFormat.json`).comms.anonMsgIDReplacer;

module.exports.config = {
	name: 'anon-msg',
	version: '1.3.4',
	hasPermssion: 0,
	description: 'send an anonymous direct message to specific user given by an id.\n• using "|" is a required to separate inputs',
	commandCategory: 'communication',
	usages: '<user id> | <your codename> | <your message>\n',
	aliases: [ 'anonymous' ],
	cooldowns: 30,
	credits: 'Hadestia',
	envConfig: {
		requiredArgument: 3,
		inProcessReaction: true
	}
	//isMaintenance: true
}

module.exports.handleMessageReply = async function ({ api, event, Prefix }) {
	
	const { body, threadID, messageID, senderID, messageReply } = event;
	
	try {
		if (event.type === 'message_reply' && !body.startsWith(Prefix)) {
			//console.log('ANONYMOUSE MESSAGE HANDLE REPLY\n', event);
		
			if (messageReply && !messageReply.senderID || messageReply.senderID !== global.botUserID) return;
		
			// IF this thread was the receiver of the sent anonymous message
			if (messageReply && messageReply.body.indexOf('𝗔𝗻𝗼𝗻𝘆𝗺𝗼𝘂𝘀 𝗠𝗲𝘀𝘀𝗮𝗴𝗲') !== -1 && messageReply.body.indexOf('replied to your anonymous message.') === -1) {
			
				// get the id of the one who sent this anonymous message
				const trackIDs = messageReply.body.match(/(?<=𝚒𝚍: ).+?(?=\s|\s+)/g) || [];
				// get the codename of the one who sent this
				const codename = messageReply.body.match(/(?<=𝚋𝚢: ).+?(?=\s|\s+)/g) || [ 'unknown' ];
				
			
				if (trackIDs.length < 2) {
					return api.sendMessage(global.textFormat('event', 'errUnableToTrackRecipientIDs'), threadID, messageID);
				}
			
				// decrypt senderID
				const anon_senderID = decryptSenderID(trackIDs[0]);
				const anon_messageID = trackIDs[1];
			
				// get the info of the user who replied to this anonymous message.
				const target_data = await api.getUserInfoV2(threadID); // expecting this was a direct message
				const senderName = target_data.name || target_data.username || threadID;
			
				const messageBody = {
					body: global.textFormat('comms', 'anonMsgSenderRepliedSide', senderName, body, codename[0], threadID, messageID, global.config.PREFIX)
				}
			
				// if has attachments
				let attachments = handleSenderAttachments(api, event, event.attachments);
				if ((attachments.length > 0) && typeof(attachments[0]) === 'string' && attachments[0] === 'false') return;
				if (attachments.length > 0) {
					messageBody.attachment = attachments;
				}
			
				return api.sendMessage(
					messageBody,
					anon_senderID,
					(err, info) => {
						if (err) {
							api.sendMessage(global.textFormat('comms', 'anonMsgSendError', err.errorDescription || ''), threadID, messageID);
							return global.sendReaction.failed(api, event);
						}
						global.sendReaction.success(api, event);
					},
					anon_messageID
				);

		
			// Handle reply of the one who sent anonymous message to the target recipient if he/she replied into it
			} else if (messageReply && messageReply.body.indexOf('𝗔𝗻𝗼𝗻𝘆𝗺𝗼𝘂𝘀 𝗠𝗲𝘀𝘀𝗮𝗴𝗲') !== -1 && messageReply.body.indexOf('replied to your anonymous message.') !== -1) {
				// same process; get the sender id
				const trackIDs = messageReply.body.match(/(?<=𝚒𝚍: ).+?(?=\s|\s+)/g) || [];
				// reusing sender codename
				// this time get the codename of the sender used in his/her message
				const codename = messageReply.body.match(/(?<=𝚢𝚘𝚞𝚛-𝚌𝚘𝚍𝚎𝚗𝚊𝚖𝚎: ).+?(?=━)/g) || [ 'unknown' ];
			
				if (trackIDs.length < 2) {
					return api.sendMessage(global.textFormat('event', 'errUnableToTrackRecipientIDs'), threadID, messageID);
				}
			
				// decrypt senderID if encrypted
				const recipient_senderID = decryptSenderID(trackIDs[0]);
				const recipient_messageID = trackIDs[1];
				// encrypt sender ID again
				const encryptedSenderID = encryptSenderID(threadID);
			
				let recipient_name = messageReply.body.match(/.+?(?=replied to your anonymous message.)/g) || null;
				let senderName = '';
			
				if (!recipient_name) {
					// get the info of the user who replied to this anonymous message.
					const target_data = await api.getUserInfoV2(recipient_senderID); // expecting this was a direct message
					senderName = target_data.name || target_data.username || recipient_senderID;
				} else {
					senderName = recipient_name.join(' ');
				}

				const messageBody = {
					body: global.textFormat('comms', 'anonMsgRecieverSide', senderName, body, codename[0], encryptedSenderID, messageID, global.config.PREFIX)
				};
			
				// if has attachments
				let attachments = handleSenderAttachments(api, event, event.attachments);
				if ((attachments.length > 0) && typeof(attachments[0]) === 'string' && attachments[0] === 'false') return;
				if (attachments.length > 0) {
					messageBody.attachment = attachments;
				}
			
				return api.sendMessage(
					messageBody,
					recipient_senderID,
					(err, info) => {
						if (err) {
							api.sendMessage(global.textFormat('comms', 'anonMsgSendError', err.errorDescription || ''), threadID, messageID);
							return global.sendReaction.failed(api, event);
						}
						global.sendReaction.success(api, event);
					},
					recipient_messageID
				);
			}
		}
	} catch (err) {
		console.log(err);
		global.sendReaction.failed(api, event);
		global.logModuleErrorToAdmin(err, __filename, event);
		return api.sendMessage(global.textFormat('error', 'errCmdExceptionError', err, Prefix), threadID, messageID);
	}
}

module.exports.run = async function (OBJ) {
	
	if (argumentRulePassed(OBJ)) {
		try {
			sendAnonMsg(OBJ);
    	} catch (err) {
    		OBJ.api.sendMessage(OBJ.textFormat('comms', 'anonMsgSendError'), OBJ.event.threadID, OBJ.event.messageID);
    		return OBJ.returns.remove_usercooldown();
   	}
    } else {
    	return OBJ.returns.remove_usercooldown();
    }
}

function encryptSenderID (id) {
	let result = id;
	for (const digit in reference) {
		result = result.replace(digit, reference[digit]);
	}
	return result;
}

function decryptSenderID (id) {
	let result = id;
	for (const digit in reference) {
		result = result.replace(reference[digit], digit);
	}
	return result;
}


async function sendAnonMsg({ api, args, event, textFormat }) {
	
	const { existsSyc, unlinkSync, writeFileSync, createReadStream } = require('fs-extra');
	const { body, threadID, messageID, senderID } = event;
	const axios = require('axios');
	
	const splitBody = (args.join(' ')).split('|');
	const receiverID = splitBody[0].trim();
	const senderCodeName = splitBody[1].trim()
	
	const senderMessage = splitBody[2].trim();
	const senderAttachments = event.attachments;
	
	// encrypt senderID to avoid tracking of the one who sent this
	const encryptedSenderID = encryptSenderID(threadID);
	
	// to reciever
	let recipient = await api.getUserInfoV2(receiverID);
	let messageBody = {
		body: textFormat('comms', 'anonMsgRecieverSide', recipient.name, senderMessage, senderCodeName, encryptedSenderID, messageID, global.config.PREFIX)
	}
	
	if (!objIsEmpty(senderAttachments)) {
		
		if (Object.keys(senderAttachments).length > 3) {
			return api.sendMessage(
				textFormat('comms', 'anonMsgAttachmentOutOfLimit'),
				threadID,
				messageID
			);
		}
		
		messageBody.attachment = [];
		
		for ( const attachment in senderAttachments) {
			
			const item = senderAttachments[attachment];
			
			// return if attachment was not an image 
			if (item.hasOwnProperty('playableUrl')) {
				return api.sendMessage(
					textFormat('comms', 'anonMsgAttachmentNotImg'),
					threadID,
					messageID
				);
			}
			
			// download attachments from sender

			const path = `${__dirname}/../../cache/anonMsg${Math.random()}.jpg`;
			const image = (await axios.get(`${item.url}`, { responseType: "arraybuffer" } )).data;
			await writeFileSync(path, Buffer.from(image, "utf-8"));
			
			messageBody.attachment[attachment] = await createReadStream(path);
			unlinkSync(path);
		}
	}
	
	return api.sendMessage(
		messageBody,
		receiverID,
		(err, info) => {
			if (err) {
			    // console.log(err);
				return api.sendMessage(textFormat('comms', 'anonMsgSendError', err.errorDescription || ''), threadID, messageID);
			}
			return api.sendMessage(textFormat('comms', 'anonMsgSendSuccess', recipient.name), threadID, messageID);
		}
	);
}

async function handleSenderAttachments(api, event, senderAttachments) {
	
	const { existsSyc, unlinkSync, writeFileSync, createReadStream } = require('fs-extra');
	const { body, threadID, messageID, senderID } = event;
	const axios = require('axios');
	
	let attachment = [];
	if (!objIsEmpty(senderAttachments)) {
		
		if (Object.keys(senderAttachments).length > 3) {
			attachment.push('false');
			return api.sendMessage(
				textFormat('comms', 'anonMsgAttachmentOutOfLimit'),
				threadID,
				messageID
			);
		}
		
		for ( const attachment in senderAttachments) {
			
			const item = senderAttachments[attachment];
			
			// return if attachment was not an image 
			if (item.hasOwnProperty('playableUrl')) {
				attachment.push('false');
				return api.sendMessage(
					textFormat('comms', 'anonMsgAttachmentNotImg'),
					threadID,
					messageID
				);
			}
			
			// download attachments from sender

			const path = `${__dirname}/../../cache/anonMsg${Math.random()}.jpg`;
			const image = await axios.get(`${item.url}`, { responseType: 'arraybuffer' });
			await writeFileSync(path, Buffer.from(image.data, "utf-8"));
			
			attachment[attachment] = await createReadStream(path);
			unlinkSync(path);
		}
	}
	return attachment;
}

function argumentRulePassed({ api, args, event, textFormat, cache}) {
	
	const msg = textFormat('comms', 'anonMsgInvalidRecipient');
	
	if (args[0].length < 15) {
		api.sendMessage(msg, event.threadID, event.messageID);
		return false;
	}
	
	if (isNaN(args[0])) {
		api.sendMessage(msg, event.threadID, event.messageID);
		return false;
	}
	
	return true;
}

function objIsEmpty(obj) {
	for(var prop in obj) {
        if (obj.hasOwnProperty(prop))
            return false;
    }
    return true;
}