/**
 * Created by tuxlin on 28/10/16.
 */

setInterval(() => {
	refreshStatusTableData();
}, 15000);

let getData = (target, sortField, callback) => {
	let xhr = new XMLHttpRequest();

	xhr.open('GET', 'http://localhost:3000/api/' + target);
	xhr.responseType = 'json';
	xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.setRequestHeader('Token', '00530061006C00740079');

	xhr.onload = () => {
		let data = xhr.response;

		if (data === null) return;

        //Sorting standard values
		if (sortField === "ip") {
			data.sort((a, b) => {
				let aIP = parseIP(a[sortField]);
				let bIP = parseIP(b[sortField]);
				return aIP - bIP;
			});
		} else { //Use a special sort function while sorting IPs
			data.sort((a, b) => {
				return a[sortField] - b[sortField];
			});
		}
		if (typeof (callback) === "function") {
			callback(data);
		}
	};

	xhr.send(null);
};

//Post Request fuer Toggle Button
let postData = (id, setting, callback) => {
	let data = {
		id: id,
		status: setting
	};

	let xhr = new XMLHttpRequest();
	xhr.open('POST', 'http://localhost:3000/api/Status', true);

	xhr.responseType = 'json';
	xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
	xhr.setRequestHeader('Token', '00530061006C00740079');

    xhr.onload = () => {
        if (typeof (callback) === "function") {
            callback();
        }
    };

	xhr.send(JSON.stringify(data));
};

$(document).ready(() => {

	$("#MenuHome").on("click",  () => {
		$("#SectionHome").show();
		$("#SectionStatus").hide();
		$("#SectionTask").hide();
		$("#SectionReports").hide();

		$("#MenuHome").parent().addClass("active");
		$("#MenuStatus").parent().removeClass("active");
		$("#MenuTask").parent().removeClass("active");
		$("#MenuReports").parent().removeClass("active");
	});

	$("#MenuStatus").on("click", () => {
		$("#SectionHome").hide();
		$("#SectionStatus").show();
		$("#SectionTask").hide();
		$("#SectionReports").hide();

		$("#MenuHome").parent().removeClass("active");
		$("#MenuStatus").parent().addClass("active");
		$("#MenuTask").parent().removeClass("active");
		$("#MenuReports").parent().removeClass("active");
	});

	$("#MenuTask").on("click", () => {
		$("#SectionHome").hide();
		$("#SectionStatus").hide();
		$("#SectionTask").show();
		$("#SectionReports").hide();

		$("#MenuHome").parent().removeClass("active");
		$("#MenuStatus").parent().removeClass("active");
		$("#MenuTask").parent().addClass("active");
		$("#MenuReports").parent().removeClass("active");
	});

	$("#MenuReports").on("click", () => {
		$("#SectionHome").hide();
		$("#SectionStatus").hide();
		$("#SectionTask").hide();
		$("#SectionReports").show();

		$("#MenuHome").parent().removeClass("active");
		$("#MenuStatus").parent().removeClass("active");
		$("#MenuTask").parent().removeClass("active");
		$("#MenuReports").parent().addClass("active");
	});

	$("#MenuHome").click();
	refreshStatusTableData();
});

let refreshStatusTableData = () => {
	$("#StatusTableToFill").html("");

	getData("Status", "ip", (data) => {
		$("#StatusTableToFill").html("<tr>" + data.map((val, index) => {
			let buttonText = val.workload !== 0 ? "Stop" : "Start";

			return "<td>" + val.task + "</td><td>" + val.ip + "</td><td>" + val.id + "</td><td>" + val.workload + "</td>"
                    + "<td><button id='" + val.id + "' class='btn btn-danger'>" + buttonText + "</button></td>";
		}).join("</tr><tr>") + "</tr>");

        data.forEach((item) => {
            $("#StatusTableToFill").find("#" + item.id).on("click", () => {
                let button = $("#StatusTableToFill").find("#" + item.id);

                let state = button.text() !== "Start";

                button.text(state ? "Start" : "Stop");
                postData(item.id, !state, () => {
                    refreshStatusTableData();
                });
            });
        })
		
	});
};
let parseIP = (ip) => {
	let ipSegments = ip.split(".");
	//Parse IPv4
	if (ipSegments.length > 1) {
		//Get binary values of ip segements
		for (let i = 0; i < ipSegments.length; i++) {
			ipSegments[i] = parseInt(ipSegments[i]).toString(2);
		}
		//Fill up to comply with full 8 bit representation per segment
		for (let i = 0; i < ipSegments.length; i++) {
			if (ipSegments[i].length < 8) {
				ipSegments[i] = "00000000".substr(ipSegments[i].length) + ipSegments[i];
			}
		}
        //Return concatenated ip (binary representation) as an integer (it's always 4 segements)
		return parseInt((ipSegments[0] + ipSegments[1] + ipSegments[2] + ipSegments[3]), 2);
	} else { //Parse IPv6
        //Getting rid of "/64" tail and splitting the rest
		ipSegments = ip.split("/")[0].split(":");

		//Get binary values of ip segements
		for (let i = 0; i < ipSegments.length; i++) {
			ipSegments[i] = parseInt(ipSegments[i], 16).toString(2);
		}
		//Fill up to comply with full 16 bit representation per segment
		for (let i = 0; i < ipSegments.length; i++) {
			if (ipSegments[i].length < 8) {
				ipSegments[i] = "0000000000000000".substr(ipSegments[i].length) + ipSegments[i];
			}
		}
        //Return concatenated ip (binary representation) as an integer (it's always 8 segements)
		return parseInt((ipSegments[0] + ipSegments[1] + ipSegments[2] + ipSegments[3] + ipSegments[4] + ipSegments[5] + ipSegments[6] + ipSegments[7]), 2);
	}
};
