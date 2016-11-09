/**
 * Created by tuxlin on 28/10/16.
 */

var dataStatus;
var dataTasks;

function HttpRequest()
{
   dataStatus = pullData("Status");
   dataTasks = pullData("Tasks");
}

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
    };
    xhr.send(null);

    return data;
}

function HttpRequestPost()
{
    
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

        var workload = document.createElement("td");
        workload.innerHTML = data[i][headers[0]];
        row.appendChild(workload);

        var ip = document.createElement("td");
        ip.innerHTML = data[i][headers[1]];
        row.appendChild(ip);

        if(target == "Status") 
        {
            console.log("Processing " +i);
            var id = document.createElement("td");
            id.innerHTML = data[i][headers[2]];
            row.appendChild(id);

            var task = document.createElement("td");
            task.innerHTML = data[i][headers[3]];
            row.appendChild(task);

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
            var task = document.createElement("td");
            task.innerHTML = data[i]["data"][headers[2]];
            row.appendChild(task);

            var task = document.createElement("td");
            task.innerHTML = data[i]["data"][headers[3]];
            row.appendChild(task);
        }
        console.log(row);
        element.appendChild(row);
    }
}
function toggleStartStop(button) 
{
    if(button.innerHTML == "Stop") 
    {
        button.innerHTML = "Start";
        HttpRequestPost();
    }
    else
    {
        button.innerHTML = "Stop";
        HttpRequestPost();
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