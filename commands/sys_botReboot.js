module.exports.config = {
	name: 'reboot',
	version: '1.0.6',
	hasPermssion: 2,
	description: 'restart this bot.',
	commandCategory: 'system',
	usage: '',
	cooldowns: 60,
	credits: 'Hadestia'
}

module.exports.run = function ({ api, args, event, textFormat, Threads }) {
	
	const { spawn } = require('child_process');
	const { threadID, messageID } = event;
	const logger = require(`../../utils/log.js`);
	
	const response = textFormat('system', 'botReboot');
	
	async function updateResource(err, info) {
		
		if (err) {
			logger(`botReboot.js  ${err}`, 'error');
			return api.sendMessage(textFormat('system', 'botRebootError'), threadID, messageID);
		}
		
		const assetSession = await spawn("node", ["--trace-warnings", "--async-stack-traces", "../../assets.js"], {
			cwd: __dirname,
	    	stdio: "inherit",
	    	shell: true
		});
	
		assetSession.on("error", function(error) {
	   	logger("An error occurred: " + JSON.stringify(error), 'error');
		});

    	assetSession.on('close', function () {
			process.exit(1);
		});
	}
	
	return api.sendMessage(
		response,
		threadID,
		updateResource,
		messageID
	);
}