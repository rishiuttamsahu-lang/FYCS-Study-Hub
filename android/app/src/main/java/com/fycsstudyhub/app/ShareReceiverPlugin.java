package com.fycsstudyhub.app;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "ShareReceiver")
public class ShareReceiverPlugin extends Plugin {
    @PluginMethod
    public void getPendingShare(PluginCall call) {
        JSObject ret = new JSObject();
        if (MainActivity.pendingUri != null) {
            ret.put("uri", MainActivity.pendingUri);
            ret.put("type", MainActivity.pendingType);
            MainActivity.pendingUri = null; // Clear it so it is not processed twice
            MainActivity.pendingType = null;
        } else {
            ret.put("uri", null);
            ret.put("type", null);
        }
        call.resolve(ret);
    }
}
