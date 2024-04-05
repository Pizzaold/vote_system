const express = require('express');
const ejs = require('ejs');
const path = require('path');

const app = express();
const port = 3000;
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
	res.render('pages/index');
});

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});