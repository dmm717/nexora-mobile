package expo.modules.nexoraplayupdate

import android.os.Build
import com.google.android.play.core.appupdate.AppUpdateManagerFactory
import com.google.android.play.core.install.model.UpdateAvailability
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class NexoraPlayUpdateModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("NexoraPlayUpdate")

    AsyncFunction("checkForUpdate") { promise: Promise ->
      val context = appContext.reactContext
      if (context == null) {
        promise.reject("UPDATE_CHECK_UNAVAILABLE", "Update check unavailable", null)
        return@AsyncFunction
      }
      try {
        @Suppress("DEPRECATION")
        val packageInfo = context.packageManager.getPackageInfo(context.packageName, 0)
        @Suppress("DEPRECATION")
        val installed = if (Build.VERSION.SDK_INT >= 28) packageInfo.longVersionCode else packageInfo.versionCode.toLong()
        // Play determines availability for this installed app, account and track.
        AppUpdateManagerFactory.create(context).appUpdateInfo
          .addOnSuccessListener { info ->
            promise.resolve(mapOf(
              "available" to (info.updateAvailability() == UpdateAvailability.UPDATE_AVAILABLE && info.availableVersionCode().toLong() > installed),
              "installedVersionCode" to installed.toDouble(),
              "availableVersionCode" to info.availableVersionCode()
            ))
          }
          .addOnFailureListener {
            promise.reject("UPDATE_CHECK_UNAVAILABLE", "Update check unavailable", null)
          }
      } catch (_: Exception) {
        promise.reject("UPDATE_CHECK_UNAVAILABLE", "Update check unavailable", null)
      }
    }
  }
}
