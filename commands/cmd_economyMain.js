//////// ECONOMY: GROUP ECONOMY FEATURE BY HADESTIA ///////

module.exports.config = {
	name: 'economy',
	version: '1.0.1',
	hasPermssion: 3,
	commandCategory: 'economy',
	usages: '[ currency | add-money | remove-money | work-cooldown | set-wage ] < ... >',
	description: 'Economy settings.',
	credits: 'Hadestia',
	cooldowns: 0,
	aliases: [ 'eco' ],
	envConfig: {
		requiredArgument: 2,
		groupCommandOnly: true
	}
}

module.exports.run = async function ({ api, args, event, returns, textFormat, Prefix, Threads }) {
	
	const economySystem = require(`${__dirname}/../../json/economySystem.json`);
	const { threadID, messageID, senderID } = event;
	
	// get group data
	const threadData = await Threads.getData(threadID);
	const settings = threadData.data;
	const economy = threadData.economy;
	const inventory = threadData.inventory;
	
	const command = (args.shift()).toLowerCase();
	const currency = settings.default_currency || economySystem.config.default_currency; 
	
	const recheckEconomy = (id) => {
		if (!economy[id]) {
			economy[id] = economySystem.userConfig;
		}
		if (!inventory[id]) {
			inventory[id] = {};
		}
		return;
	}
	
	const getUserName = (id, name) => {
		const owner = await api.getUserInfoV2(id) || {};
		const ownerName = await global.fancyFont.get((name && (name).split(' ')[0]) || (owner.name) ? (owner.name == 'Facebook User') ? owner.name : (owner.name).split(' ')[0] : 'Facebook User', 1);
		return ownerName;
	}
	
	
	switch (command) {
		////// CURRENCY /////
		case 'currency': 
			if (args.length == 0) {
				api.sendMessage(textFormat('error', 'errOccured', 'Include a currency you want to set.'), threadID, messageID);
				break;
			}
			settings.default_currency = args[0];
			api.sendMessage(textFormat('success', 'successfulFormat', `Group currency has been set to "${args[0]}".`), threadID, messageID);
			break;
			
			
		////// ADD MONEY /////
		case 'add-money':
			if (args.length < 2) {
				api.sendMessage(textFormat('error', 'errOccured', 'Must include the target user via mention or "me" followed by the amount to set.'), threadID, messageID);
				break;
			}
			
			let amount = (args.join(' ')).match(/\d+/g);
			if (!amount) {
				api.sendMessage(textFormat('error', 'errOccured', 'Invalid input, set an amount to set.'), threadID, messageID);
				break;
			} else if (Math.abs(parseInt(amount[0])) <= 0) {
				api.sendMessage(textFormat('error', 'errOccured', 'Invalid amount, amount cannot be less than or equal to zero.'), threadID, messageID);
				break;
			}
			
			amount = Math.abs(parseInt(amount[0]));
			
			if (Object.keys(event.mentions).length > 0) {
				const id = Object.keys(event.mentions)[0];
				await recheckEconomy(id);
				
				economy[id].bank += amount;
				api.sendMessage(textFormat('success', 'successfulFormat', `${currency}${amount.toLocaleString('en-US')} was added to ${getUserName(id, Object.values(event.mentions)[0].replace('@', ''))}'s bank.`), threadID, messageID);
				break;
				
			} else if ((args[0]).toLowerCase() == 'me') {
				await recheckEconomy(senderID);
				
				economy[senderID].bank += amount;
				api.sendMessage(textFormat('success', 'successfulFormat', `${currency}${amount.toLocaleString('en-US')} was added to your bank.`), threadID, messageID);
				break;
				
			} else {
				api.sendMessage(textFormat('error', 'errOccured', 'Must include the target user via mention or "me" followed by the amount to set.'), threadID, messageID);
				break;
			}

			break;
		
		////// REMOVE MONEY /////
		case 'remove-money': 
		
		
			break;
			
		////// SET WAGE /////
		case 'set-wage':
			if (args.length < 2) {
				api.sendMessage(textFormat('error', 'errOccured', 'Must include two amount for minimum & maximum wages for work command.'), threadID, messageID);
				break;
			}
			let wages = (args.join(' ')).match(/\d+/g);
			
			if (!wages) {
				api.sendMessage(textFormat('error', 'errOccured', 'Invalid input, wages must be a number.'), threadID, messageID);
				break;
			}
			const min = parseInt(wages[0]);
			const max = parseInt(wages[1]);
			
			if (min <= 0 || max <= 0) {
				api.sendMessage(textFormat('error', 'errOccured', 'Wages cannot be less than or equal to zero'), threadID, messageID);
				break;
			} else if (min > 300000 || max > 300000) {
				api.sendMessage(textFormat('error', 'errOccured', 'Wages cannot be greater than 300 thousand.'), threadID, messageID);
				break;
			}
			// if minimum wage was greater than maximum wage or equal
			if (min >= max) {
				api.sendMessage(textFormat('error', 'errOccured', 'Minimum wage cannot be greater than or equal to maximum wage.'), threadID, messageID);
				break;
			}
			
			settings.work_min_wage = min;
			settings.work_max_wage = max;
			api.sendMessage(textFormat('success', 'successfulFormat', `Economy wages has been set from ${currency}${min.toLocaleString('en-US')} to ${currency}${max.toLocaleString('en-US')}`), threadID, messageID);
			break;
			
		////// SET WORK COOLDOWN /////
		case 'work-cooldown':
			let seconds = (args.join(' ')).match(/\d+/g);
			if (!seconds) {
				api.sendMessage(textFormat('error', 'errOccured', 'Invalid input, cooldown must be a seconds.'), threadID, messageID);
				break;
			}
			const cooldown = parseInt(seconds[0]);
			const cdInText = global.secondsToDHMS(cooldown);
			settings.work_cooldown = cooldown * 1000;
			
			api.sendMessage(textFormat('success', 'successfulFormat', `Work command cooldown was set to: ${cdInText}.`), threadID, messageID);
			break;
			
		////// DEFAULT /////
		default:
			returns.invalid_usage();
			break;
	}
	
	await Threads.setData(threadID, { data: settings, economy });
}