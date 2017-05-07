var commonModule = require("./sidedrawer-common");
var utils = require("utils/utils");
var bindable = require("ui/core/bindable");
require("utils/module-merge").merge(commonModule, exports);
var RadSideDrawer = (function (_super) {
    __extends(RadSideDrawer, _super);
    function RadSideDrawer() {
        _super.call(this);
    }
    RadSideDrawer.prototype._addViewToNativeVisualTree = function (child) {
        if (this.showOverNavigation) {
            return true;
        }
        if (this._android && child.android) {
            if (this.mainContent === child) {
                this._android.setMainContent(child.android);
                return true;
            }
            if (this.drawerContent === child) {
                this._android.setDrawerContent(child.android);
                return true;
            }
        }
        return false;
    };
    RadSideDrawer.prototype._removeViewFromNativeVisualTree = function (child) {
        if (this._android && child.android) {
            if (this.mainContent === child) {
                this._android.setMainContent(null);
                child._isAddedToNativeVisualTree = false;
            }
            if (this.drawerContent === child) {
                this._android.setDrawerContent(null);
                child._isAddedToNativeVisualTree = false;
            }
        }
    };
    RadSideDrawer.prototype.initNewDrawer = function () {
        this._android = new com.telerik.android.primitives.widget.sidedrawer.NSSideDrawer(this._context);
        var that = new WeakRef(this);
        this._android.addChangeListener(new com.telerik.android.primitives.widget.sidedrawer.NSDrawerChangeListener({
            onDrawerOpening: function (drawer) {
                if (that.get().hasListeners(commonModule.RadSideDrawer.drawerOpeningEvent)) {
                    var args = {
                        eventName: commonModule.RadSideDrawer.drawerOpeningEvent,
                        object: that.get(),
                        returnValue: false
                    };
                    that.get().notify(args);
                    if (args.returnValue) {
                        return args.returnValue;
                    }
                }
                return false;
            },
            onDrawerOpened: function (drawer) {
                if (that.get().hasListeners(commonModule.RadSideDrawer.drawerOpenedEvent)) {
                    var args = {
                        eventName: commonModule.RadSideDrawer.drawerOpenedEvent,
                        object: that.get()
                    };
                    that.get().notify(args);
                }
            },
            onDrawerClosing: function (drawer) {
                if (that.get().hasListeners(commonModule.RadSideDrawer.drawerClosingEvent)) {
                    var args = {
                        eventName: commonModule.RadSideDrawer.drawerClosingEvent,
                        object: that.get(),
                        returnValue: false
                    };
                    that.get().notify(args);
                    if (args.returnValue) {
                        return args.returnValue;
                    }
                }
                return false;
            },
            onDrawerClosed: function (drawer) {
                if (that.get().hasListeners(commonModule.RadSideDrawer.drawerClosedEvent)) {
                    var args = {
                        eventName: commonModule.RadSideDrawer.drawerClosedEvent,
                        object: that.get()
                    };
                    that.get().notify(args);
                }
            }
        }));
    };
    RadSideDrawer.prototype.initOldDrawer = function () {
        this._android = new com.telerik.android.primitives.widget.sidedrawer.RadSideDrawer(this._context);
        var that = new WeakRef(this);
        this._android.addChangeListener(new com.telerik.android.primitives.widget.sidedrawer.DrawerChangeListener({
            onDrawerOpening: function (drawer) {
                if (that.get().hasListeners(commonModule.RadSideDrawer.drawerOpeningEvent)) {
                    var args = {
                        eventName: commonModule.RadSideDrawer.drawerOpeningEvent,
                        object: that.get(),
                        returnValue: false
                    };
                    that.get().notify(args);
                    if (args.returnValue) {
                        return args.returnValue;
                    }
                }
                return false;
            },
            onDrawerOpened: function (drawer) {
                if (that.get().hasListeners(commonModule.RadSideDrawer.drawerOpenedEvent)) {
                    var args = {
                        eventName: commonModule.RadSideDrawer.drawerOpenedEvent,
                        object: that.get()
                    };
                    that.get().notify(args);
                }
            },
            onDrawerClosing: function (drawer) {
                if (that.get().hasListeners(commonModule.RadSideDrawer.drawerClosingEvent)) {
                    var args = {
                        eventName: commonModule.RadSideDrawer.drawerClosingEvent,
                        object: that.get(),
                        returnValue: false
                    };
                    that.get().notify(args);
                    if (args.returnValue) {
                        return args.returnValue;
                    }
                }
                return false;
            },
            onDrawerClosed: function (drawer) {
                if (that.get().hasListeners(commonModule.RadSideDrawer.drawerClosedEvent)) {
                    var args = {
                        eventName: commonModule.RadSideDrawer.drawerClosedEvent,
                        object: that.get()
                    };
                    that.get().notify(args);
                }
            }
        }));
    };
    RadSideDrawer.prototype._createUI = function () {
        if (this.showOverNavigation) {
            this.initNewDrawer();
        }
        else {
            this.initOldDrawer();
        }
        this._android.setDrawerSize(utils.layout.getDisplayDensity() * this.drawerContentSize);
        this._android.setIsLocked(!this.gesturesEnabled);
        if (this.drawerTransition) {
            this._android.setDrawerTransition(this.drawerTransition.getNativeContent());
        }
        if (this.drawerLocation) {
            this.setDrawerLocation(this.drawerLocation);
        }
    };
    Object.defineProperty(RadSideDrawer.prototype, "android", {
        get: function () {
            return this._android;
        },
        enumerable: true,
        configurable: true
    });
    RadSideDrawer.prototype._onGesturesEnabledChanged = function (data) {
        var value = data.newValue;
        if (!this.android) {
            return;
        }
        this.android.setIsLocked(!value);
    };
    RadSideDrawer.prototype._onDrawerContentSizeChanged = function (data) {
        if (!this.android) {
            return;
        }
        if (data.newValue) {
            this.android.setDrawerSize(java.lang.Integer.valueOf(data.newValue));
        }
    };
    RadSideDrawer.prototype._onDrawerContentChanged = function (data) {
        if (this.showOverNavigation) {
            return;
        }
        if (data.oldValue) {
            this._removeView(data.oldValue);
        }
        if (data.newValue) {
            this._addView(data.newValue);
        }
    };
    RadSideDrawer.prototype._onMainContentChanged = function (data) {
        if (this.showOverNavigation) {
            return;
        }
        if (data.oldValue) {
            this._removeView(data.oldValue);
        }
        if (data.newValue) {
            //This will automatically add the native content in the _addViewToNativeVisualTree...override
            this._addView(data.newValue);
        }
    };
    RadSideDrawer.prototype._onDrawerTransitionChanged = function (data) {
        var newTransition = data.newValue;
        if (!newTransition) {
            return;
        }
        var finalVal;
        if (typeof newTransition == "string") {
            switch (newTransition.toLowerCase()) {
                case commonModule.FadeTransitionString: {
                    finalVal = new FadeTransition();
                    break;
                }
                case commonModule.PushTransitionString: {
                    finalVal = new PushTransition();
                    break;
                }
                case commonModule.RevealTransitionString: {
                    finalVal = new RevealTransition();
                    break;
                }
                case commonModule.ReverseSlideOutTransitionString: {
                    finalVal = new ReverseSlideOutTransition();
                    break;
                }
                case commonModule.ScaleDownPusherTransitionString: {
                    finalVal = new ScaleDownPusherTransition();
                    break;
                }
                case commonModule.ScaleUpTransitionString: {
                    finalVal = new ScaleUpTransition();
                    break;
                }
                case commonModule.SlideAlongTransitionString: {
                    finalVal = new SlideAlongTransition();
                    break;
                }
                case commonModule.SlideInOnTopTransitionString: {
                    finalVal = new SlideInOnTopTransition();
                    break;
                }
                default: {
                    console.log("Error: Not supported value (" + newTransition + ") set to 'drawerTransition'");
                    finalVal = new SlideInOnTopTransition();
                    break;
                }
            }
            if (this.drawerTransition !== finalVal) {
                this.drawerTransition = finalVal;
                return;
            }
        }
        else {
            finalVal = newTransition;
        }
        if (this.android) {
            this.android.setDrawerTransition(finalVal.getNativeContent());
        }
    };
    RadSideDrawer.prototype._onDrawerLocationChanged = function (data) {
        _super.prototype._onDrawerLocationChanged.call(this, data);
        if (!this.android) {
            return;
        }
        if (!data.newValue) {
            return;
        }
        this.setDrawerLocation(data.newValue);
    };
    RadSideDrawer.prototype.setDrawerLocation = function (newLocation) {
        var newLocationToLower = newLocation.toLocaleLowerCase();
        switch (newLocationToLower) {
            case commonModule.SideDrawerLocation.Left.toLocaleLowerCase():
                this.android.setDrawerLocation(com.telerik.android.primitives.widget.sidedrawer.DrawerLocation.LEFT);
                break;
            case commonModule.SideDrawerLocation.Right.toLocaleLowerCase():
                this.android.setDrawerLocation(com.telerik.android.primitives.widget.sidedrawer.DrawerLocation.RIGHT);
                break;
            case commonModule.SideDrawerLocation.Top.toLocaleLowerCase():
                this.android.setDrawerLocation(com.telerik.android.primitives.widget.sidedrawer.DrawerLocation.TOP);
                break;
            case commonModule.SideDrawerLocation.Bottom.toLocaleLowerCase():
                this.android.setDrawerLocation(com.telerik.android.primitives.widget.sidedrawer.DrawerLocation.BOTTOM);
                break;
        }
    };
    RadSideDrawer.prototype._eachChildView = function (callback) {
        if (this.showOverNavigation) {
            // When showOverNavigation is true the drawer has no children. They are
            // inside DrawerPage.
            return;
        }
        if (this.mainContent) {
            callback(this.mainContent);
        }
        if (this.drawerContent) {
            callback(this.drawerContent);
        }
    };
    RadSideDrawer.prototype.closeDrawer = function () {
        if (this.android) {
            this.android.setIsOpen(false);
            _super.prototype.closeDrawer.call(this);
        }
    };
    RadSideDrawer.prototype.showDrawer = function () {
        if (this._android) {
            this._android.setIsOpen(true);
            _super.prototype.showDrawer.call(this);
        }
    };
    return RadSideDrawer;
}(commonModule.RadSideDrawer));
exports.RadSideDrawer = RadSideDrawer;
var DrawerTransitionBase = (function (_super) {
    __extends(DrawerTransitionBase, _super);
    function DrawerTransitionBase() {
        _super.apply(this, arguments);
    }
    DrawerTransitionBase.prototype.getNativeContent = function () {
        return undefined;
    };
    return DrawerTransitionBase;
}(bindable.Bindable));
exports.DrawerTransitionBase = DrawerTransitionBase;
var FadeTransition = (function (_super) {
    __extends(FadeTransition, _super);
    function FadeTransition() {
        _super.apply(this, arguments);
    }
    FadeTransition.prototype.getNativeContent = function () {
        return new com.telerik.android.primitives.widget.sidedrawer.transitions.FadeTransition();
    };
    return FadeTransition;
}(DrawerTransitionBase));
exports.FadeTransition = FadeTransition;
var PushTransition = (function (_super) {
    __extends(PushTransition, _super);
    function PushTransition() {
        _super.apply(this, arguments);
    }
    PushTransition.prototype.getNativeContent = function () {
        return new com.telerik.android.primitives.widget.sidedrawer.transitions.PushTransition();
    };
    return PushTransition;
}(DrawerTransitionBase));
exports.PushTransition = PushTransition;
var RevealTransition = (function (_super) {
    __extends(RevealTransition, _super);
    function RevealTransition() {
        _super.apply(this, arguments);
    }
    RevealTransition.prototype.getNativeContent = function () {
        return new com.telerik.android.primitives.widget.sidedrawer.transitions.RevealTransition();
    };
    return RevealTransition;
}(DrawerTransitionBase));
exports.RevealTransition = RevealTransition;
var ReverseSlideOutTransition = (function (_super) {
    __extends(ReverseSlideOutTransition, _super);
    function ReverseSlideOutTransition() {
        _super.apply(this, arguments);
    }
    ReverseSlideOutTransition.prototype.getNativeContent = function () {
        return new com.telerik.android.primitives.widget.sidedrawer.transitions.ReverseSlideOutTransition();
    };
    return ReverseSlideOutTransition;
}(DrawerTransitionBase));
exports.ReverseSlideOutTransition = ReverseSlideOutTransition;
var ScaleDownPusherTransition = (function (_super) {
    __extends(ScaleDownPusherTransition, _super);
    function ScaleDownPusherTransition() {
        _super.apply(this, arguments);
    }
    ScaleDownPusherTransition.prototype.getNativeContent = function () {
        return new com.telerik.android.primitives.widget.sidedrawer.transitions.ScaleDownPusherTransition();
    };
    return ScaleDownPusherTransition;
}(DrawerTransitionBase));
exports.ScaleDownPusherTransition = ScaleDownPusherTransition;
var ScaleUpTransition = (function (_super) {
    __extends(ScaleUpTransition, _super);
    function ScaleUpTransition() {
        _super.apply(this, arguments);
    }
    ScaleUpTransition.prototype.getNativeContent = function () {
        return new com.telerik.android.primitives.widget.sidedrawer.transitions.ScaleUpTransition();
    };
    return ScaleUpTransition;
}(DrawerTransitionBase));
exports.ScaleUpTransition = ScaleUpTransition;
var SlideAlongTransition = (function (_super) {
    __extends(SlideAlongTransition, _super);
    function SlideAlongTransition() {
        _super.apply(this, arguments);
    }
    SlideAlongTransition.prototype.getNativeContent = function () {
        return new com.telerik.android.primitives.widget.sidedrawer.transitions.SlideAlongTransition();
    };
    return SlideAlongTransition;
}(DrawerTransitionBase));
exports.SlideAlongTransition = SlideAlongTransition;
var SlideInOnTopTransition = (function (_super) {
    __extends(SlideInOnTopTransition, _super);
    function SlideInOnTopTransition() {
        _super.apply(this, arguments);
    }
    SlideInOnTopTransition.prototype.getNativeContent = function () {
        return new com.telerik.android.primitives.widget.sidedrawer.transitions.SlideInOnTopTransition();
    };
    return SlideInOnTopTransition;
}(DrawerTransitionBase));
exports.SlideInOnTopTransition = SlideInOnTopTransition;
//# sourceMappingURL=sidedrawer.js.map