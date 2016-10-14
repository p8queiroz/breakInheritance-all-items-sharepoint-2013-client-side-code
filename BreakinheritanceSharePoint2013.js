var groupName = 'My SharePoint Site Group Members';
var listName = 'MyListInstanceName';

function breakSecurityInheritanceChangeUser(id, groupName, listName) {

    var clientContext = new SP.ClientContext.get_current();
    var oList = clientContext.get_web().get_lists().getByTitle(listName);
    var itemId = id;
    this.oListItem = oList.getItemById(itemId);

    oListItem.breakRoleInheritance(true);


    /*adding "administrator" role for the user and then add the user to the item */
    var collRoleDefinitionBinding = SP.RoleDefinitionBindingCollection.newObject(clientContext);
    collRoleDefinitionBinding.add(clientContext.get_web().get_roleDefinitions().getByType(SP.RoleType.administrator));


	/*Get group name*/
    var groupCollection = clientContext.get_web().get_siteGroups();
    var group = groupCollection.getByName(groupName);


	/*Add the role to the group and the group to the item */ 
    oListItem.get_roleAssignments().add(group, collRoleDefinitionBinding);


    /*load changes*/
    clientContext.load(oListItem);

    /*commit changes to the server*/
    clientContext.executeQueryAsync(Function.createDelegate(this, function () { Success(groupName); }), Function.createDelegate(this, this.Failure));

}

function Success(groupName) {
    console.log("sucess");
}

function Failure(sender, args) {
    console.log("error");
}


function getAllitems(listName) {
    /*Create custom query. It only retrieves 100 items. You can adapt the query bellow for your need*/
    var requestUrl = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getByTitle('" + listName + "')/items?$filter=(ID ge 1) and (ID le 99)";

    //Return and ajax request (promise)
    return $.ajax({
        url: requestUrl,
        type: "GET",
        headers: {
            "accept": "application/json;odata=verbose",
        },
        success: function (result) {
            $.each(result.d.results, function (index, item) {
				/*Show the ID of the items retrieved*/
				console.log("results : " + item.ID);
                Allitems.push(breakSecurityInheritanceChangeUser(item.ID, groupName, listName));
            });
        },
        error: function (error) {
            /*Something went wrong...*/
            console.log("error");
        }
    });
}

/*Declare an array of deferred objects that hold a breakSecurityInheritanceChangeUser request for each item that will be affected*/
var Allitems = [];

/*First get the items*/
$.when(getAllitems(listName)).then(function () {
    $.when.apply($, Allitems).then(function () {
        console.log("InhehitanceBroken - security item level permission all set!");
    });
});
