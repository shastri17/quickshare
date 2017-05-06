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
let uploaded = false;
var documents = fs.knownFolders.documents();
var page;
var timer = require("timer");
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
		var cleanusername = receiver.replace("@gmail.com","");
		console.log(cleanusername);
		firebase.push(
		      '/userbucket/' + cleanusername,
		      {
				  'sender': sender,
				  'receiver': receiver,
				  'filename': imageName,
				  downloaded : false,
		      }
		  ).then(
		      function (result) {
		        console.log("created key: " + result.key);
		      }
		  );
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
					var p = Math.random().toString(36).substring(7);
                    let path = fs.path.join(folder.path, p +".png");
                    let saved = imagesource.saveToFile(path, "png");

                    if(saved){
                        var task = sendImages("Image"+counter+".png", path);
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
let count = 0;
var onChildEvent = function(result) {
   console.log("Event type: " + result.type);
   console.log("Key: " + result.key);
   console.log("Value: " + JSON.stringify(result.value));
   count=count+1;
   console.log(count)
   var receiver = result.value['receiver']
   var cleanusername = receiver.replace("@gmail.com","");
   var user = appSettings.getString('email', 'not set');
   console.log(user)
   val = JSON.stringify(result.value)
   if(result.value['downloaded'] != true){
   var image = result.value["filename"]["0"];
 var logoPath = documents.path + "/" + image
   console.log(result.value["receiver"])
	   console.log("need to download")
	   console.log(logoPath)
	   console.log("here")
	   console.log(result.value["filename"]["0"])

      /* do something*/
	  firebase.downloadFile({
   // optional, can also be passed during init() as 'storageBucket' param so we can cache it
   bucket: 'gs://quickshare-f22aa.appspot.com',
   // the full path of an existing file in your Firebase storage
   remoteFullPath: 'uploads/images/' + user+ '/'+ result.value["filename"]["0"],
   // option 1: a file-system module File object
   localFile: fs.File.fromPath(logoPath),
 }).then(
	 function (uploadedFile) {
	   console.log("File downloaded to the requested location");
	   var item = new observable.Observable();
	   firebase.update(
	       '/userbucket/' + cleanusername + '/' + result.key,
	       {downloaded:true}
	   );

	 mainViewModel.set("thumb", logoPath);
	 mainViewModel.set("uri", image);
	 imageItems.push(item);
	 mainViewModel.set("imageItems", imageItems);
	 },
	 function (error) {
	   console.log("File download error: " + error);
	 }
 );

}


 };
var senderlistener = appSettings.getString('email', 'not set');
var senderlistenerclean = senderlistener.replace("@gmail.com","");
 // listen to changes in the /users path
 firebase.addChildEventListener(onChildEvent, "/userbucket/"+senderlistenerclean).then(
   function(listenerWrapper) {
	 var path = listenerWrapper.path;
	 var listeners = listenerWrapper.listeners; // an Array of listeners added
	 // you can store the wrapper somewhere to later call 'removeEventListeners'
   }
 );
exports.mainViewModel = mainViewModel;

exports.pageLoaded = pageLoaded;
exports.onSelectSingleTap = onSelectSingleTap;
