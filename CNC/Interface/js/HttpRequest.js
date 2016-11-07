/**
 * Created by tuxlin on 28/10/16.
 */

var data;

function HttpRequest()
{
    var xhr = new XMLHttpRequest();

    xhr.open('GET', 'http://botnet.artificial.engineering:80/api/Status');

    xhr.responseType = 'json';
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onload = function ()
    {
        data = xhr.response;

        if (data !== null)
            console.log(data); // Parsed JSON object

        fillTable();
    };
    xhr.send(null);
}

function fillTable()
{
    //dummydaten
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

    for(var i =0; i < data.length; i++)
    {
        var element = document.getElementById("TableToFill");
        var row = document.createElement("tr");

        var workload = document.createElement("td");
        workload.innerHTML = data[i]["workload"];
        row.appendChild(workload);

        var ip = document.createElement("td");
        ip.innerHTML = data[i]["ip"];
        row.appendChild(ip);

        var id = document.createElement("td");
        id.innerHTML = data[i]["id"];
        row.appendChild(id);

        var task = document.createElement("td");
        task.innerHTML = data[i]["task"];
        row.appendChild(task);


        /*for(var a in data[i])
        {
            var column = document.createElement("td");
            column.innerHTML = data[i][a];
            row.appendChild(column);
        }*/

        element.appendChild(row);
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