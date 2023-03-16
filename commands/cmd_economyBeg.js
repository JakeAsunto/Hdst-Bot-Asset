//////// BEG: GROUP ECONOMY FEATURE BY HADESTIA ///////

module.exports.config = {
	name: 'beg-money',
	version: '1.0.1',
	hasPermssion: 0,
	commandCategory: 'economy',
	usages: '',
	description: 'Beg some money from Hadestia. let\'s see if he was generous to give you.',
	credits: 'Hadestia',
	cooldowns: 0,
	aliases: [ 'beg' ],
	envConfig: {
		groupCommandOnly: true
	}
}

module.exports.run = async function ({ api, args, event, returns, textFormat, Prefix, Threads }) {

	const economySystem = require(`${__dirname}/../../json/economySystem.json`);
	
	const { threadID, messageID, senderID } = event;
	
	try {
		const threadData = await Threads.getData(threadID);
		const economy = threadData.economy;
		
		if (!economy[senderID].beg_cooldown || economy[senderID].beg_cooldown == 0) {
			economy[senderID].beg_cooldown = Date.now();
		}
		
		const currency = threadData.data.default_currency || economySystem.config.default_currency;
		const minWage = economySystem.default.beg_min_salary;
		const maxWage = economySystem.default.beg_max_salary;
		
		// if user was in cooldown
		if (Date.now() < economy[senderID].beg_cooldown) {
			
			const timeA = new Date(economy[senderID].beg_cooldown);
			const timeB = new Date(Date.now());
			const { toString } = await global.secondsToDHMS(Math.abs(timeA - timeB)/1000)
			return api.sendMessage(
				`Quit begging, You may ask me money again in ${toString}.`,
				threadID,
				global.autoUnsend,
				messageID
			);
		}
		
		const randomSalary = Math.floor(Math.random() * (maxWage - minWage + 1)) + minWage;
		const randomSuccessResponse = (economySystem.begResponseSuccess[Math.floor(Math.random() * (economySystem.begResponseSuccess).length)]).replace('${salary}', `${currency}${randomSalary.toLocaleString('en-US')}`);
		const randomFailedResponse = economySystem.begResponseFailed[Math.floor(Math.random() * (economySystem.begResponseFailed).length)];
		
		// set time for user for his/her next session
		economy[senderID].beg_cooldown = (Date.now() + economySystem.default.beg_cooldown);

		// if user was in debt just a lil consideration will do :)
		if (economy[senderID].hand < 0) {
			
			economy[senderID].hand += randomSalary;
			api.sendMessage(randomSuccessResponse, threadID, messageID);
			
		} else {
			// do the probability
			if (Math.random() <= economySystem.default.beg_success_rate) {
				
				economy[senderID].hand += randomSalary;
				api.sendMessage(randomSuccessResponse, threadID, messageID);
				
			} else {
				api.sendMessage(randomFailedResponse, threadID, messageID);
			}
		}
		await Threads.setData(threadID, { economy });
		
	} catch (err) {
		returns.remove_usercooldown();
		global.sendReaction.failed(api, event);
		global.logger(err, 'error');
		global.logModuleErrorToAdmin(err, __filename, event);
		return api.sendMessage(textFormat('error', 'errCmdExceptionError', err, Prefix), threadID, messageID);
	}
	
}