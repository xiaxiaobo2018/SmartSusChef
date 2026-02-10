/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 73.0, "KoPercent": 27.0};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.37333333333333335, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.96, 500, 1500, "GET /api/Ingredients"], "isController": false}, {"data": [0.49, 500, 1500, "POST /api/Ingredients"], "isController": false}, {"data": [0.27, 500, 1500, "POST /api/recipes"], "isController": false}, {"data": [0.0, 500, 1500, "GET /api/dashboard"], "isController": false}, {"data": [0.0, 500, 1500, "GET /api/Forecast"], "isController": false}, {"data": [0.52, 500, 1500, "POST /api/auth/login"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 300, 81, 27.0, 16176.316666666668, 356, 120768, 926.0, 102335.80000000016, 120642.85, 120695.87, 2.2355860588853367, 4.239630315571602, 1.5353134687539587], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["GET /api/Ingredients", 50, 0, 0.0, 443.12000000000006, 356, 983, 416.5, 463.9, 924.3, 983.0, 5.689576695493855, 29.605356736458805, 3.8393530240100135], "isController": false}, {"data": ["POST /api/Ingredients", 50, 0, 0.0, 735.9599999999998, 592, 1797, 683.0, 774.0, 1263.149999999999, 1797.0, 5.537098560354375, 2.5225160921926912, 4.487104616555925], "isController": false}, {"data": ["POST /api/recipes", 50, 22, 44.0, 972.9, 363, 2005, 1295.5, 1460.0, 1503.1499999999999, 2005.0, 5.638249887235002, 2.372249591226883, 5.823475205796121], "isController": false}, {"data": ["GET /api/dashboard", 50, 9, 18.0, 1845.38, 1558, 2622, 1762.0, 2304.1, 2433.749999999999, 2622.0, 4.929022082018927, 20.688414949723974, 3.355008194499211], "isController": false}, {"data": ["GET /api/Forecast", 50, 50, 100.0, 92314.20000000003, 5636, 120768, 120605.5, 120681.6, 120696.9, 120768.0, 0.39018299582504196, 0.0609660930976628, 0.26482146689297276], "isController": false}, {"data": ["POST /api/auth/login", 50, 0, 0.0, 746.3399999999999, 457, 1766, 533.0, 1464.0999999999995, 1597.1, 1766.0, 4.88328938372888, 4.616234495556206, 1.1874404849106357], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 78,516 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.2345679012345678, 0.3333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 120,682 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.2345679012345678, 0.3333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 120,678 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 2, 2.4691358024691357, 0.6666666666666666], "isController": false}, {"data": ["The operation lasted too long: It took 120,659 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.2345679012345678, 0.3333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 68,916 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.2345679012345678, 0.3333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 44,661 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.2345679012345678, 0.3333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 59,127 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.2345679012345678, 0.3333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 97,852 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.2345679012345678, 0.3333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 117,318 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.2345679012345678, 0.3333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 15,621 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.2345679012345678, 0.3333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 83,329 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.2345679012345678, 0.3333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 120,643 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.2345679012345678, 0.3333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 2,309 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.2345679012345678, 0.3333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 107,886 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.2345679012345678, 0.3333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 120,698 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.2345679012345678, 0.3333333333333333], "isController": false}, {"data": ["409/Conflict", 21, 25.925925925925927, 7.0], "isController": false}, {"data": ["The operation lasted too long: It took 120,639 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.2345679012345678, 0.3333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 2,552 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.2345679012345678, 0.3333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 120,655 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.2345679012345678, 0.3333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 2,260 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.2345679012345678, 0.3333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 120,666 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.2345679012345678, 0.3333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 10,614 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.2345679012345678, 0.3333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 102,834 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.2345679012345678, 0.3333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 120,607 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.2345679012345678, 0.3333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 2,213 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.2345679012345678, 0.3333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 120,621 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.2345679012345678, 0.3333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 120,629 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.2345679012345678, 0.3333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 2,337 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.2345679012345678, 0.3333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 120,667 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.2345679012345678, 0.3333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 5,636 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.2345679012345678, 0.3333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 20,447 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.2345679012345678, 0.3333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 2,170 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.2345679012345678, 0.3333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 120,664 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.2345679012345678, 0.3333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 73,500 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.2345679012345678, 0.3333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 120,604 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.2345679012345678, 0.3333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 64,039 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.2345679012345678, 0.3333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 112,752 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.2345679012345678, 0.3333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 120,696 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.2345679012345678, 0.3333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 120,638 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 2, 2.4691358024691357, 0.6666666666666666], "isController": false}, {"data": ["The operation lasted too long: It took 120,768 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.2345679012345678, 0.3333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 120,645 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.2345679012345678, 0.3333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 120,609 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.2345679012345678, 0.3333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 120,623 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.2345679012345678, 0.3333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 30,189 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.2345679012345678, 0.3333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 54,330 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.2345679012345678, 0.3333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 2,622 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.2345679012345678, 0.3333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 120,640 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.2345679012345678, 0.3333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 25,275 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.2345679012345678, 0.3333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 87,942 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.2345679012345678, 0.3333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 49,367 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.2345679012345678, 0.3333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 120,624 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.2345679012345678, 0.3333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 2,005 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.2345679012345678, 0.3333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 120,683 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.2345679012345678, 0.3333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 2,320 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.2345679012345678, 0.3333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 34,951 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.2345679012345678, 0.3333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 120,650 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.2345679012345678, 0.3333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 2,220 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.2345679012345678, 0.3333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 40,615 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.2345679012345678, 0.3333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 92,989 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.2345679012345678, 0.3333333333333333], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 300, 81, "409/Conflict", 21, "The operation lasted too long: It took 120,678 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 2, "The operation lasted too long: It took 120,638 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 2, "The operation lasted too long: It took 78,516 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 120,682 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["POST /api/recipes", 50, 22, "409/Conflict", 21, "The operation lasted too long: It took 2,005 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["GET /api/dashboard", 50, 9, "The operation lasted too long: It took 2,337 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 2,552 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 2,260 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 2,309 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 2,320 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1], "isController": false}, {"data": ["GET /api/Forecast", 50, 50, "The operation lasted too long: It took 120,678 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 2, "The operation lasted too long: It took 120,638 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 2, "The operation lasted too long: It took 78,516 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 120,682 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 120,667 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
