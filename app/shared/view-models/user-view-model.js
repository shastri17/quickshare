var config = require("../../shared/config");
var fetchModule = require("fetch");
var Observable = require("data/observable").Observable;
var validator = require("email-validator");
var firebase = require("nativescript-plugin-firebase");
var dialogs = require("ui/dialogs");
var frameModule = require("ui/frame");
function User(info) {
    info = info || {};
    // You can add properties to observables on creation
    var viewModel = new Observable({
        email: info.email || "",
        password: info.password || ""
    });

    viewModel.login = function() {
        return firebase.login({type: firebase.LoginType.PASSWORD, email: viewModel.get("email"), password: viewModel.get("password")}).then(function(errorMessage) {
            console.log(errorMessage);
        });
    };

    viewModel.register = function() {
        return firebase.createUser({email: viewModel.get("email"), password: viewModel.get("password")}).then(function(result) {
            return result;
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
