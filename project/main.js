global.$ = $;

var abar = require('address_bar');
var folder_view = require('folder_view');
var path = require('path');
var fs = require('fs');
var shell = require('nw.gui').Shell;

$(document).ready(function() {
  $('.jq-menu').jqsimplemenu();
	
  folder = new folder_view.Folder($('#files'));
  addressbar = new abar.AddressBar($('#addressbar'));

  loadDir(process.cwd())

  folder.on('navigate', function(dir, mime) {
    if (mime.type == 'folder') {
      loadDir(mime.path)
    } else {
      shell.openItem(mime.path);
    }
  });

  addressbar.on('navigate', function(dir) {
    loadDir(dir)
  });
  
  //load config file
  fs.readFile('config.xml', 'ascii', function(err,data){
    if(err) {
        alert("Error- Can't load config file.")
    	return
    }
    
    configXml = $(data)
   
    updateBookmarksList()
  });

});

var configXml
var folder
var addressbar
var currentPath

function addBookmark(){
    //append to bookmarks config
    var numBookmarks = $(configXml).find("bookmarks > bookmark").length
    $($(configXml).find("bookmarks")).append(
        "<bookmark name='" + (numBookmarks + 1) + 
                    "'>" + currentPath  + "</bookmark>"
    )
    
    updateBookmarksList()
    
    //save file
    writeConfigXml()
}

function writeConfigXml(){
    fs.writeFile('config.xml', "<config>" + $(configXml).html() + "</config>", function (err) {
      if (err){
           alert("Unable to save config file")   
      }
    });    
}

function updateBookmarksList(){
    $("#bookmarksList").html("")
	
	$(configXml).find("bookmarks > bookmark").each(function(i,v){
	    var jBookMarkSnip = $($("#bookmarkSnip").html()) 
	    jBookMarkSnip.find(".bookmarkLink").text($(v).attr("name"));
	    $("#bookmarksList").append(jBookMarkSnip)
	}) 
}

function loadDir(dir){
    currentPath = dir
    folder.open(dir)
    addressbar.set(dir)    
}

function bookmarkClicked(elem){ 
    var elemIndex = $("#bookmarksList > .bookmark").index($(elem).parent())
	var dir = $($(configXml).find("bookmarks > bookmark")
                            [elemIndex]).text()
    loadDir(dir)
}

function deleteBookmark(elem){
	//delete bookmark from configXml
    var elemIndex = $("#bookmarksList > .bookmark").index($(elem).parent())
	$($(configXml).find("bookmarks > bookmark")
                            [elemIndex]).remove()
    
    //delete bookmark from ui
    $(elem).parent().remove();
    
    //save file
    writeConfigXml()
}
