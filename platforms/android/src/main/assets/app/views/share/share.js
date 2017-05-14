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
var uploadedItems = new observableArray.ObservableArray();
var mainViewModel = new observable.Observable();
var imageSource = require("image-source");
var documents = fs.knownFolders.documents();
var page;
var imageName;
mainViewModel.set("uploadedItems", uploadedItems);
var PhotoViewer = require("nativescript-photoviewer");
photoViewer = new PhotoViewer();
var http = require("http");
var counter = 0;
var applicationModule = require("application");
var ui = require("ui/frame")
var LoadingIndicator = require("nativescript-loading-indicator").LoadingIndicator;
var loader = new LoadingIndicator();
var options = {
    message: 'Sending...',
    progress: 0.65,
    android: {
        indeterminate: true,
        cancelable: false,
        max: 100,
        progressNumberFormat: "%1d/%2d",
        progressPercentFormat: 0.53,
        progressStyle: 2,
        secondaryProgress: 1
    }
};
function pageLoaded(args) {
    page = args.object;
    page.bindingContext = mainViewModel;
    titleusername = appSettings.getString('username', 'not set');
    page.bindingContext.titleusername = titleusername;
}
var myImages = {}
var folder = documents.getFolder("downloads");
var user = appSettings.getString('username', 'not set');
folder.getEntities().then(function(mainentities) {
    mainentities.forEach(function(mainentity) {
        var mainfolder = folder.getFolder(mainentity.name);
        mainfolder.getEntities().then(function(subentities) {
            var currarr = []
            subentities.forEach(function(subentity) {
                var final_url = 'file://' + subentity.path
                currarr.unshift(final_url)

            })
            myImages[mainentity.name] = currarr

        })
    })
})
folder.getEntities().then(function(mainentities) {
    mainentities.forEach(function(mainentity) {

        var mainfolder = folder.getFolder(mainentity.name);
        mainfolder.getEntities().then(function(subentities) {
            subentities.forEach(function(subentity) {
                var final_url = 'file://' + subentity.path
                var item = new observable.Observable();
                item.set("thumb", final_url);
                item.set("sender", mainentity.name)
                item.set("name", subentity.name)
                uploadedItems.unshift(item);

            })
        })
    })
})
folder.getEntities().then(function(mainentities) {
    mainViewModel.set("imageItems", imageItems);
    mainentities.forEach(function(mainentity) {

        var mainfolder = folder.getFolder(mainentity.name);
        mainfolder.getEntities().then(function(entities) {
            var entitylen = 0;
            // entities is array with the document's files and folders.
            entities.forEach(function(entity) {
                entitylen = entitylen + 1;

            });
            if (entitylen != 0) {
                var item = new observable.Observable();
                item.set("foldername", mainentity.name);

                imageItems.unshift(item);

            }
        })
    })
}, function(error) {
    console.error(error.message);
});

function onSelectSingleTap(args) {
    var context = imagepickerModule.create({mode: "single"});
    if (platformModule.device.os === "Android" && platformModule.device.sdkVersion >= 23) {
        permissions.requestPermission(android.Manifest.permission.READ_EXTERNAL_STORAGE, "I need these permissions to read from storage").then(function() {
            startSelection(context);
            folder.getEntities().then(function(mainentities) {
                mainentities.forEach(function(mainentity) {
                    var mainfolder = folder.getFolder(mainentity.name);
                    mainfolder.getEntities().then(function(subentities) {
                        var currarr = []
                        subentities.forEach(function(subentity) {
                            var final_url = 'file://' + subentity.path
                            currarr.unshift(final_url)

                        })
                        myImages[mainentity.name] = currarr
                    })
                })
            })
            folder.getEntities().then(function(mainentities) {
                mainViewModel.set("imageItems", imageItems);
                mainentities.forEach(function(mainentity) {
                    var mainfolder = folder.getFolder(mainentity.name);
                    mainfolder.getEntities().then(function(entities) {
                        var entitylen = 0;
                        // entities is array with the document's files and folders.
                        entities.forEach(function(entity) {
                            entitylen = entitylen + 1;
                        });
                        if (entitylen != 0) {
                            var item = new observable.Observable();
                            item.set("foldername", mainentity.name);

                            imageItems.unshift(item);

                        }
                    })
                })
            }, function(error) {
                console.error(error.message);
            });
        }).catch(function() {});
    } else {
        startSelection(context);

    }
}

function sendImages(fileUri, args) {
    loader.show(options);
    var message = mainViewModel.get('message');
    var sender = appSettings.getString('username', 'not set');
    var receiver = mainViewModel.get('username').replace(/\s/g, "");
    imageName = extractImageName(fileUri);
    firebase.uploadFile({
        remoteFullPath: 'uploads/images/' + receiver + '/' + sender + '/' + imageName,
        localFullPath: fileUri,
        onProgress: function(status) {}
    }).then(function(uploadedFile) {
        loader.hide()
        mainViewModel.set('username', '')
        mainViewModel.set('message', '')
        var token = ""
        firebase.push('/transferbucket/' + receiver + '/' + sender, {
            'sender': sender,
            'receiver': receiver,
            'message': message,
            'filename': imageName,
            downloaded: false
        }).then(function(result) {
            uploadItems.pop(args.object.index);
            var onQueryEvent = function(result) {
                // note that the query returns 1 match at a time
                // in the order specified in the query
                if (!result.error) {
                    token = result.value['token']
                    text = sender + " sent you a new photo!\n" + "Message: " + result.value['message']
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
                    }, function(e) {});
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
    }, function(error) {});
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
                uploadItems.unshift(item);
                folder.getEntities().then(function(mainentities) {
                    mainentities.forEach(function(mainentity) {
                        var mainfolder = folder.getFolder(mainentity.name);
                        mainfolder.getEntities().then(function(subentities) {
                            var currarr = []
                            subentities.forEach(function(subentity) {
                                var final_url = 'file://' + subentity.path
                                currarr.unshift(final_url)

                            })
                            myImages[mainentity.name] = currarr
                        })
                    })
                })
                folder.getEntities().then(function(mainentities) {
                    mainViewModel.set("imageItems", imageItems);
                    mainentities.forEach(function(mainentity) {
                        var mainfolder = folder.getFolder(mainentity.name);
                        mainfolder.getEntities().then(function(entities) {
                            var entitylen = 0;
                            // entities is array with the document's files and folders.
                            entities.forEach(function(entity) {
                                entitylen = entitylen + 1;
                            });
                            if (entitylen != 0) {
                                var item = new observable.Observable();
                                item.set("foldername", mainentity.name);
                                if (!(entity.name in imageItems)) {
                                    imageItems.unshift(item);
                                }
                            }
                        })
                    })
                }, function(error) {
                    console.error(error.message);
                });
                counter++;
            })

        });
    }).catch(function(e) {});
}

function extractImageName(fileUri) {
    var pattern = /[^/]*$/;
    var imageName = fileUri.match(pattern);
    return imageName;
}

var onChildEvent = function(result) {
    var keyNames = Object.keys(result.value);
    for (var key in keyNames) {
        var i = keyNames[key]
        var user = appSettings.getString('username', 'not set');
        var folder = documents.getFolder("downloads");
        if (result.value[i]['downloaded'] != true) {
            var myobj = result.value[i]
            var image = myobj["filename"]["0"];
            var receiver = myobj['receiver']
            var logoPath = folder.path + '/' + myobj['sender'] + '/' + image
            path = '/transferbucket/' + receiver + '/' + myobj['sender'] + '/' + i
            firebase.downloadFile({
                remoteFullPath: 'uploads/images/' + user + '/' + myobj['sender'] + '/' + myobj["filename"]["0"],
                localFile: fs.File.fromPath(logoPath)
            }).then(function(uploadedFile) {
                firebase.update(path, {downloaded: true});
                var exists = false;
                imageItems.forEach(function(element) {
                    if (element.foldername == myobj['sender']) {
                        exists = true;
                        return;
                    }
                })
                if (exists == false) {
                    var item = new observable.Observable();
                    item.set("foldername", myobj['sender']);
                    imageItems.unshift(item);
                }

                var item = new observable.Observable();
                item.set("thumb", logoPath);
                item.set("sender", myobj['sender'])
                item.set("name", image)
                uploadedItems.unshift(item);
            }, function(error) {});
        }
        folder.getEntities().then(function(mainentities) {
            mainentities.forEach(function(mainentity) {
                var mainfolder = folder.getFolder(mainentity.name);
                mainfolder.getEntities().then(function(subentities) {
                    var currarr = []
                    subentities.forEach(function(subentity) {
                        var final_url = 'file://' + subentity.path
                        currarr.unshift(final_url)

                    })
                    myImages[mainentity.name] = currarr
                })
            })
        })

    };
}
var senderlistener = appSettings.getString('username', 'not set');
firebase.addChildEventListener(onChildEvent, "/transferbucket/" + senderlistener).then(function(listenerWrapper) {
    var path = listenerWrapper.path;
    var listeners = listenerWrapper.listeners;
});

function listitem(args) {
    photoViewer.showViewer(myImages[args.object.text]);

}
function deleteitem(args) {
    var folder = documents.getFolder("downloads");
    var senderfolder = folder.getFolder(args.object.sender)
    var file = senderfolder.getFile((args.object.img).toString());
    file.remove().then(function(result) {
        var folderindex = args.object.index
        mainViewModel.set("uploadedItems", uploadedItems);
        uploadedItems.pop(args.object.index);
        var folder = documents.getFolder("downloads");
        var user = appSettings.getString('username', 'not set');
        folder.getEntities().then(function(mainentities) {
            mainentities.forEach(function(mainentity) {
                var mainfolder = folder.getFolder(mainentity.name);
                mainfolder.getEntities().then(function(subentities) {
                    var currarr = []
                    subentities.forEach(function(subentity) {
                        var final_url = 'file://' + subentity.path
                        currarr.unshift(final_url)

                    })
                    myImages[mainentity.name] = currarr
                })
            })
        })
        senderfolder.getEntities().then(function(entities) {
            mainViewModel.set("imageItems", imageItems);
            var entitylen = 0;
            // entities is array with the document's files and folders.
            entities.forEach(function(entity) {
                entitylen = entitylen + 1;
            });
            if (entitylen == 0) {
                imageItems.pop(folderindex)

            }
        }, function(error) {
            console.error(error.message);
        });
    }, function(error) {
        // Failed to remove the file.
    });
}
function sendImg(args) {
    sendImages(args.object.img, args);
}
exports.mainViewModel = mainViewModel;
exports.pageLoaded = pageLoaded;
exports.onSelectSingleTap = onSelectSingleTap;
exports.logout = function() {
    appSettings.clear();
    frameModule.topmost().navigate({
        moduleName: "views/login/login",
        animated: true,
        transition: {
            name: "slideRight",
            duration: 380,
            curve: "easeIn"
        }
    });
};

exports.listitem = listitem;
exports.deleteitem = deleteitem;
exports.sendImg = sendImg;
exports.deleteall = function deletall() {
    var folder = documents.getFolder("downloads");
    folder.clear().then(function() {
        mainViewModel.set("uploadedItems", uploadedItems);
        mainViewModel.set("imageItems", imageItems);
        imageItems.splice(0, imageItems.length)
        uploadedItems.splice(0, uploadedItems.length)
    }, function(error) {
        // Failed to clear the folder.
    });
};
exports.viewimage = function(args) {
    var mylist = []
    var path = 'file://' + args.object.src
    mylist.push(path)
    photoViewer.showViewer(mylist);
}
