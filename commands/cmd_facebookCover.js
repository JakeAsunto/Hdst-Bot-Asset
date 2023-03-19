module.exports.config = {
	name: 'fbcover',
	version: '1.0.0',
	hasPermssion: 0,
	cooldowns: 20,
	commandCategory: 'edited images/meme',
	description: 'Generate facebook cover by filling out the form the bot will send to you.',
	usages: '',
	dependencies: {
		'axios': '',
		'fs-extra': ''
	},
	credits: 'Joshua Sy for API'
}

module.exports.fetchData = function (body) {
	// fetch informations
	let color = body.match(/(?<=color:).+?(?=\s|\s+)/) ?
		(body.match(/(?<=color:).+?(?=\s|\s+)/))[0].trim() : null;

	let top_name = body.match(/(?<=name:).+?(?=\n)/) ?
		(body.match(/(?<=name:).+?(?=\n)/))[0].trim() : null;
		
	let sub_name = body.match(/(?<=subname:).+?(?=\n)/) ?
		(body.match(/(?<=subname:).+?(?=\n)/))[0].trim() : null;
	
	let email = body.match(/(?<=email:).+?(?=\s|\s+)/) ?
		(body.match(/(?<=email:).+?(?=\s|\s+)/))[0].trim() : null;
	
	let address = body.match(/(?<=address:).+?(?=\n)/) ?
		(body.match(/(?<=address:).+?(?=\n)/))[0].trim() : null;
	
	let contact_no = body.match(/(?<=contact no.:).+?(?=\n)/) ?
		(body.match(/(?<=contact no.:).+?(?=\n)/))[0].trim() : null;
		
	return { color, top_name, sub_name, email, address, contact_no };
}

module.exports.handleEvent = async function ({ api, event, returns }) {
	
	const { threadID, messageID, senderID } = event;
	
	if (event.body == undefined || event.body == '') return;
	if (event.body.indexOf('● Facebook Cover Form\n━━━━━━━━━━━━━━━━━━━━') == -1) return;

	//console.log(event.body);
	
	const axios= require('axios');
	const fs = require('fs-extra');
	const body = event.body;
	
	const sendError = (msg) => {
		api.sendMessage(textFormat('error', 'errOccured', `${msg}. Make sure you didn't change anything on the form and doesn't make any new lines for data.`), threadID, messageID);
	}
	
	const { color, top_name, sub_name, email, address, contact_no } = this.fetchData(body);
	
	if (!color) {
		return sendError(`Color not found pls specified via color name`);
	} else if (!top_name) {
		return sendError(`Name not found`);
	} else if (!sub_name) {
		return sendError(`Subname not found`);
	} else if (!email) {
		return sendError(`Email not found`);
	} else if (!address) {
		return sendError(`Address not found`);
	} else if (!contact_no) {
		return sendError(`Contact number not found`);
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
					returns.handleTimestamps();
				}
				if (fs.existsSync(path)) { fs.unlinkSync(path); }
				//returns.delete_data();
			},
			messageID
		);
	} catch (e) {
		//returns.delete_data();
		global.sendReaction.failed(api, event);
		global.logModuleErrorToAdmin(e, __filename, event);
		api.sendMessage(textFormat('error', 'errCmdExceptionError', e, Prefix), threadID, messageID);
		if (fs.existsSync(path)) return fs.unlinkSync(path);
	}
}

/* module.exports.handleReply = async function ({ api, event, returns, handleReply, Prefix }) {
	
	if (event.senderID !== handleReply.author) {
		return returns.interaction_failed_other();
    }
	
	const { body, threadID, messageID, senderID } = event;
	const axios= require('axios');
	const fs = require('fs-extra');
	
	const sendError = (msg) => {
		api.sendMessage(textFormat('error', 'errOccured', `${msg}. Make sure you didn't change anything on the form and doesn't make any new lines for data.`), threadID, messageID);
	}
	
	const { color, top_name, sub_name, email, address, contact_no } = this.fetchData(body);
	
	if (!color) {
		return sendError(`Color not found pls specified via color name`);
	} else if (!top_name) {
		return sendError(`Name not found`);
	} else if (!sub_name) {
		return sendError(`Subname not found`);
	} else if (!email) {
		return sendError(`Email not found`);
	} else if (!address) {
		return sendError(`Address not found`);
	} else if (!contact_no) {
		return sendError(`Contact number not found`);
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
} */

module.exports.run = async function ({ api, args, event, returns, textFormat }) {
	
	const { threadID, messageID, senderID } = event;
	const replyTimeout = Date.now() + 300000; // 5 minutes timeout

	const user = await api.getUserInfoV2(senderID) || {};
	
	return api.sendMessage(
		{
			body: `${textFormat('canvas', 'fbcoverFillOutForm')} @${user.name || 'user'}`,
			mentions: [{
				tag: `@${user.name || 'user'}`,
				id: senderID
			}]
		},
		threadID,
		async (err, info) => {
			if (err) {
				returns.remove_usercooldown();
				api.sendMessage(textFormat('error', 'errCmdExceptionError', e), threadID, messageID);
				return global.logModuleErrorToAdmin(err, __filename, event);
			}
			global.autoUnsend(err, info, 180);
			/*// send a signal to handle Reply
			return global.client.handleReply.push({
				name: this.config.name,
				messageID: info.messageID,
            	author: senderID,
            	timeout: replyTimeout
			});*/
		},
		messageID
	);
}