const express = require('express');
const ejs = require('ejs');
const path = require('path');
const db = require('./util/db');
const database = new db();

const app = express();
const port = 3000;
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

(async () => {
	await database.start();
})();

app.get('/', (req, res) => {
	res.render('pages/login');
});

app.post('/login', async (req, res) => {
	const user = req.body.kasutajanimi;
	const password = req.body.parool;
	console.log('User:', user);
	console.log('Password:', password);
	try {

		const userData = await database.getUser(user, password);
		if (!userData) {
			return res.status(401).send('Invalid username or password');
		}
		res.redirect('/lobby');
	} catch (error) {
		console.error('Error during login:', error);
		res.status(500).send('Internal Server Error');
	}
});

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
