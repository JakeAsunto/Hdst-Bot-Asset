module.exports = function({ api, models, Utils, Users, Threads, Banned }) {
	
    return async function({ event }) {
    	
    	const threadData = await Threads.getData(threadID);

        const { allowInbox } = global.HADESTIA_BOT_CONFIG;

        const { commands, handleReply, messageReplyRegistered } = global.HADESTIA_BOT_CLIENT;

        const { body, messageID, senderID, threadID, messageReply } = event;
        
        const threadSetting = (threadData) ? threadData.data : {};
        
        const botPrefix = (threadSetting.hasOwnProperty('PREFIX')) ? threadSetting.PREFIX : global.HADESTIA_BOT_CONFIG.PREFIX;
        
        // do not track replies from command that has handleReply event && replies that has bot prefix
        if ((handleReply.findIndex(e => e => e.messageID == messageReply.messageID)) !== -1 || body.startsWith(botPrefix)) return;
		
        for (const mrReg of messageReplyRegistered) {

            const command = commands.get(mrReg);

            try {

                const Obj = {};

                Obj.api = api;
                
                Obj.event = event;

                Obj.models = models;
                
                Obj.Utils = Utils;

                Obj.Users = Users;
                
                Obj.Banned = Banned;

                Obj.Threads = Threads;

                Obj.getText = Utils.getModuleText(command, event);

                if (cmd) cmd.handleMessageReply(Obj);

            } catch (error) {

                Utils.logger(global.getText('handleCommandEvent', 'moduleError', cmd.config.name), 'error');

            }

        }

    };

};