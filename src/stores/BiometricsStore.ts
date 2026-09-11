import { action, makeAutoObservable, makeObservable, observable } from "mobx";
import { RoutesPath } from "src/consts/RoutesPath";
import AlertUtils from "src/utils/AlertUtils";
import { registrationStatus } from "src/utils/authentication/enums";
import ErrorUtils from "src/utils/errorHandling/ErrorUtils";
import NofhonitStorage from "src/utils/NofhonitStorage";
import BiometricsService from "../services/BiometricsService";
import AuthStore from "./AuthStore";
import MessagesStore from "./MessagesStore";
import ViewStore from "./ViewStore";
import { History } from 'history';
import { BiometricsErros_Android, BiometricsErros_Ios, PlatformApp } from "src/models/enums";
import CartStore from "./CartStore";
import MenuStore from "./MenuStore";
import ConfigurationStore from "./ConfigurationStore";
import rootStores from ".";
import { CONFIGURATION_STORE } from "src/consts/stores";

export default class BiometricsStore {

	@observable history: History;
    @observable otp: string;
	@observable hash = "";

	@observable platformReactNative: any;
	@observable isSupportBimetricsButNotEnrolled: boolean = false;
	@observable initialBiometricsInProgress: Boolean = false;
	@observable stepOfInitialBiometricsSuccess: any;
	@observable stepOfInitialBiometrics: number;
	@observable payloadSignature: string;
	@observable isBiometricsSettingsSuccess: boolean | null;
	@observable forceUpdateComponentBiometricsSettings: any;
	@observable cardModalCallback: any;
	// @observable loginBiometricOption: string = ByometricType.TouchID;

	@observable isSensorAvailableResult: any = '';
	@observable createKeys: any;
	@observable biometricKeysExist: any;
	@observable deleteKeys: any;
	@observable createSignature: any;
	@observable simplePrompt: any;

	authStore: AuthStore;
	viewStore: ViewStore;
	messagesStore: MessagesStore;
	menuStore: MenuStore;
	constructor(authStore: AuthStore, viewStore: ViewStore, messagesStore: MessagesStore, menuStore: MenuStore) {
		makeObservable(this);
		this.authStore = authStore;
		this.viewStore = viewStore;
		this.messagesStore = messagesStore;
		this.menuStore = menuStore;
	}

	@action
	savetHistory = (history: History) => {
		this.history = history;
	}

	@action
	setStepOfInitialBiometricsSuccess = (callback: any) => {
		this.stepOfInitialBiometricsSuccess = callback;
	}

	@action
	setOtp = (val: string) => {
		this.otp = val;
	}

	
	@action
	setHash = (val: string) => {
		this.hash = val;
	}

	@action
	onMessageFromNativeApp = (message: any) => {
		switch (message.action) {
			case 'isSensorAvailable':
				this.isSensorAvailableResult = message.resultObject;
				break;
			case 'createKeys':
				this.createKeys = message.resultObject;
				this.savePublicKey();
				break;
			case 'biometricKeysExist':
				this.biometricKeysExist = message.resultObject;
				this.checkIfKeyExists()
				break;
			case 'deleteKeys':
				this.deleteKeys = message.resultObject;
				break;
			case 'createSignature':
				this.createSignature = message.resultObject;
				this.verifySignautre();
				break;
			case 'simplePrompt':
				this.simplePrompt = message.resultObject;
				break;
			case 'getPlatform':
				this.platformReactNative = message.resultObject;
				this.disabledAutozoomIos();
				break;
			case 'openHamburgerMenu':
				this.menuStore.toggleIsOpenBurgerMenu();
				break;
			case 'isLatestVersionApp':
				if (message.resultObject)
					this.menuStore.setshowSideBarFalse();
				break;
			case 'openSearchBox':
				this.openSearchBox();
				break;
			case 'goToHomePage':
				this.history.push('/')
				break;
			case 'getOtp':
				this.setOtp(message.code);
				break;
			case 'getHash':
				if (message.code != undefined) {
					this.setHash(message.code);
				}
				break;
			case 'openExternalDeepLink':
				try {
					const fullUrl =  message.resultObject.toString();

					const urlObject = new URL(fullUrl);
					const path = urlObject.pathname;
					window.location.href = path;

				} catch (error) {
					alert('Error parsing URL: ' + error.message);
				}

				break;
		}
	}

	disabledAutozoomIos = () => {
		if (this.platformReactNative.OS == PlatformApp.Ios) {
			const el = document.querySelector('meta[name=viewport]');
			if (el !== null) {
				let content = String(el.getAttribute('content'));
				let re = /maximum\-scale=[0-9\.]+/g;
				if (re.test(content)) {
					content = content.replace(re, 'maximum-scale=1.0');
				} else {
					content = [content, 'maximum-scale=1.0'].join(', ')
				}
				el.setAttribute('content', content);
			}
		}
	}

	openSearchBox = () => {
		if (this.authStore.canActivateAction) {
			if (this.menuStore.showSearchContainerInMobile) {
				this.menuStore.showSearchContainerInMobile = false;
			} else {
				window.scrollTo(0, 0);
				this.menuStore.showSearchContainerInMobile = true;
				this.menuStore.searchText = '';
			}
		}
	};

	setForceUpdateComponentBiometricsSettings = (callback: any) => {
		this.forceUpdateComponentBiometricsSettings = callback;
	}

	setCardModal = (callback: any) => {
		this.cardModalCallback = callback;
	}

	postSignature = () => {
		this.payloadSignature = Math.round((new Date()).getTime() / 1000).toString()
		this.postMessageToNativeApp('createSignature', { promptMessage: 'בצע אימות', payload: this.payloadSignature })
	}

	savePublicKey = async () => {
		const { publicKey } = this.createKeys;
		const status = await this.UpdateBiometricToken(publicKey);
		this.postSignature();
	};

	UpdateBiometricToken = async (publicKey: string | null) => {
		return await BiometricsService.UpdateBiometricToken(this.authStore.currentUser.id, publicKey);
	}

	checkIfKeyExists = () => {
		const { keysExist } = this.biometricKeysExist;
		if (!keysExist && this.initialBiometricsInProgress && this.stepOfInitialBiometrics === 1) {
			this.postMessageToNativeApp('createKeys');
		}
		else if (keysExist && !this.initialBiometricsInProgress && !localStorage.getItem('memberId')) {
			this.deleteKeysFunc();
		}
	}

	deleteKeysFunc = async () => {
		this.postMessageToNativeApp('deleteKeys');
		localStorage.removeItem('memberId');
		await this.UpdateBiometricToken(null);
	}
	setExpiredUserSlink = async () => {
		var errorMessage = await this.messagesStore.getSingleMessageFromService(this.messagesStore.errorMessageForUserExpired);
		this.cardModalCallback(true, errorMessage);
	}
	verifySignautre = async (confirmPrivacyPolicy : boolean | null = null) => {
		const { success, signature, error } = this.createSignature;
		if (this.platformReactNative.OS !== PlatformApp.Ios) { // android
			if (error === BiometricsErros_Android.KeyChange) {
				await this.deleteKeysFunc();
				this.setInitialBiometricInProgress(true);
				return;
			}
			else if (error === BiometricsErros_Android.failVerificationBiometrics || error === BiometricsErros_Android.sensorDisabled) {
				await this.deleteKeysFunc();
				this.isBiometricsSettingsSuccess = false;
				this.forceUpdateComponentBiometricsSettings();
				return;
			}
			else if (error === BiometricsErros_Android.userCancel && this.initialBiometricsInProgress) {
				await this.deleteKeysFunc();
				this.authStore.logout();
			}
		}
		else if (this.platformReactNative.OS === PlatformApp.Ios) {
			if (error === BiometricsErros_Ios.userCancel && this.initialBiometricsInProgress) {
				await this.deleteKeysFunc();
				this.authStore.logout();
			}
			else if (error === BiometricsErros_Ios.failVerificationBiometrics || error === BiometricsErros_Ios.sensorDisabled) {
				await this.deleteKeysFunc();
				this.isBiometricsSettingsSuccess = false;
				this.forceUpdateComponentBiometricsSettings();
				return;
			}
		}
		this.isBiometricsSettingsSuccess = success;
		if (success) {
			try {
				this.viewStore.setLoadingView(true);
				this.authStore.loginWithBiometricsSignautre(signature, btoa(this.payloadSignature), confirmPrivacyPolicy)
					.then((user) => {
						this.viewStore.setLoadingView(false);
						if (user.shouldUpdateorRegister == registrationStatus.UserExpired)
							this.setExpiredUserSlink();
						else {
							// Success Actions
							if (this.initialBiometricsInProgress) {
								this.stepOfInitialBiometricsSuccess();
							}
							else
								this.navigateToWebSite();
						}
					})
					.catch(err => {
						this.viewStore.setLoadingView(false);
						if (err.toString().includes("<p>NeedToConfirmPrivacyPסlicy</p>")) {
							const configurationStore: ConfigurationStore = rootStores[CONFIGURATION_STORE];

							AlertUtils.confirmAlertOneButton(
								"",
								`לידיעתך, עדכנו את <a target="_blank" style="text-decoration: underline;" href="${new URLSearchParams(configurationStore.getConfiguration.privacyPolicy.split('?')[1]).get('link')}">מדיניות הפרטיות</a>,<br/> נא לאשר על מנת להמשיך לבצע פעולות באתר `,
								"מאשר/ת",
								{ showCloseButton: true, icon: 'warning', iconColor: "#0f6bb3" },
								true
							).then(result => {
								if (result.isConfirmed) {
									this.verifySignautre(true)
								}
							});
							return
						}
						ErrorUtils.checkErrorAndShowPopUp(err);
					});
			} catch (err) {
				this.viewStore.setLoadingView(false);
				ErrorUtils.checkErrorAndShowPopUp(err);
			}
		}
	}

	navigateToWebSite = () => {
		let user = this.authStore.currentUser;
		if (user.shouldUpdateorRegister == registrationStatus.NeedEdit) {
			this.moveUserToEditDetails();
		// } else if (user.shouldUpdateorRegister == registrationStatus.NeedResetPassword) {
		// 	this.moveUserRestPassword(user);
		} else if (user.shouldUpdateorRegister == registrationStatus.RefreshExpierdPassword) {
			this.moveUserRefreshPassword(user);
		}
		else {
			if (sessionStorage.getItem("ExternalURL"))
				this.moveUserBackToExternalURL(sessionStorage.getItem("ExternalURL"))
			else
				this.moveUserToHomepage();
		}
	}

	moveUserRefreshPassword = (user) => {
		AlertUtils.basicAlert('', this.messagesStore.MessageForUserWeekPassword).then(() => {
			NofhonitStorage.saveToken();
			window.location.href = RoutesPath.login.updatePasswordFromForgotPassword + `?token=${user.FPT}&memberId=${user.identityNumber}`
		});
	};

	moveUserBackToExternalURL = (externalURL: any) => {
		sessionStorage.removeItem("ExternalURL");
		window.location.href = externalURL;
	};

	moveUserRestPassword = (user) => {
		let userMsg: string = '';
		//use for version 134(4) opinal remove
		if (!user.phoneNumber || !user.email)
			this.messagesStore.getSingleMessageFromService(this.messagesStore.userDidnotFinishRegistrationMessageKey).then((message) => {
				userMsg = message;
			});
		else
			userMsg = this.messagesStore.MessageForUserWeekPassword;
			
		AlertUtils.basicAlert('', userMsg).then(() => {
			sessionStorage.setItem('needToLogOutForFirstLoginToOldMember', 'true');
			window.location.href = RoutesPath.login.updatePasswordFromRegistration
		})
	};

	moveUserToRegistration = () => {
		// Get Success message from messages Service and then move to registration
		this.messagesStore.getSingleMessageFromService(this.messagesStore.userDidnotFinishRegistrationMessageKey).then((message) => {
			AlertUtils.basicAlert('', message);
			setTimeout(() => (window.location.href = RoutesPath.login.registration), 2000);
		});
	};

	moveUserToEditDetails = () => {
		// Get Success message from messages Service and then move to registration
		this.messagesStore.getSingleMessageFromService(this.messagesStore.userWasntActiveForTwoYearsKey).then((message) => {
			AlertUtils.basicAlert('', message);
			setTimeout(() => (window.location.href = RoutesPath.profile.root), 2000);
		});
	};

	moveUserToHomepage = () => {
		window.location.href = RoutesPath.root;
	};

	@action
	setInitialBiometricInProgress = (value: any = null) => {
		if (value)
			this.initialBiometricsInProgress = value
		else
			this.initialBiometricsInProgress = !this.initialBiometricsInProgress;

		this.authStore.initialBiometricsInProgress = this.initialBiometricsInProgress;

		if (!this.initialBiometricsInProgress)
			this.authStore.logout();
	};

	@action
	setIsBiometricsSettingsSuccess = (value: boolean | null) => {
		this.isBiometricsSettingsSuccess = value;
	}

	@action
	postMessageToNativeApp = (action: string, obj: any = null) => {
		const message = { action, obj };
		if (window.ReactNativeWebView)
			window.ReactNativeWebView.postMessage(JSON.stringify(message));
	}
}