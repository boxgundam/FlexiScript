function FoutainToArray(fountainString) {
    let csvArr = [[]];

    let newRow = function() {
        return new Array(SpreadsheetScriptHeaders.length);
    }

    // Catch invalid Fountain data
    try {
        let formattedScript = fountain.parse(fountainString);

        if(!formattedScript.html || ! formattedScript.html.script)
            throw 'No script object found';

        let scriptHTML = formattedScript.html.script;

        let row = newRow();
        row[SpreadsheetScriptKeys.Label] = 'start';
        csvArr[0] = row;

        $(scriptHTML).each(function(i, k) {
            let el = $(this);

            // Character and Dialogue
            if(el.hasClass('dialogue')) {
                row = newRow();
                row[SpreadsheetScriptKeys.Character] = el.find('h4').text();
                row[SpreadsheetScriptKeys.Dialogue] = el.find('p:not(.parenthetical)').text();
                csvArr.push(row);
            }

            // Section (used as menu)
            else if(el.hasClass('section')) {
                row = newRow();
                let depth = el.data('depth');

                if(+depth == 1) {
                    let parts = el.text().split('|');
                    row[SpreadsheetScriptKeys.Choice] = parts[1];
                    row[SpreadsheetScriptKeys.Option] = parts[0];
                } else {
                    row[SpreadsheetScriptKeys.Option] = el.text();
                }
                csvArr.push(row);
            }

            // Narrative
            // Boneyard -> %Scene:
            // Boneyard -> %Label:
            // Boneyard -> %Jump:
            // Boneyard -> %Condition:
            // Boneyard -> %Prepend:
            // Boneyard -> %Append:
            else if(el.is('p') && !el.attr('class')) {
                row = newRow();
                let text = el.text();
                let boneyardContent = text.match(/^\/\s*%(.*)\//);

                if(boneyardContent && boneyardContent.length > 1) {
                    let boneyardParts = boneyardContent[1].split(':');
                    
                    switch(boneyardParts[0].toLowerCase()) {
                        case 'scene':
                            row[SpreadsheetScriptKeys.Scene] = boneyardParts[1];
                            break;
                        case 'label':
                            row[SpreadsheetScriptKeys.Label] = boneyardParts[1];
                            break;
                        case 'jump':
                            row[SpreadsheetScriptKeys.Jump] = boneyardParts[1];
                            break;
                        case 'condition':
                            row[SpreadsheetScriptKeys.Condition] = boneyardParts[1];
                            break;   
                        case 'prepend':
                            row[SpreadsheetScriptKeys.Prepend] = boneyardParts[1];
                            break; 
                        case 'append':
                            row[SpreadsheetScriptKeys.Append] = boneyardParts[1];
                            break; 
                    }
                } else {
                    row[SpreadsheetScriptKeys.Narrative] = text;
                }
                csvArr.push(row);
            }
        });
    } catch (e) {
        alert('Invalid fountain format');
    }

    return { data: csvArr };
}


function ArrayToFoutain(csvArray) {
    return '';
}