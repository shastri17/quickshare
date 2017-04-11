var dialogsModule = require("ui/dialogs");
var frameModule = require("ui/frame");

var UserViewModel = require("../../shared/view-models/user-view-model");
var user = new UserViewModel();
var appSettings = require('application-settings');
exports.loaded = function(args) {
    var page = args.object;
    page.bindingContext = user;
    console.log(page)
};

function completeRegistration() {
    user.register().then(function(data) {
        dialogsModule.alert("Your account was successfully created.")
        .then(function() {
            console.log("Saving info")
            appSettings.setString('email', data["email"]);
            appSettings.setString('password', data["password"]);
            frameModule.topmost().navigate("views/list/list");

        });
    }).catch(function(error) {
        console.log(error);
        dialogsModule.alert({message: "Unfortunately we were unable to create your account.", okButtonText: "OK"});
    });
}

exports.register = function() {
    if (user.isValidEmail()) {
        completeRegistration();
    } else {
        dialogsModule.alert({message: "Enter a valid email address.", okButtonText: "OK"});
    }
};
