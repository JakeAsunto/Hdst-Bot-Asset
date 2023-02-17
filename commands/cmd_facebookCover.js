module.exports.config = {
	name: 'fbcover',
	version: '1.0.0',
	hasPermssion: 0,
	cooldowns: 20,
	commandCategory: 'edited images/meme',
	description: 'Generate personalized Facebook cover by giving information needed.',
	usages: ' (fill out the form that the bot will send to you) ',
	envConfig: {
		requiredArgument: 3,
		inProcessReaction: true
	},
	dependencies: {
		'axios': '',
		'fs-extra': ''
	},
	credits: 'Joshua Sy for API'
}

module.exports.handleReply = async function ({ api, event, returns, handleReply, Prefix }) {
	
	if (event.senderID !== handleReply.author) {
		return returns.interaction_failed_other();
    }
	
	const { body, threadID, messageID, senderID } = event;
	const axios= require('axios');
	const fs = ('fs-extra');
	
	const sendError = (msg) => {
		api.sendMessage(textFormat('error', 'errOccured', `${msg}. Make sure you didn't change anything on the form and doesn't make any new lines for data.`), threadID, messageID);
	}
	
	// fetch informations
	let color = body.match(/(?<=color:).+?(?=\s|\s+)/) ?
		(body.match(/(?<=color:).+?(?=\s|\s+)/))[0].trim() : null;

	let top_name = body.match(/(?<=name:).+?(?=\s|\s+)/) ?
		(body.match(/(?<=name:).+?(?=\s|\s+)/))[0].trim() : null;
		
	let sub_name = body.match(/(?<=subname:).+?(?=\s|\s+)/) ?
		(body.match(/(?<=subname:).+?(?=\s|\s+)/))[0].trim() : null;
	
	let email = body.match(/(?<=email:).+?(?=\s|\s+)/) ?
		(body.match(/(?<=email:).+?(?=\s|\s+)/))[0].trim() : null;
	
	let address = body.match(/(?<=address:).+?(?=\s|\s+)/) ?
		(body.match(/(?<=address:).+?(?=\s|\s+)/))[0].trim() : null;
	
	let contact_no = body.match(/(?<=contact no.:).+?(?=\s|\s+)/) ?
		(body.match(/(?<=contact no.:).+?(?=\s|\s+)/))[0].trim() : null;
	
	
	if (!top_name) {
		return sendError(`Name not found`);
	} else if (!sub_name) {
		return sendError(`Subname not found`);
	} else if (!email) {
		return sendError(`Email not found`);
	} else if (!address) {
		return sendError(`Address not found`);
	} else if (!contact_no) {
		return sendError(`Contact number not found`);
	} else if (!color) {
		return sendError(`Color not found pls specified via color name`);
	}
	
	// process if no violation found
	
	try {
		global.sendReaction.inprocess(api, event);
		
		const link = `${encodeURI(`https://api.reikomods.repl.co/canvas/fbcover?uid=${senderID}&color=${color}&name=${top_name}&subname=${sub_name}&email=${email}&address=${address}&sdt=${contact_no}`)}`;
		var path = `${__dirname}/../../cache/${(link.split('/')).pop()}.png`;
		const generatedIMG = (await axios.get(link, { responseType: 'arraybuffer' } )).data;
		
		// save img
		fs.writeFileSync(path, Buffer.from(generatedIMG, 'utf-8'));
		
		api.sendMessage(
			{
				body: '',
				attachment: fs.createReadStream(path)
			},
			threadID,
			(e) => {
				if (e) {
					global.sendReaction.failed(api, event);
				} else {
					global.sendReaction.success(api, event);
				}
				if (fs.existsSync(path)) { fs.unlinkSync(path); }
				returns.delete_data();
			},
			messageID
		);
	} catch (e) {
		returns.delete_data();
		global.sendReaction.failed(api, event);
		global.logModuleErrorToAdmin(e, __filename, event);
		api.sendMessage(textFormat('error', 'errCmdExceptionError', e, Prefix), threadID, messageID);
		if (fs.existsSync(path)) return fs.unlinkSync(path);
	}
}

module.exports.run = function ({ api, args, event, returns, textFormat }) {
	
	const { threadID, messageID, senderID } = event;
	const replyTimeout = Date.now() + 300000; // 5 minutes timeout
	
	return api.sendMessage(
		textFormat('canvas', 'fbcoverFillOutForm'),
		threadID,
		async (err, info) => {
			if (err) {
				returns.remove_usercooldown();
				api.sendMessage(textFormat('error', 'errCmdExceptionError', e), threadID, messageID);
				return global.logModuleErrorToAdmin(err, __filename, event);
			}
			global.autoUnsend(err, info, 300);
			// send a signal to handle Reply
			return global.client.handleReply.push({
				name: this.config.name,
				messageID: info.messageID,
            	author: senderID,
            	timeout: replyTimeout
			});
		},
		messageID;
	);
}