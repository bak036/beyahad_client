import { CustomButton, CustomHeader, CustomSpan, HeaderType } from 'nofshonit-base-web-client';
import * as React from 'react';
import Lang from '../../../../config/Language';
import { USER_DETAILS_STORE, AUTH_STORE, MESSAGES_STORE, VIEW_STORE } from '../../../../consts/stores';
import rootStores from '../../../../stores';
import UserDetailsStore from '../../../../stores/UserDetailsStore';
import EditUserInputsProfile from '../EditUserInputs/EditUserInputsProfile';
import NewUserAgreement from '../NewUserAgreement/NewUserAgreement';
import { observer } from 'mobx-react';
import AuthStore from '../../../../stores/AuthStore';
import EditorMessage from '../../EditorMessage/EditorMessage';
import MessagesStore from 'src/stores/MessagesStore';
import ViewStore from 'src/stores/ViewStore';
import AlertUtils from 'src/utils/AlertUtils';
import { registrationStatus } from 'src/utils/authentication/enums';
import { NewOrUpdate } from 'src/models/enums';
import NofhonitStorage from 'src/utils/NofhonitStorage';
import { RoutesPath } from 'src/consts/RoutesPath';
import ErrorUtils from 'src/utils/errorHandling/ErrorUtils';
import { CustomMediaQuery } from 'src/components/CustomComponents/CustomMediaQuery/CustomMediaQuery';
import { useEffect, useState } from 'react';
import { cloneDeep } from 'lodash';
import City from 'src/models/City';
import ContactApprovalCheckbox from '../ContactApproval/ContactApprovalCheckbox';

interface Props {
	history?: any;
	isMint?: boolean;
	accessToken?: string;
}


interface IState {
	agreeCheckBox: boolean;
	agreeToMarketing: string;
}
const viewStore: ViewStore = rootStores[VIEW_STORE];
const userDetailsStore: UserDetailsStore = rootStores[USER_DETAILS_STORE];
const authStore: AuthStore = rootStores[AUTH_STORE];
const messagesStore: MessagesStore = rootStores[MESSAGES_STORE];
const EditUserMain: React.FC<Props> = ({
	history,
	isMint,
	accessToken
}) => {
	const [agreeCheckBox, setAgreeCheckBox] = useState<boolean>(true);
	const [agreeToMarketing, seTagreeToMarketing] = useState<string>('');
	const [isSend, setIsSend] = useState<boolean>(false);

	const [cityNamePrev, setCityNamePrev] = React.useState<string>(userDetailsStore.address.cityTextName);
	const [cityObjPrev, setCityObjPrev] = React.useState<City>(userDetailsStore.address.city);
	const [streetNamePrev, setStreetNamePrev] = React.useState<string>(userDetailsStore.address.streetName);

	const [streetNumberPrev, setStreetNumberPrev] = React.useState<string>(userDetailsStore.address.streetNumber);
	const [apartmentNumberPrev, setApartmentNumberPrev] = React.useState<string>(userDetailsStore.address.apartmentNumber);
	const [postalCodePrev, setPostalCodePrev] = React.useState<string>(userDetailsStore.address.postalCode);
	const [entrancePrev, setEntrancePrev] = React.useState<string>(userDetailsStore.address.entrance);
	const [mailboxPrev, setMmailboxPrev] = React.useState<string>(userDetailsStore.address.mailbox);

	useEffect(() => {
		userDetailsStore.initConfig();
		userDetailsStore.initUserDetails();
		userDetailsStore.getAllCities();
		initPrevAddress();
		initMessages();
	}, [])
	const initPrevAddress = () => {
		if (userDetailsStore.address && userDetailsStore.address.city) {
			setCityNamePrev(userDetailsStore.address.city.cityName)
			setStreetNamePrev(userDetailsStore.address.streetName)
			setCityObjPrev(userDetailsStore.address.city);
			setMmailboxPrev(userDetailsStore.address.mailbox);
			setEntrancePrev(userDetailsStore.address.entrance);
			setPostalCodePrev(userDetailsStore.address.postalCode);
			setApartmentNumberPrev(userDetailsStore.address.apartmentNumber);
			setStreetNumberPrev(userDetailsStore.address.streetNumber);
		}
	}
	const initMessages = async () => {
		await messagesStore
			.getSingleMessageFromService(messagesStore.userAcceptToRecieveMarketing)
			.then((agreeToMarketing) => {
				seTagreeToMarketing(agreeToMarketing)
			});
		setAgreeCheckBox(userDetailsStore.currentEditingUserDetails.allowSmsAndEmail)
		viewStore.setLoadingView(false);
	}
	const initPrevUserAddress = () => {
		userDetailsStore.address.setCity(cityObjPrev);
		userDetailsStore.address.setCityTextName(cityNamePrev);
		userDetailsStore.setCityTextName(cityNamePrev);
		userDetailsStore.address.setStreetName(streetNamePrev);
		userDetailsStore.setStreetNameError('');
		userDetailsStore.setCityError('');
		userDetailsStore.address.setStreetNumber(streetNumberPrev);
		userDetailsStore.address.setApartmentNumber(apartmentNumberPrev);
		userDetailsStore.address.setPostalCode(postalCodePrev);
		userDetailsStore.address.setEntrance(entrancePrev);
		userDetailsStore.address.setMailbox(mailboxPrev);
	}
	// TODO: move this action to the container and not use it in this component
	const submitButtonClicked = (cityObj: City, cityName: string, streetName: string, streetNumber: string, apartmentNumber: string, postalCode: string, entrance: string, mailbox: string) => {
		setIsSend(false);

		userDetailsStore.address.setCity(cityObj);
		userDetailsStore.address.setCityTextName(cityName);
		userDetailsStore.setCityTextName(cityName);
		userDetailsStore.address.setStreetName(streetName);
		userDetailsStore.address.setStreetNumber(streetNumber);
		userDetailsStore.address.setApartmentNumber(apartmentNumber);
		userDetailsStore.address.setPostalCode(postalCode);
		userDetailsStore.address.setEntrance(entrance);
		userDetailsStore.address.setMailbox(mailbox);

		if (userDetailsStore.validate()) {
			AlertUtils.confirmAlert2(
				Lang.format('ForYourAttention'),
				Lang.format('EditUserInputsSubmitMessage'),
				Lang.format('Cancel'),
				Lang.format('Approve')
			).then((result) => {
				// Enable loader
				if (result.value) {
					viewStore.setLoadingView(true);
					authStore
						.updateUser(userDetailsStore.currentEditingUserDetails, agreeCheckBox, NewOrUpdate.Update)
						.then((res) => {
							// Disable loader
							viewStore.setLoadingView(false);
							authStore.currentUser.shouldUpdateorRegister = registrationStatus.Pass;
							// Success Actions
							AlertUtils.successAlert(Lang.format('Updated'), Lang.format('TheFilledDetailsUpdatedSuccessfully')).then(
								() => {
									if (isMint) {
										// Move MINT user back to category
										const categoryId = NofhonitStorage.getCategoryIdSession();
										if (categoryId != null) {
											NofhonitStorage.deleteCategoryIdSession();
											// prettier-ignore
											history.push(`${RoutesPath.mint.category}/${categoryId}`);
										} else {
											history.push(`${RoutesPath.mint.successPage}`);
										}
									}
								}
							);

						})
						.catch((err) => {
							// Disable loader
							viewStore.setLoadingView(false);
							// Check error type
							ErrorUtils.checkErrorAndShowPopUp(err, '', '');

						});
				} else {
					initPrevUserAddress();
				}
			}).catch(() => {
				initPrevUserAddress();
			});
		} else {
			initPrevUserAddress();
		}
	};

	const checkBoxClicked = (e) => {
		userDetailsStore.setAllowSmsAndEmail(!agreeCheckBox);
		setAgreeCheckBox(!agreeCheckBox)
	};

	const { allowSmsAndEmail } = userDetailsStore.currentEditingUserDetails;
	return (
		<div className={'edit-user'}>

			{/* <div className={'title-container hide-on-desktop'}>
				<CustomHeader text={Lang.format('UpadteDetails')} type={HeaderType.Title} />
			</div> */}

			<div className={'padding-container'}>
				<div className={'main-container'}>
					<div className={'body-container'}>
						{/* // Title is hidden on mobile */}
						<div className='header-edit-user'>
							<div className={'title-container'}>
								<CustomHeader text={Lang.format('UpadteDetails')} type={HeaderType.Title} />
								<div className={'update-info-element'}>
									<CustomSpan text={Lang.format('UpdateUserInfo')} />
								</div>
							</div>
							<CustomMediaQuery.Desktop>
								<div className={'submit-button-container'}>
									<CustomButton
										buttonClassName='primary-design center'
										text={'שמירת שינויים'}
										onClick={() => setIsSend(true)}
										disabled={viewStore.loadingView}
									/>
								</div>
							</CustomMediaQuery.Desktop>
						</div>

						<EditUserInputsProfile isSendDetails={isSend} handleSubmit={submitButtonClicked} />
					</div>


						<div className={'footer-container'}>
						<CustomMediaQuery.Desktop>
							<div className={'new-user-agreement'}>
								<div className='agreement-container'>
									<div className="checkbox-line">
										<ContactApprovalCheckbox />
									</div>
									<div className="checkbox-line">
										<label className="control control--checkbox">
											<input
												className={'checkbox'}
												type='checkbox'
												style={{ cursor: 'pointer' }}
												checked={agreeCheckBox}
												onChange={checkBoxClicked}
											/>
											<div className="control__indicator"></div>
										</label>
									<div className='agreement-text'>
										<CustomSpan classNameSpan='agree-item-text' text={agreeToMarketing} />
									</div>
									</div>
									<EditorMessage textClassName={'agree-message'} message={messagesStore.registrationMessage} />
								</div>
							</div>

						</CustomMediaQuery.Desktop>

					</div>
					<CustomMediaQuery.Mobile>
						<div className="checkbox-line">
							<ContactApprovalCheckbox />
						</div>
						<NewUserAgreement
							history={history}
							submitButtonText={'שמירת שינויים'}
							isMint={isMint}
							accessToken={accessToken}
							markCheckBox={allowSmsAndEmail}
							handleClick={() => setIsSend(true)}
						/>
					</CustomMediaQuery.Mobile>
				</div>
			</div>
		</div>
	);
}
export default observer(EditUserMain)
