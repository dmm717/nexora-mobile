import { Linking, Platform } from 'react-native';
import { requireOptionalNativeModule } from 'expo-modules-core';
import { checkForPlayUpdate, isNewerPlayUpdate, openPlayStore, PLAY_STORE_URL } from '../src/services/appUpdate';

jest.mock('expo-modules-core', () => ({
  ...jest.requireActual('expo-modules-core'),
  requireOptionalNativeModule: jest.fn(),
}));

describe('Play update availability and store handoff', () => {
  beforeEach(() => { jest.clearAllMocks(); jest.replaceProperty(Platform, 'OS', 'android'); });
  afterEach(() => { jest.restoreAllMocks(); });
  it.each([
    null, {},
    { available: false, installedVersionCode: 26101502, availableVersionCode: 26101503 },
    { available: true, installedVersionCode: 26101502, availableVersionCode: 26101502 },
    { available: true, installedVersionCode: 26101502, availableVersionCode: 26101501 },
    { available: true, installedVersionCode: 26101502, availableVersionCode: '26101503' },
    { available: true, installedVersionCode: 0, availableVersionCode: 26101503 },
  ])('does not prompt for an unavailable, equal, older or invalid update: %p', info => {
    expect(isNewerPlayUpdate(info)).toBe(false);
  });
  it('accepts only an available strictly newer Play version', () => {
    expect(isNewerPlayUpdate({ available: true, installedVersionCode: 26101502, availableVersionCode: 26101503 })).toBe(true);
  });
  it('does not check native services in development', async () => {
    expect(await checkForPlayUpdate()).toBeNull();
    expect(requireOptionalNativeModule).not.toHaveBeenCalled();
  });
  it('returns no update on production Play failure without throwing', async () => {
    const previous = __DEV__;
    (globalThis as any).__DEV__ = false;
    (requireOptionalNativeModule as jest.Mock).mockReturnValue({ checkForUpdate: () => Promise.reject(new Error('Play unavailable')) });
    try { expect(await checkForPlayUpdate()).toBeNull(); }
    finally { (globalThis as any).__DEV__ = previous; }
  });
  it('returns the newer version only when production Play confirms availability', async () => {
    const previous = __DEV__;
    (globalThis as any).__DEV__ = false;
    const info = { available: true, installedVersionCode: 26101502, availableVersionCode: 26101503 };
    (requireOptionalNativeModule as jest.Mock).mockReturnValue({ checkForUpdate: () => Promise.resolve(info) });
    try { expect(await checkForPlayUpdate()).toEqual(info); }
    finally { (globalThis as any).__DEV__ = previous; }
  });
  it('falls back to the exact public store URL when the market handler is unavailable', async () => {
    const open = jest.spyOn(Linking, 'openURL').mockRejectedValueOnce(new Error('No market handler')).mockResolvedValueOnce(undefined);
    await openPlayStore();
    expect(open.mock.calls).toEqual([
      ['market://details?id=com.vuvietanh.nexora'], [PLAY_STORE_URL],
    ]);
    open.mockRestore();
  });
});
