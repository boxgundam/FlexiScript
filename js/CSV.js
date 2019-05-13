function CSVToArray(csvString, delimiter = ',', separateHeaders = true) {
    // Create a regular expression to parse the CSV values.
    let csvPattern = new RegExp((
        // Delimiters.
        `(\\${delimiter}|\\r?\\n|\\r|^)` +

        // Quoted fields.
        `(?:"([^"]*(?:""[^\"]*)*)"|` +

        // Standard fields.
        `([^"\\${delimiter}\\r\\n]*))`
    ), 
        'gi'
    );

    let arrData = [[]];
    let arrMatches;

    // Find matches.
    while(arrMatches = csvPattern.exec(csvString)) {
        // Get the delimiter that was found.
        let matchedDelimiter = arrMatches[1];
        let matchedValue;

        // If delimiter starts a new row add an empty row to arrData.
        if(matchedDelimiter.length && matchedDelimiter !== delimiter)
            arrData.push([]);

        // Handle quoted value; unescape double quotes.
        if(arrMatches[2])
            matchedValue = arrMatches[2].replace(/""/g, '"');
        // Handle non-quoted value.
        else
            matchedValue = arrMatches[3];


        // Add value to arrData.
        arrData[arrData.length - 1].push(matchedValue);
    }

    let returnObj = { data: arrData };
    if(separateHeaders) {
        returnObj.headers = returnObj.data.splice(0, 1)[0];
    }
    
    return returnObj;
}

function ArrayToCSV(csvArray, delimiter = ',', includeHeaders = true) {
    let stringData = '';
    for(let i = 0; i < csvArray.length; i++) {
        let row = csvArray[i];
        stringData += `"${row.join(`"${delimiter}"`)}"\n`;
    }

    return stringData;
}