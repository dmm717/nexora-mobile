import React from 'react';
import { Alert, AppState } from 'react-native';
import { render, waitFor, act } from '@testing-library/react-native';
import { AppUpdatePrompt } from '../src/components/AppUpdatePrompt';
import { checkForPlayUpdate, openPlayStore } from '../src/services/appUpdate';

let mockPathname = '/home';
jest.mock('expo-router', () => ({ usePathname: () => mockPathname }));
jest.mock('../src/services/appUpdate', () => ({ checkForPlayUpdate: jest.fn(), openPlayStore: jest.fn() }));

describe('optional update prompt', () => {
  const originalState = AppState.currentState;
  afterAll(() => { (AppState as any).currentState = originalState; });
  beforeEach(() => {
    jest.clearAllMocks();
    (AppState as any).currentState = 'active';
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    mockPathname = '/home';
    (openPlayStore as jest.Mock).mockResolvedValue(undefined);
  });
  afterEach(() => { jest.restoreAllMocks(); });

  it('offers Later and opens the store only after the user chooses Update', async () => {
    (checkForPlayUpdate as jest.Mock).mockResolvedValue({ available: true, availableVersionCode: 26101503 });
    await render(<AppUpdatePrompt />);
    await waitFor(() => expect(Alert.alert).toHaveBeenCalledTimes(1));
    const buttons = (Alert.alert as jest.Mock).mock.calls[0][2];
    expect(buttons.map((button: any) => button.text)).toEqual(['Để sau', 'Cập nhật']);
    expect(openPlayStore).not.toHaveBeenCalled();
    await act(async () => { buttons[1].onPress(); });
    expect(openPlayStore).toHaveBeenCalledTimes(1);
  });
  it('does not display a popup when Play cannot confirm an update', async () => {
    (checkForPlayUpdate as jest.Mock).mockResolvedValue(null);
    await render(<AppUpdatePrompt />);
    await act(async () => {});
    expect(Alert.alert).not.toHaveBeenCalled();
  });
  it('does not check or interrupt an interview', async () => {
    mockPathname = '/interview/abc';
    await render(<AppUpdatePrompt />);
    await act(async () => {});
    expect(checkForPlayUpdate).not.toHaveBeenCalled();
    expect(Alert.alert).not.toHaveBeenCalled();
  });
  it('discards a delayed result when the user has entered an interview', async () => {
    let resolve!: (value: unknown) => void;
    (checkForPlayUpdate as jest.Mock).mockReturnValue(new Promise(done => { resolve = done; }));
    const view = await render(<AppUpdatePrompt />);
    mockPathname = '/interview/abc';
    await view.rerender(<AppUpdatePrompt />);
    await act(async () => { resolve({ available: true, availableVersionCode: 26101503 }); });
    expect(Alert.alert).not.toHaveBeenCalled();
  });
});
