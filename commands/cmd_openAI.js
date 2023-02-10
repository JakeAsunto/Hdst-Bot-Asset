module.exports.config = {
	name: 'openai',
	version: '2.0.10',
	hasPermssion: 0,
	credits: 'Hadestia',
	description: 'a ChatGPT3 base AI.',
	commandCategory: 'artificial intelligence',
	usages: '< prompt (that is not a single word) >',
	aliases: [ 'ai', 'aoi' ],
	cooldowns: 10,
	dependencies: {
        'openai': ''
    },
    envConfig: {
    	requiredArgument: 2
   }
}

module.exports.run = async function({ api, event, args, textFormat }) {

	const { Configuration, OpenAIApi } = require('openai');
	const configuration = new Configuration({ apiKey: process.env.OPENAI_API });
  
	const openai = new OpenAIApi(configuration);

	try {
		global.sendReaction.inprocess(api, event);
		const completion = await openai.createCompletion({
        	model: 'text-davinci-003',
            prompt: args.join(' '),
            temperature: 0.3,
            max_tokens: 1000,
            frequency_penalty: 0.3,
            presence_penalty: 0.5
        });
        
		api.sendMessage(
			completion.data.choices[0].text,
			event.threadID,
			(err) => {
				if (err) return global.sendReaction.failed(api, event);;
				global.sendReaction.success(api, event);
			},
			event.messageID
		);
	} catch (error) {
		
		if (error.response) {
        	console.log(error.response.status);
            console.log(error.response.data);
        } else {
        	console.log(error.message);
        	global.sendReaction.failed(api, event);
            api.sendMessage(textFormat('error', 'errCmdExceptionError', err, global.config.PREFIX), event.theadID, event.messageID);
        }
        
	}
}