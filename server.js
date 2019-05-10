const express       = require('express');
const bodyParser = require('body-parser');
const cors              = require('cors');
const bcrypt           = require('bcrypt-nodejs');

const app = express();
const db = {
	users: [
		{
			id: '123',
			name: 'John',
			email: 'john@doe.com',
			password: 'cookies',
			entries: 0,
			joined: new Date()
		},
		{
			id: '124',
			name: 'Sally',
			email: 'Sally@doe.com',
			password: 'cream',
			entries: 0,
			joined: new Date()
		},
	],
	login: [
		{
			id: '987',
			hash: '',
			email: '',
		}
	]
}

app.use(cors());
app.use(bodyParser.json());

// ROUTES
app.get('/', (req, res) => {
	res.json(db.users)
})

app.post('/signin', (req, res) => {
	const { email, password } = req.body
	let found = false;

	db.users.forEach( user => {
		if ( email === user.email && password === user.password  ) {
			found = true;
			return res.json(user);
		} 
	})

	if (!found) {
		res.status(403).json("Login information Incorrect");
	}
})

app.post('/register', (req, res) => {
	const { name, email, password } = req.body; 
	db.users.push({
		id: '125',
		name: name,
		email: email,
		password: password,
		entries: 0,
		joined: new Date()
	})
	res.json(db.users[db.users.length-1]);
})

app.get('/profile/:id', (req, res) => {
	const { id }= req.params;
	let found = false;

	db.users.forEach( user => {
		if ( user.id === id ) {
			found = true;
			return res.json(user);
		} 
	})

	if (!found) {
		res.status(404).json("No such user");
	}
})

app.put('/image/:id', (req, res) => {
	const { id } = req.params;
	let found = false;

	db.users.forEach( user => {
		if ( user.id === id ) {
			found = true;
			user.entries++;
			return res.json(user);
		} 
	})

	if (!found) {
		res.status(404).json("No such user");
	}
})

app.listen(3000, ()=> {
	console.log('Server is running on Port: 3000');
});