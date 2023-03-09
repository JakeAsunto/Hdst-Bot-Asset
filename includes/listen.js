module.exports = function({ api, models }) {

	const Users = require("./controllers/controller_users")({ models, api }),
		Threads = require("./controllers/controller_threads")({ models, api });
		
	const logger = require("../utils/log.js");
	const fs = require("fs");
	const moment = require('moment-timezone');
	const axios = require("axios");

	//////////////////////////////////////////////////////////////////////
	//========= Push all variable from database to environment =========//
	//////////////////////////////////////////////////////////////////////



	(async function() {
		api.markAsReadAll((err) => {
			if (err) return console.error("Error [Mark as Read All]: " + err)
		});

		try {
			
			logger(global.getText('listen', 'startLoadEnvironment'), '[ DATABASE ]');
			
			let threads = await Threads.getAll(),
				users = await Users.getAll(['userID', 'name', 'data']);
				
			for (const threadData of threads) {
				
				const threadID = String(threadData.threadID);
				
				global.data.allThreadID.push(threadID)
				global.data.threadData.set(threadID, threadData.data || {})
				global.data.threadInfo.set(threadID, threadData.threadInfo || {});
				
					
				if (threadData.data && threadData.data.isBanned) {
					global.data.bannedThreads.set(
						threadID,
						{
							caseID: threadData.data.banned.caseID || -1,
							reason: threadData.data.banned.reason || '<reason not set>',
							dateIssued: threadData.data.banned.dateIssued || '<unknown date>'
						}
					)
				}
				
				if (threadData.data && threadData.data.bannedCommands && (threadData.data.bannedCommands).length > 0) {
					(global.data.bannedCommands).set(threadID, threadData.data.bannedCommands)
				}
				
				if (threadData.data && threadData.data.allowNSFW) {
					(global.data.threadAllowNSFW)[(global.data.threadAllowNSFW).length] = threadID;
				}
			}
			
			logger.loader(global.getText('listen', 'loadedEnvironmentThread'));
			
			for (const userData of users) {
				
				const userID = String(userData['userID']);
				
				// save data to global variable: allUserID
				(global.data.allUserID)[(global.data.allUserID).length] = userID;
				
				// save user name to global variable: userName
				if (userData.name && userData.name['length'] != 0) {
					(global.data.userName).set(userID, userData.name);
				}
				
				// save this user to global variable banned User
				if (userData.data && userData.data.isBanned) {
					(global.data.bannedUsers).set(
						userID,
						{
							caseID: userData.data.banned.caseID || -1,
							reason: userData.data.banned.reason || '<reason not set>',
							dateIssued: userData.data.banned.dateIssued || '<unknown date>'
						}
					);
				}
				
				// save this user on global variable command banned if he/she has it
				if (userData.data && userData.data.bannedCommands && (userData.data.bannedCommands).length > 0) {
					(global.data.bannedCommands).set(userID, userData.data.bannedCommands);
				}
			}
			
			logger.loader(global.getText('listen', 'loadedEnvironmentUser'))
			logger(global.getText('listen', 'successLoadEnvironment'), '[ DATABASE ]');
			
		} catch (error) {
			return logger.loader(global.getText('listen', 'failLoadEnvironment', error), 'error');
		}
		
	}());
	
	logger(`${api.getCurrentUserID()} - [ ${global.config.PREFIX} ] • ${(!global.config.BOTNAME) ? "This bot was forked & modified from original made by CatalizCS and SpermLord" : global.config.BOTNAME}`, "[ BOT INFO ]");
	
	// preset
	api.getUserInfoV2 = async function (ids, callback) {
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
	}
	

	///////////////////////////////////////////////
	//========= Require all handle need =========//
	//////////////////////////////////////////////

	const handleCommand = require("./handle/handleCommand")({
		api,
		models,
		Users,
		Threads
	});
	
	const handleCommandEvent = require("./handle/handleCommandEvent")({
		api,
		models,
		Users,
		Threads
	});
	
	const handleCommandMessageReply = require("./handle/handleCommandMessageReply")({
		api,
		models,
		Users,
		Threads
	});
	
	const handleReply = require("./handle/handleReply")({
		api,
		models,
		Users,
		Threads
	});
	
	const handleReaction = require("./handle/handleReaction")({
		api,
		models,
		Users,
		Threads
	});
	
	const handleEvent = require("./handle/handleEvent")({
		api,
		models,
		Users,
		Threads
	});
	
	const handleCreateDatabase = require("./handle/handleCreateDatabase")({
		api,
		models,
		Threads,
		Users
	});

	logger.loader(`====== ${Date.now() - global.client.timeStart}ms ======`);


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
		
		if (time[1] > 12 || time[1] < 1) resolve("Tháng của bạn có vẻ không hợp lệ");
		if (time[0] > getDayFromMonth(time[1]) || time[0] < 1) resolve("Ngày của bạn có vẻ không hợp lệ");
		if (time[2] < 2022) resolve("You live at the Kỷ nguyên nào thế giới?");
		if (time[3] > 23 || time[3] < 0) resolve("Giờ của bạn có vẻ không hợp lệ");
		if (time[4] > 59 || time[3] < 0) resolve("Phút của bạn có vẻ không hợp lệ");
		if (time[5] > 59 || time[3] < 0) resolve("Giây của bạn có vẻ không hợp lệ");
		
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

	logger.loader(`====== ${Date.now() - global.client.timeStart}ms ======`);
	
	const checkAndExecuteEvent = async () => {

		/*smol check*/
		if (!fs.existsSync(datlichPath)) {
			fs.writeFileSync(datlichPath, JSON.stringify({}, null, 4));
		}
		
		var data = JSON.parse(fs.readFileSync(datlichPath));

		//GET CURRENT TIME
		var timePH = moment().tz('Asia/Manila').format('DD/MM/YYYY_HH:mm:ss');
		
		timePH = timePH.split("_");
		timePH = [...timePH[0].split("/"), ...timePH[1].split(":")];

		let temp = [];
		let phMS = await checkTime(timePH);
		
		const compareTime = e => new Promise(async (resolve) => {
			let getTimeMS = await checkTime(e.split("_"));
			if (getTimeMS < phMS) {
				if (vnMS - getTimeMS < tenMinutes) {
					data[boxID][e]["TID"] = boxID;
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
				
				var all = (await Threads.getInfo(el["TID"])).participantIDs;
				
				all.splice(all.indexOf(api.getCurrentUserID()), 1);
				
				var body = el.REASON || "MỌI NGƯỜI ƠI",
					mentions = [],
					index = 0;

				for (let i = 0; i < all.length; i++) {
					if (i == body.length) body += " ‍ ";
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
			
			if ("ATTACHMENT" in el) {
				
				out.attachment = [];
				
				for (a of el.ATTACHMENT) {
					
					let getAttachment = (await axios.get(encodeURI(a.url), {
						responseType: "arraybuffer"
					})).data;
					
					fs.writeFileSync(__dirname + `/../modules/commands/cache/${a.fileName}`, Buffer.from(getAttachment, 'utf-8'));
					out.attachment.push(fs.createReadStream(__dirname + `/../modules/commands/cache/${a.fileName}`));
				}
				
			}
			
			console.log(out);
			
			if ("BOX" in el) { await api.setTitle(el["BOX"], el["TID"]); }
			
			api.sendMessage(out, el["TID"], () => ("ATTACHMENT" in el) ? el.ATTACHMENT.forEach(a => fs.unlinkSync(__dirname + `/../modules/commands/cache/${a.fileName}`)) : "");
		}

	}
	
	setInterval(checkAndExecuteEvent, tenMinutes / 10);


	//////////////////////////////////////////////////
	//========= Send event to handle need =========//
	/////////////////////////////////////////////////

	return (event) => {
		
		(event.body !== undefined) ? event.body = (event.body).normalize('NFKD') : '';
		
		switch (event.type) {
			
			case "message":
			
			case "message_reply":
			
				handleCommandMessageReply({ event });
			
			case "message_unsend":
			
				handleCreateDatabase({ event });
				
				handleCommand({ event });
				
				handleReply({ event });
				
				handleCommandEvent({ event });

				break;
				
			case "event":
			
				handleEvent({ event });
				
				break;
				
			case "message_reaction":
			
				handleReaction({ event });
				
				break;
				
			default:
			
				break;
		}
	};
};

//THIZ BOT WAS MADE BY ME(CATALIZCS) AND MY BROTHER SPERMLORD - DO NOT STEAL MY CODE (つ ͡ ° ͜ʖ ͡° )つ ✄ ╰⋃╯