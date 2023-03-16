module.exports = function (input) {
	const force = false;

	const Users = require("./models/model_users")(input);
	const Threads = require("./models/model_threads")(input);
	const Banned = require("./models/model_banned")(input);
	
	Users.sync({ force });
	Threads.sync({ force });
	Banned.sync({ force });
	
	return {
		model: {
			Users,
			Banned,
			Threads
		},
		use: function (modelName) {
			return this.model[`${modelName}`];
		}
	}
}