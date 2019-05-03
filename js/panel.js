jQuery(document).ready(function($) {
    // Open panel
    $('[data-panel]').on('click', function() {
        openPanel($(`#panel-${$(this).data('panel')}`));
    });

    // Close panel
    $('.panel .btn-close').on('click', function() {
        closePanel($(this).parent('.panel'));
    });

    initLoadPanel($('#panel-load'));
});

function openPanel(panel) {
    if($('.panel:visible') && $('.panel:visible').attr('id') != panel.attr('id'))
        closePanel($('.panel:visible'));

    panel.show();
    panel.animate({
        left: 0
    });
    $('#menu .nav').hide();

    var panelFunc = panel.attr('id').replace('panel-', 'panel_');

    if(typeof window[panelFunc] === 'function')
        window[panelFunc](panel);
}

function closePanel(panel) {
    panel.animate({ 
        left: -panel.width()
    }, function() {
        panel.hide();
    });
}

function panel_load(panel) {
    var projects = getProjectListFromLocalStorage();
    var containerEl = panel.find('#autosaves');
    containerEl.html('');

    for(var i in projects) {
        containerEl.append(`<button type="button" name="load_autosave" value="${projects[i]}">${projects[i]}</button> <button type="button" class="btn" name="delete_autosave" value="${projects[i]}">&times;</button><br/>`)
    }
}

function panel_save(panel) {
    saveProjectToFile(Title);
}

function initLoadPanel(panel) {
    $('#form-load-file').on('change', function(e) {
        loadProjectFromFile(e);
        $('#form-load-file').find('[name="file"]').val('');
        closePanel(panel);
    });

    $('#form-load-file').on('click', 'button', function(e) {
        e.preventDefault();
        var loadType = $(this).attr('name');

        switch(loadType) {
            case 'load_autosave':
                loadProjectFromLocalStorage($(this).val());
                closePanel(panel);
            break;
            case 'delete_autosave':
                if(confirm(`Delete ${$(this).val()}? This action is permanent.`)) {
                    deleteProjectFromLocalStorage($(this).val());
                    panel_load(panel);
                }
            break;
            case 'load_new':
                var titleInput = $('#form-load-file').find('[name="title"]');

                Title = titleInput.val() || ScriptTemplate.title;
                Characters = {};
                Script = ScriptTemplate.script;
                resetDiagram();
                saveProjectToLocalStorage(Title);

                titleInput.val('');
                closePanel(panel);
            break;
            default:
                alert('Invalid selection');
        }
    });
}





