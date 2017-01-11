const crypto = require('crypto');

let tasks = [];
let completedTasks = [];

let tasksTypes = [ 'hash-md5', 'hash-sha256' ];

let postTasksData = function(data) {
	let xhr = new XMLHttpRequest();
	xhr.open('POST', 'http://localhost:3000/api/Reports', true);

	xhr.responseType = 'json';
	xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
	xhr.setRequestHeader('Token', '00530061006C00740079');

	xhr.send(JSON.stringify(data));

	xhr.onload = () => {
		return xhr.status;
	};
};

let start_stop_onButtonPress = function() {
	let state = $(this).text() !== 'Start';
	$(this).text(state ? 'Start' : 'Stop');

	if (state) {
        //Delete old data
		tasks = [];

        //Get new data
		getData('Tasks', 'id', (data) => {
			data.forEach((item) => {
				if (item.body.data.output === undefined) tasks.push(item);
			});
		});

		tasks.forEach((item) => {
			decrypt(item);
			refresh();
		});
	} else {
        //implement stopping
    }
};

let decrypt = function(item) {

	let isAllowedType = tasksTypes.includes(item.body.type);

	if (isAllowedType) {

		let template = Object.assign({ id: -1, type: '', data: { input: '' } }, item.body);
		let completedTask = JSON.parse(JSON.stringify(template));

		switch (item.body.type) {
			case "hash-md5": {
				let md5sum = crypto.createHash('md5');
				md5sum.update(item.body.data.input);
				completedTask.data.output = md5sum.digest('hex');
				break;
			}
			case "hash-sha256": {
				let sha256sum = crypto.createHash('sha256');
				sha256sum.update(item.body.data.input);
				completedTask.data.output = sha256sum.digest('hex');
				break;
			}
			default: {
				break;
			}
		}

		let responseStatus = postTasksData(completedTask);

		if (responseStatus === 200) {
			completedTask.sync = 'OK';
		} else {
			completedTask.sync = 'NOT OK';
		}

		completedTasks.push(completedTask);
	}
};

let refresh = function() {
	$("#BotModeTableToFill").html("");

	$("#BotModeTableToFill").html("<tr>" + completedTasks.map((val, index) => {
		return "<td>" + val.id + "</td><td>" + val.type + "</td><td>" + val.data.input + "</td><td>" + val.data.output + "</td><td>" + val.data.sync + "</td>";
	}).join("</tr><tr>") + "</tr>");
};

$(document).ready(() => {
	start_stop_onButtonPress();
});
