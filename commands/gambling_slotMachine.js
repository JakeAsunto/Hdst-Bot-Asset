module.exports.config = {
    name: 'slot-machine',
    version: '1.0.0',
    hasPermssion: 0,
    credits: 'Mirai Team, beautify by Hadestia',
    description: 'An easy gambling game to earn more money.',
    commandCategory: 'gambling',
    usages: '< bet >',
    aliases: [ 'slot' ],
    cooldowns: 5,
    disabled: true,
    envConfig: {
		groupCommandOnly: true
	}
};

/*module.exports.languages = {
    "vi": {
        "missingInput": "[ SLOT ] Số tiền đặt cược không được để trống hoặc là số âm",
        "moneyBetNotEnough": "[ SLOT ] Số tiền bạn đặt lớn hơn hoặc bằng số dư của bạn!",
        "limitBet": "[ SLOT ] Số coin đặt không được dưới 50$!",
        "returnWin": "🎰 %1 | %2 | %3 🎰\nBạn đã thắng với %4$",
        "returnLose": "🎰 %1 | %2 | %3 🎰\nBạn đã thua và mất %4$"
    },
    "en": {
        "missingInput": "[ SLOT ] The bet money must not be blank or a negative number",
        "moneyBetNotEnough": "[ SLOT ] The money you betted is bigger than your balance!",
        "limitBet": "[ SLOT ] Your bet is too low, the minimum is 50$",
        "returnWin": "🎰 %1 | %2 | %3 🎰\nYou won with %4$",
        "returnLose": "🎰 %1 | %2 | %3 🎰\nYou lost and loss %4$"
    }
}*/

module.exports.run = async function({ api, event, args, returns, textFormat, Prefix }) {
	
    const { threadID, messageID, senderID } = event;
    const Gambling = require(`${global.client.mainPath}/json/textFormat.json`).gamblingSystem;
    const economySystem = require(`${global.client.mainPath}/json/economySystem.json`);
    
    const message = (msg) => { api.sendMessage(msg, threadID, messageID) };
    const minimumBet = 100;
    
    let bet = ((args.join(' ')).match(/\d+/))
    if (!bet || parseInt(bet[0]) == 0) {
    	returns.remove_usercooldown();
    	return message(textFormat('gamblingSystem', 'errInvalidAmountOfBet'));
    }
    // Get user economy
    try {
    	
    	const slotItems = Gambling.slotItems;
    	const threadData = await Threads.getData(threadID);
		const economy = threadData.economy;
		
		const moneyOnHand = economy[senderID].hand;
		const currency = threadData.data.default_currency || economySystem.config.default_currency;
		
		let betAmount = Math.abs(parseInt(bet[0]));
		// money not enough
		if (betAmount < minimumBet) {
    		returns.remove_usercooldown();
	    	return message(textFormat('error', 'errOccured', `Not enough amount of bet, the minimum bet for this game was ${currency}100.`));
  	  } else if (moneyOnHand < betAmount) {
			returns.remove_usercooldown();
			return message(textFormat('error', 'errOccured', `You currently have ${currency}${moneyOnHand} on hand.`));
		}
		
		var number = [], win = false;
		
		for (i = 0; i < 3; i++) {
			number[i] = Math.floor(Math.random() * slotItems.length);
		}
		
 	   if (number[0] == number[1] && number[1] == number[2]) {
      	  betAmount *= 9;
        	win = true;
  	  } else if (number[0] == number[1] || number[0] == number[2] || number[1] == number[2]) {
        	betAmount *= 2;
       	 win = true;
   	 }
   
   	 switch (win) {
        	case true: {
        		economy[senderID].hand += betAmount;
        		message(textFormat('gamblingSystem', 'slotResult', slotItems[number[0]], slotItems[number[1]], slotItems[number[2]], `Congratulations, You won ${currency}${betAmount}.`));
           	 break;
       	 }
     	   case false: {
          	  economy[senderID].hand -= betAmount;
				message(textFormat('gamblingSystem', 'slotResult', slotItems[number[0]], slotItems[number[1]], slotItems[number[2]], `Sorry, You loss ${currency}${betAmount}. Better luck next time.`));
            	break;
        	}
    	}
    	await Threads.setData(threadID, { economy });
    	return;
    } catch (err) {
    	returns.remove_usercooldown();
		global.sendReaction.failed(api, event);
		global.logger(err, 'error');
		global.logModuleErrorToAdmin(err, __filename, event);
		return message(textFormat('error', 'errCmdExceptionError', err, Prefix));
    }
}
