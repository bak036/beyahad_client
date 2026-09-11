import { observer } from 'mobx-react';
import { CustomButton, CustomHeader, CustomInputText, Logger, TextTypes, CustomSpan } from 'nofshonit-base-web-client';
import * as React from 'react';
import Lang from '../../../../config/Language';
import { AUTH_STORE, VIEW_STORE, MESSAGES_STORE } from '../../../../consts/stores';
import rootStores from '../../../../stores';
import AuthStore from '../../../../stores/AuthStore';
import AlertUtils from '../../../../utils/AlertUtils';
import ErrorUtils from '../../../../utils/errorHandling/ErrorUtils';
import ViewStore from '../../../../stores/ViewStore';
import MessagesStore from '../../../../stores/MessagesStore';
import { CustomMediaQuery } from 'src/components/CustomComponents/CustomMediaQuery/CustomMediaQuery';
import GoogleAnalyticsUtils from 'src/utils/analytics/GoogleAnalyticsUtils';
import { useEffect, useState } from 'react';

interface Props { }

interface IState {
	currentPassword: string;
	newPassword: string;
	confirmedPassword: string;
	currentPasswordError: string;
	newPasswordError: string;
	confirmedPasswordError: string;
	matchingPasswordsError: string;
	currentPasswordNotEqualNewPasswordError: string;
}

const viewStore: ViewStore = rootStores[VIEW_STORE];
const authStore: AuthStore = rootStores[AUTH_STORE];
const messagesStore: MessagesStore = rootStores[MESSAGES_STORE];

const ChangePassword : React.FC<Props> = ({

}) => {

	const [currentPassword,setCurrentPassword] = useState<string>('');
	const [newPassword,setNewPassword] = useState<string>('');
	const [confirmedPassword,setConfirmedPassword] = useState<string>('');
	const [currentPasswordError,setCurrentPasswordError] = useState<string>('');
	const [newPasswordError,setNewPasswordError] = useState<string>('');
	const [confirmedPasswordError,setConfirmedPasswordError] = useState<string>('');
	const [matchingPasswordsError,setMatchingPasswordsError] = useState<string>('');
	const [currentPasswordNotEqualNewPasswordError,setCurrentPasswordNotEqualNewPasswordError] = useState<string>('');

	useEffect(() => {
		viewStore.setLoadingView(false);
	},[])

	const clearErrors = () => {
		setCurrentPasswordError('')
		setNewPasswordError('')
		setConfirmedPasswordError('')
		setMatchingPasswordsError('')
	};

	const onCurrentPasswordChange = (value) => {
		if (value.length> 14) return;
		const currentPassword = value;
		setCurrentPassword(currentPassword)
	};

	const onNewPasswordChange = (value) => {
		if (value.length> 14) return;
		const newPassword = value;
		setNewPassword(newPassword)
	};

	const onConfirmedPasswordChange = (value) => {
		if (value.length> 14) return;
		const confirmedPassword = value;
		setConfirmedPassword(confirmedPassword)
	};
	const validtion = () => {
		let retVal: boolean = true;

		// Check length of passwords
		if (currentPassword.length < 8 || currentPassword.length > 14) {
			if (currentPassword.length == 0) {
				setCurrentPasswordError(Lang.format('InputsThatMarkedWithAsteriskAreRequired'))
			} else {
				setCurrentPasswordError(Lang.format('PasswordNeedsToContainBetween8and14Characters'))
			}
			retVal = false;
		} else {
				setCurrentPasswordError('')
		}
		if (newPassword.length < 8 || newPassword.length > 14) {
			if (newPassword.length == 0) {
				setNewPasswordError(Lang.format('InputsThatMarkedWithAsteriskAreRequired'))
			} else {
				setNewPasswordError(Lang.format('PasswordNeedsToContainBetween8and14Characters'))
			}
			retVal = false;
		} else {
			setNewPasswordError('')
		}

		if (confirmedPassword.length < 8 || confirmedPassword.length > 14) {
			if (confirmedPassword.length == 0) {
				setConfirmedPasswordError(Lang.format('InputsThatMarkedWithAsteriskAreRequired'))
			} else {
				setConfirmedPasswordError(Lang.format('PasswordNeedsToContainBetween8and14Characters'))
			}
			retVal = false;
		} else {
			setConfirmedPasswordError('')
		}

		// Check Matching Passwords if all fields are filled correctly

		if (retVal) {
			var strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!?@#\$%\^&\*])(?=.{8,})");
			if (!strongRegex.test(newPassword)) {
				setNewPasswordError(Lang.format('PasswordMustBeStrong'))
				setConfirmedPasswordError(Lang.format('PasswordMustBeStrong'))
				retVal = false;
			} else {
				setNewPasswordError('')
				setConfirmedPasswordError('')
			}

			if (newPassword !== confirmedPassword) {
				setMatchingPasswordsError(Lang.format('PasswordsDontMatch'))
				retVal = false;
			} else {
				setMatchingPasswordsError('')
			}

			// Check If Current Password Does not Match New Password

			if (newPassword == currentPassword) {
				setCurrentPasswordNotEqualNewPasswordError(Lang.format('currentPasswordNotEqualNewPassword'))
				retVal = false;
			} else {
				setCurrentPasswordNotEqualNewPasswordError('')

			}
		}
		return retVal;
	};

	const sendGoogleAnalytics = (event:any,event_category:any,event_action:any, event_label: any) => {
		GoogleAnalyticsUtils.clickButtonAnalytics(event,event_category,event_action,event_label);
	}

	const onSaveChangesClick = () => {
		if (validtion()) {
			sendGoogleAnalytics('password_reset','password_reset','submit_form','שמור שינויים')
			// Enable loader
			viewStore.setLoadingView(true);

			authStore
				.changePassword(currentPassword, newPassword)
				.then(() => {
					// Disable loader
					viewStore.setLoadingView(false);
					// Success Actions
					AlertUtils.successAlert(Lang.format('TheNewPasswordWasUpdatedAtTheSystem'), '');
				})
				.catch((err) => {
					// Disable loader
					viewStore.setLoadingView(false);
					// Check error type
					ErrorUtils.checkErrorAndShowPopUp(err, '', '');
				});
		}
	};

	const connectWithEnter = (e) => {
		if (e.key === 'Enter') {
			onSaveChangesClick();
		}
	};

	return (
		<div className='container-change-password'>
			<div className='change-password-main-container'>
				<div className='change-password-main-content'>
					<div className='change-password-title'>
						<div className='main-text'>
							<CustomHeader text={Lang.format('ChangePasswordBY')} containerClassName={'center'} />
						</div>
						<CustomMediaQuery.Desktop>
							<div className='change-password-btn-container'>
								<CustomButton
									text={'שמירת שינויים'}
									buttonClassName='primary-design center'
									onClick={onSaveChangesClick}
									disabled={viewStore.loadingView}
								/>
							</div>
						</CustomMediaQuery.Desktop>
					</div>
					<div className='container-form-and-rules'>
						<div className='change-input-with-button'>
							<div className='change-password-inputs' onKeyDown={connectWithEnter}>
								<div>
									<CustomInputText
										labelText={Lang.format('CurrentPassword')}
										type={TextTypes.Password}
										value={currentPassword}
										onChange={onCurrentPasswordChange}
										error={currentPasswordError}
										required
										id='currentPassword'
									/>
								</div>
								<div
									className={
										currentPasswordNotEqualNewPasswordError || matchingPasswordsError
											? 'input-red'
											: ''
									}>
									<CustomInputText
										labelText={Lang.format('NewPasswordBY')}
										type={TextTypes.Password}
										value={newPassword}
										onChange={onNewPasswordChange}
										error={newPasswordError}
										required
									/>
								</div>
								<div
									className={
										currentPasswordNotEqualNewPasswordError || matchingPasswordsError
											? 'input-red'
											: ''
									}>
									<CustomInputText
										labelText={'אימות סיסמה'}
										type={TextTypes.Password}
										value={confirmedPassword}
										onChange={onConfirmedPasswordChange}
										error={confirmedPasswordError}
										required
									/>
								</div>
								{matchingPasswordsError ? (
									<div className='error-div'>
										<CustomSpan text={matchingPasswordsError} classNameSpan='error-color' />
									</div>
								) : (
									''
								)}
								{currentPasswordNotEqualNewPasswordError ? (
									<div>
										<CustomSpan text={currentPasswordNotEqualNewPasswordError} classNameSpan='error-color' />
									</div>
								) : (
									''
								)}
							</div>

						</div>
						<div className='change-password-content-text'>
							<div className='content-text-item change-password-instructions'
								dangerouslySetInnerHTML={{
									__html: messagesStore.UpdatePasswordInstructions,
								}}>

							</div>
						</div>

					</div>
					<CustomMediaQuery.Mobile>
						<div className='change-password-btn-container'>
							<CustomButton
								text={Lang.format('SaveChanges')}
								buttonClassName='primary-design center'
								onClick={onSaveChangesClick}
								disabled={viewStore.loadingView}
							/>

						</div>
					</CustomMediaQuery.Mobile>
				</div>
			</div>
		</div>
	);
}
export default observer(ChangePassword)
