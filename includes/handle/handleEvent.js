module.exports = function({ api, models, Utils, Users, Threads, Banned }) {
	
    const moment = require("moment");

    return function({ event, groupData, bannedUserData, bannedGroupData }) {

        const timeStart = Date.now()

        const time = moment.tz("Asia/Manila").format("HH:MM:ss L");

		const { allowInbox, DeveloperMode } = global.HADESTIA_BOT_CONFIG;

        const { events } = global.HADESTIA_BOT_CLIENT;

        var { senderID, threadID } = event;

        senderID = String(senderID);
        threadID = String(threadID);
        
        // Group Banned? User Banned? Is PM?
        if (bannedUserData || bannedGroupData || !allowInbox && senderID == threadID) return;

        for (const [key, value] of events.entries()) {
			
			const evn = value.config.eventType
			const envConfig = value.config.envConfig || {};
			const needData = envConfig.needsDataFetching && !groupData;
			
            if (evn.indexOf(event.logMessageType) !== -1 && !needData) {

                const eventRun = events.get(key);

                try {

                    const Obj = {};

                    Obj.api = api;

                    Obj.event = event;

                    Obj.models = models;
                    
                    Obj.Utils = Utils;

                    Obj.Users = Users;

					Obj.Banned = Banned;

                    Obj.Threads = Threads;
                    
                    Obj.GroupData = groupData;
                    
                    Obj.getText = Utils.getModuleText(eventRun, event);

                    eventRun.run(Obj);

                    if (DeveloperMode) {
                        Utils.logger(Utils.getText('handleEvent', 'executeEvent', time, eventRun.config.name, threadID, Date.now() - timeStart), '[ Event ]');
                    }

                } catch (error) {
					
                    Utils.logger(Utils.getText('handleEvent', 'eventError', eventRun.config.name, JSON.stringify(error)), "error");

                }

            }

        }

        return;

    };

}