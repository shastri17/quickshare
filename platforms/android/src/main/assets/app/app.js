var applicationModule = require("application");
var firebase = require("nativescript-plugin-firebase");
var appSettings = require("application-settings");

firebase.init({
    onPushTokenReceivedCallback: function(token) {
        appSettings.setString('token', token);
    },
    onMessageReceivedCallback: function(message) {
    },
    storageBucket: 'gs://quickshare-f22aa.appspot.com'
}).then(function(instance) {
}, function(error) {
});
var username = appSettings.getString('username', 'not set');
var password = appSettings.getString('password', 'not set');
if (username != 'not set' && password != 'not set') {
    applicationModule.start({moduleName: "views/share/share"});
} else {
    applicationModule.start({moduleName: "views/login/login"});
}
