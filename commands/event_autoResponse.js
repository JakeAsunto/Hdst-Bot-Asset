module.exports.config = {
    name: 'auto-response',
    version: '1.0.4',
    credits: 'Hadestia', // pls don't change my credit as for my effort for this work.
    description: 'turned on to automatically response into any matched messages installed in the system.',
    commandCategory: 'hidden',
    hasPermssion: 3,
    usages: ''
}

module.exports.handleEvent = async ({ api, event, Users }) => {
	
	const threadSettings = global.data.threadData.get(event.threadID) || {};
	if (event.body === undefined || event.body == '') return;
	
	const { body, mentions, threadID, messageID, senderID } = event;
	
	const dictionary = require('../../json/autoResponse.json');
	const senderBody = body.toLowerCase();
	
	if (senderBody === 'prefix') {
		return api.sendMessage((await constructMessage(api, event, 'Hey!, looking for me? This is my prefix\n❱ ${prefix} ❰', Users)), threadID, messageID);
	}
	
	if (!threadSettings.auto_response_listener) return;
	
	// Ignore messages with bot prefix
	if (senderBody.startsWith(threadSettings.PREFIX || global.config.PREFIX)) {
		return;
	// avoid interaction if user mentioned this bot, (mentioning bot can also be a prefix for command (see handleCommand.js))
	} else if (senderBody.startsWith('@')) {
		if (Object.keys(mentions).length === 1 && Object.values(mentions)[0] === global.botUserID) {
			return;
		}
	// avoid interaction on other conversation
	} else if (event.type == 'message_reply' && event.messageReply.senderID !== global.botUserID) {
		return;
	}
	
	for (const type in dictionary) {
		
		const typeProperty = dictionary[type];
		
		if (typeProperty.single_message_only) {
			
			for (const match of typeProperty.matches) {
				if (senderBody === match) {
					const responseText = typeProperty.response[Math.floor(Math.random() * typeProperty.response.length)];
					const toSend = await constructMessage(api, event, responseText, Users);
					return api.sendMessage(toSend, threadID, messageID);
				}
			}
			
		} else if (typeProperty.required_mention && event.type === 'message_reply') {
			if (event.messageReply.senderID == api.getCurrentUserID()) {
				for (const match of typeProperty.matches) {
					if (senderBody.indexOf(match) !== -1) {
						const responseText = typeProperty.response[Math.floor(Math.random() * typeProperty.response.length)];
						const toSend = await constructMessage(api, event, responseText, Users);
						return api.sendMessage(toSend, threadID, messageID);
					}
				}
			}
		} else if (typeProperty.stand_alone) {
			for (const match of typeProperty.matches) {
				if (senderBody.indexOf(match) !== -1) {
					const responseText = typeProperty.response[Math.floor(Math.random() * typeProperty.response.length)];
					const toSend = await constructMessage(api, event, responseText, Users);
					return api.sendMessage(toSend, threadID, messageID);
				}
			}
		} else if (typeProperty.reaction) {
			for (const match of typeProperty.matches) {
				if (senderBody.indexOf(match) !== -1) {
					const responseText = typeProperty.response[Math.floor(Math.random() * typeProperty.response.length)];
					return global.sendReaction.custom(api, event, responseText);
				}
			}
		}
	}
}

module.exports.run = async function ({ api, event, Threads }) {

	const { threadID, messageID } = event;
	
	if (threadID.length < 16) return 'inaccessible_outside_gc';
	
	
	let data = (await Threads.getData(threadID)).data;
	
	
	// set initial state when not set
	// if (typeof(data['auto-response-listener']) == undefined || data['auto-response-listener'] == true) {
	data.auto_response_listener = !data.auto_response_listener;
	// } else {
		//data['auto-response-listener'] = true;
	//}
	
	const state = data.auto_response_listener;
	// update data
	await Threads.setData(threadID, { data });
	global.data.threadData.set(threadID, data);
	// send response
	return api.sendMessage(
		textFormat('cmd', `eventAutoResponse${(state) ? 'On' : 'Off'}`),
		threadID,
		global.autoUnsend,
		messageID
	);
}

async function constructMessage(api, event, text, Users) {
	
	const moment = require('moment-timezone');
	const hour = moment.tz('Asia/Manila').format('HH');
	
	const threadSetting = global.data.threadData.get(event.threadID);
	const botPrefix = (threadSetting.hasOwnProperty('PREFIX')) ? threadSetting.PREFIX : global.config.PREFIX;
	// get user name
	const sender = await Users.getNameUser(event.senderID);
	const single_name = sender.split(' ');
	
	let greeting = (
		(hour === 12) ? 'Good noon' :
		(hour >= 0 && hour < 11) ? 'Good morning' :
		(hour >= 11 && hour < 18) ? 'Good afternoon' :
		(hour >= 18 && hour <= 24) ? 'Good evening' : ''
	);
	
	// replace text
	let result = text.replace('${meridiem}', greeting)
		.replace('${prefix}', botPrefix);
		//.replace();
		//...
	
	// check if needs mentioning
	if (result.indexOf('${mention}') !== -1) {
		return { body: result.replace('${mention}', single_name[0]), mentions: [{ tag: single_name[0], id: event.senderID }] };
	} else {
		return { body: result };
	}
}