//////// WORK: GROUP ECONOMY FEATURE BY HADESTIA ///////

module.exports.config = {
	name: 'work',
	version: '1.0.0',
	hasPermssion: 0,
	commandCategory: 'economy',
	usages: '',
	description: 'Earn some money',
	credits: 'Hadestia',
	cooldowns: 1200,
	aliases: [ 'earn' ]
}

module.exports.run = async function ({ api, args, event, returns, textFormat, Prefix, Threads }) {
	
	const economySystem = require(`${__dirname}/../../json/economySystem.json`);

	const { threadID, messageID, senderID } = event;
	
	try {
		const threadData = await Threads.getData(threadID);
		const economy = threadData.economy;
	
		// create user an account if not exist just to ensure
		if (!economy[senderID]) {
			economy[senderID] = { hand: 0, bank: 0 }
		}
	
		const currency = threadData.data.economy_currency || economySystem.config.default_currency;
		const minWage = threadData.data.economy_work_min_wage || economySystem.config.work_min_wage || 500;
		const maxWage = threadData.data.economy_work_max_wage || economySystem.config.work_max_wage || 1000;
	
		const randomSalary = Math.floor(Math.random() * (maxWage - minWage + 1)) + minWage;
	
		// save data first
		economy[senderID].hand = economy[senderID].hand + randomSalary;
		await Threads.setData(threadID, { economy });
		
		const formatSalary = randomSalary.toLocaleString('en-US');
		const messageResponse = (economySystem.workResponse[Math.floor(Math.random() * (economySystem.workResponse).length)]).replace(/${salary}/g, `${currency}${formatSalary}`);
		
		return api.sendMessage( messageResponse, threadID, messageID);
		
	} catch (err) {
		returns.remove_usercooldown();
		global.sendReaction.failed(api, event);
		global.logger(err, 'error');
		global.logModuleErrorToAdmin(err, __filename, event);
		return api.sendMessage(textFormat('error', 'errCmdExceptionError', err, Prefix), threadID, messageID);
	}
	
}