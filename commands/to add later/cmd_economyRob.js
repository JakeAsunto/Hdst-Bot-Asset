//////// ROB: GROUP ECONOMY FEATURE BY HADESTIA ///////

module.exports.config = {
	name: 'Robery',
	version: '1.0.1',
	hasPermssion: 0,
	commandCategory: 'economy',
	usages: '',
	description: 'Rob money from someone.',
	credits: 'Hadestia',
	aliases: [ 'rob' ],
	cooldowns: 60,
	envConfig: {
		requiredArgument: 2,
		groupCommandOnly: true
	}
}

module.exports.run = async function ({ api, args, event, returns, textFormat, Prefix, Threads }) {

	const economySystem = require(`${__dirname}/../../json/economySystem.json`);

	const { threadID, messageID, senderID } = event;
	
	try {
		const threadData = await Threads.getData(threadID);
		const economy = threadData.economy;
		
		const currency = threadData.data.default_currency || economySystem.config.default_currency;
		
		let ID, NAME;
		let amount = (args.join(' ').toLowerCase()).match(/\d+|all/g);
		
		if (!amount) {
			returns.remove_usercooldown();
			return api.sendMessage(textFormat('error', 'errOccured', `Invalid amount, include the amount you want to give.`), threadID, messageID);
		};
		
		// @mention
		if (Object.keys(event.mentions).length > 0) {
			ID = Object.keys(event.mentions)[0];
			NAME = Object.values(event.mentions)[0].replace('@', '');
		} else {
			return returns.invalid_usage();
		}
		
		amount = (amount[0] == 'all') ? (economy[senderID].hand > 0) ? economy[senderID].hand : 0 : Math.abs(parseInt(amount[0]));
		// if 0 or not enough
		if (amount == 0 || economy[senderID].hand < amount) {
			returns.remove_usercooldown();
			return api.sendMessage(textFormat('error', 'errOccured', `You currently have ${currency}${(economy[senderID].hand).toLocaleString('en-US')} on your hand, withdraw some.`), threadID, global.autoUnsend, messageID);
		}
		
		// get names
		const recipient = await api.getUserInfoV2(ID) || {};
		const recipientName = (NAME && (NAME).split(' ')[0]) || (recipient.name) ? (recipient.name == 'Facebook User') ? recipient.name : (recipient.name).split(' ')[0] : 'Facebook User';
		
		// ## Process
		// transfer to recipient
		economy[ID].hand += amount;
		economy[senderID].hand -= amount;
		
		await Threads.setData(threadID, { economy });
		return api.sendMessage(
			{
				body: textFormat('success', 'successfulFormat', `@${recipientName} has received your ${currency}${amount.toLocaleString('en-US')}.`),
				mentions: [{ tag: `@${recipientName}`, id: ID }]
			},
			threadID,
			global.autoUnsend,
			messageID
		);
	} catch (err) {
		returns.remove_usercooldown();
		global.sendReaction.failed(api, event);
		global.logger(err, 'error');
		global.logModuleErrorToAdmin(err, __filename, event);
		return api.sendMessage(textFormat('error', 'errCmdExceptionError', err, Prefix), threadID, messageID);
	}
	
}