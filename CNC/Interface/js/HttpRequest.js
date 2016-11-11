/**
 * Created by tuxlin on 28/10/16.
 */

var dataStatus;
var dataTasks;

pullData("Status");
pullData("Tasks");
setInterval(function() {
    refreshOnInterval();
}, 5000);

function pullData(target) {

    var data;

    var xhr = new XMLHttpRequest();

    xhr.open('GET', 'http://botnet.artificial.engineering:80/api/' + target);

    xhr.responseType = 'json';
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onload = function ()
    {
        data = xhr.response;

        if (data !== null)
            console.log(data); // Parsed JSON object

        fillTable(target, data);
        if(target == "Status") 
        {
            dataStatus = data;
        }
        else
        {
            dataTasks = data;
        }

    };
    xhr.send(null);
}

function postData(id, setting)
{
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

function fillTable(target, data)
{
    //Dummydaten
    if(data === null || data === undefined)
        data =
            [{
                "ID": "Salty",
                "IP": "Max",
                "Task": "Mustermann",
                "Workload": "5IB"
            },
            {
                "ID": "Salty",
                "IP": "Johannes",
                "Task": "Lutz",
                "Workload": "3IB"
            }];

    //var thead  = '<tr><th>' + Object.keys(data[0]).join('</trth><th>') + '</th></tr>';

    //var tbody  = '<tr>' + data.map((val, index) => {
    //    return '<td>' + val.id + '</td><td>' + val.ip + '</td>...';
    // }).join('</tr><tr>') + '</tr>';
    var headers;
    var id;
    if(target == "Status") 
    {
        headers = ["workload", "ip", "id", "task"]
        id = "StatusTableToFill";
    }
    else
    {
        headers = ["id", "type", "input", "output"]
        id = "TasksTableToFill";
    }

    var element = document.getElementById(id);

    for(var i =0; i < data.length; i++)
    {
        var row = document.createElement("tr");

        var col_1 = document.createElement("td");
        col_1.innerHTML = data[i][headers[0]];
        row.appendChild(col_1);

        var col_2 = document.createElement("td");
        col_2.innerHTML = data[i][headers[1]];
        row.appendChild(col_2);

        if(target == "Status") 
        {
            console.log("Processing " +i);
            var col_3 = document.createElement("td");
            col_3.innerHTML = data[i][headers[2]];
            row.appendChild(col_3);

            var col_4 = document.createElement("td");
            col_4.innerHTML = data[i][headers[3]];
            row.appendChild(col_4);

            var button = document.createElement("td");
            if(data[i]["task"] == 1) 
            {
                button.innerHTML = "<button onclick='toggleStartStop(this)'>Stop</button>";
            }
            else 
            {
                button.innerHTML = "<button onclick='toggleStartStop(this)'>Start</button>";
            }
            row.appendChild(button);
        }
        else
        {
            var col_3 = document.createElement("td");
            col_3.innerHTML = data[i]["data"][headers[2]];
            row.appendChild(col_3);

            var col_4 = document.createElement("td");
            col_4.innerHTML = data[i]["data"][headers[3]];
            row.appendChild(col_4);
        }
        console.log(row);
        element.appendChild(row);
    }
}
function sortByID()
{
    console.log(dataStatus);
    dataStatus.sort(function(a, b) {
        return b.id - a.id;     
    })
    refreshOnInterval();
}

function reload()
{
    var table = document.getElementById("StatusTableToFill");
    table.innerHTML = "";

    fillTable("Status", dataStatus);
}

function refreshOnInterval()
{
    var table = document.getElementById("StatusTableToFill");
    table.innerHTML = "";

    pullData("Status");
}

function refreshOnButtonPress() 
{
    var table = document.getElementById("StatusTableToFill");
    table.innerHTML = "";

    pullData("Status");
}

function toggleStartStop(button) 
{
    if(button.innerHTML == "Stop") 
    {
        button.innerHTML = "Start";
        dataStatus[(button.parentNode.parentNode.rowIndex - 1)]["task"] = 0;
        postData((button.parentNode.parentNode.rowIndex - 1), false);
        reload();
    }
    else
    {
        button.innerHTML = "Stop";
        dataStatus[(button.parentNode.parentNode.rowIndex - 1)]["task"] = 1;
        postData((button.parentNode.parentNode.rowIndex - 1), true);
        reload();
    }
}

$(document).ready(function()
{
    $("#MenuHome").on("click",  function()
    {
        $("#SectionHome").show();
        $("#SectionStatus").hide();
        $("#SectionTask").hide();

        $("#MenuHome").parent().addClass("active");
        $("#MenuStatus").parent().removeClass("active");
        $("#MenuTask").parent().removeClass("active");

    });

    $("#MenuStatus").on("click", function()
    {
        $("#SectionHome").hide();
        $("#SectionStatus").show();
        $("#SectionTask").hide();

        $("#MenuHome").parent().removeClass("active");
        $("#MenuStatus").parent().addClass("active");
        $("#MenuTask").parent().removeClass("active");
    });

    $("#MenuTask").on("click", function()
    {
        $("#SectionHome").hide();
        $("#SectionStatus").hide();
        $("#SectionTask").show();

        $("#MenuHome").parent().removeClass("active");
        $("#MenuStatus").parent().removeClass("active");
        $("#MenuTask").parent().addClass("active");
    });
    $("#MenuHome").click();
});