var dialogsModule = require("ui/dialogs");
var frameModule = require("ui/frame");
var firebase = require("nativescript-plugin-firebase");
var UserViewModel = require("../../shared/view-models/user-view-model");
var user = new UserViewModel();
var appSettings = require('application-settings');

exports.loaded = function(args) {
    var page = args.object;
    page.bindingContext = user;
};

function completeRegistration() {
    user.register().then(function(data) {
        dialogsModule.alert("Your account was successfully created.").then(function() {
            var username = data["username"];
            var email = data["email"];
            appSettings.setString('username', data["username"]);
            appSettings.setString('password', data["password"]);
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
            frameModule.topmost().navigate({moduleName:"views/share/share",clearHistory: true,animated: true,
        transition: {
            name: "slide",
            duration: 380,
            curve: "easeIn"
        }});
        });
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
}
function onGoBack(args) {
    frameModule.topmost().goBack();
}
exports.register = function() {
    if (user.isValidEmail()) {
        completeRegistration();
    } else {
        dialogsModule.alert({
            message: "Enter a valid email address.",
            okButtonText: "OK"
        });
    }
};
exports.onGoBack = onGoBack;
