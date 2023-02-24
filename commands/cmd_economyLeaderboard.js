//////// LEADERBOARD: GROUP ECONOMY FEATURE BY HADESTIA ///////

module.exports.config = {
	name: 'leaderboard',
	version: '1.0.1',
	hasPermssion: 0,
	commandCategory: 'economy',
	usages: '[ page number ]',
	description: 'View economy group LeaderBoard.',
	credits: 'Hadestia',
	cooldowns: 0,
	aliases: [ 'lb' ],
	envConfig: {
		requiredArgument: 0,
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
		const updatedEconomy = {};
		
		const requestPage = parseInt(args[0]) || 1;
		const itemPerPage = 10;
		const rankingInfo = [];
		
		let thisUserCurrentRank;
		let rankingMsg = '';

		for (const id in economy) {
			if (economy[id]) {
				const name = ((global.data.userName).has(id)) ? (global.data.userName).get(id) : 'Facebook User';
				const total = economy[id].bank + economy[id].hand;
				rankingInfo.push({ id, name, total });
				// use to remove left user and update the economy
				updatedEconomy[String(id)] = economy[id];
			}
		}
		
		await Threads.setData(threadID, { economy: updatedEconomy });
		// sort leaderboard top-lowest
		rankingInfo.sort((a, b) => {
			return (a.total < b.total) ? 1 : -1;
		});
	
		// get specific list for specific page.
		const totalPages = Math.ceil(rankingInfo.length/itemPerPage);
  	  const page = (requestPage > totalPages) ? 1 : requestPage;
   	 const pageSlice = itemPerPage * page - itemPerPage;
  	  const returnArray = rankingInfo.slice(pageSlice, pageSlice + itemPerPage);
	
		let index = pageSlice;
		let cIndex = 0;
		// loop again (TF im doing)
		// basically track requester current leaderboard position
		for (const data of rankingInfo) {
			cIndex += 1
			if (data.id == senderID) {
				const ordinals = this.getOrdinalPosition(cIndex);
				thisUserCurrentRank = await global.fancyFont.get(`${cIndex}${ordinals}`, 2);
			}
		}
	
		for (const data of returnArray) {
			index += 1;
			const number = await global.fancyFont.get(`${index}`, 1);
			rankingMsg += `${number}. ${((data.name).toLowerCase() == 'facebook user') ? data.name : ((data.name).split(' ')).shift()} • ${currency}${(data.total).toLocaleString('en-US')}\n`;
		}
	
		//const fontedThreadName = await global.fancyFont.get(threadData.threadName || '', 1);
		return api.sendMessage(
			textFormat('economy', 'cmdLeaderboard', rankingMsg, page, totalPages, thisUserCurrentRank || 'untracked'),
			threadID,
			messageID
		);
		
	} catch (err) {
		global.sendReaction.failed(api, event);
		global.logger(err, 'error');
		global.logModuleErrorToAdmin(err, __filename, event);
		return api.sendMessage(textFormat('error', 'errCmdExceptionError', err, Prefix), threadID, messageID);
	}
}


module.exports.getOrdinalPosition = function (pos) {
	if (pos <= 20) {
		return (pos == 1) ? 'st' : (pos == 2) ? 'nd' : (pos == 3) ? 'rd' : 'th';
	} else {
		const numberString = toString(pos);
		const endNum = parseInt(numberString.charAt(numberString.length - 1));
		return (endNum == 1) ? 'st' : (endNum == 2) ? 'nd' : (endNum == 3) ? 'rd' : 'th';
	}
}