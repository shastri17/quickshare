var applicationModule = require("application");
var firebase = require("nativescript-plugin-firebase");
var appSettings = require("application-settings");
firebase.init({
  // Optionally pass in properties for database, authentication and cloud messaging,
  // see their respective docs.
}).then(
    function (instance) {
      console.log("firebase.init done");
    },
    function (error) {
      console.log("firebase.init error: " + error);
    }
);
var email,password;
email = appSettings.getString('email', 'not set');
password = appSettings.getString('password', 'not set');
if(email != 'not set' && password != 'not set'){
applicationModule.start({ moduleName: "views/list/list" });
}
else{
    applicationModule.start({ moduleName: "views/login/login" });
}
