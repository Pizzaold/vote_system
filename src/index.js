const express = require('express');
const ejs = require('ejs');
const path = require('path');
const db = require('./util/db');
const session = require('express-session');
const database = new db();

const app = express();
const port = 3000;
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'views')));

app.use(session({
	secret: 'your_secret_key_here',
	resave: false,
	saveUninitialized: true,
	cookie: { secure: false },
}));


(async () => {
	await database.start();
	await database.initializeModels();
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
			// this need to be shown on the login page later :)
			return res.status(401).send('Invalid username or password');
		}
		req.session.user = userData;
		

		res.redirect('/lobby');
	} catch (error) {
		console.error('Error during login:', error);
		res.status(500).send('Internal Server Error');
	}
});

app.get('/lobby', async (req, res) => {
	if (!req.session.user) {
		return res.redirect('/');
	}
	const resultsData = await database.tulemusedModel.findOne({ order: [['h_alguse_aeg', 'DESC']] });
	const time = new Date(resultsData.h_alguse_aeg)
	res.render('pages/lobby', { time });
});

app.get('/voting', async (req, res) => {
	res.render('pages/voting');
});

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
