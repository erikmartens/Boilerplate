/**
 * Created by tuxlin on 28/10/16.
 */

var data;

function HttpRequest() {

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

function fillTable() {

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

    for(var i =0; i<data.length; i++)
    {
        var element = document.getElementById("TableToFill");
        var row = document.createElement("tr");

        for(var a in data[i])
        {
            var column = document.createElement("td");
            column.innerHTML = data[i][a];
            row.appendChild(column);
            console.log("Key: " + a + ", Value: " + data[i][a]);
        }

        element.appendChild(row);
    }

}