var applicationModule = require("application");
var firebase = require("nativescript-plugin-firebase");
var appSettings = require("application-settings");
var pushPlugin = require("nativescript-push-notifications");
var self = this;
pushPlugin.register({ senderID: '735578524657' }, function (data){
    self.set("message", "" + JSON.stringify(data));
}, function() { });

pushPlugin.onMessageReceived(function callback(data) {
    self.set("message", "" + JSON.stringify(data));
});
firebase.init({
    onMessageReceivedCallback: function(message) {
  console.log("Title: " + message.title);
  console.log("Body: " + message.body);
  // if your server passed a custom property called 'foo', then do this:
},

  // Optionally pass in properties for database, authentication and cloud messaging,
  // see their respective docs.
  storageBucket: 'gs://quickshare-f22aa.appspot.com',

}).then(
    function (instance) {
      console.log("firebase.init done");
    },
    function (error) {
      console.log("firebase.init error: " + error);
    }
);
appSettings.clear();
var email,password;
email = appSettings.getString('email', 'not set');
password = appSettings.getString('password', 'not set');
if(email != 'not set' && password != 'not set'){
applicationModule.start({ moduleName: "views/list/list" });
}
else{
    applicationModule.start({ moduleName: "views/login/login" });
}
