/**
 * @author
 * @warn Do not edit code or edit credits
 * @apikey Reg key tại: https://meewmeew.info/site
 */
module.exports.config = {
    name: 'sim',
    version: '4.3.7',
    hasPermssion: 0,
    credits: 'ProcodeMew', //change api sim Hoang Giap
    description: 'Chat with simisimi or enable or disable auto sim.',
    commandCategory: 'Chatbot',
    usages: '<message | on | off >',
    cooldowns: 5,
    envConfig: {
    	requiredArgument: 1
    },
    dependencies: {
        axios: ''
    }
}


async function simsimi(a, b, c) {
    const d = global.nodemodule.axios;
	const g = (a) => encodeURIComponent(a);
    
    try {
    	
        var { data: j } = await d({ url: `https://api.simsimi.net/v2/?text=${g(a)}&lc=en&cf=false&name=Mei&key=C.IQHPE1cSfZFev-EhpwRbndXxcD9YGdTlbGReM`, method: 'GET' });
        return { error: !1, data: j }
        
    } catch (p) {
    	
        return { error: !0, data: {} }
        
    }
}

module.exports.onLoad = async function () {
	
    global.simsimi || (global.simsimi = new Map);
    
};

module.exports.handleEvent = async function ({ api, event }) {
	
    const { threadID, messageID, senderID, body } = event;
	const send = (text) => api.sendMessage(text, threadID, messageID);
	
	//console.log(body);
	
	// const bot = global.config.OTHERBOT;
  
    if (global.simsimi.has(threadID)) {
    	
        if (senderID == global.botUserID || body == '' || messageID == global.simsimi.get(threadID)) return;
        
        var { data, error } = await simsimi(body, api, event);
        
        return !0 == error ? void 0 : !1 == data.success ? send(data.error) : send(data.success)
    }
}

module.exports.run = async function ({ api, event, args, returns, textFormat }) {
	
    const { threadID, messageID } = event;
	const f = (text) => api.sendMessage(text, threadID, messageID);
    
    if (args.length == 0) return returns.invalid_usage();
    
    switch (args[0]) {
        case 'on':
        
            if (global.simsimi.has(threadID)) {
				f(textFormat('error', 'errOccured', 'Sim was already been set.'));;
			} else {
				global.simsimi.set(threadID, messageID);
				f(textFormat('success', 'successfulFormat', 'Sim has been turned on.\n\nNOTE:\nWhile being turned on, bot will respond to any messages in this thread and seems like a spam if this was a group chat.'));
			}
            break;
        case 'off':
        
            if (global.simsimi.has(threadID)) {
				global.simsimi.delete(threadID);
				f(textFormat('success', 'successfulFormat', 'Sim has been turned off.'));
			} else {
				f(textFormat('error', 'errOccured', 'Sim is not been set.'));
			}
            break;
        default:
            var { data, error } = await simsimi(args.join(' '), threadID, messageID);
            if (global.simsimi.has(threadID)) {
				
			}
            
            !0 == error ? void 0 : !1 == data.success ? f(data.error) : f(data.success);
            break; 
    }
    
};

//re-made by Mr.Aik3ro