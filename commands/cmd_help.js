 module.exports.config = {
	name: 'help',
	version: '1.1.4',
	hasPermssion: 0,
	credits: 'Hadestia',
	description: 'A guide for commands',
	commandCategory: 'system',
	usages: '[ all | usage | <module name> | <page number> ]',
	cooldowns: 5,
	aliases: [ 'menu', 'start' ],
	envConfig: {
		autoUnsend: true,
		delayUnsend: 180,
		requiredArgument: 0
	}
};

module.exports.run = async function({ api, event, args, textFormat }) {
	
	const { commands, commandAliases } = global.client;
	const { threadID, messageID } = event;
	const command = commands.get((commandAliases.get(args[0]) || args[0] || '').toLowerCase());
	const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};
	
	const prefix = (threadSetting.hasOwnProperty('PREFIX')) ? threadSetting.PREFIX : global.config.PREFIX;
	
	async function autoUnsent(err, info) {
		if (err) throw err;
		
		const { autoUnsend, delayUnsend } = module.exports.config.envConfig;
		
		if (autoUnsend) {
			await new Promise(resolve => setTimeout(resolve, delayUnsend * 1000));
			return api.unsendMessage(info.messageID);
		}
		return;
	}
	
	if (args.join().indexOf('usage') == 0) {
		return api.sendMessage(textFormat('cmd', 'cmdHelpUsageSyntax'), threadID, messageID);
	}
	
	
	if (args.join().indexOf('all') == 0) {
			
		const group = [];
		let messageListBody = '';
		let totalCat = 0, totalCmd = 0;
			
		for (const cmd of commands.values()) {
			
			const cat = (cmd.config.commandCategory).toLowerCase()
			if (cat !== 'hidden') {
				if (!group.some(item => item.group.toLowerCase() == cat)) {
					group.push({ group: cat, cmds: [cmd.config.name] });
				} else {
					if (!cmd.config.hidden) {
						group.find(item => item.group.toLowerCase() == cmd.config.commandCategory.toLowerCase()).cmds.push(cmd.config.name);
					}
				}
			}
		}
		
		group.sort((a, b) => {
			return (a.group > b.group) ? 1 : -1;
		});
			
		group.forEach(function (cmdGroupItem) {
			
			totalCat += 1;
			totalCmd += cmdGroupItem.cmds.length;
			
			const name = await global.fancyFont.get(cmdGroupItem.group.charAt(0).toUpperCase() + cmdGroupItem.group.slice(1), 2);
			const cmds = cmdGroupItem.cmds.join(' • ');
				
			const body = textFormat('cmd', 'cmdListCategoryCmd', name, cmds);
			messageListBody = messageListBody + body + '\n\n';
		});
			
		const messageBody = textFormat('cmd', 'cmdListCategoryFormat', messageListBody, totalCat, totalCmd);
			
		return api.sendMessage(messageBody, threadID, autoUnsent, messageID);
	}
    
	// shows all brief list of commands
	if (!command) {
		
		const arrayInfo = [];
        const itemPerPage = 5;
        const requestPage = parseInt(args[0]) || 1;
        
        let index = 0;
        
        for (const [ name, value ] of (commands)) {
        	const cmd = commands.get(name);
        	const cat = (cmd.config.commandCategory).toLowerCase();
        	if (cat != 'hidden' && !cmd.config.hidden) {
        		arrayInfo.push(name);
			}
        }
        
        arrayInfo.sort((a, b) => a.data - b.data);
        
        const totalPages = Math.ceil(arrayInfo.length/itemPerPage);
        const page = (requestPage > totalPages) ? 1 : requestPage;
        const pageSlice = itemPerPage * page - itemPerPage;
        const returnArray = arrayInfo.slice(pageSlice, pageSlice + itemPerPage);

        let messageListBody = '';
        
        index = pageSlice;
        
        for (let item of returnArray) {
        	index += 1;
			const cmdName = commands.get(item).config.name;
			const cmdDesc = commands.get(item).config.description;
			
        	const body = textFormat('cmd', 'cmdListCmd', index, prefix, cmdName, cmdDesc);
        	messageListBody = messageListBody + body + '\n\n';
        
        }
        
        const messageBody = textFormat('cmd', 'cmdListFormat', messageListBody, page, totalPages, prefix);
        
        return api.sendMessage(messageBody, threadID, autoUnsent, messageID);
        
	}
	
	// command = module + help: show command info
		
	const permssion = textFormat('system', `perm${command.config.hasPermssion || 0}`);
	const commandUsage = `${prefix}${command.config.name} ${command.config.usages || ''}`;
	const cooldown = (command.config.cooldowns && command.config.cooldowns > 1) ? `${command.config.cooldowns} seconds` : 'no cooldown';
	const commandReplyUsage = (command.config.replyUsages) ? `\n● usage reply:\n${command.config.replyUsages}` : '';
	const commandName = await global.fancyFont.get(command.config.name, 1);
	
	const messageBody = textFormat(
		'cmd', 'cmdShowInfo',
		`${prefix}${commandName}`,
		command.config.description,
		commandUsage,
		commandReplyUsage,
		command.config.commandCategory,
		cooldown,
		permssion,
		(command.config.aliases) ? `\n[ ${command.config.aliases.join(', ')} ]` : 'none',
		command.config.credits || 'ctto'
	);
		
	return api.sendMessage( messageBody, threadID, autoUnsent, messageID);
}