module.exports.config = {
	name: 'changelog',
	version: '2.0.1',
	usages: '[ set ]',
	description: 'Enable or Disable receiving patch notes about this bot. Or vier patch notes by running the command.',
	commandCategory: 'system',
	credits: 'Hadestia',
	hasPermssion: 0,
	cooldowns: 30
}

module.exports.lateInit = async function ({ api, models }) {
	
	const { readFileSync, writeFileSync } = require('fs-extra');
	
	const Threads = require(`${__dirname}/../../includes/controllers/controller_threads`)({ models, api });
    const isUpdated = readFileSync(`${__dirname}/../../cache/keep/!asset-has-update.txt`, { encoding: 'utf-8' });
	const assets = require(`${__dirname}/../../json/!asset-update.json`);
	const botAdmins = global.config.ADMINBOT;

	global.BOT_VERSION = assets.VERSION;
	//console.log(global.data.threadData[id]['recieve-update']);
	// Notify each group about the patch notes
	if (isUpdated == 'true') {
    	try {
			for (const thread of global.data.allThreadID) {
				var { data } = await Threads.getData(thread);
				data = data || {};
				const idIndex = global.data.allThreadID.indexOf(thread);
				
				if (data.receive_update) {
					api.sendMessage(
						`Bot has been updated to version: ${assets.VERSION}\nrun "${global.config.PREFIX}changelog" to see full details.\n\nYou can also use "${global.config.PREFIX}changelog set" to turn on/off this update notification.`,
						thread,
						async (err) => {
							// if this fails that means its an old thread data
							// that probably bot are not a member anymore
							if (err) {
								(idIndex !== -1) ? (global.data.allThreadID).slice(idIndex, 1) : '';
								await Threads.delData(thread);
							}
						}
					);
				}
			}
			// notify admins too
			for (const admin of botAdmins) {
				api.sendMessage(global.textFormat('system', 'botUpdateFormat', assets.VERSION, assets.CHANGELOGS), admin);
			}
		} catch (e) {
        	//logger (e);
			console.log(`BOT update notif: ${e}`, 'warn');
		}
	}
	
	await writeFileSync(`${__dirname}/../../cache/keep/!asset-has-update.txt`, 'false', 'utf-8');
}

module.exports.run = async function ({ api, args, event, textFormat, Threads }) {
	
	const { threadID, messageID } = event;

	if (args.length > 0) {
		
		if (!args[0] == 'set') {
			return 'invalid_usage';
		}
		
		// if has argument and not GC
		if (!event.isGroup) {
			return api.sendMessage(textFormat('system', 'botUpdateSettingOnlyGC'), threadID, messageID);
		}
		
		let data = (await Threads.getData(threadID)).data;
		
		// set initial state when not set
		// if (typeof(data['recieve-update']) == undefined || data['recieve-update'] == true) {
		data.recieve_update = !data.recieve_update;
		//} else 
			//data['recieve-update'] = true;
		//}
		
		await Threads.setData(threadID, { data });
		global.data.threadData.set(threadID, data);

		return api.sendMessage(
			textFormat('system', `botUpdate${(data.recieve_update == true) ? 'On' : 'Off'}`),
			threadID,
			global.autoUnsend,
			messageID
		);
	}
	
	// const { threadID, messageID } = event;
	const asset = await require('../../json/!asset-update.json');
	
	return api.sendMessage(
		textFormat('system', 'botUpdateFormat', asset.VERSION, asset.CHANGELOGS),
		threadID,
		(err) => {
			if (err) return global.sendReaction.failed(api, event);
			return global.sendReaction.success(api, event);
		},
		messageID
	)
}