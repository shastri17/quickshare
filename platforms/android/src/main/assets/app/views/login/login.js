var dialogsModule = require("ui/dialogs");
var frameModule = require("ui/frame");
var Observable = require("data/observable").Observable;
var observable = require("data/observable");
var firebase = require("nativescript-plugin-firebase");
var appSettings = require("application-settings");
var LoadingIndicator = require("nativescript-loading-indicator").LoadingIndicator;
var loader = new LoadingIndicator();
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
    if (page.ios) {
        var navigationBar = frameModule.topmost().ios.controller.navigationBar;
        navigationBar.barStyle = UIBarStyle.UIBarStyleBlack;
    }
    page.bindingContext = mainViewModel;
};

exports.signIn = function(args) {
    loader.show(options);
    var username = mainViewModel.get("username").replace(/\s/g, "");
    var password = mainViewModel.get("password").replace(/\s/g, "");
    var quick_email = username + "@quickshare.com"
    firebase.login({type: firebase.LoginType.PASSWORD, email: quick_email, password: password}).then(function() {
        appSettings.setString('username', username);
        appSettings.setString('password', password);
        loader.hide();
        frameModule.topmost().navigate({
            moduleName: "views/share/share",
            clearHistory: true,
            animated: true,
            transition: {
                name: "slide",
                duration: 380,
                curve: "easeIn"
            }
        });
    }).catch(function(error) {
        console.log(error);
        dialogsModule.alert({title: "Error", message: "Wrong username or password", okButtonText: "Try again"}).then(function() {
            loader.hide();
        });
    });
};

exports.register = function() {
    var topmost = frameModule.topmost();
    topmost.navigate({
        moduleName: "views/register/register",
        animated: true,
        transition: {
            name: "slide",
            duration: 380,
            curve: "easeIn"
        }
    });
};
exports.mainViewModel = mainViewModel;
