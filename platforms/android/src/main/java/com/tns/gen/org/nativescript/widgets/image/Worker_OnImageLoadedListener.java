package com.tns.gen.org.nativescript.widgets.image;

public class Worker_OnImageLoadedListener implements org.nativescript.widgets.image.Worker.OnImageLoadedListener {
	public Worker_OnImageLoadedListener() {
		com.tns.Runtime.initInstance(this);
	}

	public void onImageLoaded(boolean param_0)  {
		java.lang.Object[] args = new java.lang.Object[1];
		args[0] = param_0;
		com.tns.Runtime.callJSMethod(this, "onImageLoaded", void.class, args);
	}

}
