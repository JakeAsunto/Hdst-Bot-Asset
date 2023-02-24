//////// WORK: GROUP ECONOMY FEATURE BY HADESTIA ///////

module.exports.config = {
	name: 'work',
	version: '1.0.0',
	hasPermssion: 0,
	commandCategory: 'economy',
	usages: '',
	description: 'Earn some money',
	credits: 'Hadestia',
	cooldowns: 0,
	aliases: [ 'earn' ],
	envConfig: {
		groupCommandOnly: true
	}
}

module.exports.run = async function ({ api, args, event, returns, textFormat, Prefix, Threads }) {
	
	const economySystem = require(`${__dirname}/../../json/economySystem.json`);

	const { threadID, messageID, senderID } = event;
	const dateNow = Date.now();
	
	try {
		const threadData = await Threads.getData(threadID);
		const economy = threadData.economy;
		const inventory = threadData.inventory;
		
		/*if (!economy[senderID]) {
			economy[senderID] = economySystem.userConfig;
		}
		if (!inventory[senderID]) {
			inventory[senderID] = {};
		}*/
		
		const expirationTime = (threadData.data.work_cooldown || economySystem.config.work_cooldown); // 20 minutes default
		const userCooldown = economy[senderID].work_cooldown + expirationTime;
		
		if (dateNow < userCooldown) {
			return returns.user_in_cooldown(userCooldown, dateNow);
		}
		
		const currency = threadData.data.default_currency || economySystem.config.default_currency;
		const minWage = threadData.data.work_min_wage || economySystem.config.work_min_wage || 500;
		const maxWage = threadData.data.work_max_wage || economySystem.config.work_max_wage || 1000;
	
		const randomSalary = Math.floor(Math.random() * (maxWage - minWage + 1)) + minWage;
	
		// save data first
		economy[senderID].hand = economy[senderID].hand + randomSalary;
		economy[senderID].work_cooldown = Date.now();
		await Threads.setData(threadID, { economy });
		
		const formatSalary = randomSalary.toLocaleString('en-US');
		const messageResponse = (economySystem.workResponse[Math.floor(Math.random() * (economySystem.workResponse).length)]).replace('${salary}', `${currency}${formatSalary}`);
		
		return api.sendMessage( messageResponse, threadID, messageID);
		
	} catch (err) {
		returns.remove_usercooldown();
		global.sendReaction.failed(api, event);
		global.logger(err, 'error');
		global.logModuleErrorToAdmin(err, __filename, event);
		return api.sendMessage(textFormat('error', 'errCmdExceptionError', err, Prefix), threadID, messageID);
	}
	
}