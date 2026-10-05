const { execFileSync } = require("node:child_process");
const path = require("node:path");
const app = require("../app.json").expo;
const profiles = require("../eas.json").build;
const canonical = "https://api.nexorainterview.io.vn/api/v1";

// Evaluate config in Node, as Expo/EAS does, without Jest Expo env inlining.
function configure(env) {
  return JSON.parse(execFileSync(process.execPath, ["-e", 'console.log(JSON.stringify(require("./app.config")({config: require("./app.json").expo})))'], {
    cwd: path.resolve(__dirname, ".."),
    env: { ...process.env, EAS_BUILD_PROFILE: "", EXPO_PUBLIC_ENV: "", EXPO_PUBLIC_API_URL: "", ...env },
    encoding: "utf8", stdio: ["ignore", "pipe", "pipe"],
  }));
}

describe("Android release configuration", () => {
  it("blocks broad image access while retaining microphone and picker", () => {
    expect(app.android.blockedPermissions).toContain("android.permission.READ_MEDIA_IMAGES");
    expect(app.android.blockedPermissions).not.toContain("android.permission.RECORD_AUDIO");
    expect(app.android.permissions).not.toContain("com.android.vending.BILLING");
    expect(app.plugins).toContainEqual(expect.arrayContaining(["expo-image-picker"]));
  });
  it.each(["preview", "production"])("%s ships the canonical API URL", (profile) => {
    expect(profiles[profile].env.EXPO_PUBLIC_API_URL).toBe(canonical);
    expect(configure({ ...profiles[profile].env, EAS_BUILD_PROFILE: profile }).android.blockedPermissions)
      .toContain("android.permission.READ_MEDIA_IMAGES");
  });
  it.each(["", "https://wrong.example/api/v1", canonical + "/"])("rejects invalid production URL: %s", (url) => {
    expect(() => configure({ EAS_BUILD_PROFILE: "production", EXPO_PUBLIC_ENV: "development", EXPO_PUBLIC_API_URL: url }))
      .toThrow("Production requires EXPO_PUBLIC_API_URL=");
  });
  it("also validates production exports outside EAS", () => {
    expect(() => configure({ EXPO_PUBLIC_ENV: "production" })).toThrow("Production requires EXPO_PUBLIC_API_URL=");
  });
  it("preserves development and test overrides", () => {
    expect(() => configure(profiles.development.env)).not.toThrow();
    expect(() => configure({ EXPO_PUBLIC_API_URL: "https://api.test.com/api/v1" })).not.toThrow();
  });
});
