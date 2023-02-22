//////// LEADERBOARD: GROUP ECONOMY FEATURE BY HADESTIA ///////

module.exports.config = {
	name: 'leaderboard',
	version: '1.0.0',
	hasPermssion: 0,
	commandCategory: 'economy',
	usages: '[ page number ]',
	description: 'View economy group LeaderBoard.',
	credits: 'Hadestia',
	cooldowns: 0,
	aliases: [ 'lb' ],
	envConfig: {
		requiredArgument: 0
	}
}

module.exports.run = async function ({ api, args, event, returns, textFormat, Prefix, Threads }) {
	
	const { threadID, messageID, senderID } = event;
	const threadData = await Threads.getData(threadID);
	const economy = threadData.economy;
	
	const currency = threadData.data.default_currency || economySystem.config.default_currency;
	
	const requestPage = parseInt(args[0]) || 1;
	const itemPerPage = 10;
	const rankingInfo = [];
	
	let thisUserCurrentRank;
	let rankingMsg = '';
	
	for (const id in economy) {
		const name = ((global.data.userName).has(id)) ? (global.data.userName).get(id) : 'Facebook User';
		const total = economy[id].bank + economy[id].hand;
		rankingInfo.push({ id, name, total });
	}
	// sort leaderboard top-lowest
	rankingInfo.sort((a, b) => {
		return (a.total > b.total) ? 1 : -1;
	});
	
	// get specific list for specific page.
	const totalPages = Math.ceil(rankingInfo.length/itemPerPage);
    const page = (requestPage > totalPages) ? 1 : requestPage;
    const pageSlice = itemPerPage * page - itemPerPage;
    const returnArray = rankingInfo.slice(pageSlice, pageSlice + itemPerPage);
	
	const index = pageSlice;
	// loop again (TF im doing)
	for (const data of returnArray) {
		index += 1;
		const number = await global.fancyFont.get(`${index}`, 1);
		rankingMsg += `${number}. ${((data.name).split(' ')).pop()} • ${currency}${data.total}\n`;
		if (data.id == senderID) {
			const ordinals = (index == 1) ? 'st' : (index == 2) ? 'nd' : (index == 3) ? 'rd' : 'th';
			thisUserCurrentRank = await global.fancyFont.get(`${number}${ordinals}`, 2);
		}
	}
	
	//const fontedThreadName = await global.fancyFont.get(threadData.threadName || '', 1);
	return api.sendMessage(
		textFormat('economy', 'cmdLeaderboard', rankingMsg, page, totalPages, thisUserCurrentRank || 'untracked'),
		threadID,
		messageID
	);
}
