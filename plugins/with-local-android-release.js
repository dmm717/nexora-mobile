const { withAppBuildGradle } = require('expo/config-plugins');

// Credentials are loaded only by Gradle from an operator-created, protected file.
const signingBlock = String.raw`
// NEXORA_LOCAL_SIGNING_START
def nexoraSigningPath = System.getenv('NEXORA_SIGNING_PROPERTIES')
def nexoraReleaseRequested = gradle.startParameter.taskNames.any { it.toLowerCase().contains('release') }
if (nexoraSigningPath) {
    def nexoraSigningFile = new File(nexoraSigningPath)
    if (!nexoraSigningFile.isFile()) throw new GradleException('Protected upload signing file is missing')
    def nexoraSigning = new Properties()
    nexoraSigningFile.withInputStream { nexoraSigning.load(it) }
    ['storeFile', 'storePassword', 'keyAlias', 'keyPassword'].each {
        if (!nexoraSigning.getProperty(it)) throw new GradleException('Upload signing configuration is incomplete')
    }
    if (nexoraSigning.getProperty('keyAlias') != 'nexora-upload') throw new GradleException('Unexpected upload key alias')
    if (!new File(nexoraSigning.getProperty('storeFile')).isFile()) throw new GradleException('Upload keystore is missing')
    android.signingConfigs.create('nexoraUpload') {
        storeFile new File(nexoraSigning.getProperty('storeFile'))
        storeType 'PKCS12'
        storePassword nexoraSigning.getProperty('storePassword')
        keyAlias nexoraSigning.getProperty('keyAlias')
        keyPassword nexoraSigning.getProperty('keyPassword')
    }
    android.buildTypes.release.signingConfig = android.signingConfigs.nexoraUpload
} else if (nexoraReleaseRequested && System.getenv('NEXORA_ALLOW_DEBUG_RELEASE') != '1') {
    throw new GradleException('Release requires verified upload signing. Run scripts/build-android-local.ps1 with protected signing inputs.')
}
// Also guard aggregate or abbreviated task requests that resolve to release tasks.
gradle.taskGraph.whenReady { graph ->
    if (!nexoraSigningPath && System.getenv('NEXORA_ALLOW_DEBUG_RELEASE') != '1' &&
        graph.allTasks.any { it.project == project && it.name.toLowerCase().contains('release') }) {
        throw new GradleException('Release requires verified upload signing. Run scripts/build-android-local.ps1 with protected signing inputs.')
    }
}
// NEXORA_LOCAL_SIGNING_END
`;

module.exports = (config) => withAppBuildGradle(config, (mod) => {
  if (mod.modResults.language !== 'groovy') throw new Error('Nexora local signing requires the generated Groovy app Gradle file');
  mod.modResults.contents = mod.modResults.contents.replace(/\n\/\/ NEXORA_LOCAL_SIGNING_START[\s\S]*?\/\/ NEXORA_LOCAL_SIGNING_END\n?/g, '\n').trimEnd() + signingBlock + '\n';
  return mod;
});
