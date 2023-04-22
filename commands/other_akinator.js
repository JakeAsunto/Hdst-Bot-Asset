module.exports.config = {
	name: 'akinator',
	version: '1.0.0',
	description: 'Think about a real or fictional character. I will try to guess who it is',
	hasPermssion: 0,
	usage: '',
	aliases: [ 'aki' ],
	cooldowns: 0,
	commandCategory: 'other',
	credits: 'Hadestia',
	envConfig: {
		handleEvent_allowDirectMessages: true
	},
	dependencies: {
        'axios': '',
        'stream': '',
        'aki-api': ''
    }
}

const userMAP = new Object();
const possibleAns = {
	'yes': 0,
	'no': 1,
	'don\'t know': 2,
	'probably': 3,
	'probably not': 4
}

module.exports.lateInit = function ({ api, Utils }) {
	
	setInterval(async function () {
		await (async() => {
			for (const ID in userMAP) {
				if (userMAP[ID].expiration <= 0) {
					const data = userMAP[ID];
					// session expired
					api.sendMessage(
						'\u274E Cancelled Akinator game.',
						data.threadID,
						() => {
							delete userMAP[ID];
						}
					);
				} else {
					userMAP[ID].expiration = userMAP[ID].expiration - 1;
				}
			}
			return;
		})();
	}, 1000);
	
}

module.exports.run = async function ({ api, event, Utils }) {
	
	const { Aki } = require('aki-api');
	
	const { senderID, threadID, messageID } = event;
	
	const mappingID = `${senderID}-${threadID}`;
	
	// Create new client
	if (!userMAP[mappingID]) {
		const akiAPI = new Aki({ region: 'en' });
		const expiration = 120;
		const botGuessed = false;
		await akiAPI.start();
		
		const question = await Utils.fancyFont.get(`Q${akiAPI.currentStep + 1}. ${akiAPI.question}`, 1);
		api.sendMessage(
			Utils.textFormat('cmd', 'cmdAkinatorQuestion', question),
			threadID,
			(err) => {
				if (!err) {
					userMAP[mappingID] = { akiAPI, expiration, botGuessed }
				}
			},
			messageID
		);
	}
}

module.exports.handleEvent = async function ({ api, event, Utils }) {
	
	const axios = require('axios');
	const fs = require('fs');
	
	const { body, threadID, messageID, senderID } = event;
	const mappingID = `${senderID}-${threadID}`;
	const response = body.toLowerCase();
	
	if (userMAP[mappingID]) {
		const data = userMAP[mappingID];
		
		if (['yes', 'no', 'don\'t know', 'probably', 'probably not'].includes(response)) {
			await data.akiAPI.step(response);
			
			// If bot already have a guess
			if (data.botGuessed) {
				if (client_answer == 0) {
					delete userMAP[mappingID];
					api.sendMessage('Great! I guessed correctly. I love playing with you!', data.threadID, data.messageID);
				} else {
					await data.akiAPI.back();
					await sendOtherQuestion(data).catch(console.error);
				}
			} else {
			
				if (data.akiAPI.progress >= 80 || data.akiAPI.currentStep >= 50) {
					await data.akiAPI.win(); 
					const answer = data.akiAPI.answers[0];
					const path = `${Utils.ROOT_PATH}/cache/akinator_${mappingID}_${Date.now()}.jpg`;
					const body = Utils.textFormat('cmd', 'cmdAkinatorGuess', Math.floor(data.akiAPI.progress), answer.name);
					await Utils.downloadFile(answer.absolute_picture_path, path).then(() => {
						api.sendMessage(
							{ body, attachment: fs.createReadStream(path) },
							threadID,
							(err) => {
								if (!err) {
									userMAP[mappingID].botGuessed = true;
								}
								fs.unlinkSync(path);
							},
							messageID
						);
					}).catch(() => {
						api.sendMessage(
							body, threadID,
							(err) => {
								if (!err) {
									userMAP[mappingID].botGuessed = true;
								}
								fs.unlinkSync(path);
							},
							messageID
						);
					});
				} else {
					await sendOtherQuestion(data).catch(console.error);
				}
			}
		} else {
			api.sendMessage(
				'\u274E Cancelled Akinator game.',
				threadID,
				() => {
					delete userMAP[mappingID];
				}
			);
		}
	}
	
	async function sendOtherQuestion(data) {
		const question = await Utils.fancyFont.get(`Q${data.akiAPI.currentStep + 1}. ${data.akiAPI.question}`, 1);
		api.sendMessage(
			Utils.textFormat('cmd', 'cmdAkinatorQuestion', question),
			threadID,
			(err) => {
				if (!err) {
					userMAP[mappingID].expiration = 120;
				}
			},
			messageID
		);
		return;
	}
}