import { observer } from 'mobx-react';
import { CustomButton, CustomHeader, CustomInputText, TextTypes } from 'nofshonit-base-web-client';
import * as React from 'react';
import Lang from '../../../../config/Language';
import { AUTH_STORE, VIEW_STORE, MINT_STORE, MESSAGES_STORE } from '../../../../consts/stores';
import { UpdatePasswordType } from '../../../../models/enums';
import rootStores from '../../../../stores';
import AuthStore from '../../../../stores/AuthStore';
import ViewStore from '../../../../stores/ViewStore';
import AlertUtils from '../../../../utils/AlertUtils';
import ErrorUtils from '../../../../utils/errorHandling/ErrorUtils';
import NofhonitStorage from '../../../../utils/NofhonitStorage';
import { RoutesPath } from '../../../../consts/RoutesPath';
import { isMint, getValueFromHistroyQuery } from '../../../../utils/authentication/historyUtils';
import { registrationStatus } from '../../../../utils/authentication/enums';
import MintStore from '../../../../stores/MintStore';
import MessagesStore from '../../../../stores/MessagesStore'
import { CustomMediaQuery } from 'src/components/CustomComponents/CustomMediaQuery/CustomMediaQuery';
import HeaderLoginMobile from '../../HomePage/HeaderLoginMobile';
import HeaderLogin from '../../HomePage/HeaderLogin';
import LogInWithBackImg from '../../HomePage/LogInWithBackImg';
import { useEffect, useState } from 'react';

interface Props {
	history?: any;
	location?: any;
	isMint?: boolean;
	accessToken?: string;
	fromRegistration?: boolean;
	fromForgotPasswordProp?: boolean;
}
interface IState {
	password: string;
	id: string;
	token: string;
	confirmPassword: string;
	confirmPasswordError: string;
	matchingPasswordsError: string;
	passwordError: string;
	isMint: boolean;
}
const authStore: AuthStore = rootStores[AUTH_STORE];
const viewStore: ViewStore = rootStores[VIEW_STORE];
const mintStore: MintStore = rootStores[MINT_STORE];
const messagesStore: MessagesStore = rootStores[MESSAGES_STORE];

const UpdatePassword : React.FC<Props> = ({
	history,
	location,
	isMint,
	accessToken,
	fromRegistration,
	fromForgotPasswordProp
}) => {
	const [password,setPassword] = useState<string>('')
	const [id,setId] = useState<string>('')
	const [token,setToken] = useState<string>('')
	const [confirmPassword,setConfirmPassword] = useState<string>('')
	const [confirmPasswordError,setConfirmPasswordError] = useState<string>('')
	const [matchingPasswordsError,setMatchingPasswordsError] = useState<string>('')
	const [passwordError,setPasswordError] = useState<string>('')
	const [isMintVar,setIsMintVar] = useState<boolean>(isMint ? isMint : false)


	useEffect(() => {
// If user already finished registration - send to homepage
		// Checks For Beyahad Website
		if (!isMint) {
			// No need to check the else of the next "IF statement"
			// the app already reconginzes that route is not legal and sends to login/not found page.
			// if url from join do this
			if (fromRegistration) {
				// User should be logged in with user token after joining, if he is not logged in send to login page.
				if (!authStore.loggedInUser) {
					history.push('/login');
				}

				if (authStore.currentUser.shouldUpdateorRegister != registrationStatus.NeedRegister) {
					// If user is logged in and already finished registration - send to home page
					if (authStore.loggedInUser && !authStore.currentUser.shouldUpdateorRegister) {
						history.push('/');
						// If user is logged in and two years passed since updating details - send to update profile
					} else if (
						authStore.loggedInUser &&
						authStore.currentUser.shouldUpdateorRegister == registrationStatus.NeedEdit
					) {
						history.push(RoutesPath.profile.root);
					}
				}
			} else if (fromForgotPasswordProp) {
				// if the user is logged in while trying to enter forgot password - send back to login

				viewStore.setLoadingView(false);

				let query = history.location.search;
				// if the user is logged in while trying to enter forgot password - send back to login
				if (authStore.loggedInUser && !query.length) {
					history.push(RoutesPath.login.login);
				}

				if (query) {
					const urlArray = history.location.search.split('&');
					const urlToken = urlArray && urlArray[0] ? urlArray[0].split('=')[1] : '';
					const urlMemberId = urlArray && urlArray[1] ? urlArray[1].split('=')[1] : '';

					if (!urlToken || !urlMemberId) {
						history.push(RoutesPath.login.login);
					}
					setId(urlMemberId)
					setToken(urlToken)
					authStore
						.validateToken(urlMemberId, urlToken)
						.then((res) => {
							// Valid token
						})
						.catch(() => {
							// Invalid token
							history.push(RoutesPath.login.login);
						});
				} else {
					// User came from forgot password without token and memberid
					history.push(RoutesPath.login.login);
				}
			}
		} else {
			mintStore.setMintButtonActivation(false);
		}
	},[])


	const validate = () => {
		let retVal = true;
		var strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!?@#\$%\^&\*])(?=.{8,})");

		if (password.length < 8 || password.length > 14) {
			if (password.length == 0) {
				setPasswordError(Lang.format('InputsThatMarkedWithAsteriskAreRequired'))
			} else {
				setPasswordError(Lang.format('PasswordNeedsToContainBetween8and14Characters'))
			}
			retVal = false;
		} else if (!strongRegex.test(password)){
			setPasswordError(Lang.format('PasswordMustBeStrong'));
			retVal = false;
		}
		else {
			setPasswordError('');
		}

		if (confirmPassword.length < 8 || confirmPassword.length > 14) {
			if (confirmPassword.length == 0) {
				setConfirmPasswordError(Lang.format('InputsThatMarkedWithAsteriskAreRequired'))
			} else {
				setConfirmPasswordError(Lang.format('PasswordNeedsToContainBetween8and14Characters'))
			}
			retVal = false;
		}else if (!strongRegex.test(confirmPassword)){
			setConfirmPasswordError(Lang.format('PasswordMustBeStrong'));
			retVal = false;
		 }else {
			setConfirmPasswordError('')
			setMatchingPasswordsError('')
		}
		if (retVal) {
				if (password !== confirmPassword) {
					setMatchingPasswordsError(Lang.format('PasswordsNeedsToMatch'));
					retVal = false;
				} else {
					setMatchingPasswordsError('');
					setPasswordError('');
				}
		}

		return retVal;
	};

	const onPasswordChanged = (value) => {
		if (value.length> 14) return;
		const password = value;
		setPassword(password)
	};
	const onConfirmedPasswordChanged = (value) => {
		if (value.length> 14) return;
		const confirmPassword = value;
		setConfirmPassword(confirmPassword)
	};
	const getAccessTokenFromUrl = () => {
		return getValueFromHistroyQuery(history, 'accessToken');
	}
	const onSendClick = () => {
		if (validate()) {
			let query = history.location.search;
			let updatePasswordType: UpdatePasswordType;
			if (isMint) {
				updatePasswordType = UpdatePasswordType.Register;
			} else {
				if ((query && query.length > 0)) {
					updatePasswordType = UpdatePasswordType.Reset;
				} else {
					updatePasswordType = UpdatePasswordType.Register;
				}
			}

			// Checking token, if the user is coming from Forgot Password -> no token should exists
			// --------------- if the user is coming from join -> token should exists in session storage.
			let storageToken = NofhonitStorage.getToken();
			let checkToken;

			// If we from "fromForgotPassword", we take the token from the URL
			if (fromForgotPasswordProp) {
				checkToken = token;
			} else {
				// Otherwise, we take the token from storageToken
				checkToken = storageToken ? storageToken : token;
			}
			//------------------------------------------------------------------------------------------
			// Enable loader
			viewStore.setLoadingView(true);
			authStore
				.updatePassword(updatePasswordType, password, id, checkToken)
				.then(() => {
					// Success Actions
					AlertUtils.successAlert(Lang.format('TheNewPasswordWasUpdatedAtTheSystem'), '', false);
					if (isMint) {
						setTimeout(
							() =>
								(history.push(RoutesPath.mint.registration)),
							2000
						);
					} else {
						// Wait a few seconds before redirecting
						let query = history.location.search;
						if (query && query.length > 0) {
							// Forgot Password Finished - go to login
							if (Boolean(sessionStorage.getItem('logoutFirstLoginReq0188'))) {
								NofhonitStorage.clearStorage();
								sessionStorage.removeItem('logoutFirstLoginReq0188');
							}
							setTimeout(() => (window.location.href = '/login'), 2000);
						} else {
							// Join -> Updated Password -> Move to Register
							setTimeout(() => (window.location.href = '/register'), 2000);
						}
					}
				})
				.catch((err) => {
					// Check error type
					ErrorUtils.checkErrorAndShowPopUp(err, '', '');
				})
				.finally(() => {
					// Disable loader
					viewStore.setLoadingView(false);
				});
		}
	};

	const connectWithEnter = (e) => {
		if (e.key === 'Enter') {
			onSendClick();
		}
	};

	return (
		<LogInWithBackImg>
			<CustomMediaQuery.Mobile>
				<HeaderLoginMobile />
			</CustomMediaQuery.Mobile>
			<CustomMediaQuery.Desktop>
				<div className='header-container-injoin'>
					<HeaderLogin />
				</div>
			</CustomMediaQuery.Desktop>
			<div className='update-password-main-container'>
				<div className='update-password-content-container'>
					<div className='update-inputs-container' onKeyDown={connectWithEnter}>
						<div className='form-container-and-title'>
							<CustomHeader containerClassName={'center'} text={'איפוס סיסמה'} />
							<div className={matchingPasswordsError ? 'red' : ''}>
								<CustomInputText
									type={TextTypes.Password}
									labelText={Lang.format('NewPassword')}
									value={password}
									onChange={onPasswordChanged}
									error={passwordError}
									id='newPassword'
									autocomplete='new-password'
								/>
								<CustomInputText
									type={TextTypes.Password}
									labelText={Lang.format('ConfirmedPassword')}
									value={confirmPassword}
									onChange={onConfirmedPasswordChanged}
									error={confirmPasswordError}
									id='confirmedPassword'
									autocomplete='new-password'
								/>
							</div>
							{matchingPasswordsError && (
								<div className='error-message'>{matchingPasswordsError}</div>
							)}
							<CustomButton
								text={Lang.format('ChangePasswordBtn')}
								buttonClassName='primary-design center'
								onClick={onSendClick}
								disabled={viewStore.loadingView}
							/>
						</div>
					</div>
					<CustomMediaQuery.Desktop>
						<div className='vl'></div>
					</CustomMediaQuery.Desktop>
					<div className='password-rules'>
						<div className='update-password-instructions'
							dangerouslySetInnerHTML={{
								__html: messagesStore.UpdatePasswordInstructions,
							}}>
						</div>
					</div>
				</div>
			</div>
		</LogInWithBackImg>
	);
}
export default observer(UpdatePassword)
