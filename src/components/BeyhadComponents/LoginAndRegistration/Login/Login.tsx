import { observer } from 'mobx-react';
import {
	CustomButton,
	CustomHeader,
	CustomInputText,
	CustomSpan,
	HeaderType,
	TextTypes,
	Logger,
} from 'nofshonit-base-web-client';
import * as React from 'react';
import Lang from '../../../../config/Language';
import { RoutesPath } from '../../../../consts/RoutesPath';
import { AUTH_STORE, BIOMETRICS_STORE, MESSAGES_STORE, PROFILE_CARD_STORE, VIEW_STORE } from '../../../../consts/stores';
import rootStores from '../../../../stores';
import AuthStore from '../../../../stores/AuthStore';
import MessagesStore from '../../../../stores/MessagesStore';
import ViewStore from '../../../../stores/ViewStore';
import AlertUtils from '../../../../utils/AlertUtils';
import { registrationStatus } from '../../../../utils/authentication/enums';
import ErrorUtils from '../../../../utils/errorHandling/ErrorUtils';
import NofhonitStorage from '../../../../utils/NofhonitStorage';
import ValidationService from '../../../../utils/ValidationService';
import { PlatformApp, PremiumType } from '../../../../models/enums';
import GoogleAnalyticsUtils from '../../../../utils/analytics/GoogleAnalyticsUtils';
import Recaptcha from 'react-google-invisible-recaptcha';
import { CustomMediaQuery } from 'src/components/CustomComponents/CustomMediaQuery/CustomMediaQuery';
import { BiometricsErros_Android, BiometricsErros_Ios, ByometricType } from 'src/models/enums';
import BiometricsStore from 'src/stores/BiometricsStore';
import CustomModal from 'src/components/CustomComponents/CustomModal';
import ProfileCardModal from '../../BeyhadCard/ProfileCardModal';
import HeaderLogin from '../../HomePage/HeaderLogin';
import TabsHorizontalComponent from 'src/components/CustomComponents/TabsHorizontalComponent/TabsHorizontalComponent';
import CustomTubs from 'src/components/CustomComponents/CustomTubs';
import HeaderLoginMobile from '../../HomePage/HeaderLoginMobile';
import LoginWithShortCode from '../../Passwords/LoginWithShortCode/LoginWithShortCode';
import LogInWithBackImg from '../../HomePage/LogInWithBackImg';
import ProfileCardStore from 'src/stores/ProfileCardStore';
import { useEffect, useRef, useState } from 'react';


interface Props {
	history?: any;
}

interface IState {
	id: string;
	password: string;
	rememberMe: boolean;
	errorId?: string;
	errorPassword?: string;
	disabled: boolean;
	idForLoginWithShortCode: string;
	errorIdForLoginWithShortCode?: string;
	disabledIdForLoginWithShortCode: boolean;
	loginOption: string;
	cardModal: boolean;
	cardModalBiometricsNotEnrolled: boolean;
	errorMessage: string;
	loginWhithIdAndPassword: number;
	loginWithShortCode: boolean;

}
const messagesStore: MessagesStore = rootStores[MESSAGES_STORE];
const authStore: AuthStore = rootStores[AUTH_STORE];
const viewStore: ViewStore = rootStores[VIEW_STORE];
const biometricsStore: BiometricsStore = rootStores[BIOMETRICS_STORE];
const profileCardStore: ProfileCardStore = rootStores[PROFILE_CARD_STORE];
declare global {
	interface Window {
		ReactNativeWebView: any;
	}
}


const Login: React.FC<Props> = ({
	history
}) => {
	const recaptchaRef = useRef<any>(null);
	let rnBiometrics: any;
	const [id, setId] = useState<string>('');
	const [password, setPassword] = useState<string>('');
	const [rememberMe, setRememberMe] = useState<boolean>(false);
	const [errorId, setErrorId] = useState<string | undefined>('');
	const [errorPassword, setErrorPassword] = useState<string | undefined>('');
	const [disabled, setDisabled] = useState<boolean>(false);
	const [idForLoginWithShortCode, setIdForLoginWithShortCode] = useState<string>('');
	const [errorIdForLoginWithShortCode, setErrorIdForLoginWithShortCode] = useState<string | undefined>('');
	const [disabledIdForLoginWithShortCode, setDisabledIdForLoginWithShortCode] = useState<boolean>(false);
	const [cardModal, setCardModal] = useState<boolean>(false);
	const [cardModalBiometricsNotEnrolled, setCardModalBiometricsNotEnrolled] = useState<boolean>(false);
	const [errorMessage, setErrorMessage] = useState<string>('');
	const [loginOption, setLoginOption] = useState<string>('password');
	const [imgLogin, setImgLogin] = useState<any>('');
	const [stopInterval, setStopInterval] = useState<any>('');
	const [updateComponennt, setUpdateComponennt] = useState<any>('');
	const [loginWithShortCode, setLoginWithShortCode] = useState<boolean>(false);
	const [loginWhithIdAndPassword, setLoginWhithIdAndPassword] = useState<number>(1);
	const [cvv, setCvv] = useState<number>();
	const [expiredDate, setExpiredDate] = useState<string>("");
	const isLoaded = useRef(false);
	const mounted = useRef(false);
	const cardNumber =
		authStore.currentUser && authStore.currentUser.cardNumber ? authStore.currentUser.cardNumber : '';

	useEffect(() => {
		const handlePopState = (event) => {
			if (!event.state || !event.state.loginWithPassword) {
				setLoginWhithIdAndPassword(1);
			}
		};

		window.addEventListener('popstate', handlePopState);

		return () => {
			window.removeEventListener('popstate', handlePopState);
		};
	}, []);


	useEffect(() => {
		if (!mounted.current) {
			mounted.current = true;
			biometricsStore.savetHistory(history);
			biometricsStore.postMessageToNativeApp('getPlatform');
			biometricsStore.postMessageToNativeApp('isSensorAvailable');
			biometricsStore.postMessageToNativeApp('biometricKeysExist');
			biometricsStore.postMessageToNativeApp('showHeader=false');
			biometricsStore.postMessageToNativeApp('showBackBtn=false');
			biometricsStore.setCardModal((cardModal, errorMessage) => {
				setErrorMessage(errorMessage)
				profileCardStore.getCardDetailsByCardNumber(cardNumber).then((res) => {
					setCvv(res.cvv);
					setExpiredDate(res.expirationDate)
					setCardModal(cardModal)
				})
			});

			if (NofhonitStorage.getToken()) {
				history.replace(RoutesPath.root);
				return;
			}
			const result = NofhonitStorage.getCookie();
			if (result) {
				setId(result.PersonalNumber)
				setPassword(result.Password)
			}
			viewStore.setLoadingView(false);
		} else {
			biometricsStore.postMessageToNativeApp('isSensorAvailable');
			biometricsStore.postMessageToNativeApp('biometricKeysExist');
			if (!cardModal && isLoaded.current)
				authStore.logout();
		}
	});
	const onIdInputChange = (value) => {
		clearError();
		if (ValidationService.validateID(value)) {
			setId(value)
		}
	};

	const onIdForLoginWithShortCodeInputChange = (value) => {
		clearError();
		if (ValidationService.validateID(value)) {
			setIdForLoginWithShortCode(value)
		}
	};

	const onPassowrdIputChange = (value) => {
		if (value.length > 14) return;
		clearError();
		setPassword(value)
	};

	const moveUserToRegistration = () => {
		// Get Success message from messages Service and then move to registration
		messagesStore.getSingleMessageFromService(messagesStore.userDidnotFinishRegistrationMessageKey).then((message) => {
			AlertUtils.basicAlert('', message);
			setTimeout(() => (window.location.href = RoutesPath.login.registration), 2000);
		});
	};

	const moveUserToEditDetails = () => {
		// Get Success message from messages Service and then move to registration
		messagesStore.getSingleMessageFromService(messagesStore.userWasntActiveForTwoYearsKey).then((message) => {
			AlertUtils.basicAlert('', message);
			setTimeout(() => (window.location.href = RoutesPath.profile.root), 2000);
		});
	};
	const setExpiredUserSlink = async () => {
		var errorMessage = await messagesStore.getSingleMessageFromService(messagesStore.errorMessageForUserExpired);
		setErrorMessage(errorMessage)
		const res = await profileCardStore.getCardDetailsByCardNumber(cardNumber);
		setCvv(res.cvv);
		setExpiredDate(res.expirationDate)
		setCardModal(true)
	}

	const moveUserResetPassword = (user) => {
		messagesStore.getSingleMessageFromService(messagesStore.firstLoginForOldMember).then((message) => {
			AlertUtils.basicAlert('', message).then(() => {
				window.location.href = RoutesPath.login.updatePasswordFromForgotPassword + `?token=${user.FPT}&memberId=${user.identityNumber}`
			})
		});
	};

	const moveUserRefreshPassword = (user) => {
		AlertUtils.basicAlert('', messagesStore.MessageForUserWeekPassword).then(() => {
			NofhonitStorage.clearStorage();
			window.location.href = RoutesPath.login.updatePasswordFromForgotPassword + `?token=${user.FPT}&memberId=${user.identityNumber}`
		});
	};

	const moveUserToHomepage = () => {
		window.location.href = RoutesPath.root;
	};

	const moveUserBackToExternalURL = (externalURL: any) => {
		window.location.href = externalURL;
		sessionStorage.removeItem("ExternalURL")
	};

	const moveUserToInitialBiometricsDetails = () => {
		// NofhonitStorage.clearStorage();
		history.push(RoutesPath.login.initialBiometrics)
	};

	const isMobile = () => {
		if (
			navigator.userAgent.match(/Android/i) ||
			navigator.userAgent.match(/webOS/i) ||
			navigator.userAgent.match(/iPhone/i) ||
			navigator.userAgent.match(/iPad/i) ||
			navigator.userAgent.match(/iPod/i) ||
			navigator.userAgent.match(/BlackBerry/i) ||
			navigator.userAgent.match(/Windows Phone/i) ||
			navigator.userAgent.match(/Opera Mini/i)
		) {
			return true;
		}
		return false;
	}
	const onConnectClick = async () => {
		if (disabled || authStore.isLoginInProgress) return;
		if (!validate()) return;

		setDisabled(true);
		try {
			let user = await authStore.loginWithIdentityAndPassword(id, password, rememberMe);
			if (user.premiumType === PremiumType.Type5) {
				await AlertUtils.basicAlert('', messagesStore.premiumType5Login);
			}

			const cardNumber = user && user.cardNumber ? user.cardNumber : '';
			const clubCreditCardHolder = user.clubCreditCard && user.clubCreditCard == 1 ? Lang.format('CreditCardHolder') : Lang.format('NotCreditCardHolder');
			GoogleAnalyticsUtils.clickButtonAnalytics('UID', 'UID', '', '', isMobile() ? 'app' : 'web', user.identityNumber, clubCreditCardHolder);
			// Success Actions
			if (user.shouldUpdateorRegister == registrationStatus.NeedRegister) {
				moveUserToRegistration();
			} else if (user.shouldUpdateorRegister == registrationStatus.NeedEdit) {
				moveUserToEditDetails();
				// } else if (user.shouldUpdateorRegister == registrationStatus.NeedResetPassword) {
				// 	moveUserResetPassword(user);
			} else if (user.shouldUpdateorRegister == registrationStatus.RefreshExpierdPassword) {
				moveUserRefreshPassword(user);
			} else if (user.shouldUpdateorRegister == registrationStatus.UserExpired) {
				setExpiredUserSlink();
			} else {
				if (biometricsStore.initialBiometricsInProgress) {
					authStore.tempMemberId = user.identityNumber;
					localStorage.setItem('memberId', user.identityNumber);
					moveUserToInitialBiometricsDetails();
				} else if (sessionStorage.getItem("ExternalURL")) {
					moveUserBackToExternalURL(sessionStorage.getItem("ExternalURL"));
				} else {
					moveUserToHomepage();
				}
			}
		} catch (err) {
			// Check error type
			ErrorUtils.checkErrorAndShowPopUp(err, '', '');
		} finally {
			setDisabled(false);
		}
	};

	const onResolvedRecaptchaLogin = () => {

	};
	const validate = () => {
		let retVal = true;
		if (!id || id.length !== 9) {
			setErrorId(Lang.format('IdError'))
			retVal = false;
		}

		if (!password) {
			setErrorPassword(Lang.format('PasswordError'))
			retVal = false;
		}

		let passwordLength = password && password.length;
		if (parseInt(passwordLength.toString()) < 6 || parseInt(passwordLength.toString()) > 14) {
			setErrorPassword(Lang.format('PasswordError'))
			retVal = false;
		}

		return retVal;
	}

	const onConnectWithShortCodeClick = async (e) => {
		e.preventDefault();
		if (disabled || authStore.isLoginInProgress) return;
		if (!validateLoginWithShortCode()) {
			recaptchaRef.current?.reset?.();
			viewStore.setLoadingView(false);
			return;
		}

		setDisabled(true);
		viewStore.setLoadingView(true);
		try {
			const reCaptchaToken = await recaptchaRef.current.execute({ action: `SendOtp${(Math.random() + 1).toString(36).substring(7)}` });
			const res = await authStore.sendShortCode(idForLoginWithShortCode, reCaptchaToken);
			sessionStorage.setItem('memberContactDetails', JSON.stringify(res.data.data));
			setLoginWithShortCode(true);
		} catch (err) {
			ErrorUtils.checkErrorAndShowPopUp(err, '', '');
		} finally {
			viewStore.setLoadingView(false);
			recaptchaRef.current?.reset?.();
			setDisabled(false);
		}
	};

	const validateLoginWithShortCode = () => {
		let retVal = true;
		if (!idForLoginWithShortCode || idForLoginWithShortCode.length !== 9) {
			setErrorIdForLoginWithShortCode(Lang.format('IdError'))
			retVal = false;
		}

		return retVal;
	};

	const changeLoginOptionToPassword = (e) => {
		setLoginOption('password')
	};

	const changeLoginOptionToOtp = (e) => {
		setLoginOption('otp')
	};

	const loginWithBiometrics = (e) => {//simplePrompt
		// biometricsStore.postMessageToNativeApp('simplePrompt', { promptMessage: 'בצע אימות' })
		if (biometricsStore.isSensorAvailableResult.error === BiometricsErros_Android.NotEnrolled || (biometricsStore.isSensorAvailableResult.error && biometricsStore.isSensorAvailableResult.error.includes(BiometricsErros_Ios.NotEnrolled))) {
			setCardModalBiometricsNotEnrolled(true)
		}
		else if (biometricsStore.biometricKeysExist.keysExist && localStorage.getItem('memberId')) {
			authStore.tempMemberId = localStorage.getItem('memberId');
			biometricsStore.postSignature();
		}
		else {
			biometricsStore.setInitialBiometricInProgress(true);
		}
	}

	const goToSettings = () => {
		biometricsStore.postMessageToNativeApp('openAppSettings');
		setCardModalBiometricsNotEnrolled(false)
	}
	const clearError = () => {
		setErrorId(undefined)
		setErrorPassword(undefined)
		setErrorIdForLoginWithShortCode(undefined)
	};

	const onRememberMeChanged = (e) => {
		const checked = e.target.checked;
		setRememberMe(checked)
	};

	const forgotPasswordClicked = () => {
		history.push(RoutesPath.login.forgotPassword);
	};

	const onJoinClicked = () => {
		history.push(RoutesPath.login.join);
	};

	const connectWithEnter = (e) => {
		if (e.key === 'Enter') {
			onConnectClick();
		}
	};
	const sendCardMemberOnSMS = () => {
		setCardModal(false)
		profileCardStore.sendCardMemberOnSMS()
			.then((response) => {
				AlertUtils.successAlert(Lang.format('MessageWasSentSuccessfully'), '')
					.then(() => authStore.logout());
			})
			.catch((err) => {
				ErrorUtils.checkErrorAndShowPopUp(err)
					.then(() => authStore.logout());
			});
	};
	const onCancelCardSlink = () => {
		setCardModal(false)
		//NofhonitStorage.clearStorage();
		authStore.logout();
	};
	const handleLoginWhithIdAndPassword = (index: number) => {
		setLoginWhithIdAndPassword(index)
	}
	const renderLogInWithShortCode = (errorIdForLoginWithShortCode, idForLoginWithShortCode) => {
		return (
			<div className='inputs-container'>
				<div className='img-login-container'>
					<img
						className='logo-login'
						src={require('../../../../assets/login-copy.png')}
						alt={'logo-login'}

					/>
				</div>
				<CustomSpan
					text={isMobile() ? Lang.format('MobileLoginWithShortCode') : Lang.format('LoginWithShortCode')}
					classNameSpan={'login-with-short-code'}
				/>

				{loginWithShortCode ?
					<LoginWithShortCode history={history} /> :
					<form onSubmit={onConnectWithShortCodeClick}>

						<CustomInputText
							labelText={Lang.format('ID')}
							type={TextTypes.Telephone}
							error={errorIdForLoginWithShortCode}
							value={idForLoginWithShortCode}
							onChange={onIdForLoginWithShortCodeInputChange}
							id='loginIdWithShortCode'

						/>
						<span className='guidelines-ID'>{Lang.format('GuidelinesID')}</span>
						<CustomButton
							text={Lang.format('ClickInOrderToGetCode')}
							buttonClassName={'primary-design center'}
							disabled={disabled}
						/>
						<Recaptcha
							ref={recaptchaRef}
							sitekey="6LdlaVcgAAAAABAJB8oqrcAj2dgdnumYAyVctQ0a"
							onResolved={onResolvedRecaptchaLogin}
						/>
					</form>
				}
			</div>)
	}
	const renderDesktopLogIn = (password, errorId, errorPassword, id, errorIdForLoginWithShortCode, idForLoginWithShortCode, componentsToRender) => {
		return (
			<LogInWithBackImg>

				<div className='header-container-injoin'>
					<HeaderLogin />
				</div>
				<div className='login-main-container'>
					<div className='login-container-and-title'>
						<div className='login-container'>
							<div className={`vl ${loginWithShortCode ? 'otp' : ''} ${loginWhithIdAndPassword === 0 ? 'login-id-password' : ''}`}></div>
							{loginWhithIdAndPassword === 0 ?
								<div>
									<CustomSpan text={Lang.format('LoginAgent')} classNameSpan={'login-agent-title'} />
									<div className='img-login-container'>
										<img
											className='logo-login'
											src={require('../../../../assets/login.png')}
											alt={'logo-login'}

										/>
									</div>
									<div className='inputs-container' onKeyDown={connectWithEnter}>
										<CustomInputText
											labelText={Lang.format('ID')}
											type={TextTypes.Telephone}
											error={errorId}
											value={id}
											onChange={onIdInputChange}
											id='loginId'
										/>
										<span className='guidelines-ID'>{Lang.format('GuidelinesID')}</span>
										<CustomInputText
											labelText={Lang.format('Password')}
											type={TextTypes.Password}
											error={errorPassword}
											value={password}
											onChange={onPassowrdIputChange}
											id='loginPassword'

										/>
										<CustomButton
											text={Lang.format('Login1')}
											buttonClassName={'primary-design center'}
											onClick={onConnectClick}
											disabled={disabled}
										/>
										<div className='back-to-options-container'>

											<div className='back-to-options'>
												<CustomSpan
													onClick={() => setLoginWhithIdAndPassword(1)}
													text={'חזרה למסך הקודם'}
													classNameSpan={'cursor-pointer'}
												/>
											</div>
										</div>
									</div>
								</div>
								: <>{renderLogInWithShortCode(errorIdForLoginWithShortCode, idForLoginWithShortCode)}</>
							}
						</div>
						{loginWhithIdAndPassword !== 0 && !loginWithShortCode && (
							<div className="switch-to-password-login" onClick={() => { setLoginWhithIdAndPassword(0); window.history.pushState({ loginWithPassword: true }, ''); }}>
								לשימוש נציגי שירות לקוחות
							</div>
						)}

					</div>
					{loginWhithIdAndPassword !== 0 && (
						<div className='join-container'>
							<div>
								<CustomHeader
									type={HeaderType.Text}
									containerClassName={'center'}
									headerClassName={'header-join-container'}
									text={Lang.format('FirstTimeBY')}
								/>
								<span className='registration-for-club-members'>{Lang.format('RegistrationForClubMembers')}</span>
								<CustomButton
									buttonClassName={'secondry-design center'}
									text={Lang.format('Join')}
									onClick={onJoinClicked}
								/>
							</div>
						</div>
					)}
				</div>
			</LogInWithBackImg>
		)
	}
	const renderMobileLogIn = (password, errorId, errorPassword, id, errorIdForLoginWithShortCode, idForLoginWithShortCode, componentsToRender) => {
		return (
			<>
				{
					biometricsStore.isSensorAvailableResult &&
					<CustomModal
						onCancel={() => setCardModalBiometricsNotEnrolled(false)}
						visible={cardModalBiometricsNotEnrolled}
						componentToRender={
							<div className='modal-biometrics-not-enrolled'>
								{biometricsStore.platformReactNative.OS === PlatformApp.Ios ?
									<img
										className='icon-biometrics'
										src={require('../../../../assets/login-finger.png')}
										alt={Lang.format('LoginWithBiometrics')}
										title={Lang.format('LoginWithBiometrics')}
									/>
									:
									<img
										className='icon-biometrics'
										src={require('../../../../assets/icon-fingerprint.png')}
										alt={Lang.format('LoginWithBiometrics')}
										title={Lang.format('LoginWithBiometrics')}
									/>
								}
								<div className='title-biometrics-not-enrolled'>{biometricsStore.platformReactNative.OS === PlatformApp.Ios ? Lang.format('titleBiometricsNotEnrolled') : Lang.format('HeaderAndroidFingerprintProccess')}</div>
								<div className='text-biometrics-not-enrolled'>{biometricsStore.platformReactNative.OS === PlatformApp.Ios ? Lang.format('textBiometricsNotEnrolled') : Lang.format('textFingerprintNotEnrolled')}</div>
								<div className='container-btn-biometrics-settings'>
									<button className='btn-biometrics-settings' onClick={goToSettings}>{Lang.format('toSettings')}</button>
									<button className='btn-biometrics-settings' onClick={() => setCardModalBiometricsNotEnrolled(false)}>{Lang.format('Cancel1')}</button>
								</div>
							</div>
						}
					/>
				}
				<div className='login-mobile'>
					<HeaderLoginMobile />
					{/* {
							!biometricsStore.initialBiometricsInProgress &&
							<div className='img-container'>
								<div className='img-container'>
									<img
										className='img-item img-item-one'
										src={'//pics.k4a.co.il/share/histadrut/uploads/Slider/responsive/LoginDesktop1000-700.jpg'}
										alt={Lang.format('Login')}
									/>
									<img
										className='img-item img-item-two'
										src={'//pics.k4a.co.il/share/histadrut/uploads/Slider/responsive/LoginMobile1000-170.jpg'}
										alt={Lang.format('Login')}
									/>
									<img
										className='img-item img-item-three'
										src={'//pics.k4a.co.il/share/histadrut/uploads/Slider/responsive/LoginMobile600-170.jpg'}
										alt={Lang.format('Login')}
									/>
								</div>
							</div>
						} */}
					<div className='login-main-container'>
						<div className='login-container-and-title'>
							{
								!biometricsStore.initialBiometricsInProgress ?
									<CustomHeader text={Lang.format('LoginDesktop')} containerClassName={'center'} type={HeaderType.SubTitle} />
									:
									<div className='header-biometrics-settings-container'>
										{
											biometricsStore.platformReactNative.OS === PlatformApp.Ios ?
												<CustomSpan classNameSpan='header-biometrics-settings-text' text={Lang.format('HeaderBiometricsProccess')} />
												:
												<CustomSpan classNameSpan='header-biometrics-settings-text' text={Lang.format('HeaderFingerprintProccess')} />
										}
										{/* {
												biometricsStore.isSensorAvailableResult.biometryType === ByometricType.TouchID ?
													<CustomSpan classNameSpan='header-biometrics-settings-text' text={Lang.format('HeaderFingerprintProccess')} />
													:
													<CustomSpan classNameSpan='header-biometrics-settings-text' text={Lang.format('HeaderFaceScanProccess')} />
											} */}
									</div>
							}
							{/* <CustomSpan text={Lang.format('EnterYourDetails')} /> */}
							{/* <div className='container-options-login'>
									<div className={`option-login ${loginOption == 'password' && 'option-login-active'}`} onClick={changeLoginOptionToPassword}>{Lang.format('withPassword')}</div>
									<div className={`option-login ${loginOption == 'otp' && 'option-login-active'}`} onClick={changeLoginOptionToOtp}>{Lang.format('withOtp')}</div>
								</div> */}
							{/* <CustomTubs tabComponents={componentsToRender} changeTub={handleLoginWhithIdAndPassword} indexActive={loginWhithIdAndPassword} /> */}
							<div className='login-container-with-biometric'>
								{
									loginWhithIdAndPassword == 0 ? <div>

										<div className='inputs-container' onKeyDown={connectWithEnter}>
											<div className='img-login-container'>
												<img
													className='logo-login'
													src={require('../../../../assets/login.png')}
													alt={'logo-login'}

												/>
											</div>
											<CustomSpan text={Lang.format('EnterYourDetails')} classNameSpan={'enter-your-details'} />
											<CustomInputText
												labelText={Lang.format('ID')}
												type={TextTypes.Telephone}
												error={errorId}
												value={id}
												onChange={onIdInputChange}
												id='loginId'
											/>
											<span className='guidelines-ID'>{Lang.format('GuidelinesID')}</span>
											<CustomInputText
												labelText={Lang.format('Password')}
												type={TextTypes.Password}
												error={errorPassword}
												value={password}
												onChange={onPassowrdIputChange}
												id='loginPassword'
											/>
											<CustomButton
												text={Lang.format('Login1')}
												buttonClassName={'primary-design center'}
												onClick={onConnectClick}
												disabled={disabled}
											/>
											<div className='remember-and-forgot-password'>
												{/* <div className='remember-password'>
											<label className="control control--checkbox input-checkbox">
												<input
													type='checkbox'
													style={{ cursor: 'pointer' }}
													checked={rememberMe}
													onChange={onRememberMeChanged}
												/>
												<div className="control__indicator"></div>
											</label>
											<CustomSpan text={Lang.format('RememberMe')} />
										</div> */}
												<div className='forgot-password'>
													<CustomSpan
														onClick={forgotPasswordClicked}
														text={Lang.format('ForgotPassword')}
														classNameSpan={'cursor-pointer'}
													/>
												</div>
											</div>

										</div>
									</div>
										: <>{renderLogInWithShortCode(errorIdForLoginWithShortCode, idForLoginWithShortCode)}</>
								}
								{
									!biometricsStore.initialBiometricsInProgress &&
									<>
										{
											(
												biometricsStore.isSensorAvailableResult &&
												(
													biometricsStore.isSensorAvailableResult.available ||
													biometricsStore.isSensorAvailableResult.error === BiometricsErros_Android.NotEnrolled ||
													(biometricsStore.isSensorAvailableResult.error && biometricsStore.isSensorAvailableResult.error.includes(BiometricsErros_Ios.NotEnrolled))
												)
											) &&

											<div className='login-biometrics-root'>
												<div className='wl'></div>
												<div className='login-biometrics-container' onClick={loginWithBiometrics}>
													{biometricsStore.platformReactNative.OS === PlatformApp.Ios ?

														<img
															className='icon-biometrics'
															src={require('../../../../assets/login-finger.png')}
															alt={Lang.format('LoginWithBiometrics')}
															title={Lang.format('LoginWithBiometrics')}
														/>
														:
														<img
															className='icon-biometrics'
															src={require('../../../../assets/icon-fingerprint.png')}
															alt={Lang.format('LoginWithBiometrics')}
															title={Lang.format('LoginWithBiometrics')}
														/>
													}
													<div className='txt-biometrics'>
														{biometricsStore.platformReactNative.OS === PlatformApp.Ios ? Lang.format('LoginWithBiometrics') : Lang.format('LoginWithFingerprint')}
													</div>
												</div>
											</div>
										}
									</>
								}
							</div>
						</div>
						{
							!biometricsStore.initialBiometricsInProgress ?
								<>


									<div className='join-container'>
										<CustomHeader
											type={HeaderType.Text}
											containerClassName={'center'}
											headerClassName={'header-join-container'}
											text={Lang.format('FirstTimeBY')}
										/>

										<CustomButton
											buttonClassName={'secondry-design center'}
											text={Lang.format('Join')}
											onClick={onJoinClicked}
										/>
										<span className='registration-for-club-members'>{Lang.format('RegistrationForClubMembers')}</span>
									</div>
								</>
								:
								<CustomButton
									buttonClassName='cencel-biometrics-container'
									onClick={biometricsStore.setInitialBiometricInProgress}
									text={Lang.format('Cancel1')}
								/>}
						<div className='text-container'>
							{/* מיועד להשאיר רווח ריק בין הכפתור לתחית הטופס */}
						</div>
					</div>
				</div>
			</>
		)
	}

	const componentsToRender = [
		{ title: "כניסה עם סיסמה", index: 0 },
		{ title: "כניסה עם קוד חד פעמי", index: 1 }
	];
	return (
		<>
			<CustomMediaQuery.Desktop>
				<CustomModal
					onCancel={onCancelCardSlink}
					visible={cardModal}
					componentToRender={
						<ProfileCardModal
							errorMessage={errorMessage}
							sendCardMemberOnSMS={sendCardMemberOnSMS}
							onCancel={onCancelCardSlink}
							cvv={cvv}
							expiredDate={expiredDate}
						/>
					}
				/>
				{renderDesktopLogIn(password, errorId, errorPassword, id, errorIdForLoginWithShortCode, idForLoginWithShortCode, componentsToRender)}
			</CustomMediaQuery.Desktop>
			<CustomMediaQuery.Mobile>
				<CustomModal
					onCancel={onCancelCardSlink}
					visible={cardModal}
					componentToRender={
						<ProfileCardModal
							errorMessage={errorMessage}
							sendCardMemberOnSMS={sendCardMemberOnSMS}
							onCancel={onCancelCardSlink}
							cvv={cvv}
							expiredDate={expiredDate}
						/>
					}
				/>
				{renderMobileLogIn(password, errorId, errorPassword, id, errorIdForLoginWithShortCode, idForLoginWithShortCode, componentsToRender)}
			</CustomMediaQuery.Mobile>
		</>
	);
}
export default observer(Login)
