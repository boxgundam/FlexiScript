function Forms() {

    // New Project
    $('[data-nav="new_project"] form').on('submit', function(e) {
        event.preventDefault();

        if(!confirm(`This action will close the current project. Start a new project?`))
            return;

        let titleField = $(this).find('[name="title"]');
        let title = titleField ? titleField.val() || 'Untitled' : 'Untitled';

        newProject(title);        

        titleField.val('');
    });

    // Import
    $('[data-nav="import"] form').on('submit', function(e) {
        event.preventDefault();

        let fileField = $(this).find('[name="import_files"]');
        let files = fileField[0].files;

        if(!files) return;

        for(let i = 0; i < files.length; i++) {
            importCSV(files[i]);
        }
    });

    // Add Sheet
    $('[data-nav="add_sheet"] form').on('submit', function(e) {
        event.preventDefault();
        let nameField = $(this).find('[name="name"]');
        let name = nameField ? nameField.val() || 'untitled' : 'untitled';
        let newSheet = newSpreadsheet(name, SpreadsheetType.Script);
        newSheet.jexcel('setValue', 'B1', name);
        nameField.val('');
    });

    // Export for CSV
    $('[data-nav="export_csv"] form').on('submit', function(e) {
        event.preventDefault();
        let combineField = $(this).find('[name="combine"]');
        let combine = combineField[0].checked;
        let combinedScript = ArrayToCSV([SpreadsheetScriptHeaders]);

        let zip = new JSZip();
        $.each(getOrderedSpreadsheets(), function() {
            let data = $(this).jexcel('getData');
            let sheetName = $(this).data('fsname');

            switch($(this).data('fstype')) {
                case SpreadsheetType.Variables:
                    zip.file(`${sheetName}.csv`, ArrayToCSV([SpreadsheetVariablesHeaders]) + ArrayToCSV(data));
                    break;
                case SpreadsheetType.Characters:
                    zip.file(`${sheetName}.csv`, ArrayToCSV([SpreadsheetCharactersHeaders]) + ArrayToCSV(data));
                    break;
                case SpreadsheetType.Script:
                    if(combine) {
                        combinedScript += ArrayToCSV(data);
                    } else {
                        zip.file(`${sheetName}.csv`, combinedScript + ArrayToCSV(data));
                    }
                    
                    break;
                default:
                    alert('Invalid spreadsheet type');
            }
        });

        if(combine)
            zip.file('script.csv', combinedScript);

        downloadZip(zip, `${ProjectTitle} CSV`);
    });

    // Export for Ren'Py
    $('[data-nav="export_renpy"] form').on('submit', function(e) {
        event.preventDefault();
        let combineField = $(this).find('[name="combine"]');
        let combine = combineField[0].checked;
        let combinedScript = '';

        let zip = new JSZip();
        $.each(getOrderedSpreadsheets(), function() {
            let data = $(this).jexcel('getData');
            let sheetName = $(this).data('fsname');

            switch($(this).data('fstype')) {
                case SpreadsheetType.Variables:
                    zip.file(`${sheetName}.rpy`, ArrayToRenPyVariables(data));
                    break;
                case SpreadsheetType.Characters:
                    zip.file(`${sheetName}.rpy`, ArrayToRenPyCharacters(data));
                    break;
                case SpreadsheetType.Script:
                    if(combine) {
                        combinedScript += ArrayToRenPyScript(data);
                    } else {
                        zip.file(`${sheetName}.rpy`, combinedScript + ArrayToRenPyScript(data));
                    }
                    break;
                default:
                    alert('Invalid spreadsheet type');
            }
        });

        if(combine)
            zip.file('script.rpy', combinedScript);

        downloadZip(zip, `${ProjectTitle} RenPy`);
    });
}