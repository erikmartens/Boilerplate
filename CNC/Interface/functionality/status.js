/**
 * Created by tuxlin on 28/10/16.
 */

setInterval(function() {
    refresh();
}, 10000);

function getData(target, sortField, handleData) {
    var xhr = new XMLHttpRequest();

    xhr.open('GET', 'http://botnet.artificial.engineering:80/api/' + target);
    xhr.responseType = 'json';
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onload = () => {
        let data = xhr.response;

        if(data === null) return;

        //Sorting standard values
        if(sortField == "ip") {
        	data.sort(function(a, b) 
			{ 
				var aIP = parseIP(a[sortField]);
				var bIP = parseIP(b[sortField]);

				return aIP - bIP; 
			});
		}
		//Use a special sort function while sorting IPs
		else {
			data.sort(function(a, b) { 
                return a[sortField] - b[sortField]; 
            });			
		}
        if(typeof(handleData) === "function")
            handleData(data);
    };

    xhr.send(null);
}

//Post Request fuer Toggle Button
function postData(id, setting) {
    var data = {
        id: id,
        status: setting
    };

    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://botnet.artificial.engineering/api/Status', true);

    xhr.responseType = 'json';
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    //xhr.setRequestHeader('Token', 'c157a79031e1c40f85931829bc5fc552')

    xhr.send(JSON.stringify(data));
}

$(document).ready(function() {

    $("#MenuHome").on("click",  function() {
        $("#SectionHome").show();
        $("#SectionStatus").hide();
        $("#SectionTask").hide();

        $("#MenuHome").parent().addClass("active");
        $("#MenuStatus").parent().removeClass("active");
        $("#MenuTask").parent().removeClass("active");

    });

    $("#MenuStatus").on("click", function() {
        $("#SectionHome").hide();
        $("#SectionStatus").show();
        $("#SectionTask").hide();

        $("#MenuHome").parent().removeClass("active");
        $("#MenuStatus").parent().addClass("active");
        $("#MenuTask").parent().removeClass("active");
    });

    $("#MenuTask").on("click", function() {
        $("#SectionHome").hide();
        $("#SectionStatus").hide();
        $("#SectionTask").show();

        $("#MenuHome").parent().removeClass("active");
        $("#MenuStatus").parent().removeClass("active");
        $("#MenuTask").parent().addClass("active");
    });

    $("#MenuHome").click();
    refresh();
});

function refresh() {
    $("#StatusTableToFill").html("");

    getData("Status", "ip", function (data) {
        // $("#statustabletofill").innerHTML("<tr><th>" + Object.keys(data[0]).join("</th><th>") + "</th></tr>"); // HEAD
        $("#StatusTableToFill").html("<tr>" + data.map(function(val, index) {
                var buttonText = val.workload != 0 ? "Stop" : "Start";

                return "<td>" + val.workload + "</td><td>" + val.ip + "</td><td>" + val.id + "</td><td>" + val.task +"</td>"
                    + "<td><button toggle-id='" + val.id + "' class='btn btn-danger'>" + buttonText + "</button></td>";
            }).join("</tr><tr>") + "</tr>");

        $("#StatusTableToFill").find("button").on("click", function() {
            var toggleID = $(this).attr("toggle-id"); // determine the id of the clicked button
            var state = $(this).text() !== "Start";

            $(this).text(state ? "Start" : "Stop");
            postData(parseInt(toggleID), !state);
        });
    });
}
function parseIP(ip) {
	var ipSegments = ip.split(".");
	//Parse IPv4
	if(ipSegments.length > 1) {
		//Get binary values of ip segements
		for(var i = 0; i < ipSegments.length; i++) {
			ipSegments[i] = parseInt(ipSegments[i]).toString(2);
		}
		//Fill up to comply with full 8 bit representation per segment
		for(var i = 0; i < ipSegments.length; i++) {
			if(ipSegments[i].length < 8) {
				ipSegments[i] = "00000000".substr(ipSegments[i].length) + ipSegments[i];
			}
		}
        //Return concatenated ip (binary representation) as an integer (it's always 4 segements)
        return parseInt((ipSegments[0] + ipSegments[1] + ipSegments[2] + ipSegments[3]), 2);	
	}
	//Parse IPv6
	else {
        //Getting rid of "/64" tail and splitting the rest
		ipSegments = ip.split("/")[0].split(":");

		//Get binary values of ip segements
		for(var i = 0; i < ipSegments.length; i++) {
			ipSegments[i] = parseInt(ipSegments[i], 16).toString(2);
		}
		//Fill up to comply with full 16 bit representation per segment
		for(var i = 0; i < ipSegments.length; i++) {
			if(ipSegments[i].length < 8) {
				ipSegments[i] = "0000000000000000".substr(ipSegments[i].length) + ipSegments[i];
			}
		}
        //Return concatenated ip (binary representation) as an integer (it's always 8 segements)
        return parseInt((ipSegments[0] + ipSegments[1] + ipSegments[2] + ipSegments[3] + ipSegments[4] + ipSegments[5] + ipSegments[6] + ipSegments[7]), 2);
	}
}