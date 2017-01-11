//MARK: - Import & Assets
const express = require('express');
const app = express();

const cors = require('cors');
const bodyParser = require('body-parser');

const fs = require('fs');

let statusEntries = [];
let tasksEntries = [];
let tasksTypes = ["hash-md5", "hash-sha256", "crack-md5"];


//MARK: - Setup
app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.listen(3000, () => {
    fs.readFile('./status_cache.json', (error, data) => {
        if(error) throw error;
        statusEntries = JSON.parse(data.toString('utf8'));
    });

    fs.readFile('./tasks_cache.json', (error, data) => {
        if(error) throw error;
        tasksEntries = JSON.parse(data.toString('utf8'));
    });
});


//MARK: - GET Request

/* request for STATUS */
app.get('/api/Status', (req, res) => {
    if(statusEntries instanceof Array) {
        res.send(JSON.stringify(statusEntries));
    }
});
app.get('/api/Status/:id', (req, res) => {
    if(statusEntries instanceof Array) {
        let requestedItem  = statusEntries.find((item) => {
            return item.id == req.params.id;
        });

        if(requestedItem !== undefined) {
            res.send(JSON.stringify(id));
        } 
        else {
            res.status(404);
            res.json( { code: 404, message: 'BAD REQUEST: Item with specified ID not present' } );
        }
    }
});

/* request for TASKS */
app.get('/api/Tasks', (req, res) => {
    if(tasksEntries instanceof Array) {
        res.send(JSON.stringify(tasksEntries));
    }
});
app.get('/api/Tasks/:id', (req, res) => {
    if(tasksEntries instanceof Array) {
        let requestedItem = tasksEntries.find((item) => {
            return item.id == req.params.id;
        });

        if(requestedItem !== undefined) {
            res.send(JSON.stringify(id));
        } 
        else {
            res.status(404);
            res.json( { code: 404, message: 'BAD REQUEST: Item with specified ID not present'} );
        }
    }
});


//MARK: - POST Request

/* request for STATUS */
app.post('/api/Status', (req, res) => {

    let targetedItem = statusEntries.find((item) => {
        return item.id == req.body.id;;
    });

    //Correct ID was passed
    if(targetedItem !== null) {
		//POST request must include status information, otherwise nothing can be updated
        if(req.body.status !== null) {

        	//Start task
            if(req.body.status === true) {
                targetedItem.workload = 1.0;
                targetedItem.task = 0;
            } 
            //Cease task
            else {
                targetedItem.workload = 0.0;
                targetedItem.task = 1;
            }

            //Save changes to file system
            fs.writeFile('./status_cache.json', JSON.stringify(statusEntries), (error) => {
            	if(error) {
                    res.status(500);
                    res.json( { code: 500, message: 'INTERNAL ERROR: An error occured on the server'} )
                    throw error;
                }
            });

            res.status(200);
            res.json({ code: 200, message: 'SUCCESS: Request was completed'});
        } 
        else {
            res.status(400);
            res.json( { code: 400, message: 'BAD REQUEST: No status information passed to server'} );
        }
    } 
    //No ID was passed
    else if(req.body.id === undefined) {
        res.status(400);
    	res.json({ code: 400, message: 'BAD REQUEST: No ID was passed with the request' });
    }
    //Wrong ID was passed
    else {
        res.status(404);
        res.json( { code: 404, message: 'BAD REQUEST: Item with specified ID does not exist' });
    }
});

/* request for TASKS */
app.post('/api/Tasks', (req, res) => {

    let isAllowedType = tasksTypes.contains((item) => {
        return item.type == req.body.type;
    });
	
	//POST request must include allowed type, otherwise nothing can be updated or added
    if(req.body.type === undefined) {
        res.status(400);
        res.json({ code: 400, message: 'BAD REQUEST: Missing type information in request' });
    } 
    else if(req.body.type !== undefined && !isAllowedType ) {
        res.status(400);
        res.json( { code: 400, message: 'BAD REQUEST: Udefined type information passed' } );
    }
    else {
        //POST request can modify a task or add a new task (latter case requires passing no ID)
        let targtedItem = tasksEntries.find((item) => {
            return item.id == req.body.id;
        });

        //Modify a current entry
        if(targtedItem !== undefined) {  
            tasksEntries[tasksEntries.indexOf(targtedItem)] = req.body;
            res.status(200);
            res.sjson( { code: 200, message: 'SUCCESS: Tasks item was modified successfully' } );
        }
        //Add a new entry (No ID was passed)
        else if(req.body.id === undefined) {
            tasksEntries.push(req.body);
            res.status(200);
            res.json( { code: 200, message: 'SUCCESS: Tasks item was added successfully' } );
        }
        //Wrong ID was passed
        else  {
            res.status(400);
            res.json( { code: 400, message: 'BAD REQUEST: Item with specified ID does not exist' } );
        }

        //Save changes to file system
        fs.writeFile('./tasks_cache.json', JSON.stringify(tasksEntries), (error) => {
            if(error) {
                res.status(500);
                res.json( { code: 500, message: 'INTERNAL ERROR: An error occured on the server'} )
                throw error;
            }
        });
    }
});