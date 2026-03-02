package com.jaswantsoni41.ilifelearnmobile101.ar

import android.content.Intent
import com.facebook.react.bridge.*

class ARModule(private val reactContext: ReactApplicationContext) :
        ReactContextBaseJavaModule(reactContext) {

    companion object {
        var reactContext: ReactApplicationContext? = null
    }

    init {
        ARModule.reactContext = reactContext
    }

    override fun getName() = "ARNativeModule"

    @ReactMethod
    fun openAR(
            modelPath: String,
            modelName: String?,
            audiosJson: String?,
            animationsJson: String?
    ) {
        val intent = Intent(reactContext, ARActivity::class.java)
        intent.putExtra("modelPath", modelPath)
        if (!modelName.isNullOrBlank()) intent.putExtra("modelName", modelName)
        if (!audiosJson.isNullOrBlank()) intent.putExtra("audiosJson", audiosJson)
        if (!animationsJson.isNullOrBlank()) intent.putExtra("animationsJson", animationsJson)
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        reactContext.startActivity(intent)
    }

    @ReactMethod
    fun setAnimation(index: Int) {
        ARActivityHolder.activity?.runOnUiThread { ARActivityHolder.activity?.playAnimation(index) }
    }

    // Required stubs for NativeEventEmitter on the JS side
    @ReactMethod
    fun addListener(eventName: String) {
        /* no-op */
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        /* no-op */
    }
}
