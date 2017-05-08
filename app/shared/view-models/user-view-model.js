var fetchModule = require("fetch");
var Observable = require("data/observable").Observable;
var validator = require("email-validator");
var firebase = require("nativescript-plugin-firebase");
var dialogs = require("ui/dialogs");
var frameModule = require("ui/frame");
var appSettings = require('application-settings');

function User(info) {
    info = info || {};
    var viewModel = new Observable({
        email: info.email || "",
        password: info.password || ""
    });

    viewModel.login = function() {
        var email = viewModel.get("email").replace(/\s/g, "");
        var password = viewModel.get("password").replace(/\s/g, "");
        return firebase.login({type: firebase.LoginType.PASSWORD, email: email, password: password}).then(function(errorMessage) {
            console.log(errorMessage);
        }).then(function() {
            appSettings.setString('email', email);
            appSettings.setString('password', password);
        })
    };

    viewModel.register = function() {
        var email = viewModel.get("email").replace(/\s/g, "");
        var password = viewModel.get("password").replace(/\s/g, "");
        return firebase.createUser({email: email, password: password}).then(function(result) {
            var obj = {
                email: email,
                password: password
            }
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
