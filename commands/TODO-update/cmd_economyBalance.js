//////// BALANCE: GROUP ECONOMY FEATURE BY HADESTIA ///////

module.exports.config = {
	name: 'balance',
	version: '1.0.1',
	hasPermssion: 0,
	commandCategory: 'economy',
	usages: '',
	description: 'View your balance.',
	credits: 'Hadestia',
	cooldowns: 5,
	aliases: [ 'bal' ],
	envConfig: {
		groupCommandOnly: true
	}
}

module.exports.run = async function ({ api, args, event, returns, textFormat, Prefix, Threads }) {

	const economySystem = require(`${__dirname}/../../json/economySystem.json`);
	const leaderboard = require('./cmd_economyLeaderboard.js');
	
	const { threadID, messageID, senderID } = event;
	
	try {
		const threadData = await Threads.getData(threadID);
		const economy = threadData.economy;
		
		let ID, NAME;
		// if message reply
		if (event.type == 'message_reply') {
			ID = event.messageReply.senderID;
			
		// if @mention
		} else if (Object.keys(event.mentions).length > 0) {
			ID = Object.keys(event.mentions)[0];
			NAME = Object.values(event.mentions)[0].replace('@', '');
		}
		ID = (!ID) ? senderID : ID;
		
		if (!economy[ID]) {
			economy[ID] = economySystem.userConfig;
			await Threads.setData(threadID, { economy });
		}
		
		// GET CURRENT USER LEADERBOARD POSITION
		const leaderboards = await leaderboard.sortLeaderboard(ID, economy);
		
		const currency = threadData.data.default_currency || economySystem.config.default_currency;
	
		const owner = await api.getUserInfoV2(ID) || {};
		const ownerName = await global.fancyFont.get((NAME && (NAME).split(' ')[0]) || (owner.name) ? (owner.name == 'Facebook User') ? owner.name : (owner.name).split(' ')[0] : 'Facebook User', 1);
		
		const formatOnHand = (economy[ID].hand).toLocaleString('en-US');
		const formatOnBank = (economy[ID].bank).toLocaleString('en-US');
		const formatTotal = (economy[ID].hand + economy[ID].bank).toLocaleString('en-US');
		
		return api.sendMessage(textFormat('economy', 'cmdBalance', ownerName, leaderboards.userPosition, currency, formatOnHand, formatOnBank, formatTotal), threadID, messageID);
		
	} catch (err) {
		returns.remove_usercooldown();
		global.sendReaction.failed(api, event);
		global.logger(err, 'error');
		global.logModuleErrorToAdmin(err, __filename, event);
		return api.sendMessage(textFormat('error', 'errCmdExceptionError', err, Prefix), threadID, messageID);
	}
	
}