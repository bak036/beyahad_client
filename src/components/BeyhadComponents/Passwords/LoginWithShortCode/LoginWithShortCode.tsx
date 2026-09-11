import { History } from 'history';
import { observer } from 'mobx-react';
import { CustomButton, CustomHeader, CustomSpan, CustomInputText, TextTypes } from 'nofshonit-base-web-client';
import { config } from 'process';
import * as React from 'react';
import Lang from '../../../../config/Language';
import { RoutesPath } from '../../../../consts/RoutesPath';
import { AUTH_STORE, BIOMETRICS_STORE, CONFIGURATION_STORE, MESSAGES_STORE, PROFILE_CARD_STORE, VIEW_STORE } from '../../../../consts/stores';
import { PremiumType } from '../../../../models/enums';
import rootStores from '../../../../stores';
import AuthStore from '../../../../stores/AuthStore';
import ConfigurationStore from '../../../../stores/ConfigurationStore';
import MessagesStore from '../../../../stores/MessagesStore';
import ViewStore from '../../../../stores/ViewStore';
import AlertUtils from '../../../../utils/AlertUtils';
import { registrationStatus } from '../../../../utils/authentication/enums';
import ErrorUtils from '../../../../utils/errorHandling/ErrorUtils';
import NofhonitStorage from '../../../../utils/NofhonitStorage';
import BiometricsStore from 'src/stores/BiometricsStore';
import GoogleAnalyticsUtils from 'src/utils/analytics/GoogleAnalyticsUtils';
import ProfileCardModal from '../../BeyhadCard/ProfileCardModal';
import CustomModal from 'src/components/CustomComponents/CustomModal';
import ProfileCardStore from 'src/stores/ProfileCardStore';
import { useEffect, useRef, useState } from 'react';
import ValidationService from 'src/utils/ValidationService';
import EditorMessage from '../../EditorMessage/EditorMessage';

interface Props {
	history?: any;
	location?: any;
}
declare global {
	interface CredentialRequestOptions {
		otp?: any;
	}

	interface Credential {
		code?: any;
	}
}
interface IState {
	shortCode: string;
	shortCodeError: string;
	timeToSendNextSms: number;
	timerIntervalId: number;
	maskedPhoneNumber: string;
	maskedEmail: string;
	cardModal: boolean;
	errorMessage: string;
}
const authStore: AuthStore = rootStores[AUTH_STORE];
const viewStore: ViewStore = rootStores[VIEW_STORE];
const messagesStore: MessagesStore = rootStores[MESSAGES_STORE];
const configurationStore: ConfigurationStore = rootStores[CONFIGURATION_STORE];
const biometricsStore: BiometricsStore = rootStores[BIOMETRICS_STORE];
const profileCardStore: ProfileCardStore = rootStores[PROFILE_CARD_STORE];

const LoginWithShortCode: React.FC<Props> =
	({
		history,
		location,
	}) => {
		const [shortCode, setshortCode] = useState<string>('');
		const [shortCodeError, setshortCodeError] = useState<string>('');
		const [cardModal, setcardModal] = useState<boolean>(false);
		const [errorMessage, seterrorMessage] = useState<string>('');
		const [timeToSendNextSms, settimeToSendNextSms] = useState<number>(configurationStore.getConfiguration.SecondesToReSendSms);
		const [timerIntervalId, settimerIntervalId] = useState<number>(0);
		const [maskedPhoneNumber, setmaskedPhoneNumber] = useState<string>('');
		const [maskedEmail, setmaskedEmail] = useState<string>('');
		const [maskedPartnerPhone, setmaskedPartnerPhone] = useState<string>('');
		const [maskedPartnerEmail, setmaskedPartnerEmail] = useState<string>('');
		const [showPolicy, setShowPolicy] = useState<boolean | null>(null);
		const [confirmPolicy, setConfirmPolicy] = useState<boolean>(false);
		const [cvv, setCvv] = useState<number>();
		const [expiredDate, setExpiredDate] = useState<string>("");
		const isLoaded = useRef(false);
		const cardNumber =
			authStore.currentUser && authStore.currentUser.cardNumber ? authStore.currentUser.cardNumber : '';

		const startTimer = () => {
			var timerIntervalId: any = setInterval(() => {
				settimeToSendNextSms((prevstate) => prevstate - 1);
			}, 1000);
			settimerIntervalId(timerIntervalId)
		}


		useEffect(() => {
			//componentDidMount
			if (NofhonitStorage.getToken()) {
				history.replace(RoutesPath.root);
				return;
			}
			const memberContact = JSON.parse(sessionStorage.getItem('memberContactDetails') || '{}');
			setmaskedPhoneNumber(memberContact.phoneNumber);
			setmaskedEmail(memberContact.email);
			setmaskedPartnerPhone(memberContact.partnerPhoneNumber);
			setmaskedPartnerEmail(memberContact.partnerEmail);
			setShowPolicy(!memberContact.privacyPolicyAcceptedDate)
			console.log(!memberContact.privacyPolicyAcceptedDate)
			if (!authStore.tempMemberId) {
				history.replace(RoutesPath.login.login);
			}
			startTimer();
		}, []);

		useEffect(() => {
			if (showPolicy === undefined || showPolicy === null) return;

			const controller = new AbortController();
			try {
				if ('OTPCredential' in window && 'credentials' in navigator) {
					const myInput = document.querySelector('input[name="code"]') as HTMLInputElement;
					if (!myInput) {
						viewStore.setLoadingView(false);
						return;
					}

					const otpOptions: CredentialRequestOptions = {
						otp: { transport: ['sms'] },
						signal: controller.signal,
					};

					navigator.credentials
						.get(otpOptions)
						.then((otp) => {
							if (otp && otp.code) {
								setshortCode(otp.code);
								onLoginClick(otp.code);
							}
						})
						.catch((err) => {
							console.log(err);
							viewStore.setLoadingView(false);
						});

				}
			} catch {

			}
			return () => controller.abort();
		}, [navigator, window, showPolicy]);
		// componentDidUpdate() {
		// 	if(NofhonitStorage.getToken()){
		// 		this.history.replace(RoutesPath.root);
		// 		return;
		// 	}
		// }
		useEffect(() => {
			if (timeToSendNextSms == 0)
				window.clearInterval(timerIntervalId);
		}, [timeToSendNextSms])

		useEffect(() => {
			if (biometricsStore.otp) {
				setshortCode(biometricsStore.otp);
				onLoginClick(biometricsStore.otp);
				biometricsStore.setOtp('')
			}
		}, [biometricsStore.otp]);
		useEffect(() => {

		}, [biometricsStore.hash]);

		useEffect(() => {
			if (!cardModal && isLoaded.current)
				authStore.logout();
			isLoaded.current = true;
		}, [cardModal]);

		const onShortCodeChanged = (event) => {
			setshortCode(event.currentTarget.value.toString());
			setshortCodeError('')
		};

		const clearErrors = () => {
			setshortCodeError('')
		};

		const validate = (shortCode: string) => {
			if (!shortCode || shortCode.length <= 0) {
				setshortCodeError(Lang.format('LoginWithShortCodeError'))
				return false;
			}
			return true;
		};

		const moveUserRefreshPassword = (user) => {
			AlertUtils.basicAlert('', messagesStore.MessageForUserWeekPassword).then(() => {
				NofhonitStorage.saveToken();
				history.push(RoutesPath.login.updatePasswordFromForgotPassword + `?token=${user.FPT}&memberId=${user.identityNumber}`);
			})
		};

		const moveUserBackToExternalURL = (externalURL: any) => {
			history.push(externalURL);
		};

		const moveUserToInitialBiometricsDetails = () => {
			history.push(RoutesPath.login.initialBiometrics)
		};

		const onLoginClick = async (Code?: string) => {
			const code: string = Code ? Code : shortCode
			clearErrors();
			if (!validate(code)) {
				return;
			}

			if (showPolicy && !confirmPolicy) {
				return;
			}

			try {
				viewStore.setLoadingView(true);
				await authStore
					.loginWithShortCode(code)
					.then(async (user) => {
						if (user.premiumType === PremiumType.Type5) {
							await AlertUtils.basicAlert('', messagesStore.premiumType5Login);
						}
						return user;
					})
					.then((user) => {
						// Success Actions
						GoogleAnalyticsUtils.clickButtonAnalytics('UID', 'UID', '', '', isMobile() ? 'app' : 'website', user.identityNumber);
						if (user.shouldUpdateorRegister == registrationStatus.NeedRegister) {
							moveUserToRegistration();
						} else if (user.shouldUpdateorRegister == registrationStatus.NeedEdit) {
							moveUserToEditDetails();
						} else if (user.shouldUpdateorRegister == registrationStatus.UserExpired) {
							setExpiredUserSlink();
						} else {
							if (biometricsStore.initialBiometricsInProgress) {
								authStore.tempMemberId = user.identityNumber;
								localStorage.setItem('memberId', user.identityNumber);
								moveUserToInitialBiometricsDetails();
							}
							else if (sessionStorage.getItem("ExternalURL"))
								moveUserBackToExternalURL(sessionStorage.getItem("ExternalURL"));
							else
								moveUserToHomepage();
						}
					});
			} catch (err) {
				const isBlocked = err?.message === messagesStore.loginBlockMessage;

				ErrorUtils.checkErrorAndShowPopUp(err, '', '').then(() => {
					if (isBlocked) {
						window.location.href = '/login';
					}
				});
			} finally {
				viewStore.setLoadingView(false);
			}
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
		const moveUserResetPassword = (user) => {
			let userMsg: string = '';
			userMsg = messagesStore.MessageForUserWeekPassword;
			AlertUtils.basicAlert('', userMsg).then(() => {
				sessionStorage.setItem('logoutFirstLoginReq0188', 'true');
				window.location.href = RoutesPath.login.updatePasswordFromForgotPassword + `?token=${user.FPT}&memberId=${user.identityNumber}`;
			});
		};

		const moveUserToRegistration = () => {
			// Get Success message from messages Service and then move to registration
			messagesStore.getSingleMessageFromService(messagesStore.userDidnotFinishRegistrationMessageKey).then((message) => {
				AlertUtils.basicAlert('', message);
				setTimeout(() => (window.location.href = RoutesPath.login.registration), 2000);
			});
		};
		const setExpiredUserSlink = async () => {
			//biometricsStore.setInitialBiometricInProgress(false);
			var errorMessage = await messagesStore.getSingleMessageFromService(messagesStore.errorMessageForUserExpired);
			seterrorMessage(errorMessage)
			const res = await profileCardStore.getCardDetailsByCardNumber(cardNumber);
			setCvv(res.cvv);
			setExpiredDate(res.expirationDate)
			setcardModal(true)
		}
		const moveUserToEditDetails = () => {
			// Get Success message from messages Service and then move to registration
			messagesStore.getSingleMessageFromService(messagesStore.userWasntActiveForTwoYearsKey).then((message) => {
				AlertUtils.basicAlert('', message);
				setTimeout(() => (window.location.href = RoutesPath.profile.root), 2000);
			});
		};

		const moveUserToHomepage = () => {
			window.location.href = RoutesPath.root;
		};

		const onConnectWithShortCodeClick = async () => {
			try {
				// var date: any = sessionStorage.getItem('SendLastSmsOtpDate');
				// date = JSON.parse(date);
				// date = new Date(date);
				// var lastSendSmsInMilisecondes = new Date().getTime() - date.getTime(); // This will give difference in milliseconds
				// var timeToWaitBetweenReSendSms = configurationStore.getConfiguration.SecondesToReSendSms * 1000;
				// this.setState({ timeToSendNextSms: 60 - (Math.floor((timeToWaitBetweenReSendSms - lastSendSmsInMilisecondes) / 1000)) })
				if (timeToSendNextSms > 0) return;
				else {
					// sessionStorage.setItem('SendLastSmsOtpDate', JSON.stringify(new Date()));
					settimeToSendNextSms(60)
				}
				viewStore.setLoadingView(true);
				var memberContactDetails = await authStore.sendShortCode();
				startTimer();
				//await AlertUtils.basicAlert('', messagesStore.shortCodeSent);
				// this.history.push(RoutesPath.login.withShortCode);
			} catch (err) {
				// Check error type
				ErrorUtils.checkErrorAndShowPopUp(err, '', '');
			} finally {
				viewStore.setLoadingView(false);
			}
		};

		const connectWithEnter = (e) => {
			if (e.key === 'Enter') {
				onLoginClick();
			}
		};
		const sendCardMemberOnSMS = () => {
			setcardModal(false)
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
			setcardModal(false)
			authStore.logout();
		};
		const paste = (event: any) => {
			event.preventDefault();
			const valuePasted = event.clipboardData && event.clipboardData.getData('text/plain');
			if (valuePasted && ValidationService.validateNumbersOnly(valuePasted)) {
				setshortCode(valuePasted)
				onLoginClick(valuePasted);
			}
		};
		return (
			<div className='login-with-shortcode-main-container'>
				<CustomModal
					onCancel={() => setcardModal(false)}
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
				<div className='login-with-shortcode-content-container'>
					{/* <CustomHeader containerClassName={'center'} text={Lang.format('LoginWithShortCodeTitle')} /> */}
					{/* <div className='login-with-shortcode-instructions'>{Lang.format('LoginWithShortCodeSubTitle')}</div> */}
					<div className='login-with-shortcode-instructions'>
						<div>שלחנו קוד חד פעמי לפרטים הבאים:</div>

						{maskedPhoneNumber && maskedEmail && !maskedPartnerPhone && !maskedPartnerEmail ? (
							<div style={{ display: 'flex', justifyContent: 'center', gap: '10px', direction: 'ltr' }}>
								<span style={{ direction: 'rtl' }}>{maskedPhoneNumber}</span>
								<span>{maskedEmail}</span>
							</div>
						) : (
							<>
								{/* טלפונים */}
								{(maskedPhoneNumber || maskedPartnerPhone) && (
									<div>
										{maskedPartnerPhone && <span>{maskedPartnerPhone}</span>}
										{maskedPhoneNumber && maskedPartnerPhone && <span>, </span>}
										{maskedPhoneNumber && <span>{maskedPhoneNumber}</span>}
									</div>
								)}

								{/* מיילים */}
								{(maskedEmail || maskedPartnerEmail) && (
									<div style={{ direction: 'ltr' }}>
										{maskedEmail && <span>{maskedEmail}</span>}
										{maskedEmail && maskedPartnerEmail && <span>, </span>}
										{maskedPartnerEmail && <span>{maskedPartnerEmail}</span>}
									</div>
								)}
							</>
						)}

						<div className='secondery-title'>מה הקוד שקיבלת?</div>
					</div>

					<div className='update-inputs-container'>
						<div className={shortCodeError ? 'red' : ''} onKeyDown={connectWithEnter}>
							<div className='custom-input-text-container '>
								<div className='custom-input-label-container'>
									<div className='custom-lable-container '>
										<label>{Lang.format('LoginWithShortCodeInputLabel')}</label>
									</div>
								</div>
								<div className='custom-input-text-input-container'>
									<div className='one-time-code-wrapper'>
										<input
											type="text"
											inputMode="numeric"
											autoComplete="one-time-code"
											name="code"
											id="shortCode"
											required
											autoFocus
											value={shortCode}
											onChange={onShortCodeChanged}
											onPaste={paste}
										/>
										<label>{shortCodeError}</label>
									</div>
								</div>
							</div>
							{showPolicy &&
								<div className='agreement-registration-container'>
									<div className='agreement-registration'>
										<div className='check-box-container'>
											<input style={{ cursor: 'pointer' }} type='checkbox' checked={confirmPolicy} onChange={() => setConfirmPolicy(!confirmPolicy)} />
										</div>
										<div className='text-container'>
											<EditorMessage textClassName={'privacy-message'} message={messagesStore.privacyPolicyText} />
										</div>
									</div>

								</div>
							}
							<CustomButton
								text={Lang.format('Login1')}
								onClick={onLoginClick}
								buttonClassName='primary-design center'
								disabled={viewStore.loadingView || shortCode.length === 0 || (!!showPolicy && !confirmPolicy)}
							/>
							<CustomButton
								text={'קבלת קוד כניסה חד פעמי חדש'}
								onClick={onConnectWithShortCodeClick}
								buttonClassName='primary-design center'
								disabled={viewStore.loadingView || timeToSendNextSms > 0}
							/>
							{/* <CustomSpan
							onClick={this.onConnectWithShortCodeClick}
							text={
								this.state.timeToSendNextSms > 0 ? 
								`ניתן לשלוח קוד חדש בעוד ${String(Math.floor(this.state.timeToSendNextSms / 60)).padStart(2, '0')}:${String(Math.floor(this.state.timeToSendNextSms % 60)).padStart(2, '0')} דקות` 
								: Lang.format('ClickInOrderToGetCode')}
							classNameSpan={`click-in-order-to-get-code`}
						/> */}
							<CustomSpan
								onClick={onConnectWithShortCodeClick}
								text={
									timeToSendNextSms > 0 ?
										`ניתן לשלוח קוד חדש בעוד ${String(Math.floor(timeToSendNextSms / 60)).padStart(2, '0')}:${String(Math.floor(timeToSendNextSms % 60)).padStart(2, '0')} דקות`
										: ""}
								classNameSpan={`click-in-order-to-get-code`}
							/>
						</div>
					</div>
				</div>
				{/* {
				biometricsStore.initialBiometricsInProgress &&
				<div className='cencel-biometrics-container'>
					<CustomSpan
						classNameSpan='cancel-biometrics-text'
						text={Lang.format('Cancel1')}
						onClick={biometricsStore.setInitialBiometricInProgress}
					/>
				</div>
			} */}
			</div>
		);
	}
export default LoginWithShortCode;
