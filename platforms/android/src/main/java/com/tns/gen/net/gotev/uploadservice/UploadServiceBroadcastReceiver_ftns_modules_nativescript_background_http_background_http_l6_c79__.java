package com.tns.gen.net.gotev.uploadservice;

public class UploadServiceBroadcastReceiver_ftns_modules_nativescript_background_http_background_http_l6_c79__ extends net.gotev.uploadservice.UploadServiceBroadcastReceiver implements com.tns.NativeScriptHashCodeProvider {
	public UploadServiceBroadcastReceiver_ftns_modules_nativescript_background_http_background_http_l6_c79__(){
		super();
		com.tns.Runtime.initInstance(this);
	}

	public void onProgress(net.gotev.uploadservice.UploadInfo param_0)  {
		java.lang.Object[] args = new java.lang.Object[1];
		args[0] = param_0;
		com.tns.Runtime.callJSMethod(this, "onProgress", void.class, args);
	}

	public void onCancelled(net.gotev.uploadservice.UploadInfo param_0)  {
		java.lang.Object[] args = new java.lang.Object[1];
		args[0] = param_0;
		com.tns.Runtime.callJSMethod(this, "onCancelled", void.class, args);
	}

	public void onError(net.gotev.uploadservice.UploadInfo param_0, java.lang.Exception param_1)  {
		java.lang.Object[] args = new java.lang.Object[2];
		args[0] = param_0;
		args[1] = param_1;
		com.tns.Runtime.callJSMethod(this, "onError", void.class, args);
	}

	public void onCompleted(net.gotev.uploadservice.UploadInfo param_0, net.gotev.uploadservice.ServerResponse param_1)  {
		java.lang.Object[] args = new java.lang.Object[2];
		args[0] = param_0;
		args[1] = param_1;
		com.tns.Runtime.callJSMethod(this, "onCompleted", void.class, args);
	}

	public boolean equals__super(java.lang.Object other) {
		return super.equals(other);
	}

	public int hashCode__super() {
		return super.hashCode();
	}

}
