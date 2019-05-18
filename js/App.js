const Format = {
    CSV: 'csv',
    Fountain: 'fountain'
}

const SpreadsheetType = {
    Variables: 'variables',
    Characters: 'characters',
    Script: 'script'
};

const SpreadsheetVariablesKeys = {
    Name: 0,
    Type: 1,
    Default_Value: 2
};

const SpreadsheetCharactersKeys = {
    Name: 0,
    Variable: 1,
    Text_Color: 2,
    Icon: 3,
    Notes: 4
};

const SpreadsheetScriptKeys = {
    Scene: 0,
    Label: 1,
    Narrative: 2,
    Character: 3,
    Dialogue: 4,
    Choice: 5,
    Option: 6,
    Jump: 7,
    Condition: 8,
    Prepend: 9,
    Append: 10
};

const SpreadsheetVariablesHeaders = Object.keys(SpreadsheetVariablesKeys);
const SpreadsheetCharactersHeaders = Object.keys(SpreadsheetCharactersKeys);
const SpreadsheetScriptHeaders = Object.keys(SpreadsheetScriptKeys);

const SpreadsheetVariableTypes = ['string', 'number', 'boolean', 'expression'];

let SpreadsheetTabs;

let SpreadsheetCharacters = [];
let SpreadsheetLabels = [];
let untitledSpreadsheetIndex = 0;
let activeSpreadsheetCell = null;

let nextTabIndex = 1;

let ProjectTitle = 'Untitled';


jQuery(document).ready(function($) {
    // Set up tabs
    SpreadsheetTabs = $('#tabs').tabs();

    SpreadsheetTabs.find('.ui-tabs-nav').sortable({
      axis: 'x',
      items: 'li:not(.static-tab)',
      stop: function() {
        SpreadsheetTabs.tabs('refresh');
        autosave();
      }
    });
    
    // Close icon: removing the tab on click
    SpreadsheetTabs.on('click', 'span.ui-icon-close', function() {
        let tabEl = $(this).closest('li');

        if(!confirm(`Delete scriptsheet ${tabEl.find('a').text()}?`))
            return;

        let panelId = tabEl.remove().attr('aria-controls');
        $(`#${panelId}`).remove();
        SpreadsheetTabs.tabs('refresh');
        autosave();
    });

    // Menu Functions
    $('.menu-toggle').on('click', toggleMenu);

    $('[data-nav] > button').on('click', function() {
        let selectedMenu = $(this).parent().data('nav');
        let menuPanel = $(this).parent().find('.menu-panel');
        if(menuPanel.is(":hidden")) {
            $('.menu-panel:visible').slideUp();
            menuPanel.slideDown();
        }

        // Load autosaves
        if(selectedMenu == 'autosaves') {
            let localSaves = getLocalSaves();

            $('#autosaves').html('');

            if(!Object.keys(localSaves).length) {
                $('#autosaves').html('No save data found');
            } else {
                for(let key in localSaves) {
                    $('#autosaves').append(`<li class="autosave" data-save="${key}" data-name="${localSaves[key]}">${localSaves[key]}<span class="autosave-delete">&times;</span></li>`);
                }
            }
        }
    });

    $('#autosaves').on('click', 'li', function() {
        let saveData = getLocalSave($(this).data('save'));
        loadProject(saveData);
    });
    $('#autosaves').on('click', 'li span', function(event) {
        event.stopPropagation();
        let saveElement = $(this).parent();
        if(!confirm(`Are you sure you wish to delete save data for ${saveElement.data('name')}?`)) 
            return;

        removeLocalSave(saveElement.data('save'));
        saveElement.remove();
    });

    Forms();

    let lastSession = getLastLocalSave();
    if(!lastSession) {
        let title = prompt('Welcome to FlexiScript. Enter a name for your new project!');
        newProject(title);
    } else {
        loadProject(lastSession);
    }

    // DEVELOPMENT ONLY: Open menu on page load
    toggleMenu('theme');

    init();
});

function toggleMenu(togglePanel) {
    $('.menu-panel:visible').slideUp();
    $('#menu').toggleClass('open');
    $('#content').toggleClass('menu-open');

    if(togglePanel) {
        let panelButton = $(`#menu [data-nav="${togglePanel}"] > button`);
        if(!panelButton.length) return;
        panelButton[0].click();
    }
}

function init() {
    let settings = getSettings();
    if(settings.theme)
        setThemeClass(settings.theme.gui, settings.theme.controls);
}

function autosave() {
    console.info('Saving...');

    let saveData = { title: ProjectTitle, spreadsheets: [] };

    $.each(getOrderedSpreadsheets(), function() {
        let data = $(this).jexcel('getData');
        let sheetName = $(this).data('fsname');

        saveData.spreadsheets.push({
            name: sheetName,
            type: $(this).data('fstype'),
            data: data
        });
    });

    let saveName = getSaveName(ProjectTitle);
    setLocalSave(saveName, saveData);
    setLastLocalsave(saveName);
}

function getOrderedSpreadsheets() {
    let spreadsheets = [];

    $('#tabs > ul > li a').each(function() {
        spreadsheets.push($($(this).attr('href')).find('.jexcel'))
    });
    return spreadsheets;
}

function downloadZip(zip, title) {
    zip.generateAsync({ type: 'blob' })
        .then(function(content) {
            let blob = new Blob([content], { type: "application/zip;base64" });
            let downloadLink = $(`<a href="${window.URL.createObjectURL(blob)}" download="${title || 'FlexiScript Export'}.zip" id="download_${Math.floor(Math.random() * 1000)}"></a>`);
            $('body').append(downloadLink);
            downloadLink[0].click();
            downloadLink.remove();
        });
}

function newProject(title) {
    // Check for an existing project name
    let localSaves = getLocalSaves();
        
    if(localSaves[getSaveName(title)]) {
        alert(`Failed to create project. An autosave with the name ${title} already exists.`);
        return;
    }

    // Reset global variables
    SpreadsheetCharacters = [];
    SpreadsheetLabels = [];
    untitledSpreadsheetIndex = 0;
    activeSpreadsheetCell = null;

    nextTabIndex = 1;

    ProjectTitle = title;

    $('#title span').text(title);
    $('#tabs li').each(function() {
        let panelId = $(this).remove().attr('aria-controls');
        $(`#${panelId}`).remove();
        SpreadsheetTabs.tabs('refresh');
    });
        
    // Initialize default spreadsheets
    newSpreadsheet('variables', SpreadsheetType.Variables, true);
    newSpreadsheet('characters', SpreadsheetType.Characters, true);
    let scriptSpreadsheet = newSpreadsheet('script', SpreadsheetType.Script, true);
        scriptSpreadsheet.jexcel('setValue', 'B1', 'start');
    SpreadsheetTabs.tabs('option', 'active', 2);
    autosave();
}

function loadProject(saveData) {
    ProjectTitle = saveData.title;

    $('#title span').text(ProjectTitle);

    $('#tabs li').each(function() {
        let panelId = $(this).remove().attr('aria-controls');
        $(`#${panelId}`).remove();
        SpreadsheetTabs.tabs('refresh');
    });

    for(let i = 0; i < saveData.spreadsheets.length; i++) {
        let spreadsheet = saveData.spreadsheets[i];

        let spreadsheetElement = newSpreadsheet(spreadsheet.name, spreadsheet.type, spreadsheet.name == 'characters' || spreadsheet.name == 'script');
        spreadsheetElement.jexcel('setData', spreadsheet.data, false);
        SpreadsheetTabs.tabs('option', 'active', 2);
    }
    autosave();
}

function setThemeClass(guiStyle, controlsStyle) {
    $('body').attr('class', `theme-gui-${guiStyle} theme-controls-${controlsStyle}`);

    $('[name="gui_theme"]').val(guiStyle);
    $('[name="controls_theme"]').val(controlsStyle);

    setSettings({
        theme: {
            gui: guiStyle,
            controls: controlsStyle
        }
    });
}