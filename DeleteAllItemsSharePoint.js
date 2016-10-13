var itemsToDelete = [];

function getItemsToDelete(ListName) {
	//Get All items of the list
    var requestUrl = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getByTitle(" + ListName + ")/items?$filter=ID gt 0"

    return $.ajax({
        url: requestUrl,
        type: "GET",
        headers: {
            "accept": "application/json;odata=verbose",
        },
        success: function(result) {
            $.each(result.d.results, function(index, item){
                itemsToDelete.push(deleteItem(item));
            });            
        },
        error: function(error) {
            
        }
    });    
}

function deleteItem(item) {
    
    var requestUrl = item.__metadata.uri;

    return $.ajax({
        url: requestUrl,
        type: "POST",
        headers: {
            "accept": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
            "IF-MATCH": item.__metadata.etag,
            "X-HTTP-Method": "DELETE"
        },
        success: function() {
            console.log("Item with ID " + item.__metadata.id + " successfully deleted!");
        },
        error: function(error) {
            
        }
    });    
}



//Process the Request getItemsToDelete
$.when(getItemsToDelete("ListNamePlaceholder")).then(function () {

	//Process the Request after getItemsToDelete finishes
    $.when.apply($, itemsToDelete).then(function(){
        console.log("All items are deleted!");
    });
	
});