function newSpreadsheet(name, type, isStatic = false) {
    let spreadsheetId = `${name}_spreadsheet`;
    let spreadsheetEl = $(`#${spreadsheetId}`);

    if(spreadsheetEl.length > 0) {
        spreadsheetId += `_${untitledSpreadsheetIndex}`;
        name += `-${untitledSpreadsheetIndex + 1}`;
        untitledSpreadsheetIndex++;
    }

    let tabId = `tab_${nextTabIndex}`;
    let tabTemplate = `<li ${isStatic ? `class="static-tab"` : ''}><a href="#${tabId}">${name}</a> ${!isStatic ? `<span class='ui-icon ui-icon-close' role='presentation'>Remove Tab</span></li>` : ''}`;
    nextTabIndex++;

    let tabElement = $(`<div id="${tabId}"></div>`);
    let spreadsheetElement = $(`<div id="${spreadsheetId}" data-fstype="${type}" data-fsname="${name}"></div>`);

    tabElement.append(spreadsheetElement);

    SpreadsheetTabs.find('.ui-tabs-nav').append($(tabTemplate));
    SpreadsheetTabs.append(tabElement);
    SpreadsheetTabs.tabs('refresh');

    switch(type) {
        case SpreadsheetType.Variables:
            loadSpreadsheet($(`#${spreadsheetId}`), SpreadsheetType.Variables, $.fn.jexcel('helper', { action: 'createEmptyData', cols: SpreadsheetVariablesHeaders.length, rows: 20 }));   
            break;
        case SpreadsheetType.Characters:
            loadSpreadsheet($(`#${spreadsheetId}`), SpreadsheetType.Characters, $.fn.jexcel('helper', { action: 'createEmptyData', cols: SpreadsheetCharactersHeaders.length, rows: 20 }));   
            break;
        case SpreadsheetType.Script:
            loadSpreadsheet($(`#${spreadsheetId}`), SpreadsheetType.Script, $.fn.jexcel('helper', { action: 'createEmptyData', cols: SpreadsheetScriptHeaders.length, rows: 100 }));
            break;
        default:
            alert('Failed to add sheet');
    }

    return spreadsheetElement;
}

function loadSpreadsheet(element, type, data = []) {
    switch(type) {
        case SpreadsheetType.Variables:
            element.jexcel({
                data: data,  
                colHeaders: SpreadsheetVariablesHeaders,
                colWidths: [ 250, 100, 400 ],
                columns: [
                    { type: 'text' },
                    { type: 'dropdown', source: SpreadsheetVariableTypes.map(v => { return { id: v, name: v } }) },
                    { type: 'text' }
                ],
                csvHeaders:true,
                tableOverflow:true,
                tableHeight: 600,
                onchange: function(obj, cel, val) {
                    autosave();
                }
            });

            element.jexcel('updateSettings', {
                table: function (instance, cell, col, row, val, id) {
                    if (col == 0 || col == 2) {
                        $(cell).css('text-align', 'left');
                    }
                }
            });
            break;
        case SpreadsheetType.Characters:
            element.jexcel({
                data: data,  
                colHeaders: SpreadsheetCharactersHeaders,
                colWidths: [ 160, 80, 90, 100, 500 ],
                columns: [
                    { type: 'text' },
                    { type: 'text' },
                    { type: 'text' },
                    { type: 'text' }
                ],
                csvHeaders:true,
                tableOverflow:true,
                tableHeight: 600,
                onload: function(obj, cel, val) {
                    let data = obj.jexcel('getData', false);
                    SpreadsheetCharacters = [];

                    for(let i = 0; i < data.length; i++) {
                        let name = data[i][0];
                        let variable = data[i][1];
                        if(name.length)
                            SpreadsheetCharacters.push({
                                id: variable,
                                name: name
                            });
                    }
                },
                onchange: function(obj, cel, val) {
                    autosave();
                }

                // onbeforechange: function(obj, cel, val) {
                //     activeSpreadsheetCell = val;
                // },
                // onchange: function(obj, cel, val) {
                //     let pos = $(cel).prop('id').split('-');
                //     if(pos[0] == '0') {
                //         updateSpreadsheetDropdown(SpreadsheetCharacters, activeSpreadsheetCell);
                //     }
                //     else {
                //         return;
                //     }
                // }
            });

            element.jexcel('updateSettings', {
                table: function (instance, cell, col, row, val, id) {
                    if (col == 0 || col == 4) {
                        $(cell).css('text-align', 'left');
                    }
                }
            });
            break;
        case SpreadsheetType.Script:
            element.jexcel({
                data: data,
                colHeaders: SpreadsheetScriptHeaders,
                colWidths: [ 100, 120, 300, 160, 300, 120, 300, 120, 200, 200, 200 ],
                columns: [
                    { type: 'text' },
                    { type: 'text' },
                    { type: 'text', wordWrap: true },
                    { type: 'text' }, // { type: 'dropdown', source: SpreadsheetCharacters },
                    { type: 'text', wordWrap: true },
                    { type: 'text' },
                    { type: 'text', wordWrap: true },
                    { type: 'text' }, // { type: 'dropdown', source: SpreadsheetLabels },
                    { type: 'text', wordWrap: true },
                    { type: 'text', wordWrap: true },
                    { type: 'text', wordWrap: true }
                ],
                csvHeaders:true,
                tableOverflow:true,
                tableHeight: 600,
                onchange: function(obj, cel, val) {
                    autosave();
                }
                // onbeforechange: function(obj, cel, val) {
                //     activeSpreadsheetCell = val;
                // },
                // onchange: function(obj, cel, val) {
                //     let pos = $(cel).prop('id').split('-');
                //     if(pos[0] == '1') {
                //         updateSpreadsheetDropdown(SpreadsheetLabels, activeSpreadsheetCell);
                //     }
                //     else if(pos[0] == '5') {
                //         let rowLabel = $(`#script-spreadsheet .c1.r${pos[1]}`);
                //         rowLabel.html(val);
                //         rowLabel.addClass('readonly');
                //         updateSpreadsheetDropdown(SpreadsheetLabels, activeSpreadsheetCell);
                //     } else {
                //         return;
                //     }
                // }
            });

            element.jexcel('updateSettings', {
                table: function (instance, cell, col, row, val, id) {
                    if (col == 2 || col == 4 || col == 6 || col == 8 || col == 9 || col == 10) {
                        $(cell).css('text-align', 'left');
                    }
                }
            });
            break;
        default:
            alert('Invalid type');
    }
}

function updateSpreadsheetDropdown(dropdownArray, activeSpreadsheetCell) {
    let index = dropdownArray.indexOf(activeSpreadsheetCell);

    if(index > -1) {
        if(!val || val == '') {
            dropdownArray.splice(index, 1);
        } else {
            dropdownArray[index] = val;
        }
    } else if(val.length) {
        dropdownArray.push(val);
    }
}
