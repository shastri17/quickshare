var fetchModule = require("fetch");
var Observable = require("data/observable").Observable;
var validator = require("email-validator");
var firebase = require("nativescript-plugin-firebase");
var dialogs = require("ui/dialogs");
var frameModule = require("ui/frame");
var appSettings = require('application-settings');
var LoadingIndicator = require("nativescript-loading-indicator").LoadingIndicator;
var loader = new LoadingIndicator();

// optional options
// android and ios have some platform specific options
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

function User(info) {
    info = info || {};
    var viewModel = new Observable({
        email: info.email || "",
        password: info.password || ""
    });

    viewModel.login = function() {

    };

    viewModel.register = function() {
        loader.show(options);
        var username = viewModel.get("username").replace(/\s/g, "");
        var email = viewModel.get("email").replace(/\s/g, "");
        var password = viewModel.get("password").replace(/\s/g, "");
        var quick_email = username+"@quickshare.com"
        return firebase.createUser({email: quick_email, password: password}).then(function(result) {
            var obj = {
                username: username,
                email: email,
                password: password
            }
            loader.hide();
            return obj;
        })
    };

    viewModel.isValidEmail = function() {
        var email = this.get("email");
        return validator.validate(email);
    };
    return viewModel;
}

function handleErrors(response) {
    if (!response.ok) {
        console.log(JSON.stringify(response));
        throw Error(response.statusText);
    }
    return response;
}

module.exports = User;
