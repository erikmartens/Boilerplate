const crypto = require('crypto');

let tasks = [];
let completedTasks = [];

let tasksTypes = [ 'hash-md5', 'hash-sha256' ];

let postEncryptedTasksData = (data, callback) => {
	let xhr = new XMLHttpRequest();
	xhr.open('POST', 'http://localhost:3000/api/Reports', true);

	xhr.responseType = 'json';
	xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
	xhr.setRequestHeader('Token', '00530061006C00740079');

	xhr.onload = () => {
		if (typeof (callback) === "function") {
			callback(xhr.status);
		}
	};

	xhr.send(JSON.stringify(data));
};

let start_stop_onButtonPress = () => {
	let button = $("#SectionReports").find("#toggleEncryptButton");

	let state = button.text() === 'Start';
	button.text(state ? 'Stop' : 'Start');

	if (state) {
        //Delete old data
		tasks = [];

        //Get new data
		getData('Tasks', 'id', (data) => {
			tasks = data;
			tasks.forEach((item) => {
				encrypt(item);
			});
		});
	}
};

let encrypt = (item) => {
	let isAllowedType = tasksTypes.includes(item.type);

	if (isAllowedType) {

		let template = Object.assign({ id: -1, type: '', data: { input: '' } }, item);
		let completedTask = JSON.parse(JSON.stringify(template));

		switch (item.type) {
			case "hash-md5": {
				let md5sum = crypto.createHash('md5');
				md5sum.update(item.data.input);
				completedTask.data.output = md5sum.digest('hex');
				break;
			}
			case "hash-sha256": {
				let sha256sum = crypto.createHash('sha256');
				sha256sum.update(item.data.input);
				completedTask.data.output = sha256sum.digest('hex');
				break;
			}
			default: {
				break;
			}
		}
		postEncryptedTasksData(completedTask, (status) => {
			if (status === 200) {
				completedTask.sync = 'OK';
			} else {
				completedTask.sync = 'NOT OK';
			}

			completedTasks.push(completedTask);
			refreshReports();
		});
	}
};

let refreshReports = () => {
	$("#BotModeTableToFill").html("");

	$("#BotModeTableToFill").html("<tr>" + completedTasks.map((val, index) => {
		return "<td>" + val.id + "</td><td>" + val.type + "</td><td>" + val.data.input + "</td><td>" + val.data.output + "</td><td>" + val.sync + "</td>";
	}).join("</tr><tr>") + "</tr>");
};

$(document).ready(() => {
	//refreshReports();
});