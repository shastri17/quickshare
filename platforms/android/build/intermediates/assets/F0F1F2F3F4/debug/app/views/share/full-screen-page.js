
var Observable = require("data/observable").Observable;
var mainViewModel = require("./share").mainViewModel;
var ImageModule = require("ui/image");
var imageSource = require("image-source");
var fs = require("file-system");
var imagepickerModule = require("nativescript-imagepicker");
var frameModule = require("ui/frame");

function navigatedTo(args) {
    var page = args.object;
    var selectedImage = args.context;

    page.bindingContext = new Observable({
        name: selectedImage.imageName,
        image: null // This will generate get/set for image that notify on property changes
    });
console.log(args)
    selectedImage.getImage({ maxWidth: 600, maxHeight: 800}).then(function(imageSource) {
        console.log("Retrieved image: " + imageSource);
        page.bindingContext.image = imageSource;
    }).catch(function(e) {
        console.log("Error: " + e);
    });
}

function onGoBack(args) {
    frameModule.topmost().goBack();
}

exports.navigatedTo = navigatedTo;
exports.onGoBack = onGoBack;
