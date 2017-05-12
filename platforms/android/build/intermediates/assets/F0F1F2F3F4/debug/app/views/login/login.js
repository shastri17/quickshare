var dialogsModule = require("ui/dialogs");
var frameModule = require("ui/frame");
var viewModule = require("ui/core/view");
var UserViewModel = require("../../shared/view-models/user-view-model");
var user = new UserViewModel();
var appSettings = require("application-settings");
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
  },
  ios: {
    details: "Additional detail note!",
    margin: 10,
    dimBackground: true,
    color: "#4B9ED6", // color of indicator and labels
    // background box around indicator
    // hideBezel will override this if true
    backgroundColor: "yellow",
    hideBezel: true, // default false, can hide the surrounding bezel
    view: UIView, // Target view to show on top of (Defaults to entire window)
    mode: // see iOS specific options below
  }
};


exports.loaded = function(args) {
    var page = args.object;
    if (page.ios) {
        var navigationBar = frameModule.topmost().ios.controller.navigationBar;
        navigationBar.barStyle = UIBarStyle.UIBarStyleBlack;
    }
    page.bindingContext = user;
};

exports.signIn = function() {
    user.login().then(function() {
        loader.show(options); // options is optional

        // Do whatever it is you want to do while the loader is showing, then

        loader.hide();
        frameModule.topmost().navigate({moduleName:"views/share/share", clearHistory: true,animated: true,
    transition: {
        name: "slide",
        duration: 380,
        curve: "easeIn"
    }});
    }).catch(function(error) {
        console.log(error);
        dialogsModule.alert({message: "Wrong username or password", okButtonText: "OK"});
    });
};

exports.register = function() {
    var topmost = frameModule.topmost();
    topmost.navigate({moduleName:"views/register/register",animated: true,
transition: {
    name: "slide",
    duration: 380,
    curve: "easeIn"
}});
};
