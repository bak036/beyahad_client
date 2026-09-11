import { CustomButton, CustomInputText, TextTypes, CustomHeader, CustomSpan } from 'nofshonit-base-web-client';
import * as React from 'react';
import Lang from '../../../../config/Language';
import { RoutesPath } from '../../../../consts/RoutesPath';
import CustomModal from '../../../CustomComponents/CustomModal';
import EmailModal from './EmailModal';
import AuthStore from '../../../../stores/AuthStore';
import { observer } from 'mobx-react';
import rootStores from '../../../../stores';
import { AUTH_STORE, VIEW_STORE, MESSAGES_STORE, CONFIGURATION_STORE } from '../../../../consts/stores';
import ValidationService from '../../../../utils/ValidationService';
import { validate } from '@babel/types';
import AlertUtils from '../../../../utils/AlertUtils';
import ErrorUtils from '../../../../utils/errorHandling/ErrorUtils';
import ViewStore from '../../../../stores/ViewStore';
import MessagesStore from '../../../../stores/MessagesStore';
import ConfigurationStore from '../../../../stores/ConfigurationStore';
import HeaderLoginMobile from '../../HomePage/HeaderLoginMobile';
import HeaderLogin from '../../HomePage/HeaderLogin';
import { CustomMediaQuery } from 'src/components/CustomComponents/CustomMediaQuery/CustomMediaQuery';
import { divide } from 'lodash';
import LogoutModal from '../../Logout/LogoutModal';
import CustomButtonBlueBeyahad from 'src/components/CustomComponents/CustomBlueButton/CustomButtonBlueBeyahad';
import DialogResetPasswordSucecc from './DialogResetPasswordSucecc';
import LogInWithBackImg from '../../HomePage/LogInWithBackImg';
import { useEffect, useState } from 'react';

interface Props {
	history: any;
}
interface IState {
	id: string;
	idError: string;
	timeToSendNextSms: number;
	timerIntervalId: number;
	openPopup: boolean;
	phoneNumber : '';
	email: '';
	message1: '';
	message2: '';
}
const messagesStore: MessagesStore = rootStores[MESSAGES_STORE];
const viewStore: ViewStore = rootStores[VIEW_STORE];
const authStore: AuthStore = rootStores[AUTH_STORE];
const configurationStore: ConfigurationStore = rootStores[CONFIGURATION_STORE];

const ForgotPassword : React.FC<Props> = ({ 
	history,
 })  => {
	
	const [id, setId] = useState<string>('');
	const [idError, setIdError] = useState<string>('');
	const [timeToSendNextSms, settimeToSendNextSms] = useState<number>(0);
	const [timerIntervalId, settimerIntervalId] = useState<number>(0);
	const [openPopup, setOpenPopup] = useState<boolean>(false);
	const [phoneNumber, setPhoneNumber] = useState<string>('');
	const [email, setEmail] = useState<string>('');
	const [message1, setMessage1] = useState<string>('');
	const [message2, setMessage2] = useState<string>('');

	const startTimer = () => {
		var timerIntervalId: any = setInterval(() => {
			if (timeToSendNextSms > 0) {
				settimeToSendNextSms(timeToSendNextSms - 1)
			}
			else {
				window.clearInterval(timerIntervalId);
			}
		}, 1000);
		settimerIntervalId(timerIntervalId)
	}

	useEffect(() => {
		viewStore.setLoadingView(false);
	})

	const onIdChanged = (value) => {
		const email = value;
		if (ValidationService.validateID(value)) {
			setId(email)
		}
	};

	

	const validate = () => {
		let retVal = true;
		// Check for empty id
		if (!id) {
			setIdError(Lang.format('PleaseEnterYourID'))
			retVal = false;
		} else {
			// check for id of length 9
			if (id.length != 9) {
				setIdError(Lang.format('IDIsNotValid'))
				retVal = false;
			} else {
				setIdError('')
			}
		}
		return retVal;
	};

	const forgotPasswordSuccessMessage = async () => {
		const mes1 =  await messagesStore.getSingleMessageFromService(messagesStore.forgotPasswordMessage);
		const mes2 = await messagesStore.getSingleMessageFromService(messagesStore.forgotPasswordMessage2);
		setMessage1(mes1)
		setMessage2(mes2)
		return true;
	};

	const onSaveChangesClick = () => {
		if (timeToSendNextSms > 0) return;
		if (validate()) {
			// Enable loader
			viewStore.setLoadingView(true);
			authStore
				.forgotPassword(id)
				.then((res) => {
					settimeToSendNextSms(configurationStore.getConfiguration.SecondesToReSendSms)
					startTimer();
					// Disable loader
					viewStore.setLoadingView(false);
					// Success Actions
					var urlArray = res.data.split('=');
					// This part is not needed for production, just for testing Forgot Password
					// urlArray[1] returns -12345678&memberId - the numbers are the token
					// this.props.history.push(`/login/updatePassword/forgotPassword?token=${urlArray[1]}=${this.state.id}`);
					// ***********************************************************************************
					forgotPasswordSuccessMessage()
						.then(async () => {
							await authStore.getMemberHashedData(id).then((info) => {
								setPhoneNumber(info.phone)
								setEmail(info.email)
							});
							// AlertUtils.basicAlert('', msg);
							setOpenPopup(true)
						})
						.catch((err) => {
							// Check error type
							ErrorUtils.checkErrorAndShowPopUp(err, '', '');
						});
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
	const onLogoutRender = () => {
		return <LogoutModal onCancel={() => {}} onLogoutButtonClicked={() => {}} />;
	};
	
	const phoneNumberDiv = (phoneNumber: string) => {
		return '<div style="direction: ltr;text-align:right;">' + (phoneNumber ? phoneNumber : '') + ' :נשלח למספר</div>';
	};
	const emailDiv = (email: string) => {
		return '<div style="direction: ltr;text-align:right;">' + (email ? email : '') + ' :ולמייל</div>';
	};

	const connectWithEnter = (e) => {
		if (e.key === 'Enter') {
			onSaveChangesClick();
		}
	};
	return (
		<LogInWithBackImg>
			<div className='forgot-password-main-container'>
				<CustomMediaQuery.Mobile>
					<HeaderLoginMobile />
					<div className='mobile-title'><CustomHeader containerClassName={'center '} text={'איפוס סיסמה'} /></div>
				</CustomMediaQuery.Mobile>
				<CustomMediaQuery.Desktop>
					<div className='header-container-injoin'>
						<HeaderLogin />
					</div>
				</CustomMediaQuery.Desktop>
				<div className='forgot-password-content-container'>
					<div className='forgot-password-title'>
						<CustomMediaQuery.Desktop>
							<CustomHeader containerClassName={'center'} text={'איפוס סיסמה'} />
						</CustomMediaQuery.Desktop>

						<CustomSpan
							classNameSpan={'small-font'}
							text={Lang.format('PleaseUpdateTheIdYouRegisteredWithToTheSystem')}
						/>
					</div>
					<div className='input-container' onKeyDown={connectWithEnter}>
						<CustomInputText
							type={TextTypes.Text}
							labelText={`תעודת זהות`}
							value={id}
							onChange={onIdChanged}
							error={idError}
						/>
						<p className='id-property'>יש להקליד מספר זהות כולל ספרת ביקורת (9 ספרות)</p>
						<CustomButton
							text={
								timeToSendNextSms > 0 ?
									`ניתן לשלוח קישור חדש בעוד ${String(Math.floor(timeToSendNextSms / 60)).padStart(2, '0')}:${String(Math.floor(timeToSendNextSms % 60)).padStart(2, '0')} דקות`
									: Lang.format('Continue')
							}
							buttonClassName={`primary-design center mt-10 ${timeToSendNextSms > 0 && 'disabeldButton'}`}
							onClick={onSaveChangesClick}
							disabled={viewStore.loadingView}
						/>
						<CustomModal
							onCancel={() => setOpenPopup(false)}
							visible={openPopup}
							componentToRender={
									<DialogResetPasswordSucecc 
										phonNumber={phoneNumber}
										email={email}
										onClick={() => setOpenPopup(false)}
										message1={message1}
										message2={message2}
									/>
						}
					/>
					</div>
				</div>
			</div>
		</LogInWithBackImg >
	);
}
export default ForgotPassword;
