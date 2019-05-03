var Type = {
    /* Other Instancess */
    Choice: 'choice',
    Dialogue: 'dialogue',
    Narration: 'narration',

    /* Single Instances */
    End: 'end',
    Start: 'start'
}

var ScriptTemplate = {
    title: 'Untitled',
    characters: {},
    script: {
        'start': { type: Type.Start }
    }
};

var mousePosition = { x: 0, y: 0 };

var Title = ScriptTemplate.title;
var Characters = {};
var Script = ScriptTemplate.script;

jQuery(document).ready(function($) {
    // Check for the various File API support.
    if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
        showDialogSupportWarning();
    }

    // Track mouse position
    $(document).on('mousemove', function(event) {
        mousePosition.x = event.pageX;
        mousePosition.y = event.pageY;
    });
    
    // Escape pressed
    $(document).keyup(function(event) {
        if(event.key && event.key == 'Escape') {
            $('#menu .nav').hide();
            closePanel($('.panel:visible'));
        }
    });

    // Context Menu
    $(document).on('contextmenu', function(event) { return false; });

    $(document).on('mousedown', function(event) {
        if($(event.target).hasClass('node') && event.which == 3 && !isStaticNodeElement($(event.target))) {
            $('#contextmenu').show();
            $('#contextmenu').offset({ left: mousePosition.x, top: mousePosition.y });
        } else {
            if(!$(event.target).attr('data-menuitem'))
                $('#contextmenu').hide();
        }
    });

    $('#contextmenu').on('click', '[data-menuitem="new"]', addNodeDialog);
    $('#contextmenu').on('click', '[data-menuitem="delete"]', deleteNodeDialog);

    // Toggle menu
    $('.menu-toggle').on('click', function() {
        $('#menu .nav').toggle();
    });

    // Jump Clicked
    $('#diagram').on('click', '.node-btn-jump', function() {
        var jumpKey = $(this).data('jump');
        $(`[data-label="${jumpKey}"]`).stop()
            .animate({ backgroundColor: '#888' })
            .delay(1000)
            .animate({ backgroundColor: 'transparent' });
    });

    // Reset state for startup
    resetDiagram();
});

function resetDiagram() {
    $('#diagram').html('');
    addNode($('#diagram'), 'start');
 }

/**
  * @desc Append node to DOM
  * @param {Element} parent - parent container
  * @param {{type: Type.Start, text: "Start", next: ?string }} node - start node type
  * @param {{type: Type.End, text: "End" }} node - end node type
  * @param {{type: Type.Dialogue, text: string, character: key, label: ?string, next: ?key, jump: ?label }} node - dialogue node type
  * @param {{type: Type.Narration, text: string, label: ?string, next: ?key, jump: ?label }} node - narration node type
  * @param {{type: Type.Choice, text: string, label: ?string, options: key[] }} node - choice node type
  * @return {Element} created node
  */
function addNode(parent, key) {
    var node = Script[key];
    if(!node) return;

    var element = $(`
        <li class="node-container node-container-${node.type}">
            <div class="node node-${node.type}" data-key="${key}" ${node.label ? `data-label="${node.label}"`: ''}>
                ${node.type == Type.Start ? Title : node.text}
                ${node.jump? `<span class="node-btn node-btn-jump" data-jump="${node.jump}">&lt; ${node.jump} &gt;</span>` : ''}
            </div>
            <ul class="node-children"></ul>
        </li>
    `);

    $(parent).append(element);

    // Make nodes resizable
    if(!isStaticNode(node.type)) {
        element.find('.node').css({ minHeight: element.find('.node').outerHeight() });
        element.find('.node').resizable();
    }

    var nextParent = element.find('.node-children');

    if(node.type == Type.Choice) {
        var choices = node.options;
        if(choices && Array.isArray(choices))
            for(var i in choices)
                addNode(nextParent, choices[i]);
    } else {
        if(node.next)
            addNode(nextParent, node.next);
    }
    
    return element;
}

function isStaticNode(type) {
    return 
        type == Type.Start 
        || type == Type.End;
}

function isStaticNodeElement(el) {
    return 
        el.hasClass(`node-${Type.Start}`) 
        || el.hasClass(`node-${Type.End}`);
}