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
	aliases: [ 'earn' ]
}

module.exports.run = async function ({ api, args, event, returns, textFormat, Prefix, Threads }) {
	
	const economySystem = require(`${__dirname}/../../json/economySystem.json`);

	const { threadID, messageID, senderID } = event;
	const dateNow = Date.now();
	
	try {
		const threadData = await Threads.getData(threadID);
		const economy = threadData.economy;
		
		if (!economy[senderID].work_cooldown) {
			// add minus 1 sec to let this person use this command
			economy[senderID].work_cooldown = dateNow - 1000
		}
		// if user is in cooldown for this group only
		if (economy[senderID].work_cooldown > dateNow) {
			const timer = economy[senderID].work_cooldown;
			return returns.user_in_cooldown(timer, dateNow);
		}
		
		// add cooldowns (to let user use this command on each group that bot was there also)
		const nextWork = Date.now() + (1200 * 1000) // 20 minutes
	
		const currency = threadData.data.economy_currency || economySystem.config.default_currency;
		const minWage = threadData.data.economy_work_min_wage || economySystem.config.work_min_wage || 500;
		const maxWage = threadData.data.economy_work_max_wage || economySystem.config.work_max_wage || 1000;
	
		const randomSalary = Math.floor(Math.random() * (maxWage - minWage + 1)) + minWage;
	
		// save data first
		economy[senderID].hand = economy[senderID].hand + randomSalary;
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