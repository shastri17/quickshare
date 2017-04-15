var platformModule = require("platform");
var frameModule = require("ui/frame");
var observable = require("data/observable");
var observableArray = require("data/observable-array");
var ImageModule = require("ui/image");
var permissions = require( "nativescript-permissions");
var imagepickerModule = require("nativescript-imagepicker");
var fs = require('file-system');
var appSettings = require("application-settings");
var appPath = fs.knownFolders.currentApp().path;
var firebase = require("nativescript-plugin-firebase");
var imageItems = new observableArray.ObservableArray();
var mainViewModel = new observable.Observable();
var imageSource = require("image-source");
mainViewModel.set("imageItems", imageItems);

var page;
var imageName;
var counter = 0;

function pageLoaded(args) {
	page = args.object;
    page.bindingContext = mainViewModel;
}

function onSelectSingleTap(args) {
	var context = imagepickerModule.create({
		mode: "single"
	});

	if (platformModule.device.os === "Android" && platformModule.device.sdkVersion >= 23) {
        permissions.requestPermission(android.Manifest.permission.READ_EXTERNAL_STORAGE, "I need these permissions to read from storage")
        .then(function() {
            console.log("Permissions granted!");
            startSelection(context);
        })
        .catch(function() {
            console.log("Uh oh, no permissions - plan B time!");
        });
    } else {
        startSelection(context);
    }
}

function sendImages(uri, fileUri) {
var sender = appSettings.getString('email', 'not set');
var receiver = mainViewModel.get('email')
console.log(receiver)
firebase.push(
      '/transfers',
      {
		  'sender': sender,
		  'receiver': receiver,
      }
  ).then(
      function (result) {
        console.log("created key: " + result.key);
      }
  );
    imageName = extractImageName(fileUri);
	firebase.uploadFile({
    // optional, can also be passed during init() as 'storageBucket' param so we can cache it (find it in the Firebase console)
    // the full path of the file in your Firebase storage (folders will be created)

    remoteFullPath: 'uploads/images/' + receiver + '/' + imageName,
    // option 1: a file-system module File object
    // option 2: a full file path (ignored if 'localFile' is set)
    localFullPath: fileUri,
    // get notified of file upload progress
    onProgress: function(status) {
      console.log("Uploaded fraction: " + status.fractionCompleted);
      console.log("Percentage complete: " + status.percentageCompleted);
    }
  }).then(
      function (uploadedFile) {
        console.log("File uploaded: " + JSON.stringify(uploadedFile));
		mainViewModel.set('email','')
      },
      function (error) {
        console.log("File upload error: " + error);
      }
  );
}

function startSelection(context) {
	context
		.authorize()
		.then(function() {
            imageItems.length = 0;
			return context.present();
		})
		.then(function(selection) {
			selection.forEach(function(selected_item) {
                selected_item.getImage().then(function(imagesource){
                    let folder = fs.knownFolders.documents();
                    let path = fs.path.join(folder.path, "Test"+counter+".png");
                    let saved = imagesource.saveToFile(path, "png");

                    if(saved){
                        var task = sendImages("Image"+counter+".png", path);
                        var item = new observable.Observable();
                        item.set("thumb", imagesource);
                        item.set("uri", "Test"+counter+".png");
                        item.set("uploadTask", task);

                        imageItems.push(item);
                    }
                    counter++;
                })

			});
		}).catch(function (e) {
			console.log(e.eventName);
		});
}

function extractImageName(fileUri) {
    var pattern = /[^/]*$/;
    var imageName = fileUri.match(pattern);

    return imageName;
}

exports.mainViewModel = mainViewModel;

exports.pageLoaded = pageLoaded;
exports.onSelectSingleTap = onSelectSingleTap;
