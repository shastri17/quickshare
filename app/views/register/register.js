var dialogsModule = require("ui/dialogs");
var frameModule = require("ui/frame");
var firebase = require("nativescript-plugin-firebase");
var Observable = require("data/observable").Observable;
var observable = require("data/observable");
var appSettings = require('application-settings');
var LoadingIndicator = require("nativescript-loading-indicator").LoadingIndicator;
var loader = new LoadingIndicator();
var validator = require("email-validator");
var mainViewModel = new observable.Observable();
var options = {
    message: 'Loading...',
    progress: 0.65,
    android: {
        indeterminate: true,
        cancelable: false,
        max: 100,
        progressNumberFormat: "%1d/%2d",
        progressPercentFormat: 0.53,
        progressStyle: 1,
        secondaryProgress: 1
    }
};

exports.loaded = function(args) {
    var page = args.object;
    page.bindingContext = mainViewModel;
};

function completeRegistration() {
    loader.show(options);
    var username = mainViewModel.get("username").replace(/\s/g, "");
    var email = mainViewModel.get("email").replace(/\s/g, "");
    var password = mainViewModel.get("password").replace(/\s/g, "");
    var quick_email = username+"@quickshare.com"
    firebase.createUser({email: quick_email, password: password}).then(function(result) {
        dialogsModule.alert("Your account was successfully created.").then(function() {
            appSettings.setString('username', username);
            appSettings.setString('password', password);
            firebase.setValue('/users/' + username, {
                'email': email
            }).then(function(result) {
                console.log("created key: " + result.key);
            });
            firebase.setValue('/devices/' + username, {
                'token': appSettings.getString('token', 'not set')
            }).then(function(result) {
                console.log("created key: " + result.key);
            });
            loader.hide();
            frameModule.topmost().navigate({moduleName:"views/share/share",clearHistory: true,animated: true,
        transition: {
            name: "slide",
            duration: 380,
            curve: "easeIn"
        }});
    }).catch(function(error) {
        var message = "";
        console.log(error);
        if(error == 'Creating a user failed. com.google.firebase.FirebaseException: An internal error has occurred. [ WEAK_PASSWORD  ]')
        message = "Password requires atleast one number."
        else if(error == 'Creating a user failed. com.google.firebase.auth.FirebaseAuthUserCollisionException: The email address is already in use by another account.')
        message = 'The username is already in use.'
        else if(error == 'Creating a user requires an email and password argument')
        message = 'Please enter all fields'
        dialogsModule.alert({message: message, okButtonText: "OK"});
    });

})
}
function onGoBack(args) {
    frameModule.topmost().goBack();
}
exports.register = function() {
    if (validator.validate(mainViewModel.get("email").replace(/\s/g, ""))) {
        completeRegistration();
    } else {
        dialogsModule.alert({
            message: "Enter a valid email address.",
            okButtonText: "OK"
        });
    }
};
exports.mainViewModel = mainViewModel;
exports.onGoBack = onGoBack;
