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
    description: '\u0043\u0068\u0061\u0074 \u0077\u0069\u0074\u0068 \u0074\u0068\u0065 \u0062\u0065\u0073\u0074 \u0041\u0049 \u0043\u0068\u0061\u0074 \u002d \u0053\u0069\u006d\u0073\u0069\u006d\u0069 \u0062\u0079 \u004a\u006f\u0068\u006e \u0050\u0061\u0075\u006c \u0043\u0061\u0069\u0067\u0061\u0073',
    commandCategory: 'Chatbot',
    usages: '<message>',
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

module.exports.run = async function ({ api, event, args }) {
	
    const { threadID, messageID } = event;
	const f = (text) => api.sendMessage(text, threadID, messageID);
    
    if (args.length == 0) return f('\u26a0\ufe0f\u0059\u006f\u0075 \u0068\u0061\u0076\u0065 \u006e\u006f\u0074 \u0065\u006e\u0074\u0065\u0072\u0065\u0064 \u0074\u0068\u0065 \u006d\u0065\u0073\u0073\u0061\u0067\u0065');
    
    switch (args[0]) {
        case 'on':
        
            if (global.simsimi.has(threadID)) {
				f('\u26a0\ufe0f\u0059\u006f\u0075 \u0068\u0061\u0076\u0065 \u006e\u006f\u0074 \u0074\u0075\u0072\u006e\u0065\u0064 \u006f\u0066\u0066 \u0074\u0068\u0065 \u0073\u0069\u006d\u002e\n\n\u004d\u0061\u0064\u0065 \u0062\u0079\u003a \u004a\u006f\u0068\u006e \u0050\u0061\u0075\u006c \u0043\u0061\u0069\u0067\u0061\u0073');
			} else {
				global.simsimi.set(threadID, messageID);
				f('\u2705\u0053\u0075\u0063\u0063\u0065\u0073\u0073\u0066\u0075\u006c\u006c\u0079 \u0065\u006e\u0061\u0062\u006c\u0065\u0064 \u0073\u0069\u006d\u002e');
			}
            break;
        case 'off':
        
            if (global.simsimi.has(threadID)) {
				global.simsimi.delete(threadID);
				f('\u2705\u0054\u0068\u0065 \u0073\u0069\u006d \u0068\u0061\u0073 \u0062\u0065\u0065\u006e \u0073\u0075\u0063\u0063\u0065\u0073\u0073\u0066\u0075\u006c\u006c\u0079 \u0074\u0075\u0072\u006e\u0065\u0064 \u006f\u0066\u0066.');
			} else {
				f('\u26a0\ufe0f\u0059\u006f\u0075 \u0068\u0061\u0076\u0065 \u006e\u006f\u0074 \u0074\u0075\u0072\u006e\u0065\u0064 \u006f\u006e \u0074\u0068\u0065 \u0073\u0069\u006d\u002e\n\n\u004d\u0061\u0064\u0065 \u0062\u0079 \u004a\u006f\u0068\u006e \u0050\u0061\u0075\u006c \u0043\u0061\u0069\u0067\u0061\u0073');
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