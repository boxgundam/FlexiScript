function showDialogSupportWarning() {
    alert('The File APIs are not fully supported by your browser.');
}

var addNodeDialog = function() {
    $('#contextmenu').hide();

    var nodeKey = $(this).parent().data('key');
    $("#dialog-edit-node").dialog({
        title: 'Add Node',
        // resizable: false,
        height: "auto",
        width: 400,
        modal: true,
        buttons: {
          'Save': function() {
              // If type is choice add to choice array
              // Append to or reload diagram
              // If there is one underneath
            $( this ).dialog('close');
          }
        }
    });
}

var deleteNodeDialog = function() {
    $('#contextmenu').hide();
        
    var nodeKey = $(this).parent().data('key');
    $("#dialog-delete-node").dialog({
        resizable: false,
        height: "auto",
        width: 400,
        modal: true,
        buttons: {
          'Delete Permanently': function() {
              // Update "next" param in parent
              // Delete all children 
              // Physically remove container
            $( this ).dialog( "close" );
          }
        }
    });
}