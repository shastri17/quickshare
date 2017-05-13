"use strict";
var application = require("application");
var LoadingIndicator = (function () {
    function LoadingIndicator() {
    }
    LoadingIndicator.prototype.show = function (options) {
        var context = this._getContext();
        if (context) {
            if (typeof options === 'undefined')
                options = {};
            if (typeof this._progressDialog === 'undefined') {
                // Create
                var indeterminate = true;
                var cancelable = false;
                if (options.android) {
                    if (options.android.indeterminate !== undefined)
                        indeterminate = options.android.indeterminate;
                    if (options.android.cancelable !== undefined)
                        cancelable = options.android.cancelable;
                }
                this._progressDialog = android.app.ProgressDialog.show(context, "", options.message || "Loading", indeterminate, cancelable);
            }
            else if (this._progressDialog) {
                // options
                if (options.message && this._progressDialog.setMesssage)
                    this._progressDialog.setMesssage(options.message);
                if (options.progress)
                    this._progressDialog.setProgress(options.progress);
                // android specific
                if (options.android) {
                    if (options.android.indeterminate)
                        this._progressDialog.setIndeterminate(true);
                    if (options.android.max)
                        this._progressDialog.setMax(options.android.max);
                    if (options.android.progressNumberFormat)
                        this._progressDialog.setProgressNumberFormat(options.android.progressNumberFormat);
                    if (options.android.progressPercentFormat)
                        this._progressDialog.setProgressPercentFormat(options.android.progressPercentFormat);
                    if (options.android.progressStyle)
                        this._progressDialog.setProgressStyle(options.android.progressStyle);
                    if (options.android.secondaryProgress)
                        this._progressDialog.setSecondaryProgress(options.android.secondaryProgress);
                }
            }
            return this._progressDialog;
        }
    };
    LoadingIndicator.prototype.hide = function () {
        if (typeof this._progressDialog !== 'undefined') {
            this._progressDialog.hide();
            this._progressDialog.dismiss();
        }
        this._progressDialog = undefined;
    };
    LoadingIndicator.prototype._getContext = function () {
        return application.android.foregroundActivity;
    };
    return LoadingIndicator;
}());
exports.LoadingIndicator = LoadingIndicator;
