var applicationModule = require("application");
var firebase = require("nativescript-plugin-firebase");
var appSettings = require("application-settings");

firebase.init({
    onPushTokenReceivedCallback: function(token) {
        console.log("Firebase push token: " + token);
    },
    onMessageReceivedCallback: function(message) {
        console.log("Title: " + message.title);
        console.log("Body: " + message.body);
    },
    storageBucket: 'gs://quickshare-f22aa.appspot.com'
}).then(function(instance) {
    console.log("firebase.init done");
}, function(error) {
    console.log("firebase.init error: " + error);
});
var email = appSettings.getString('email', 'not set');
var password = appSettings.getString('password', 'not set');
if (email != 'not set' && password != 'not set') {
    applicationModule.start({moduleName: "views/share/share"});
} else {
    applicationModule.start({moduleName: "views/login/login"});
}
