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
		
		economy[senderID].beg_cooldown = economy[senderID].beg_cooldown || 0;
		
		const currency = threadData.data.default_currency || economySystem.config.default_currency;
		const minWage = economySystem.default.beg_min_salary;
		const maxWage = economySystem.default.beg_max_salary;
		const expirationTime = economy[senderID].beg_cooldown + (economy[senderID].beg_cooldown || economySystem.default.beg_cooldown);
		
		// if user was in cooldown
		if (Date.now() < expirationTime) {
			return api.sendMessage(
				`Quit begging, You may ask me money again in ${await global.secondsToDHMS(Math.abs(Date.now() - expirationTime)/1000)}.`,
				threadID,
				global.autoUnsend,
				messageID
			);
		}
		
		const randomSalary = Math.floor(Math.random() * (maxWage - minWage + 1)) + minWage;
		const randomSuccessResponse = (economySytem.begResponseSuccess[Math.floor(Math.random() * (economySytem.begResponseSuccess).length)]).replace('${salary}', `${currency}${randomSalary}`);
		const randomFailedResponse = economySystem.begResponseFailed[Math.floor(Math.random() * (economySystem.begResponseFailed).length)];
		
		economy[senderID].beg_cooldown = Date.now();

		// if user was in debt just a lil consideration will do :)
		if (economy[senderID].hand < 0) {
			
			economy[senderID].hand += randomSalary;
			await Threads.setData(threadID, { economy });
			
			return api.sendMessage(randomSuccessResponse, threadID, messageID);
			
		} else {
			// do the probability
			if (Math.random() <= economySystem.default.beg_success_rate) {
				
				economy[senderID].hand += randomSalary;
				await Threads.setData(threadID, { economy });
				return api.sendMessage(randomSuccessResponse, threadID, messageID);
				
			} else {
				return api.sendMessage(randomFailedResponse, threadID, messageID);
			}
		}
		
		return api.sendMessage(textFormat('economy', 'cmdBalance', ownerName, leaderboards.userPosition, currency, formatOnHand, formatOnBank, formatTotal), threadID, messageID);
		
	} catch (err) {
		returns.remove_usercooldown();
		global.sendReaction.failed(api, event);
		global.logger(err, 'error');
		global.logModuleErrorToAdmin(err, __filename, event);
		return api.sendMessage(textFormat('error', 'errCmdExceptionError', err, Prefix), threadID, messageID);
	}
	
}