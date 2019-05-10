
function ArrayToRenPyCharacters(dataArray, delimiter = ',', includeHeaders = true) {
    let c = SpreadsheetCharactersKeys;
    let stringData = '';
    
    for(let i = 0; i < dataArray.length; i++) {
        let row = dataArray[i];
        if(row[0].length) {
            // Character definition
            stringData += `define ${row[c.Variable] || row[c.Name]} = Character("${row[c.Name]}"` +

            // Text Color
            `${row[2]? `, who_color="${row[c.Text_Color]}"` : ''}` +

            // Icon
            `${row[3]? `, image="${row[c.Icon]}"` : ''}` + 

            // Closing bracket
            `)\n`;
        }
    }

    return stringData;
}

function ArrayToRenPyScript(dataArray, delimiter = ',', includeHeaders = true) {
    let s = SpreadsheetScriptKeys;
    let stringData = '';
    let tabDepth = 0;
    let characterVars = {};

    for(let i in SpreadsheetCharacters) {
        let character = SpreadsheetCharacters[i];
        characterVars[character.name] = character.id.length ? character.id : `"${character.name}"`
    }

    for(let i = 0; i < dataArray.length; i++) {
        let row = dataArray[i];

        for(let cell in row) {
            row[cell] = row[cell].replace(/"/g, '\\"');
        }

        // Labels
        if(row[s.Label].length && !row[s.Choice].length) {
            stringData += `label ${row[s.Label]}:\n`;
            tabDepth = 1;
            continue;
        }

        // Scenes
        if(row[s.Scene].length) {
            stringData += `${'\t'.repeat(tabDepth)}scene ${row[s.Scene]}\n`;
        }

        // Narrative
        if(row[s.Narrative].length) {
            let lines = row[s.Narrative].split('\n');

            for(let l in lines)
                if(lines[l].length)
                    stringData += `${'\t'.repeat(tabDepth)}"${lines[l]}"\n`;
        }

        //Dialogue
        if(row[s.Dialogue].length) {
            let lines = row[s.Dialogue].split('\n');

            for(let l in lines)
                if(lines[l].length)
                    stringData += `${'\t'.repeat(tabDepth)}${row[s.Character] ? `${characterVars[row[s.Character]]} ` : ''}"${lines[l]}"\n`;
        }

        
    }

    return stringData;
}
