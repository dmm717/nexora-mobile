# CI dependency remediation after AAB 26101502

This follow-up updates Expo SDK 57 patch dependencies to the versions recommended by `expo install --fix`, and updates the transitive `shell-quote` dependency from 1.10.0 to 1.12.0 through its existing compatible dependency range. No CI checks were disabled or weakened. The critical [GHSA-pqg4-j6r4-53mv advisory](https://github.com/advisories/GHSA-pqg4-j6r4-53mv) is fixed from shell-quote 1.11.0 onward.

Local verification:

- Expo Doctor: 21/21 checks passed.
- TypeScript and ESLint: passed.
- Exact Jest CI command with coverage and runInBand: 20 suites / 150 tests passed. An initial concurrent validation run timed out in one existing interview integration test; the isolated CI-command run passed without changing test behavior/timeouts.
- `npm audit --omit=dev --audit-level=critical`: exit 0, no critical findings. 66 findings remain (49 high, 17 moderate); passing this configured gate is not a claim that all security findings are resolved.

The previously handed-off, signed AAB 26101502 was built from commit `2fd26b14ac85baf61472f3210fa9eb8f38f2fd6e` and earlier local build sources, before this dependency remediation. Its SHA-256 remains `919eddfed2d0f89224cd597b62bda995335b7e18d93fb2f149e94eec3ac134bf`. It does not contain these new dependency patches. No AAB was rebuilt, uploaded or replaced during this follow-up. A subsequent release needs a higher versionCode, a fresh signed native build and binary/device validation.

Existing tracked historical coverage reports are retained; newly generated coverage output is ignored.
