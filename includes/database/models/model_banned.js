module.exports = function({ sequelize, Sequelize }) {
	let Banned = sequelize.define('Banned', {
		num: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		ID: {
			type: Sequelize.STRING,
			unique: true
		},
		data: {
			type: Sequelize.JSON 
		}
	});

	return Banned;
}