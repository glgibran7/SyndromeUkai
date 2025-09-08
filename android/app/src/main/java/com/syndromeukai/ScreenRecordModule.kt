package com.syndromeukai

import android.content.Context
import android.media.projection.MediaProjectionManager
import android.os.Build
import android.provider.Settings
import com.facebook.react.bridge.*

class ScreenRecordModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "ScreenRecord"

    @ReactMethod
    fun isRecording(promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                val mgr = reactApplicationContext.getSystemService(Context.MEDIA_PROJECTION_SERVICE) as MediaProjectionManager
                val isRec = Settings.Global.getInt(
                    reactApplicationContext.contentResolver,
                    "screen_recording_active", 0
                ) == 1
                promise.resolve(isRec)
            } else {
                promise.resolve(false)
            }
        } catch (e: Exception) {
            promise.reject("ERR", e)
        }
    }
}
