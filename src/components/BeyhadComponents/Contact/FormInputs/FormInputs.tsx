import { observer } from 'mobx-react';
import {
	CustomButton,
	CustomInputText,
	CustomSelector,
	CustomSpan,
	CustomTextArea,
	Logger,
	TextTypes,
} from 'nofshonit-base-web-client';
import * as React from 'react';
import Lang from '../../../../config/Language';
import { AUTH_STORE, CONTACT_STORE, MESSAGES_STORE, USER_DETAILS_STORE, VIEW_STORE } from '../../../../consts/stores';
import rootStores from '../../../../stores';
import ContactStore, { ContactReason } from '../../../../stores/ContactStore';
import AlertUtils from '../../../../utils/AlertUtils';
import ValidationService from '../../../../utils/ValidationService';
import MessagesStore from '../../../../stores/MessagesStore';
import ViewStore from '../../../../stores/ViewStore';
import ErrorUtils from '../../../../utils/errorHandling/ErrorUtils';
import EditorMessage from '../../EditorMessage/EditorMessage';
import { RoutesPath } from './../../../../consts/RoutesPath';
import { CustomMediaQuery } from 'src/components/CustomComponents/CustomMediaQuery/CustomMediaQuery';
import UserDetailsStore from 'src/stores/UserDetailsStore';
import AuthStore from 'src/stores/AuthStore';
import GoogleAnalyticsUtils from 'src/utils/analytics/GoogleAnalyticsUtils';
import { useEffect, useState } from 'react';

interface Props {
	history?: any;
}

interface IState {
	fullNameError: string;
	phoneNumberWithoutAreaCodeError: string;
	phoneNumberAreaCodeError: string;
	descreptionError: string;
	emailError: string;
	contactReasonError: string;
}
const userDetailsStore: UserDetailsStore = rootStores[USER_DETAILS_STORE];
const authStore: AuthStore = rootStores[AUTH_STORE];
const viewStore: ViewStore = rootStores[VIEW_STORE];
const messagesStore: MessagesStore = rootStores[MESSAGES_STORE];
const contactStore: ContactStore = rootStores[CONTACT_STORE];
const FormInputs : React.FC<Props> = ({
	history,
}) => {

	const [fullNameError, setFullNameError] = useState<string>('');
	const [phoneNumberWithoutAreaCodeError, setPhoneNumberWithoutAreaCodeError] = useState<string>('');
	const [phoneNumberAreaCodeError, setPhoneNumberAreaCodeError] = useState<string>('');
	const [descreptionError, setDescreptionError] = useState<string>('');
	const [emailError, setEmailError] = useState<string>('');
	const [contactReasonError, setContactReasonError] = useState<string>('');

	useEffect(() => {
		contactStore.getCrmTypes();
		contactStore.init();
		viewStore.setLoadingView(false);
	},[])

	const validate = () => {
		// Variable Definition
		const { fullName, descreption, phoneNumberWithoutAreaCode, phoneNumberAreaCode, email, contactReason } = contactStore;
		let retval = true;
		// Contact reason
		if (!contactReason || !contactReason.crmTypeDescription) {
			Logger.debug('contactReasonError');
			setContactReasonError(Lang.format('PleaseChooseMessageSubject'))
			retval = false;
		} else {
			Logger.debug('contactReasonError');
			setContactReasonError('')
		}
		// Phone without area code
		if (!phoneNumberWithoutAreaCode || !phoneNumberWithoutAreaCode.length || phoneNumberWithoutAreaCode.length < 7) {
			setPhoneNumberAreaCodeError(Lang.format('PleaseEnterNumber'))
			retval = false;
		} else {
			setPhoneNumberAreaCodeError('')
		}
		// Phone area code
		if (!phoneNumberAreaCode) {
			setPhoneNumberAreaCodeError(Lang.format('PleaseEnterNumber'))
			retval = false;
		} else {
			setPhoneNumberAreaCodeError('')
		}
		// Full Name
		if (!fullName || !fullName.length) {
			setFullNameError(Lang.format('PleaseEnterFullName'))
			retval = false;
		} else {
			setFullNameError('')
		}
		// Description
		if (!descreption || !descreption.trim().length) {
		    setDescreptionError(Lang.format('WriteTheContent'));
		    retval = false;
		} else {
		    setDescreptionError('');
		}
		// Email
		if (!email || !email.length || !ValidationService.validateEmail(email)) {
			setEmailError(Lang.format('PleaseEnterAVaildEmail'))
			retval = false;
		} else {
			setEmailError('')
		}
		return retval;
	};

	const clearErrors = () => {
		initStates();
	};
	const DeleteMember = () => {

		const contentHtml =
			"<div >" + Lang.format('DeleteMemberButtonPressed') + "</div>" +
			"<div style='margin-top:3%'>" + Lang.format('DeleteMemberInstructionP1') + "</div>" +
			"<div style='margin-top:3%'>" + Lang.format('DeleteMemberInstructionP2') + "</div>" +
			"<div style='margin-top:3%'>" + Lang.format('DeleteMemberInstructionP3') + "</div>";

		AlertUtils.confirmAlertWithHtmlForDeleteUser(
			'',
			contentHtml,
			Lang.format('DeleteMemberAlertButtonContinue'),
			Lang.format('DeleteMemberAlertButtonPressedByMistake'),

		).then((result) => {
			// Enable loader
			if (result.value) {
				viewStore.setLoadingView(true);
				userDetailsStore
					.deleteUserRequest()
					.then((res) => {
						if (res.data == false) {
							AlertUtils.confirmAlertOneButton('', Lang.format('DeleteMemberNotAllowed'), Lang.format('DeleteMemberNotAllowedOkButton'))
								.then((result) => {
									viewStore.setLoadingView(false);
								});

						}
						else {
							const contentHtml =
								"<div style='margin-top:3%'>" + Lang.format('DeleteMemberRequestReceived') + "</div>" +
								"<div style='margin-top:3%'>" + Lang.format('DeleteMemberRequestHandled5Days') + "</div>";

							AlertUtils.confirmAlertOneButtonWithHtml('', contentHtml, Lang.format('DeleteMemberNotAllowedOkButton'))
								.then((result) => {
									authStore.logout();
								});
						}

					})
					.catch((err) => {
						// Disable loader
						viewStore.setLoadingView(false);
						// Check error type
						ErrorUtils.checkErrorAndShowPopUp(err, '', '');
					});
			}
		});
	};
	const initStates = (): void => {
		setFullNameError('')
		setPhoneNumberAreaCodeError('')
		setPhoneNumberWithoutAreaCodeError('')
		setDescreptionError('')
		setEmailError('')
		setContactReasonError('')
	}

	const clearDescriptionAndSubject = () => {
		contactStore.setDescreption('');
		contactStore.setReason({ crmTypeID: '', crmTypeDescription: '' });
	};

	const sendGoogleAnalytics = (event:any,event_category:any,event_action:any, event_label: any) => {
		GoogleAnalyticsUtils.clickButtonAnalytics(event,event_category,event_action,event_label);
	}

	const sumbitContactRequest = () => {
		clearErrors();
		if (validate()) {
			sendGoogleAnalytics('Customer_Service','Customer_Service','submit_form_custom_service',contactStore.contactReason.crmTypeDescription)
			// Enable loader
			viewStore.setLoadingView(true);
			contactStore
				.sendContactRequest()
				.then((response) => {
					// Disable loader
					viewStore.setLoadingView(false);
					// Success Actions
					const additionalOptions = { showCancelButton: false, allowOutsideClick: false };
					AlertUtils.confirmAlert(
						'',
						messagesStore.userSuccessfulySubmittedContactForm,
						'OK',
						'',
						additionalOptions
					).then((result) => {
						if (result.value) {
							clearDescriptionAndSubject();
						}
						history && history.push(RoutesPath.root);
					});
				})
				.catch((err) => {
					// Disable loader
					viewStore.setLoadingView(false);
					// Check error type
					ErrorUtils.checkErrorAndShowPopUp(err);
				});
		}
	};

	const onFullNameChange = (value) => {
		contactStore.setFullName(value);
	};

	const onEmailChange = (value) => {
		contactStore.setEmail(value);
	};

	const onDescriptionChange = (value) => {
		contactStore.setDescreption(value);
	};

	const reasonSelected = (value: ContactReason) => {
		if (value) {
			value.crmTypeDescription = value.crmTypeDescription.trim();
		} else {
			value = { crmTypeID: '', crmTypeDescription: '' };
		}
		contactStore.setReason(value);
	};

	const onPhoneNumberWithoutAreaCode = (value: string) => {
		contactStore.setPhoneNumberWithoutAreaCode(value);
	};

	const onPhoneNumberAreaCode = (value: string) => {
		contactStore.setPhoneNumberAreaCode(value);
	};

	const {
		fullName,
		id,
		prefixPhoneNumbers,
		phoneNumberAreaCode,
		phoneNumberWithoutAreaCode,
		descreption,
		email,
		contactReason,
	} = contactStore;
	
	return (
		<>
			<div className={'form-body'}>
				<div className={'form-inputs-container'}>
					<CustomMediaQuery.Mobile>
						<span className='title-form-body'>צור קשר</span>
					</CustomMediaQuery.Mobile>
					<div className={'form-inputs-padding'}>
						<div className={'desktop-right-inputs'}>
							<CustomInputText
								type={TextTypes.Text}
								error={fullNameError}
								labelText={Lang.format('ContactCustomerInputFullName')}
								value={fullName ? fullName : ''}
								onChange={onFullNameChange}
							/>
							<CustomInputText
								type={TextTypes.Email}
								error={emailError}
								labelText={Lang.format('ContactCustomerInputEmail')}
								value={email ? email : ''}
								onChange={onEmailChange}
							/>
							<div className='phone-container'>
								<div className='top'>
									<div className={`right ' ${phoneNumberWithoutAreaCodeError ? 'right-error' : ''}`}>
										<div className={'number-container'}>
											<CustomInputText
												placeholder={phoneNumberWithoutAreaCode}
												value={phoneNumberWithoutAreaCode ? phoneNumberWithoutAreaCode : ''}
												labelText={'מספר טלפון'}
												type={TextTypes.Number}
												onChange={onPhoneNumberWithoutAreaCode}
											/>
										</div>
									</div>
									<div className={`left ' ${phoneNumberAreaCodeError ? 'left-error' : ''}`}>
										<CustomSelector
											selectClassName='select-prefix'
											options={prefixPhoneNumbers}
											value={phoneNumberAreaCode ? phoneNumberAreaCode : ''}
											onSelected={onPhoneNumberAreaCode}
											isPrimitiveValue
										/>
									</div>
								</div>
								{(phoneNumberAreaCodeError || phoneNumberWithoutAreaCodeError) && (
									<div className='bottom'>
										<CustomSpan text={Lang.format('PleaseEnterNumber')} classNameSpan='phone-error-color' />
									</div>
								)}
							</div>
							<CustomInputText
								type={TextTypes.Telephone}
								labelText={Lang.format('ContactCustomerInputId')}
								value={id ? id : ''}
								disabled
							/>


						</div>

						<div className={'desktop-left-inputs'}>
							<CustomSelector
								options={contactStore.crmTypes ? contactStore.crmTypes : []}
								text={`נושא ההודעה`}
								keyAttribute={'crmTypeID'}
								valueAttribute={'crmTypeDescription'}
								value={contactReason}
								onSelected={reasonSelected}
								error={contactReasonError}
								selectClassName={contactReasonError ? 'selection-error' : ''}
							/>
							<CustomTextArea
								rows={6}
								labelText={Lang.format('ContactCustomerContent')}
								placeholder={Lang.format('ContactCustomerContentTyping')}
								value={descreption}
								onChange={onDescriptionChange}
								error={descreptionError}
							/>
						</div>
					</div>
				</div>

				<div className={'form-footer'}>
					<CustomButton
						text={Lang.format('ContactCustomerSubmit')}
						onClick={sumbitContactRequest}
						buttonClassName={'primary-design'}
						disabled={viewStore.loadingView}
					/>
				</div>
				<CustomMediaQuery.Desktop>
					{messagesStore.contactMessage && (
						<EditorMessage textClassName={'contact-message'} message={messagesStore.contactMessage} />
					)}
				</CustomMediaQuery.Desktop>
			</div>
			<CustomMediaQuery.Mobile>
				<div className='mobile-contact-message'>
					{messagesStore.contactMessage && (
						<EditorMessage textClassName={'contact-message'} message={messagesStore.contactMessage} />
					)}
				</div>
				{
					authStore.isUserLoggedIn &&
					<div style={{
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center'
					}}>
						<button className={'btn-delete-member blue-button'} onClick={DeleteMember}> בקשה למחיקת חשבון</button>
					</div>
				}
			</CustomMediaQuery.Mobile>
		</>
	);
}
export default observer(FormInputs)
