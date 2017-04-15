"use strict";
var observable_1 = require("data/observable");
var fileSystemModule = require("file-system");
var utils = require("utils/utils");
var main_queue = dispatch_get_current_queue();
var BackgroundUploadDelegate = (function (_super) {
    __extends(BackgroundUploadDelegate, _super);
    function BackgroundUploadDelegate() {
        return _super.apply(this, arguments) || this;
    }
    BackgroundUploadDelegate.prototype.URLSessionDidBecomeInvalidWithError = function (session, error) {
    };
    BackgroundUploadDelegate.prototype.URLSessionDidReceiveChallengeCompletionHandler = function (session, challenge, comlpetionHandler) {
        var disposition = null;
        var credential = null;
        comlpetionHandler(disposition, credential);
    };
    BackgroundUploadDelegate.prototype.URLSessionDidFinishEventsForBackgroundURLSession = function (session) {
    };
    BackgroundUploadDelegate.prototype.URLSessionTaskDidCompleteWithError = function (session, nsTask, error) {
        dispatch_async(main_queue, function () {
            var task = Task.getTask(session, nsTask);
            if (task._fileToCleanup) {
                var fileManager = utils.ios.getter(NSFileManager, NSFileManager.defaultManager);
                fileManager.removeItemAtPathError(task._fileToCleanup);
            }
            if (error) {
                task.notifyPropertyChange("status", task.status);
                task.notify({ eventName: "error", object: task, error: error });
            }
            else {
                task.notifyPropertyChange("upload", task.upload);
                task.notifyPropertyChange("totalUpload", task.totalUpload);
                task.notify({ eventName: "progress", object: task, currentBytes: nsTask.countOfBytesSent, totalBytes: nsTask.countOfBytesExpectedToSend });
                task.notify({ eventName: "complete", object: task });
                Task._tasks.delete(nsTask);
            }
        });
    };
    BackgroundUploadDelegate.prototype.URLSessionTaskDidReceiveChallengeCompletionHandler = function (session, task, challenge, completionHandler) {
        var disposition = null;
        var credential = null;
        completionHandler(disposition, credential);
    };
    BackgroundUploadDelegate.prototype.URLSessionTaskDidSendBodyDataTotalBytesSentTotalBytesExpectedToSend = function (nsSession, nsTask, data, sent, expectedTotal) {
        dispatch_async(main_queue, function () {
            var task = Task.getTask(nsSession, nsTask);
            task.notifyPropertyChange("upload", task.upload);
            task.notifyPropertyChange("totalUpload", task.totalUpload);
            task.notify({ eventName: "progress", object: task, currentBytes: sent, totalBytes: expectedTotal });
        });
    };
    BackgroundUploadDelegate.prototype.URLSessionTaskNeedNewBodyStream = function (session, task, need) {
    };
    BackgroundUploadDelegate.prototype.URLSessionTaskWillPerformHTTPRedirectionNewRequestCompletionHandler = function (session, task, redirect, request, completionHandler) {
        completionHandler(request);
    };
    BackgroundUploadDelegate.prototype.URLSessionDataTaskDidReceiveResponseCompletionHandler = function (session, dataTask, response, completionHandler) {
        var disposition = null;
        completionHandler(disposition);
    };
    BackgroundUploadDelegate.prototype.URLSessionDataTaskDidBecomeDownloadTask = function (session, dataTask, downloadTask) {
    };
    BackgroundUploadDelegate.prototype.URLSessionDataTaskDidReceiveData = function (session, dataTask, data) {
        dispatch_async(main_queue, function () {
            var jsTask = Task.getTask(session, dataTask);
            var jsonString = NSString.alloc().initWithDataEncoding(data, NSUTF8StringEncoding);
            jsTask.notify({ eventName: "responded", object: jsTask, data: jsonString.toString() });
        });
    };
    BackgroundUploadDelegate.prototype.URLSessionDataTaskWillCacheResponseCompletionHandler = function () {
    };
    BackgroundUploadDelegate.prototype.URLSessionDownloadTaskDidResumeAtOffsetExpectedTotalBytes = function (session, task, offset, expects) {
    };
    BackgroundUploadDelegate.prototype.URLSessionDownloadTaskDidWriteDataTotalBytesWrittenTotalBytesExpectedToWrite = function (session, task, data, written, expected) {
    };
    BackgroundUploadDelegate.prototype.URLSessionDownloadTaskDidFinishDownloadingToURL = function (session, task, url) {
    };
    return BackgroundUploadDelegate;
}(NSObject));
BackgroundUploadDelegate.ObjCProtocols = [NSURLSessionDelegate, NSURLSessionTaskDelegate, NSURLSessionDataDelegate, NSURLSessionDownloadDelegate];
var Session = (function () {
    function Session(id) {
        var delegate = BackgroundUploadDelegate.alloc().init();
        var configuration = NSURLSessionConfiguration.backgroundSessionConfigurationWithIdentifier(id);
        this._session = NSURLSession.sessionWithConfigurationDelegateDelegateQueue(configuration, delegate, null);
    }
    Object.defineProperty(Session.prototype, "ios", {
        get: function () {
            return this._session;
        },
        enumerable: true,
        configurable: true
    });
    Session.prototype.uploadFile = function (file, options) {
        if (!file) {
            throw new Error("File must be provided.");
        }
        var url = NSURL.URLWithString(options.url);
        var request = NSMutableURLRequest.requestWithURL(url);
        var headers = options.headers;
        if (headers) {
            for (var header in headers) {
                var value = headers[header];
                if (value !== null && value !== void 0) {
                    request.setValueForHTTPHeaderField(value.toString(), header);
                }
            }
        }
        if (options.method) {
            request.HTTPMethod = options.method;
        }
        var fileURL;
        if (file.substr(0, 7) === "file://") {
            fileURL = NSURL.URLWithString(file);
        }
        else if (file.charAt(0) === "/") {
            fileURL = NSURL.fileURLWithPath(file);
        }
        var newTask = this._session.uploadTaskWithRequestFromFile(request, fileURL);
        newTask.taskDescription = options.description;
        newTask.resume();
        return Task.getTask(this._session, newTask);
    };
    Session.prototype.multipartUpload = function (params, options) {
        var MPF = new MultiMultiPartForm();
        for (var i = 0; i < params.length; i++) {
            var curParam = params[i];
            if (typeof curParam.name === 'undefined') {
                throw new Error("You must have a `name` value");
            }
            if (curParam.filename) {
                var destFileName = curParam.destFilename || curParam.filename.substring(curParam.filename.lastIndexOf('/') + 1, curParam.filename.length);
                MPF.appendParam(curParam.name, null, curParam.filename, curParam.mimeType, destFileName);
            }
            else {
                MPF.appendParam(curParam.name, curParam.value);
            }
        }
        var header = MPF.getHeader();
        var uploadFile = MPF.generateFile();
        if (!options.headers) {
            options.headers = {};
        }
        options.headers['Content-Type'] = header['Content-Type'];
        var task = this.uploadFile(uploadFile, options);
        task._fileToCleanup = uploadFile;
        return task;
    };
    Session.getSession = function (id) {
        var jsSession = Session._sessions[id];
        if (jsSession) {
            return jsSession;
        }
        jsSession = new Session(id);
        Session._sessions[id] = jsSession;
        return jsSession;
    };
    return Session;
}());
Session._sessions = {};
var Task = (function (_super) {
    __extends(Task, _super);
    function Task(nsSession, nsTask) {
        var _this = _super.call(this) || this;
        _this._task = nsTask;
        _this._session = nsSession;
        return _this;
    }
    Object.defineProperty(Task.prototype, "ios", {
        get: function () {
            return this._task;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Task.prototype, "description", {
        get: function () {
            return this._task.taskDescription;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Task.prototype, "upload", {
        get: function () {
            return this._task.countOfBytesSent;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Task.prototype, "totalUpload", {
        get: function () {
            return this._task.countOfBytesExpectedToSend;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Task.prototype, "status", {
        get: function () {
            if (this._task.error) {
                return "error";
            }
            switch (this._task.state) {
                case 0: return "uploading";
                case 3: return "complete";
                case 2: return "error";
                case 1: return "pending";
            }
        },
        enumerable: true,
        configurable: true
    });
    Task.getTask = function (nsSession, nsTask) {
        var task = Task._tasks.get(nsTask);
        if (task) {
            return task;
        }
        task = new Task(nsSession, nsTask);
        Task._tasks.set(nsTask, task);
        return task;
    };
    return Task;
}(observable_1.Observable));
Task._tasks = new Map();
function session(id) {
    return Session.getSession(id);
}
exports.session = session;
var MultiMultiPartForm = (function () {
    function MultiMultiPartForm() {
        this.clear();
    }
    MultiMultiPartForm.prototype.clear = function () {
        this.boundary = "--------------formboundary" + Math.floor(Math.random() * 100000000000);
        this.header = { "Content-Type": 'multipart/form-data; boundary=' + this.boundary };
        this.fileCount = 0;
        this.fields = [];
    };
    MultiMultiPartForm.prototype.appendParam = function (name, value, filename, mimeType, destFileName) {
        if (filename == null) {
            this.fields.push({ name: name, value: value });
            return;
        }
        mimeType = mimeType || "application/data";
        if (filename.startsWith("~/")) {
            filename = filename.replace("~/", fileSystemModule.knownFolders.currentApp().path + "/");
        }
        var finalName = destFileName || filename.substr(filename.lastIndexOf('/') + 1, filename.length);
        this.fields.push({ name: name, filename: filename, destFilename: finalName, mimeType: mimeType });
    };
    ;
    MultiMultiPartForm.prototype.generateFile = function () {
        var CRLF = "\r\n";
        var fileName = fileSystemModule.knownFolders.documents().path + "/temp-MPF-" + Math.floor(Math.random() * 100000000000) + ".tmp";
        var combinedData = NSMutableData.alloc().init();
        var results = '', tempString, newData;
        for (var i = 0; i < this.fields.length; i++) {
            results += "--" + this.boundary + CRLF;
            results += 'Content-Disposition: form-data; name="' + this.fields[i].name + '"';
            if (!this.fields[i].filename) {
                results += CRLF + CRLF + this.fields[i].value + CRLF;
            }
            else {
                results += '; filename="' + this.fields[i].filename + '"';
                if (this.fields[i].mimeType) {
                    results += CRLF + "Content-Type: " + this.fields[i].mimeType;
                }
                results += CRLF + CRLF;
            }
            tempString = NSString.stringWithString(results);
            results = "";
            newData = tempString.dataUsingEncoding(NSUTF8StringEncoding);
            combinedData.appendData(newData);
            if (this.fields[i].filename) {
                var fileData = NSData.alloc().initWithContentsOfFile(this.fields[i].filename);
                combinedData.appendData(fileData);
                results = CRLF;
            }
        }
        results += CRLF + "--" + this.boundary + "--" + CRLF;
        tempString = NSString.stringWithString(results);
        newData = tempString.dataUsingEncoding(NSUTF8StringEncoding);
        combinedData.appendData(newData);
        var fileManager = utils.ios.getter(NSFileManager, NSFileManager.defaultManager);
        fileManager.createFileAtPathContentsAttributes(fileName, combinedData, null);
        return fileName;
    };
    ;
    MultiMultiPartForm.prototype.getHeader = function () {
        return this.header;
    };
    ;
    return MultiMultiPartForm;
}());
