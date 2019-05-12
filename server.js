const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt-nodejs');
const knex = require('knex');

const db = knex({
	client: 'pg',
	connection: {
		host: '127.0.0.1',
		user: 'postgres',
		password: 'admin',
		database: 'smart-brain-db'
	}
})

const app = express();

app.use(cors());
app.use(bodyParser.json());

// ROUTES
app.get('/', (req, res) => {
	const query = db.select('*').from('users').then(data=> res.json(data));
})

app.post('/signin', (req, res) => {
	const { email, password } = req.body
	db.select('email', 'has').from('login')
		.where('email', '=', email)
		.then( data => {
			const isValid = bcrypt.compareSync(password, data[0].has);
			if (isValid) {
				return db.select('*').from('users')
					.where('email', '=', email)
					.then( user => {
						if(user.length) {
							res.json(user);
						} else {
							res.status(400).json("Login Failed!")
						}
					})
			} else {
				res.status(400).json("Login Failed!")
			}
	})
		.catch( err => {
			res.status(400).json('Login Failed!')
		})
})

app.post('/register', (req, res) => {
	const { name, email, password } = req.body; 
	const hash = bcrypt.hashSync(password);
	db.transaction(trx => {
		trx.insert({
			has: hash,
			email: email
		})
		.into('login')
		.returning('email')
		.then( loginEmail => {
			return trx('users')
				.returning('*')
				.insert({
					name: name,
					email: loginEmail[0],
					joined: new Date()
				}).then( user => {
					res.json(user[0]);
				})
				.then(trx.commit)
				.catch(trx.rollback)
		})
	})
})

app.get('/profile/:id', (req, res) => {
	db.select('*').from('users').where({
		id: req.params.id
	}).then( user=> {
		if (user.length) {
			res.json(user[0]);
		} else {
			res.status(400).json('error getting user');
		}
	})
})

app.put('/image/:id', (req, res) => {
	db('users')
		.where('id', '=', req.params.id)
		.increment('entries', 1)
		.returning('*')
		.then( user => {
			if (user.length) {
				res.json(user[0]);
			} else {
				res.status(400).json('error incrementing count')
			}
		})
})

app.listen(3000, ()=> {
	console.log('Server is running on Port: 3000');
});