const { Sequelize, DataTypes } = require('sequelize');
const hääletus = require('../models/HÄÄLETUS');
const kasutajad = require('../models/KASUTAJAD');
require('dotenv/config');

class DB {
	constructor() {
		this.started = false;
		this.sequelize = new Sequelize({
			dialect: 'mysql',
			database: 'Vote_system',
			host: process.env.DB_HOST,
			username: process.env.DB_USER,
			password: process.env.DB_PASS,
		});
	}
	async start() {
		try {
			await this.sequelize.authenticate();
			this.started = true;
			console.log('Connection has been established successfully.');
		} catch (error) {
			console.error('Unable to connect to the database:', error);
		}
	}
	async getUser(username, password) {
		if (!this.started) {
			throw new Error('Database not started');
		}
		const voted = kasutajad(this.sequelize, DataTypes);
		return await voted.findOne({ where: { kasutajanimi: username, parool: password } });
	}
}

module.exports = DB;