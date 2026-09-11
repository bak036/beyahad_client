import { CONFIGURATION_STORE } from '../consts/stores';
import ConfigurationStore from 'src/stores/ConfigurationStore';
import rootStores from '../stores';

export const getCurrentPosition = (): Promise<{ latitude: number; longitude: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('מיקום לא נתמך בדפדפן'));
      return;
    }
    const configurationStore: ConfigurationStore = rootStores[CONFIGURATION_STORE];

    const timeoutMs = configurationStore.getConfiguration.geolocationTimeout;
    let done = false;

    const manualTimeout = setTimeout(() => {
      if (!done) {
        done = true;
        reject(new Error('מיקום לא זמין או שירותי מיקום כבויים'));
      }
    }, timeoutMs);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (done) return;
        done = true;
        clearTimeout(manualTimeout);
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        if (done) return;
        done = true;
        clearTimeout(manualTimeout);

        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error('המשתמש סירב למיקום'));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error('שירותי המיקום כבויים או לא זמינים'));
            break;
          case error.TIMEOUT:
            reject(new Error('זמן קבלת מיקום עבר'));
            break;
          default:
            reject(new Error('שגיאה בלתי צפויה במיקום'));
        }
      },
      {
        timeout: timeoutMs,
        maximumAge: 0,
        enableHighAccuracy: true
      }
    );
  });
};
