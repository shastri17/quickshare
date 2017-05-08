var platformModule = require("platform");
var frameModule = require("ui/frame");
var observable = require("data/observable");
var observableArray = require("data/observable-array");
var ImageModule = require("ui/image");
var permissions = require("nativescript-permissions");
var imagepickerModule = require("nativescript-imagepicker");
var fs = require('file-system');
var appSettings = require("application-settings");
var appPath = fs.knownFolders.currentApp().path;
var firebase = require("nativescript-plugin-firebase");
var imageItems = new observableArray.ObservableArray();
var mainViewModel = new observable.Observable();
var imageSource = require("image-source");
var documents = fs.knownFolders.documents();
var page;
var imageName;
var counter = 0;
var applicationModule = require("application");
var ui = require("ui/frame")
function pageLoaded(args) {
    page = args.object;
    page.bindingContext = mainViewModel;
}
var folder = documents.getFolder("downloads");
folder.getEntities().then(function(entities) {
    mainViewModel.set("imageItems", imageItems);
    // entities is array with the document's files and folders.
    entities.forEach(function(entity) {
        console.log(entity.name)
        var item = new observable.Observable();
        item.set("thumb", folder.path + '/' + entity.name);
        item.set("name", entity.name);
        imageItems.push(item);
    });
}, function(error) {
    console.error(error.message);
});

function onSelectSingleTap(args) {
    var context = imagepickerModule.create({mode: "single"});
    if (platformModule.device.os === "Android" && platformModule.device.sdkVersion >= 23) {
        permissions.requestPermission(android.Manifest.permission.READ_EXTERNAL_STORAGE, "I need these permissions to read from storage").then(function() {
            startSelection(context);
            var folder = documents.getFolder("downloads");
            folder.getEntities().then(function(entities) {
                mainViewModel.set("imageItems", imageItems);
                // entities is array with the document's files and folders.
                entities.forEach(function(entity) {
                    console.log(entity.name)
                    var item = new observable.Observable();
                    item.set("thumb", folder.path + '/' + entity.name);
                    imageItems.push(item);
                });
            }, function(error) {
                console.error(error.message);
            });
        }).catch(function() {
            console.log("Uh oh, no permissions - plan B time!");
        });
    } else {
        startSelection(context);

    }
}

function sendImages(fileUri) {
    var sender = appSettings.getString('email', 'not set');
    var receiver = mainViewModel.get('email').replace(/\s/g, "");
    imageName = extractImageName(fileUri);
    console.log(imageName)
    firebase.uploadFile({
        remoteFullPath: 'uploads/images/' + receiver + '/' + imageName,
        localFullPath: fileUri,
        onProgress: function(status) {
            console.log("Uploaded fraction: " + status.fractionCompleted);
            console.log("Percentage complete: " + status.percentageCompleted);
        }
    }).then(function(uploadedFile) {
        console.log("File uploaded: " + JSON.stringify(uploadedFile));
        mainViewModel.set('email', '')
        var cleanusername = receiver.replace("@gmail.com", "");
        firebase.push('/userbucket/' + cleanusername, {
            'sender': sender,
            'receiver': receiver,
            'filename': imageName,
            downloaded: false
        }).then(function(result) {
            console.log("created key: " + result.key);
        });
    }, function(error) {
        console.log("File upload error: " + error);
    });
}

function startSelection(context) {
    context.authorize().then(function() {
        imageItems.length = 0;
        return context.present();
    }).then(function(selection) {

        selection.forEach(function(selected_item) {
            selected_item.getImage().then(function(imagesource) {
                let folder = fs.knownFolders.documents();
                var p = Math.random().toString(36).substring(7);
                let path = fs.path.join(folder.path, p + ".png");
                var task = sendImages(selected_item.fileUri);
                counter++;
            })

        });
    }).catch(function(e) {
        console.log(e.eventName);
    });
}

function extractImageName(fileUri) {
    var pattern = /[^/]*$/;
    var imageName = fileUri.match(pattern);
    return imageName;
}

var onChildEvent = function(result) {
    console.log("Event type: " + result.type);
    console.log("Key: " + result.key);
    console.log("Value: " + JSON.stringify(result.value));
    var receiver = result.value['receiver']
    var user = appSettings.getString('email', 'not set');
    var cleanusername = receiver.replace("@gmail.com", "");
    if (result.value['downloaded'] != true) {
        var image = result.value["filename"]["0"];
        var folder = documents.getFolder("downloads");
        var logoPath = folder.path + '/' + image
        console.log(logoPath)
        firebase.downloadFile({
            remoteFullPath: 'uploads/images/' + user + '/' + result.value["filename"]["0"],
            localFile: fs.File.fromPath(logoPath)
        }).then(function(uploadedFile) {
            var item = new observable.Observable();
            firebase.update('/userbucket/' + cleanusername + '/' + result.key, {downloaded: true});
            var item = new observable.Observable();
            item.set("thumb", logoPath);
            item.set("name", image);
            imageItems.push(item);
        }, function(error) {
            console.log("File download error: " + error);
        });
    }
};
var senderlistener = appSettings.getString('email', 'not set');
var senderlistenerclean = senderlistener.replace("@gmail.com", "");
firebase.addChildEventListener(onChildEvent, "/userbucket/" + senderlistenerclean).then(function(listenerWrapper) {
    var path = listenerWrapper.path;
    var listeners = listenerWrapper.listeners;
});

function listitem(args) {
    frameModule.topmost().navigate({moduleName: "views/share/full-screen-page", context: args.object.src});
}
function deleteitem(args) {
    console.log(args.object.img)
    var folder = documents.getFolder("downloads");
 args.object.parent.parent.refresh();

    var file = folder.getFile((args.object.img).toString());
file.remove()
    .then(function (result) {
mainViewModel.set("imageItems", imageItems);
imageItems.pop(args.object.index);

    }, function (error) {
        // Failed to remove the file.
    });
}
exports.mainViewModel = mainViewModel;
exports.pageLoaded = pageLoaded;
exports.onSelectSingleTap = onSelectSingleTap;
exports.logout = function() {
    appSettings.clear();
    frameModule.topmost().navigate("views/login/login");
};
exports.listitem = listitem;
exports.delete = deleteitem;
