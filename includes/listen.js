module.exports = function({ api, models }) {
	
	const fs = require('fs');
	const moment = require('moment-timezone');
	const axios = require('axios');
	
	const Users = require('./controllers/controller_users')({ models, api }),
		Threads = require('./controllers/controller_threads')({ models, api }),
		Banned = require('./controllers/controller_banned')({ models, api });
	
	const Utils = require(`${global.HADESTIA_BOT_CLIENT.mainPath}/scripts/utils.js`)({ api, Users, Banned, Threads });
	
	const databaseConfig = require('../json/databaseConfig.json');
	const GroupDataConfig = databaseConfig.group_data_config;
	const UserDataConfig = databaseConfig.user_data_config;
	
	///////// DO RE-CHECKING DATABASE

	(async function() {
		api.markAsReadAll((err) => {
			if (err) return console.error('Error [Mark as Read All]: ' + err)
		});

		try {
			
			Utils.logger(Utils.getText('listen', 'startLoadEnvironment'), '[ DATABASE ]');
			
			let users = await Users.getAll(['userID', 'name', 'data']),
				threads = await Threads.getAll(['threadID', 'threadInfo', 'data']);
				
			for (const thread of threads) {
				
				
				const threadID = String(thread.threadID);
				const threadData = await Threads.getData(threadID);
				const Info = threadData.threadInfo;
				const GroupData = threadData.data;
				
				if (!GroupData || !Info) {
					try { await Threads.delData(threadID); } catch (e) {};
				} else {
				
					if (GroupData.isBanned) {
						const banned = Data.banned;
						const data = {
							isGroup: true,
							name: Info.threadName,
							caseID: banned.caseID || -1,
							reason: banned.reason || '<reason not set>',
							dateIssued: banned.dateIssued || '<unknown date>'
						}
						await Banned.setData(threadID, { data });
					}
					
					let changesCount = 0;
					// Check for new Database Config (set to default if has)
					for (const configName in GroupDataConfig) {
						if (!GroupData[configName]) {
							GroupData[configName] = GroupDataConfig[configName];
							changesCount++;
						}
					}
				
					// Re-save (if only has changes to optimize)
					if (changesCount > 0) {
						await Threads.setData(threadID, { data: GroupData });
					}
				}
			}
			
			Utils.logger.loader(Utils.getText('listen', 'loadedEnvironmentThread'));
			
			for (const user of users) {
				
				const userID = String(userData.userID);
				const userData = await Users.getData(userID);
				const UserData = userData.data;
				
				if (!UserData) {
					try { await Users.delData(userID); } catch (e) {}
				} else {
					if (UserData.isBanned) {
						const banned = UserData.banned;
						const data = {
							isGroup: false,
							name: userData.name,
							caseID: userData.data.banned.caseID || -1,
							reason: userData.data.banned.reason || '<reason not set>',
							dateIssued: userData.data.banned.dateIssued || '<unknown date>'
						}
						await Banned.setData(userID, { data });
					}
				
					let changesCount = 0;
					// Check for new Database Config (set to default if has)
					for (const configName in UserDataConfig) {
						if (!UserData[configName]) {
							UserData[configName] = UserDataConfig[configName];
							changesCount++;
						}
					}
				
					// Re-save (if only has changes to optimize)
					if (changesCount > 0) {
						await Users.setData(userID, { data: UserData });
					}
				}
			}
			
			Utils.logger.loader(Utils.getText('listen', 'loadedEnvironmentUser'))
			Utils.logger(Utils.getText('listen', 'successLoadEnvironment'), '[ DATABASE ]');
			
		} catch (error) {
			console.log(error);
			return Utils.logger.loader(Utils.getText('listen', 'failLoadEnvironment', error), 'error');
		}
		
	}());
	
	Utils.logger(`${api.getCurrentUserID()} - [ ${global.HADESTIA_BOT_CONFIG.PREFIX} ] • ${(!global.HADESTIA_BOT_CONFIG.BOTNAME) ? 'This bot was forked & modified from original made by CatalizCS and SpermLord' : global.HADESTIA_BOT_CONFIG.BOTNAME}`, '[ BOT INFO ]');
	
	///////////////////////////////////////////////
	//========= Require all handle need =========//
	//////////////////////////////////////////////
	
	const handleInputs = {
		api,
		models,
		Utils,
		Users,
		Banned,
		Threads
	};

	const handleCommand = require('./handle/handleCommand')(handleInputs);
	
	const handleCommandEvent = require('./handle/handleCommandEvent')(handleInputs);
	
	const handleCommandMessageReply = require('./handle/handleCommandMessageReply')(handleInputs);
	
	const handleReply = require('./handle/handleReply')(handleInputs);
	
	const handleReaction = require('./handle/handleReaction')(handleInputs);
	
	const handleEvent = require('./handle/handleEvent')(handleInputs);
	
	const handleCreateDatabase = require('./handle/handleCreateDatabase')(handleInputs);

	Utils.logger.loader(`====== ${Date.now() - global.HADESTIA_BOT_CLIENT.timeStart}ms ======`);


	// DEFINE DATLICH PATH
	const datlichPath = __dirname + '/../modules/commands/cache/datlich.json';

	// FUNCTION HOẠT ĐỘNG NHƯ CÁI TÊN CỦA NÓ, CRE: DUNGUWU
	const monthToMSObj = {
		1: 31 * 24 * 60 * 60 * 1000,
		2: 28 * 24 * 60 * 60 * 1000,
		3: 31 * 24 * 60 * 60 * 1000,
		4: 30 * 24 * 60 * 60 * 1000,
		5: 31 * 24 * 60 * 60 * 1000,
		6: 30 * 24 * 60 * 60 * 1000,
		7: 31 * 24 * 60 * 60 * 1000,
		8: 31 * 24 * 60 * 60 * 1000,
		9: 30 * 24 * 60 * 60 * 1000,
		10: 31 * 24 * 60 * 60 * 1000,
		11: 30 * 24 * 60 * 60 * 1000,
		12: 31 * 24 * 60 * 60 * 1000
	};
	
	const checkTime = (time) => new Promise((resolve) => {
		
		time.forEach((e, i) => time[i] = parseInt(String(e).trim()));
		
		const getDayFromMonth = (month) => (month == 0) ? 0 : (month == 2) ? (time[2] % 4 == 0) ? 29 : 28 : ([1, 3, 5, 7, 8, 10, 12].includes(month)) ? 31 : 30;
		
		if (time[1] > 12 || time[1] < 1) resolve('Tháng của bạn có vẻ không hợp lệ');
		if (time[0] > getDayFromMonth(time[1]) || time[0] < 1) resolve('Ngày của bạn có vẻ không hợp lệ');
		if (time[2] < 2022) resolve('You live at the Kỷ nguyên nào thế giới?');
		if (time[3] > 23 || time[3] < 0) resolve('Giờ của bạn có vẻ không hợp lệ');
		if (time[4] > 59 || time[3] < 0) resolve('Phút của bạn có vẻ không hợp lệ');
		if (time[5] > 59 || time[3] < 0) resolve('Giây của bạn có vẻ không hợp lệ');
		
		yr = time[2] - 1970;
		yearToMS = (yr) * 365 * 24 * 60 * 60 * 1000;
		yearToMS += ((yr - 2) / 4).toFixed(0) * 24 * 60 * 60 * 1000;
		monthToMS = 0;
		
		for (let i = 1; i < time[1]; i++) {
			monthToMS += monthToMSObj[i];
		}
		
		if (time[2] % 4 == 0) {
			monthToMS += 24 * 60 * 60 * 1000;
		}
		
		dayToMS = time[0] * 24 * 60 * 60 * 1000;
		hourToMS = time[3] * 60 * 60 * 1000;
		minuteToMS = time[4] * 60 * 1000;
		secondToMS = time[5] * 1000;
		oneDayToMS = 24 * 60 * 60 * 1000;
		timeMs = yearToMS + monthToMS + dayToMS + hourToMS + minuteToMS + secondToMS - oneDayToMS;
		
		resolve(timeMs);
	});


	const tenMinutes = 10 * 60 * 1000;

	Utils.logger.loader(`====== ${Date.now() - global.HADESTIA_BOT_CLIENT.timeStart}ms ======`);
	
	const checkAndExecuteEvent = async () => {

		/*smol check*/
		if (!fs.existsSync(datlichPath)) {
			fs.writeFileSync(datlichPath, JSON.stringify({}, null, 4));
		}
		
		var data = JSON.parse(fs.readFileSync(datlichPath));

		//GET CURRENT TIME
		var timePH = moment().tz('Asia/Manila').format('DD/MM/YYYY_HH:mm:ss');
		
		timePH = timePH.split('_');
		timePH = [...timePH[0].split('/'), ...timePH[1].split(':')];

		let temp = [];
		let phMS = await checkTime(timePH);
		
		const compareTime = e => new Promise(async (resolve) => {
			let getTimeMS = await checkTime(e.split('_'));
			if (getTimeMS < phMS) {
				if (phMS - getTimeMS < tenMinutes) {
					data[boxID][e]['TID'] = boxID;
					temp.push(data[boxID][e]);
					delete data[boxID][e];
				} else delete data[boxID][e];
				fs.writeFileSync(datlichPath, JSON.stringify(data, null, 4));
			};
			resolve();
		})

		await new Promise(async (resolve) => {
			for (boxID in data) {
				for (e of Object.keys(data[boxID])) await compareTime(e);
			}
			resolve();
		})
		
		for (el of temp) {
			try {
				
				var all = (await Threads.getInfo(el['TID'])).participantIDs;
				
				all.splice(all.indexOf(api.getCurrentUserID()), 1);
				
				var body = el.REASON || 'Everybody',
					mentions = [],
					index = 0;

				for (let i = 0; i < all.length; i++) {
					if (i == body.length) body += ' ‍ ';
					mentions.push({
						tag: body[i],
						id: all[i],
						fromIndex: i - 1
					});
				}
				
			} catch (e) {
				return console.log(e);
			}
			
			var out = { body, mentions }
			
			if ('ATTACHMENT' in el) {
				
				out.attachment = [];
				
				for (a of el.ATTACHMENT) {
					
					let getAttachment = (await axios.get(encodeURI(a.url), {
						responseType: 'arraybuffer'
					})).data;
					
					fs.writeFileSync(__dirname + `/../modules/commands/cache/${a.fileName}`, Buffer.from(getAttachment, 'utf-8'));
					out.attachment.push(fs.createReadStream(__dirname + `/../modules/commands/cache/${a.fileName}`));
				}
				
			}
			
			console.log(out);
			
			if ('BOX' in el) { await api.setTitle(el['BOX'], el['TID']); }
			
			api.sendMessage(out, el['TID'], () => ('ATTACHMENT' in el) ? el.ATTACHMENT.forEach(a => fs.unlinkSync(__dirname + `/../modules/commands/cache/${a.fileName}`)) : '');
		}

	}
	
	setInterval(checkAndExecuteEvent, tenMinutes / 10);
	
	/// COMMANDS AND EVENTS MODULE LATE INITIALIZATION ///
	const { events, commands } = global.HADESTIA_BOT_CLIENT;
	
	// # Commands Late Init
	for (const [key, module] of commands.entries()) {
		try {
			if (module.lateInit) {
				console.log('Late Init :' + key);
				module.lateInit({ api, models, Utils, Users, Banned, Threads });
			}
		} catch (error) {
			throw new Error(error);
		}
	}
		
	// # Events Late Init
	for (const [key, module] of events.entries()) {
		try {
			if (module.lateInit) {
				console.log('Late Init :' + key);
				module.lateInit({ api, models, Utils, Users, Banned, Threads });
			}
		} catch (error) {
			throw new Error(error);
		}
	}


	//////////////////////////////////////////////////
	//========= Send event to handle need =========//
	/////////////////////////////////////////////////

	return async (event) => {
		
		event.body = (event.body !== undefined) ? (event.body).normalize('NFKD') : '';
		
        const input = { event }
        
		switch (event.type) {
			
			case 'message':
			
			case 'message_reply':
			
				handleCommandMessageReply(input);
			
			case 'message_unsend':
			
				handleCreateDatabase(input);
				
				handleCommand(input);
				
				handleReply(input);
				
				handleCommandEvent(input);

				break;
				
			case 'event':
			
				handleEvent(input);
				
				break;
				
			case 'message_reaction':
			
				handleReaction(input);
				
				break;
				
			default:
			
				break;
		}
	};
};

//THIZ BOT WAS MADE BY ME(CATALIZCS) AND MY BROTHER SPERMLORD - DO NOT STEAL MY CODE (つ ͡ ° ͜ʖ ͡° )つ ✄ ╰⋃╯in