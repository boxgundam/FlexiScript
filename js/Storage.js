const savePrefix = 'autosave__';
const lastSaveKey = 'lastAutosave__';
const settingsKey = 'settings__';

// Get save name for Localstorage
function getSaveName(title) {
    return `${savePrefix}${title.replace(/ /g, '_')}`;
}

// Update last autosave
function setLastLocalsave(save) {
    return localStorage.setItem(lastSaveKey, save);
}

function getSettings() {
    let settingsString = localStorage.getItem(settingsKey);
    let settingsJSON = {};

    // Catch invalid JSON data
    try {
        settingsJSON = JSON.parse(settingsString) || {};
    } catch (e) {
        alert('Failed to load save data');
    }
    return settingsJSON;
}

function setSettings(options) {
    localStorage.setItem(settingsKey, JSON.stringify(Object.assign(getSettings(), options)));
}

// List saves From Localstorage
function getLastLocalSave() {
    return getLocalSave(localStorage.getItem(lastSaveKey));
}

// List saves From Localstorage
function getLocalSaves() {
    let saves = {};
    for(let key in localStorage)
        if(key.startsWith(savePrefix))
        saves[key] = key.replace(savePrefix, '').replace(/_/g, ' ');
    return saves;
}

// Retrieve From Localstorage
function getLocalSave(save) {
    let saveString = localStorage.getItem(`${save}`);
    let saveJSON = [];

    // Catch invalid JSON data
    try {
        saveJSON = JSON.parse(saveString) || [];
    } catch (e) {
        alert('Failed to load save data');
    }
    return saveJSON;
}

// Save To Localstorage
function setLocalSave(save, data) {
    localStorage.setItem(save, JSON.stringify(data));
}

// Remove From Localstorage
function removeLocalSave(save) {
    localStorage.removeItem(save);
}