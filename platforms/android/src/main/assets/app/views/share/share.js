var platformModule = require("platform");
var frameModule = require("ui/frame");
var observable = require("data/observable");
var Observable = require("data/observable").Observable;
var observableArray = require("data/observable-array");
var ImageModule = require("ui/image");
var permissions = require("nativescript-permissions");
var imagepickerModule = require("nativescript-imagepicker");
var fs = require('file-system');
var appSettings = require("application-settings");
var appPath = fs.knownFolders.currentApp().path;
var firebase = require("nativescript-plugin-firebase");
var imageItems = new observableArray.ObservableArray();
var uploadItems = new observableArray.ObservableArray();
var mainViewModel = new observable.Observable();
var imageSource = require("image-source");
var documents = fs.knownFolders.documents();
var page;
var imageName;
var http = require("http");
var counter = 0;
var applicationModule = require("application");
var ui = require("ui/frame")
function pageLoaded(args) {
    page = args.object;
    page.bindingContext = mainViewModel;
    titleusername = appSettings.getString('username', 'not set');
    page.bindingContext.titleusername = titleusername;
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

function sendImages(fileUri, args) {
    var message = mainViewModel.get('message');
    var sender = appSettings.getString('username', 'not set');
    var receiver = mainViewModel.get('username').replace(/\s/g, "");
    console.log(receiver)
    imageName = extractImageName(fileUri);
    firebase.uploadFile({
        remoteFullPath: 'uploads/images/' + receiver + '/' + imageName,
        localFullPath: fileUri,
        onProgress: function(status) {
            console.log("Uploaded fraction: " + status.fractionCompleted);
            console.log("Percentage complete: " + status.percentageCompleted);
        }
    }).then(function(uploadedFile) {
        console.log("File uploaded: " + JSON.stringify(uploadedFile));
        mainViewModel.set('username', '')
        mainViewModel.set('message', '')
        var token = ""
        firebase.push('/userbucket/' + receiver, {
            'sender': sender,
            'receiver': receiver,
            'message': message,
            'filename': imageName,
            downloaded: false
        }).then(function(result) {
            console.log("created key: " + result.key);
            uploadItems.pop(args.object.index);
            var onQueryEvent = function(result) {
                // note that the query returns 1 match at a time
                // in the order specified in the query
                if (!result.error) {
                    console.log("Event type: " + result.type);
                    console.log("Key: " + result.key);
                    console.log("Value: " + JSON.stringify(result.value));
                    console.log(result.value['token'])
                    token = result.value['token']
                    text = sender + " sent you a new photo!"
                    http.request({
                        url: "https://fcm.googleapis.com/fcm/send",
                        method: "POST",
                        headers: {
                            "Authorization": "key=AAAAq0Pli_E:APA91bG2APH54GFsopp2haUNXx2y3h3l5qB9HQvY4c2KoG8O7cVFPFXCd80GPEIehImi9g1qZeLfxPpS3Nnj2BoYt-ckCZJ0yyrgsdlYLNqYLa-r2Oi-7wSjF0L3ZPsdj6xCN88jW42u",
                            "Content-Type": "application/json"
                        },
                        content: JSON.stringify({
                            notification: {
                                title: "Incoming file!",
                                text: text,
                                badge: "1",
                                sound: "default"
                            },
                            data: {
                                foo: "bar"
                            },
                            priority: "High",
                            to: token
                        })
                    }).then(function(response) {
                        result = response.content.toJSON();
                        console.log(result);
                    }, function(e) {
                        console.log("Error occurred " + e);
                    });
                }
            };
            firebase.query(onQueryEvent, "/devices/" + receiver, {
                singleEvent: true,
                orderBy: {
                    type: firebase.QueryOrderByType.CHILD,
                    value: 'token' // mandatory when type is 'child'
                }
            });

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
                mainViewModel.set("uploadItems", uploadItems);
                uploadItems.splice(0, uploadItems.length)
                var item = new observable.Observable();
                item.set("thumb", selected_item.fileUri);
                uploadItems.push(item);

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
    var user = appSettings.getString('username', 'not set');
    if (result.value['downloaded'] != true) {
        var image = result.value["filename"]["0"];
        var folder = documents.getFolder("downloads");
        var logoPath = folder.path + '/' + image
        firebase.downloadFile({
            remoteFullPath: 'uploads/images/' + user + '/' + result.value["filename"]["0"],
            localFile: fs.File.fromPath(logoPath)
        }).then(function(uploadedFile) {
            firebase.update('/userbucket/' + receiver + '/' + result.key, {downloaded: true});
            var item = new observable.Observable();
            item.set("thumb", logoPath);
            item.set("name", image);
            imageItems.push(item);

        }, function(error) {
            console.log("File download error: " + error);
        });
    }
};
var senderlistener = appSettings.getString('username', 'not set');
firebase.addChildEventListener(onChildEvent, "/userbucket/" + senderlistener).then(function(listenerWrapper) {
    var path = listenerWrapper.path;
    var listeners = listenerWrapper.listeners;
});

function listitem(args) {
    frameModule.topmost().navigate({moduleName: "views/share/full-screen-page", context: args.object.src});
}
function deleteitem(args) {
    var folder = documents.getFolder("downloads");

    var file = folder.getFile((args.object.img).toString());
    file.remove().then(function(result) {
        mainViewModel.set("imageItems", imageItems);
        imageItems.pop(args.object.index);

    }, function(error) {
        // Failed to remove the file.
    });
}
function sendImg(args){
    sendImages(args.object.img, args);
}
exports.mainViewModel = mainViewModel;
exports.pageLoaded = pageLoaded;
exports.onSelectSingleTap = onSelectSingleTap;
exports.logout = function() {
    appSettings.clear();
    frameModule.topmost().navigate({moduleName:"views/login/login",animated: true,
transition: {
    name: "slideRight",
    duration: 380,
    curve: "easeIn"
}});
};
exports.listitem = listitem;
exports.delete = deleteitem;
exports.sendImg = sendImg;
exports.deleteall = function() {
    var folder = documents.getFolder("downloads");
    folder.clear().then(function() {
        mainViewModel.set("imageItems", imageItems);
        imageItems.splice(0, imageItems.length)
    }, function(error) {
        // Failed to clear the folder.
    });
}
