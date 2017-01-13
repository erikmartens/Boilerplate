//MARK: - Import & Assets

const express = require('express');
const server = express();

const cors = require('cors');
const bodyParser = require('body-parser');

const fs = require('fs');

let statusEntries = [];
let tasksEntries = [];
let tasksTypes = [ 'hash-md5', 'hash-sha256', 'crack-md5' ];

const teamToken = '00530061006C00740079';


//MARK: - Setup

server.use(cors());
server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());

server.listen(3000, () => {
	fs.readFile('./status_cache.json', (error, data) => {
		if (error) throw error;
		statusEntries = JSON.parse(data.toString('utf8'));
	});

	fs.readFile('./tasks_cache.json', (error, data) => {
		if (error) throw error;
		tasksEntries = JSON.parse(data.toString('utf8'));
	});
});


//MARK: - GET Request

/* request for STATUS */

server.get('/api/Status', (req, res) => {
	if (statusEntries instanceof Array) {
		res.send(JSON.stringify(statusEntries));
	}
});
server.get('/api/Status/:id', (req, res) => {
	if (statusEntries instanceof Array) {
		let requestedItem  = statusEntries.find((item) => {
			return item.id === req.params.id;
		});

		if (requestedItem !== undefined) {
			res.send(JSON.stringify(requestedItem));
		} else {
			res.status(404);
			res.json({ code: 404, message: 'BAD REQUEST: Item with specified ID not present' });
		}
	}
});

/* request for TASKS */

server.get('/api/Tasks', (req, res) => {
	if (tasksEntries instanceof Array) {
		res.send(JSON.stringify(tasksEntries));
	}
});
server.get('/api/Tasks/:id', (req, res) => {
	if (tasksEntries instanceof Array) {
		let targetedItem = tasksEntries.find((item) => {
			return item.id === req.params.id;
		});

		if (targetedItem !== undefined) {
			res.send(JSON.stringify(targetedItem));
		} else {
			res.status(404);
			res.json({ code: 404, message: 'BAD REQUEST: Item with specified ID not present' });
		}
	}
});


//MARK: - POST Request

/* request for STATUS */

server.post('/api/Status', (req, res) => {
	if (teamToken === req.get('Token')) {
		let targetedItem = statusEntries.find((item) => {
			return item.id === req.body.id;
		});

    //Correct ID was passed
		if (targetedItem !== undefined) {
		//POST request must include status information, otherwise nothing can be updated
			if (req.body.status !== null) {

				if (req.body.status === true) {
				//Start task
					targetedItem.workload = 1;
					targetedItem.task = 0;
				} else {
				//Cease task
					targetedItem.workload = 0;
					targetedItem.task = 1;
				}

            //Save changes to file system
				fs.writeFile('./status_cache.json', JSON.stringify(statusEntries), (error) => {
					if (error) {
						res.status(500);
						res.json({ code: 500, message: 'INTERNAL ERROR: An error occured on the server' });
						throw error;
					}
				});

				res.status(200);
				res.json({ code: 200, message: 'SUCCESS: Request was completed' });
			} else {
				res.status(400);
				res.json({ code: 400, message: 'BAD REQUEST: No status information passed to server' });
			}
		} else if (req.body.id === undefined) { //No ID was passed
			res.status(400);
			res.json({ code: 400, message: 'BAD REQUEST: No ID was passed with the request' });
		} else { //Wrong ID was passed
			res.status(404);
			res.json({ code: 404, message: 'BAD REQUEST: Item with specified ID does not exist' });
		}
	} else {
		res.status(400);
		res.json({ code: 400, message: 'BAD REQUEST: Token does not check out' });
	}
});

/* request for TASKS */

server.post('/api/Tasks', (req, res) => {
	if (teamToken === req.get('Token')) {
		let isAllowedType = tasksTypes.includes(req.body.type);

		//Sort tasks
		tasksEntries.sort((a, b) => {
			if (a.id < b.id) return -1;
			if (a.id > b.id) return  1;
			return 0;
		});

		let next_id = tasksEntries[tasksEntries.length - 1].id + 1;

		//POST request must include allowed type, otherwise nothing can be updated or added
		if (req.body.type === undefined) {
			res.status(400);
			res.json({ code: 400, message: 'BAD REQUEST: Missing type information in request' });
		} else if (req.body.type !== undefined && !isAllowedType) {
			res.status(400);
			res.json({ code: 400, message: 'BAD REQUEST: Undefined type information passed' });
		} else {
			//POST request can modify a task or add a new task (latter case requires passing no ID)
			let targtedItem = tasksEntries.find((item) => {
				return item.id === req.body.id;
			});

			let template = Object.assign({ id: -1, type: '', data: { input: '' } }, req.body);
			let task = JSON.parse(JSON.stringify(template));

			
			if (targtedItem !== undefined) {
				console.log(req.body.remove);
				console.log(req.body.id);
				if (req.body.remove === true) {
					console.log('remove');
					//Remove an entry
					let index = tasksEntries.indexOf(targtedItem);

					if (index > -1) {
    					tasksEntries.splice(index, 1);
					}

					res.status(200);
					res.json({ code: 200, message: 'SUCCESS: Tasks item was removed successfully' });

				} else { //req.body.remove will be undefined
					//Modify a current entry
					tasksEntries[tasksEntries.indexOf(targtedItem)] = task;
				
					res.status(200);
					res.json({ code: 200, message: 'SUCCESS: Tasks item was modified successfully' });
				}
			} else if (req.body.id === undefined) { //Add a new entry (No ID was passed)
				task.id = next_id;
				tasksEntries.push(task);

				res.status(200);
				res.json({ code: 200, message: 'SUCCESS: Tasks item was added successfully' });
			} else  { //Wrong ID was passed
				res.status(400);
				res.json({ code: 400, message: 'BAD REQUEST: Item with specified ID does not exist' });
			}

			//Save changes to file system
			fs.writeFile('./tasks_cache.json', JSON.stringify(tasksEntries), (error) => {
				if (error) {
					res.status(500);
					res.json({ code: 500, message: 'INTERNAL ERROR: An error occured on the server' });
					throw error;
				}
			});
		}
	} else {
		res.status(404);
		res.json({ code: 404, message: 'BAD REQUEST: Token does not check out' });
	}
});

/* request for REPORT */

server.post('/api/Reports', (req, res) => {
	if (tasksEntries instanceof Array) {
		let targtedItem = tasksEntries.find((item) => {
			return item.id === req.body.id;
		});

		if (targtedItem !== undefined) {
			if (targtedItem.data.output === undefined) {
				let template = Object.assign({ id: -1, type: '', data: { input: '', output: '' } }, req.body);
				let task = JSON.parse(JSON.stringify(template));
				tasksEntries[tasksEntries.indexOf(targtedItem)] = task;

				res.status(200);
				res.json({ code: 200, message: 'OK: Item with specified ID was updated' });
			} else {
				res.status(304);
				res.json({ code: 304, message: 'NOT MODIFIED: Item was already updated previously' });
			}
		} else {
			res.status(404);
			res.json({ code: 404, message: 'BAD REQUEST: Item with specified ID not present' });
		}

		//Save changes to file system
		fs.writeFile('./tasks_cache.json', JSON.stringify(tasksEntries), (error) => {
			if (error) {
				res.status(500);
				res.json({ code: 500, message: 'INTERNAL ERROR: An error occured on the server' });
				throw error;
			}
		});
	}
});
