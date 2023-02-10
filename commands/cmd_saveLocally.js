module.exports.config = {
	name: 'save',
	version: '1.2.0',
	hasPermssion: 2,
	commandCategory: 'media',
	description: 'Save files into the system by replying to the target file',
	cooldowns: 5,
	credits: 'Hadestia',
	usages: '<path>',
	envConfig: {
		requiredArgument: 1
	},
	dependencies: {
		'fs-extra': '',
		'axios': ''
	}
}

module.exports.run = async function ({ api, args, event }) {
	
	const { threadID, messageID } = event;
	const { writeFileSync } = require('fs-extra');
	const moment = require('moment-timezone');
	const axios = require('axios');
	
	if (event.type !== 'message_reply') return api.sendMessage(`You must reply to specific message.`, threadID, messageID);
	
	global.sendReaction.inprocess(api, event);

	const attachments = event.messageReply.attachments;
	const path = args.shift(); // path where to save
	const path_location = ((path.startsWith('/')) ?
		(path.endsWith('/')) ?
		`${__dirname}/../../${path}` :
		`${__dirname}/../../${path}/` :
		`${__dirname}/../../${path}/`
	)
	
	// return if there's no attachment found
	if (objIsEmpty(attachments)) {
		return api.sendMessage(`I don't see any attachments here :/`, threadID, messageID);
	}
	
	//const attachmentKeys = Object.keys(attachments)
	// console.info(attachments);
	
	let downloaded_files = [];
	try {
		for ( const attachment of attachments) {
		
			const extension_name = await getExtensionName(attachment.type, api, event);
			if (!extension_name) return api.sendMessage('Invalid file format', event.threadID, event.messageID);
		
			let filename = attachment.filename;
		
			const url = attachment.url;
			
			filename = `${filename}${extension_name}`;
			const final_path = `${path_location}${filename}`;
			const fetchedFile = (await axios.get(`${url}`, { responseType: "arraybuffer" } )).data;
		
			if (fetchedFile) {
				downloaded_files.push(filename);
				writeFileSync(final_path, Buffer.from(fetchedFile, "utf-8"));
			}
		}
	
		if (downloaded_files.length > 0) {
			return api.sendMessage(
				textFormat('cmd', 'saveLocallySuccess', downloaded_files.join('\n')),
				threadID,
				(e) => {
					if (e) return;
					global.sendReaction.success(api, event);
				},
				messageID
			);
		}
	} catch (e) {
		global.sendReaction.failed(api, event);
		return api.sendMessage(textFormat('error', 'errOccured', e), threadID, messageID);
	}
	// download failed
	return api.sendMessage(textFormat('cmd', 'saveLocallyFailed'), threadID, messageID);
}

function objIsEmpty(obj) {
	for(var prop in obj) {
        if (obj.hasOwnProperty(prop))
            return false;
    }
    return true;
}

function getExtensionName(type, api, event) {
	// for gif
	if (type == 'animated_image') {
		return '.gif';
	// for video
	} else if (type == 'video') {
		return '.mp4';
	// for image
	} else if (type == 'photo') {
		return '.jpg';
	// for audio
	} else if (type == 'audio') {
		return '.mp3';
	}
}