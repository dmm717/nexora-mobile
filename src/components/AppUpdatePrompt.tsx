import { useEffect, useRef } from 'react';
import { Alert, AppState } from 'react-native';
import { usePathname } from 'expo-router';
import { checkForPlayUpdate, openPlayStore } from '@/services/appUpdate';

export function AppUpdatePrompt() {
  const pathname = usePathname();
  const pathRef = useRef(pathname);
  useEffect(() => { pathRef.current = pathname; }, [pathname]);
  const lastCheck = useRef(0);
  const notified = useRef(new Set<number>());
  const checking = useRef(false);

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      // Do not interrupt an interview, microphone check or report flow.
      if (AppState.currentState !== 'active' || pathRef.current.includes('/interview') ||
          checking.current || Date.now() - lastCheck.current < 15 * 60 * 1000) return;
      checking.current = true;
      lastCheck.current = Date.now();
      try {
        const info = await checkForPlayUpdate();
        if (!mounted || AppState.currentState !== 'active' || pathRef.current.includes('/interview') ||
            !info || notified.current.has(info.availableVersionCode)) return;
        notified.current.add(info.availableVersionCode);
        Alert.alert('Có phiên bản Nexora AI mới',
          'Cập nhật để nhận các cải thiện và bản sửa lỗi mới nhất. Bạn vẫn có thể tiếp tục sử dụng phiên bản hiện tại.', [
            { text: 'Để sau', style: 'cancel' },
            { text: 'Cập nhật', onPress: () => {
              void openPlayStore().catch(() => {
                Alert.alert('Chưa mở được CH Play', 'Vui lòng mở CH Play, tìm Nexora AI và chọn Cập nhật.');
              });
            } },
          ]);
      } finally {
        checking.current = false;
      }
    };
    void check();
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') void check();
    });
    return () => { mounted = false; subscription.remove(); };
  }, []);
  return null;
}
