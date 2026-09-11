import * as React from 'react';
import { useEffect, useState } from 'react';
import Lang from 'src/config/Language';
import { RoutesPath } from 'src/consts/RoutesPath';
import { AUTH_STORE, BIOMETRICS_STORE, MESSAGES_STORE, VIEW_STORE } from 'src/consts/stores';
import { ByometricType, PlatformApp } from 'src/models/enums';
import rootStores from 'src/stores';
import AuthStore from 'src/stores/AuthStore';
import BiometricsStore from 'src/stores/BiometricsStore';
import MessagesStore from 'src/stores/MessagesStore';
import ViewStore from 'src/stores/ViewStore';


interface Props {
    history?: any;
}
interface IState {
    stepOfInitialBiometrics: number;
}

const authStore: AuthStore = rootStores[AUTH_STORE];
const viewStore: ViewStore = rootStores[VIEW_STORE];
const messagesStore: MessagesStore = rootStores[MESSAGES_STORE];
const biometricsStore: BiometricsStore = rootStores[BIOMETRICS_STORE];


const BiometricsSettings : React.FC<Props> = ({
	history,
}) => {
    const [stepOfInitialBiometrics, setStepOfInitialBiometrics] = useState<number>(0);
    const [rerander,setRerander] = useState<boolean>(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        biometricsStore.setStepOfInitialBiometricsSuccess(() => setStepOfInitialBiometrics(2))
        // biometricsStore.setInitialBiometricInProgress(true);
        if (!biometricsStore.initialBiometricsInProgress) {
            biometricsStore.isBiometricsSettingsSuccess = true; // need to not call deleteKeysFunc() and delete biometric keys in componentWillUnmount
            history.push(RoutesPath.root);
        }

        biometricsStore.setForceUpdateComponentBiometricsSettings(() => setRerander(!rerander));
        (async () => {
            await messagesStore.getMessagesForBiometricsComponent();
            biometricsStore.forceUpdateComponentBiometricsSettings();
        })();

        return () => {
            if (!biometricsStore.isBiometricsSettingsSuccess) {
                biometricsStore.deleteKeysFunc();
            }
            biometricsStore.setInitialBiometricInProgress(false);
            biometricsStore.setIsBiometricsSettingsSuccess(null);
            biometricsStore.createSignature = null;
        }
    },[])

    const cuntinueBiometricsInitial = () => {
        biometricsStore.stepOfInitialBiometrics = 1;
        biometricsStore.postMessageToNativeApp('biometricKeysExist');
        setStepOfInitialBiometrics(1);
    }

    const failSettingsBiometrics = () => {
        authStore.logout();
    }
    return (
        <div className='root-biometrics-initial'>
            <div
                className='mainTitle'
                dangerouslySetInnerHTML={{
                    __html: messagesStore.mainTitle.replace('{0}', authStore.currentUser.firstName),
                }}
            />
            <div className='main-biometrics-initial'>
                {
                    stepOfInitialBiometrics === 0 &&
                    <>
                        <div className='container-biometrics-initial'>
                            {
                                // biometricsStore.isSensorAvailableResult.biometryType === ByometricType.TouchID &&
                                <>
                                    <div
                                        className='secondaryTitleFingerprint'
                                        dangerouslySetInnerHTML={{
                                            __html: biometricsStore.platformReactNative.OS === PlatformApp.Ios ? messagesStore.secondaryTitleBiometrics : messagesStore.secondaryTitleFingerprint,
                                        }}
                                    />
                                    <div
                                        className='bodyTextFingerprint'
                                        dangerouslySetInnerHTML={{
                                            __html: biometricsStore.platformReactNative.OS === PlatformApp.Ios ? messagesStore.bodyTextBiometrics : messagesStore.bodyTextFingerprint,
                                        }}
                                    />
                                </>
                            }
                        </div>
                        <div className='continer-buttons-biometrics-settings'>
                            <button className='btn-biometrics-settings blue-btn' onClick={cuntinueBiometricsInitial}>המשך</button>
                            <button className='btn-biometrics-settings white-btn' onClick={authStore.logout}>ביטול</button>
                        </div>
                    </>
                }
                {
                    stepOfInitialBiometrics === 1 &&
                    <div className='container-biometrics-instructions'>
                        <div className='text-biometrics-instructions'>
                            <div>{`${authStore.currentUser.firstName}, ${biometricsStore.platformReactNative.OS === PlatformApp.Ios ? Lang.format('titleBiometricsInitial') : Lang.format('titleFingerPrintInitial')}`}</div>
                        </div>
                        {
                            biometricsStore.createSignature && biometricsStore.isBiometricsSettingsSuccess === false &&
                            <div className='popup-biometrics-signautre-fail'>
                                <div className='signautre-title'>{Lang.format('titleBiometrics')}</div>
                                <div className='signautre-text'>{Lang.format('biometricsFailMsg')}</div>
                                <img
                                    className='signautre-icon'
                                    src={require('../../../../assets/icon-fingerprint-fail.png')}
                                />
                                <button className='signautre-fail-button btn-biometrics-settings' onClick={failSettingsBiometrics}>סגירה</button>
                            </div>
                        }
                    </div>
                }
                {
                    stepOfInitialBiometrics === 2 &&
                    <div className='container-success-biometrics-initial'>
                        <img
                            className='signautre-icon'
                            src={require('../../../../assets/check-mark.png')}
                        />
                        <div className='signautre-title'>{Lang.format('biometricsSettingsSuccessTitle')}</div>
                        <div className='signautre-text'>{biometricsStore.platformReactNative.OS === PlatformApp.Ios ? Lang.format('bioemtricsSettingsSuccessMsg') : Lang.format('fingerprintSettingsSuccessMsg')}</div>
                        <button className='signautre-button btn-biometrics-settings' onClick={biometricsStore.navigateToWebSite}>סיום</button>
                    </div>
                }
            </div>
        </div>
    );
}
export default BiometricsSettings;