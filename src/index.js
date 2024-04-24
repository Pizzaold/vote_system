const express = require('express');
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

app.get('/', async (req, res) => {
	if (!req.session.user) {
		return res.redirect('/login');
	} else {
		res.redirect('/lobby');
	}
});

app.get('/voting-start-time', async (req, res) => {
	try {
		const resultsData = await database.tulemusedModel.findOne({ order: [['h_alguse_aeg', 'DESC']] });
		const startTime = new Date(resultsData.h_alguse_aeg).getTime() + new Date().getTimezoneOffset();
		res.json({ startTime });
	} catch (error) {
		console.error('Error retrieving voting start time:', error);
		res.status(500).send('Internal Server Error');
	}
});

app.get('/admin', async (req, res) => {
	const user = req.session.user;
	if (!user || user.id !== 12) {
		return res.redirect('/');
	}
	try {
		const logiData = await database.LogiModel.findAll({
			order: [['tegevus_aeg', 'DESC']],
		});
		const tulemusedData = await database.tulemusedModel.findAll({
			order: [['h_alguse_aeg', 'DESC']],
		});
		res.render('pages/admin', { logiData, tulemusedData });
	} catch (error) {
		console.error('Error fetching data:', error);
		res.status(500).send('Internal Server Error');
	}
});


app.post('/admin/add-voting-time', async (req, res) => {
	const user = req.session.user;
	if (!user || user.id !== 12) {
		return res.redirect('/');
	}

	const { startDate, startTime } = req.body;
	const newVotingTime = `${startDate} ${startTime}`;
	console.log('New voting time:', newVotingTime);

	try {
		await database.addNewVotingTime(newVotingTime);
		res.redirect('/admin');
	} catch (error) {
		console.error('Error adding new voting time:', error);
		res.status(500).send('Internal Server Error');
	}
});

app.post('/login', async (req, res) => {
	const user = req.body.kasutajanimi;
	const password = req.body.parool;
	try {
		const userData = await database.getUser(user, password);
		console.log('User data:', userData);
		if (!userData) {
			return res.render('pages/login', { error: 'Invalid username or password' });
		}
		req.session.user = userData;
		if (userData.id === 12) {
			console.log('Redirecting to admin page...');
			return res.redirect('/admin');
		}
		console.log('Redirecting to lobby page...');
		res.redirect('/lobby');
	} catch (error) {
		console.error('Error during login:', error);
		res.status(500).send('Internal Server Error');
	}
});

app.get('/logout', (req, res) => {
	req.session.destroy(err => {
		if (err) {
			return res.redirect('/');
		}

		res.clearCookie('connect.sid', { path: '/' });
		res.redirect('/login');
	});
});


app.get('/login', (req, res) => {
	res.render('pages/login', { error: null });
});


app.get('/lobby', async (req, res) => {
	if (!req.session.user) {
		return res.redirect('/');
	}
	const user = req.session.user;
	const voted = await database.checkIfVoted(user);
	const resultsData = await database.tulemusedModel.findOne({ order: [['h_alguse_aeg', 'DESC']] });
	if (resultsData == null) {
		return res.render('pages/lobby', { time: null, voted });
	}
	const time = new Date(resultsData.h_alguse_aeg).getTime() + new Date().getTimezoneOffset();
	console.log('Time:', time);
	res.render('pages/lobby', { time, voted });
});

app.get('/check-voting-status', async (req, res) => {
	const user = req.session.user;
	if (!user) {
		return res.status(401).json({ error: 'User not authenticated' });
	}
	try {
		const votingEnded = await database.checkIfVoted(user);
		res.json({ voted: votingEnded });
	} catch (error) {
		console.error('Error checking voting status:', error);
		res.status(500).send('Internal Server Error');
	}
});

app.get('/voting', async (req, res) => {
	try {
		const user = req.session.user;
		if (user.id === 12) {
			return res.redirect('/admin');
		}
		const resultsData = await database.tulemusedModel.findOne({ order: [['h_alguse_aeg', 'DESC']] });
		const startTime = new Date(resultsData.h_alguse_aeg).getTime() + new Date().getTimezoneOffset() * 60000;
		const votingStartTime = new Date() - startTime;
		if (votingStartTime <= 0) {
			return res.redirect('/lobby');
		}
		if (!user) {
			return res.redirect('/');
		}
		const votingEnded = await database.checkIfVoted(user);
		if (votingEnded) {
			return res.redirect('/lobby');
		}
		res.render('pages/voting');
	} catch (error) {
		console.error('Error during voting:', error);
		res.status(500).send('Internal Server Error');
	}
}).post('/voting', async (req, res) => {
	const user = req.session.user;
	if (!user) {
		return res.status(401).json({ error: 'User not authenticated' });
	}
	const { otsus } = req.body;
	try {
		await database.voteAction(user.id, otsus);
		res.render('pages/voting', { user_voted: true, user_choice: otsus });
	} catch (error) {
		console.error('Error logging action:', error);
		res.status(500).send('Internal Server Error');
	}
});

app.post('/mark-all-users-as-voted', async (req, res) => {
	try {
		await database.markAllUsersAsVoted();
		res.sendStatus(200);
	} catch (error) {
		console.error('Error marking all users as voted:', error);
		res.sendStatus(500);
	}
});

app.post('/count-votes', async (req, res) => {
	try {
		const votes = await database.countVotes();
		await database.updateTulemused(votes);

		res.sendStatus(200);
	} catch (error) {
		console.error('Error counting votes:', error);
		res.status(500).send('Internal Server Error');
	}
});

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
