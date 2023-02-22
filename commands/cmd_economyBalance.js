//////// BALANCE: GROUP ECONOMY FEATURE BY HADESTIA ///////

module.exports.config = {
	name: 'balance',
	version: '1.0.0',
	hasPermssion: 0,
	commandCategory: 'economy',
	usages: '',
	description: 'View your balance.',
	credits: 'Hadestia',
	cooldowns: 0,
	aliases: [ 'bal' ]
}

module.exports.run = async function ({ api, args, event, returns, textFormat, Prefix, Threads }) {
	
	const { threadID, messageID, senderID } = event;
	
	try {
		const economy = (await Threads.getData(threadID)).economy;
		let ID;
		// if message reply
		if (event.type == 'message_reply') {
			ID = event.messageReply.senderID;
			
		// if @mention
		} else if (Object.keys(event.mentions).length > 0) {
			ID = Object.keys(event.mentions)[0];
		}
		ID = (!ID) ? senderID : ID;
		
		// create user an account if not exist just to ensure
		if (!economy[ID]) {
			economy[ID] = { hand: 0, bank: 0 }
			await Threads.setData(threadID, { economy });
		}
	
		const currency = threadData.data.default_currency || economySystem.config.default_currency;
	
		const formatOnHand = (economy[ID].hand).toLocaleString('en-US');
		const formatOnBank = (economy[ID].bank).toLocaleString('en-US');
		const formatTotal = (economy[ID].hand + economy[senderID].bank).toLocaleString('en-US');
		
		return api.sendMessage(textFormat('economy', 'cmdBalance', currency, formatOnHand, formatOnBank, formatTotal), threadID, messageID);
		
	} catch (err) {
		returns.remove_usercooldown();
		global.sendReaction.failed(api, event);
		global.logger(err, 'error');
		global.logModuleErrorToAdmin(err, __filename, event);
		return api.sendMessage(textFormat('error', 'errCmdExceptionError', err, Prefix), threadID, messageID);
	}
	
}