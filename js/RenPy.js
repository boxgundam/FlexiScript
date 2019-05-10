
function ArrayToRenPyVariables(dataArray, delimiter = ',', includeHeaders = true) {
    const v = SpreadsheetVariablesKeys;
    let stringData = '';
    
    for(let i = 0; i < dataArray.length; i++) {
        let row = dataArray[i];
        if(row[0].length) {
            // Character definition
            stringData += `default ${row[v.Name]} = ${row[v.Default_Value] ? row[v.Default_Value] : 'null'}\n`;
        }
    }

    return stringData;
}

function ArrayToRenPyCharacters(dataArray, delimiter = ',', includeHeaders = true) {
    const c = SpreadsheetCharactersKeys;
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
    const renpyTab = '    '; // Four spaces
    const s = SpreadsheetScriptKeys;

    let stringData = '';
    let menuOptionDepth = null;
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

        //Prepend
        if(row[s.Prepend].length) {
            let lines = row[s.Prepend].split('\n');

            for(let l in lines)
                if(lines[l].length)
                    stringData += `${renpyTab.repeat(tabDepth)}${lines[l]}\n`;
        }

        // Scenes
        if(row[s.Scene].length) {
            stringData += `${renpyTab.repeat(tabDepth)}scene ${row[s.Scene]}\n`;
        }

        // Narrative
        if(row[s.Narrative].length) {
            let lines = row[s.Narrative].split('\n');

            for(let l in lines)
                if(lines[l].length)
                    stringData += `${renpyTab.repeat(tabDepth)}"${lines[l]}"\n`;
        }

        //Dialogue
        if(row[s.Dialogue].length) {
            let lines = row[s.Dialogue].split('\n');

            for(let l in lines)
                if(lines[l].length)
                    stringData += `${renpyTab.repeat(tabDepth)}${row[s.Character] ? `${characterVars[row[s.Character]]} ` : ''}"${lines[l]}"\n`;
        }

        //Choice
        if(row[s.Choice].length) {
            stringData += `${renpyTab.repeat(tabDepth)}menu ${row[s.Choice]}:\n`;
            tabDepth++; 
            menuOptionDepth = tabDepth;
        }

        //Option
        if(row[s.Option].length) {
            if(row[s.Choice].length) {
                stringData += `${renpyTab.repeat(menuOptionDepth)}"${row[s.Option]}"\n`;
            } else {
                stringData += `${renpyTab.repeat(menuOptionDepth)}"${row[s.Option]}":\n`;
                tabDepth = menuOptionDepth + 1;
            }
        }

        //Jump
        if(row[s.Jump].length) {
            
            stringData += `${renpyTab.repeat(tabDepth)}${row[s.Jump] != 'return' ? 'jump ': ''}${row[s.Jump]}\n`;
        }

        //Append
        if(row[s.Append].length) {
            let lines = row[s.Append].split('\n');

            for(let l in lines)
                if(lines[l].length)
                    stringData += `${renpyTab.repeat(tabDepth)}${lines[l]}\n`;
        }
    }

    return stringData;
}
