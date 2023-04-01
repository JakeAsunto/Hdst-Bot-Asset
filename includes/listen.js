module.exports = function({ api, models }) {
	
	const fs = require('fs');
	const util = require('../utils');
	const logger = require('../utils/log.js');
	const moment = require('moment-timezone');
	const axios = require('axios');

	const Users = require('./controllers/controller_users')({ models, api }),
		Threads = require('./controllers/controller_threads')({ models, api }),
		Banned = require('./controllers/controller_banned')({ models, api });
	
	const databaseConfig = require('../json/databaseConfig.json');
	const GroupDataConfig = databaseConfig.group_data_config;
	const UserDataConfig = databaseConfig.user_data_config;
	
	///////// Initialize Utility Functions //
	const Utils = {
		sendReaction : require('../utils/sendReaction.js'),
		textFormat : require('../utils/textFormat.js'),
		fancyFont : require('../utils/localFont.js'),
		editGif : require('../utils/editGif.js'),
		logger : require('../utils/log.js')
	}
	
	for (const key in util) {
		Utils[key] = util[key];
	}
	
	Utils.sendRequestError = function (err, event, prefix) {
		api.sendMessage(Utils.textFormat('error', 'errCmdExceptionError', err.message, prefix), event.threadID, ()=>{}, event.messageID);
	}
	
	Utils.logModuleErrorToAdmin = async function (err, filename, event) {
		console.error(filename, err);
		let name = '<DIRECT MESSAGE>';
		if (event.isGroup) {
			const data = await Threads.getData(event.threadID);
			name = (data) ? data.threadInfo.threadName : 'Uninitialize Group';
		}
		for (const admin of global.HADESTIA_BOT_CONFIG.ADMINBOT) {
			api.sendMessage(Utils.textFormat('events', 'eventModulesErrorToAdmin', filename, err, name || 'No Data', event.threadID, event.senderID), admin);
		}
	}
	
	Utils.autoUnsend = async function (err, info, delay = 120) {
		if (err) return console.log('AUTO UNSEND MESSAGE:', err);
		await new Promise(resolve => setTimeout(resolve, delay * 1000));
		return api.unsendMessage(info.messageID);
	}
	
	Utils.getModuleText = function (module = {}, event) {
    	if (!module.language) return function () {};
       
        return function (...values) {
        	if (!module.language.hasOwnProperty(global.HADESTIA_BOT_CONFIG.language)) {
        		const msg = Utils.getText('handleCommand', 'notFoundLanguage', module.config.name);
        		api.sendMessage(msg, event.threadID, ()=>{}, event.messageID);
				return Utils.logModuleErrorToAdmin(msg, module.config.name, event);
            }
			let lang = module.language[global.HADESTIA_BOT_CONFIG.language][values[0]] || '';
            for (var i = values.length; i > 0x16c0 + -0x303 + -0x1f * 0xa3; i--) {
                const expReg = RegExp('%' + i, 'g');
				lang = lang.replace(expReg, values[i]);
			}
			return lang;
        }
    }
    
    Utils.getText = function(...args) {
    	const langText = global.HADESTIA_BOT_DATA.language;
    	if (!langText.hasOwnProperty(args[0])) throw `${__filename} - Not found key language: ${args[0]}`;
    	var text = langText[args[0]][args[1]];

    	for (var i = args.length - 1; i > 0; i--) {
        	const regEx = RegExp(`%${i}`, 'g');
        	text = text.replace(regEx, args[i + 1]);

    	}
    	return text;
	}
    
    Utils.getRemainingTime = function (seconds, v2 = true) {
		function hasS (pref, count) {
			return (count > 0) ? (count > 1) ? pref+'s' : pref : '';
		}
		seconds = Number(seconds);
		var d = Math.floor(seconds / (3600*24));
		var h = Math.floor(seconds % (3600*24) / 3600);
		var m = Math.floor(seconds % 3600 / 60);
		var s = Math.floor(seconds % 60);
	
		if (!v2) { // will send complete countdown details Day -> Seconds
			const sDisplay = s > 0 ? s + hasS('second', s) : '';
			const mDisplay = m > 0 ? m + (m == 1 ? (s > 0) ? ' minute and ' : ' minute' : (s > 0) ? ' minutes and ' : ' minutes') : '';
			const hDisplay = h > 0 ? h + (h == 1 ? (m > 0) ? ((s > 0) ? ' hour, ' : ' hour and ') : ((s > 0) ? ' hour and ' : ' hour') : (m > 0) ? ((s > 0) ? ' hours, ' : ' hours and ') : ((s > 0) ? ' hours and ' : ' hours')) : '';
			const dDisplay = d > 0 ? d + (d == 1 ? (h > 0) ? ((m > 0) ? ' day, ' : ' day and ') : ((h > 0) ? ' day and ' : ' day') : (h > 0) ? ((m > 0) ? ' days, ' : ' days and ') : ((h > 0 ) ? ' days and ' : ' days')) : '';
			return {
				day: d,
				hour: h,
				minute: m,
				second: s,
				toString: dDisplay + hDisplay + mDisplay + sDisplay
			};
		}
		const allTime = [
			{ val: d, name: 'day' },
			{ val: h, name: 'hour' },
			{ val: m, name: 'minute' },
			{ val: s, name: 'second' }
		];
	
		const result = [];
		for (const item of allTime) {
			if (result.length < 2 && item.val > 0) {
				result[result.length] = `${item.val} ${hasS(item.name, item.val)}`;
			}
		}
		// Out: 3 minutes and 1 second (example)
		return result.join(' and ');
	}
	
	///////// DO RE-CHECKING DATABASE

	(async function() {
		api.markAsReadAll((err) => {
			if (err) return console.error('Error [Mark as Read All]: ' + err)
		});

		try {
			
			logger(Utils.getText('listen', 'startLoadEnvironment'), '[ DATABASE ]');
			
			let users = await Users.getAll(['userID', 'name', 'data']),
				threads = await Threads.getAll(['threadID', 'threadInfo', 'data']);
				
			for (const threadData of threads) {
				
				
				const threadID = String(threadData.threadID);
				const Info = threadData.threadInfo;
				const Data = threadData.data;
				
				if (!Data || !Info) {
					try { await Threads.delData(threadID); } catch (e) {};
				} else {
				
					if (Data.isBanned) {
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
						if (!Data[configName]) {
							Data[configName] = GroupDataConfig[configName];
							changesCount++;
						}
					}
				
					// Re-save (if only has changes to optimize)
					if (changesCount > 0) {
						await Threads.setData(threadID, { data: Data });
					}
				}
			}
			
			logger.loader(Utils.getText('listen', 'loadedEnvironmentThread'));
			
			for (const userData of users) {
				
				const userID = String(userData.userID);
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
			
			logger.loader(Utils.getText('listen', 'loadedEnvironmentUser'))
			logger(Utils.getText('listen', 'successLoadEnvironment'), '[ DATABASE ]');
			
		} catch (error) {
			console.log(error);
			return logger.loader(Utils.getText('listen', 'failLoadEnvironment', error), 'error');
		}
		
	}());
	
	
	/// COMMANDS AND EVENTS MODULE LATE INITIALIZATION ///
	
	// # Commands Late Init
	global.HADESTIA_BOT_CLIENT.commands.forEach(function (name, module) {
		try {
			if (module.lateInit) {
				console.log('Late Init :' + name);
				module.lateInit({ api, models, Utils, Users, Banned, Threads });
			}
		} catch (error) {
			throw new Error(JSON.stringify(error));
		}
	});
		
	// # Events Late Init
	global.HADESTIA_BOT_CLIENT.events.forEach(function (name, module) {
		try {
			if (module.lateInit) {
				console.log('Late Init :' + name);
				module.lateInit({ api, models, Utils, Users, Banned, Threads });
			}
		} catch (error) {
			throw new Error(JSON.stringify(error));
		}
	});
	
	logger(`${api.getCurrentUserID()} - [ ${global.HADESTIA_BOT_CONFIG.PREFIX} ] • ${(!global.HADESTIA_BOT_CONFIG.BOTNAME) ? 'This bot was forked & modified from original made by CatalizCS and SpermLord' : global.HADESTIA_BOT_CONFIG.BOTNAME}`, '[ BOT INFO ]');
	
	// preset
	/*api.getUserInfoV2 = async function (ids, callback) {
		const info = await api.getUserInfo(ids, callback);
		if (!info) return;
		const fix = {};
		for (const id in info) {
			const fixed = {
				name: info[id].name,
				firstName: info[id].firstName,
				username: info[id].vanity,
				avatar: `https://graph.facebook.com/${id}/picture?width=1290&height=1290&access_token=${process.env.FB_ACCESS_TOKEN}`,
				url: (info[id].profileUrl || `https://facebook.com/${id}`).replace('www.', ''),
				gender: (info[id].gender == 1) ? 'Female' : (info[id].gender == 2) ? 'Male' : 'no_data',
				isBirthday: info[id].isBirthday
			}
			fix[id] = fixed;
		}
		
		if (Object.keys(fix).length === 1) {
			return fix[Object.keys(fix)[0]];
		}
		return fix;
	}*/
	

	///////////////////////////////////////////////
	//========= Require all handle need =========//
	//////////////////////////////////////////////

	const handleCommand = require('./handle/handleCommand')({
		api,
		models,
		Utils,
		Users,
		Banned,
		Threads
	});
	
	const handleCommandEvent = require('./handle/handleCommandEvent')({
		api,
		models,
		Utils,
		Users,
		Banned,
		Threads
	});
	
	const handleCommandMessageReply = require('./handle/handleCommandMessageReply')({
		api,
		models,
		Utils,
		Users,
		Banned,
		Threads
	});
	
	const handleReply = require('./handle/handleReply')({
		api,
		models,
		Utils,
		Users,
		Banned,
		Threads
	});
	
	const handleReaction = require('./handle/handleReaction')({
		api,
		models,
		Utils,
		Users,
		Banned,
		Threads
	});
	
	const handleEvent = require('./handle/handleEvent')({
		api,
		models,
		Utils,
		Users,
		Banned,
		Threads
	});
	
	const handleCreateDatabase = require('./handle/handleCreateDatabase')({
		api,
		models,
		Utils,
		Users,
		Banned,
		Threads
	});

	logger.loader(`====== ${Date.now() - global.HADESTIA_BOT_CLIENT.timeStart}ms ======`);


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

	logger.loader(`====== ${Date.now() - global.HADESTIA_BOT_CLIENT.timeStart}ms ======`);
	
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


	//////////////////////////////////////////////////
	//========= Send event to handle need =========//
	/////////////////////////////////////////////////

	return async (event) => {
		(event.body !== undefined) ? event.body = (event.body).normalize('NFKD') : '';
		// type Object if has data else return false
        const bannedUserData = (event.senderID) ? await Banned.getData(event.senderID) : false;
        const bannedGroupData = (event.threadID && event.isGroup) ? await Banned.getData(event.threadID) : false;
        
        const input = {
			event,
			bannedUserData,
			bannedGroupData
		}
        
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