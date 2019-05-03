var projectFileExtension = 'flexiscript';
var projectKey = 'project__';

// Load project and update the interface
function _loadProject(json) {
    // Catch invalid JSON data
    try {
        var projectJSON = JSON.parse(json);
        
        Title = projectJSON.title;
        Characters = projectJSON.characters;
        Script = projectJSON.script;

        resetDiagram();
    } catch (e) {
        alert('Invalid project format');
    }
}

function _formatSave() {
    return JSON.stringify({
        title: Title,
        characters: Characters,
        script: Script
    });
}

// Load Projects From Localstorage
function getProjectListFromLocalStorage() {
    var projects = [];
    for(var key in localStorage) {
        if(key.startsWith(projectKey))
            projects.push(key.replace(projectKey, ''));
    }
    return projects;
}

// Load From Localstorage
function loadProjectFromLocalStorage(name) {
    var project = localStorage.getItem(projectKey + name);

    if(!project) {
        alert('Failed to access project data');
        return;
    }

    _loadProject(project);
}


// Save To Localstorage
function saveProjectToLocalStorage(name) {
    localStorage.setItem(projectKey + name, __formatSave());
}

// Remove From Localstorage
function deleteProjectFromLocalStorage(name) {
    localStorage.removeItem(projectKey + name);
}

// Load From File
function loadProjectFromFile(event) {
    var files = event.target.files; 
    var reader = new FileReader();

    if(!files) return;

    reader.onload = function(e) {
        var project = e.target.result;

        if(!project) {
            alert('Failed to load data');
            return false;
        }
        _loadProject(project);
    };
    reader.readAsText(files[0]);
}

// Save to File
function saveProjectToFile(name) {
    var blob = new Blob(
        [_formatSave()],
        { type: "text/plain;charset=utf-8" }
    );

    // window.URL.revokeObjectURL();
    var downloadLink = $(`<a href="${window.URL.createObjectURL(blob)}" download="${name + '.' + projectFileExtension}" id="downloadLink"></a>`);
    $('body').append(downloadLink);
    downloadLink[0].click();
    downloadLink.remove();
}

// Export (Format: Ren'Py Script)




/*

function saveToFile() {
    
}
*/