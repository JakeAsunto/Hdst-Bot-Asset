module.exports.config = {
	name: 'stalk',
	version: '1.0.8',
	hasPermssion: 0,
	credits: 'Hadestia',
	commandCategory: 'utilities',
	description: 'get user info of yourself or using uid / by mentioning / or replied message',
	usages: '[ (reply) | uid | (mention) ]',
	cooldowns: 300,
	envConfig: {
		inProcessReaction: true
	}
};

module.exports.run = async function ({ api, event, args, utils, textFormat, Prefix }) {
	
	const axios = require('axios');
	const fs = require('fs-extra');
	const request = require('request');

	let { threadID, senderID, messageID } = event;
	
	if (event.body.indexOf('https') !== -1 || event.body.indexOf('//') !== -1) {
		global.sendReaction.failed(api, event);
		return 'invalid_usage';
	}
	//global.sendReaction.inprocess(api, event);
	try {
		
		let id;
		
		if (args.join().indexOf('@') !== -1) {
			
			const mentKeys = Object.keys(event.mentions);
			if (mentKeys.length == 0) {
				return api.sendMessage('Why should i stalk my self?', threadID, messageID);
			}
			id = Object.keys(event.mentions)
			
		} else {
			
			id = args[0] || event.senderID;
			
		}
		
		if (event.type == 'message_reply') {
			
			id = event.messageReply.senderID
			
		}
		
		const res = await api.getUserInfoV2(id);
		const n_a = '𝘯𝘰 𝘥𝘢𝘵𝘢';
		
		var gender = (res.gender.startsWith('Không')) ? n_a : (res.gender == 'male') ? 'Male' : (res.gender == 'female') ? 'Female' : res.gender;
		var birthday = (res.birthday.startsWith('Không')) ? n_a : res.birthday;
		var usern = (res.username.startsWith('Không')) ? id : res.username;
		
		var love = (res.relationship_status.startsWith('Không')) ? n_a : res.relationship_status;
		var location = (res.location.startsWith('Không')) ? n_a : res.location.name;
		var hometown = (res.hometown.startsWith('Không')) ? n_a : res.hometown.name;
		var followers = (res.follow.startsWith('Không')) ? n_a : res.follow;
		//var rs = (res.love.startsWith('Không')) ? n_a : res.love.name;
		var quotes = (res.qoutes.startsWith('Không'))? n_a : res.qoutes;

		const path = `${__dirname}/../../cache/stalkImg.png`;
		const profile_av = (await axios.get(encodeURI(res.imgavt), { responseType: 'arraybuffer' })).data;
		fs.writeFileSync(path, Buffer.from(profile_av, 'utf-8'));
		
		return api.sendMessage(
			{
				body: textFormat(
					'cmd', 'cmdStalkFormat',
					res.name,
					usern,
					love,
					
					gender,
					birthday,
					followers,
					location,
					hometown,
					quotes
				),
				attachment: fs.createReadStream(path)
			},
			event.threadID,
			(e, info) => {
				global.sendReaction.success(api, event);
				try { fs.unlinkSync(path) } catch (e) {}
				global.autoUnsend(e, info, 300);
			},
			event.messageID
		);
		
	} catch (err) {
		global.sendReaction.failed(api, event);
		global.logModuleErrorToAdmin(err, __filename, event);
		api.sendMessage(textFormat('error', 'errCmdExceptionError', err, Prefix), threadID, messageID);
		return console.log(err);
	}
}