module.exports = function (input) {
	const force = false;

	const Users = require("./models/model_users")(input);
	const Threads = require("./models/model_threads")(input);
	
	Users.sync({ force });
	Threads.sync({ force });

	return {
		model: {
			Users,
			Threads
		},
		use: function (modelName) {
			return this.model[`${modelName}`];
		}
	}
}