package com.tns.gen.com.google.firebase.storage;

public class OnProgressListener implements com.google.firebase.storage.OnProgressListener {
	public OnProgressListener() {
		com.tns.Runtime.initInstance(this);
	}

	public void onProgress(java.lang.Object param_0)  {
		java.lang.Object[] args = new java.lang.Object[1];
		args[0] = param_0;
		com.tns.Runtime.callJSMethod(this, "onProgress", void.class, args);
	}

}
