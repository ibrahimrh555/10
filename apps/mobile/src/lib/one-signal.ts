const importOneSignal = () => import("react-native-onesignal").catch(() => null);
let modulePromise: ReturnType<typeof importOneSignal> | null = null;
let initialized = false;

async function loadOneSignal() {
  const appId = process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID;
  if (!appId) return null;
  modulePromise ??= importOneSignal();
  const module = await modulePromise;
  if (module && !initialized) {
    try {
      module.OneSignal.initialize(appId);
      initialized = true;
    } catch {
      return null;
    }
  }
  return module;
}

export async function initializeOneSignal(): Promise<boolean> {
  return Boolean(await loadOneSignal());
}

export async function requestOneSignalRegistration(userId: string): Promise<{ granted: boolean; subscriptionId: string | null }> {
  const module = await loadOneSignal();
  if (!module) return { granted: false, subscriptionId: null };
  try {
    const granted = await module.OneSignal.Notifications.requestPermission(false);
    if (!granted) return { granted: false, subscriptionId: null };
    module.OneSignal.login(userId);
    const subscriptionId = await module.OneSignal.User.pushSubscription.getIdAsync();
    return { granted: true, subscriptionId };
  } catch {
    return { granted: false, subscriptionId: null };
  }
}
