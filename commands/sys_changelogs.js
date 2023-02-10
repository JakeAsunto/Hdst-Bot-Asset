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

module.exports.run = async function ({ api, args, event, textFormat, Threads }) {
	
	const { threadID, messageID } = event;

	if (args.length > 0) {
		
		if (!args[0] == 'set') {
			return 'invalid_usage';
		}
		
		// if has argument and not GC
		if (threadID.length < 16) {
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