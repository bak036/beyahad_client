import { observer } from 'mobx-react';
import { CustomButton, CustomHeader, CustomSpan } from 'nofshonit-base-web-client';
import * as React from 'react';
import EditorMessage from 'src/components/BeyhadComponents/EditorMessage/EditorMessage';
import HeaderLogin from 'src/components/BeyhadComponents/HomePage/HeaderLogin';
import HeaderLoginMobile from 'src/components/BeyhadComponents/HomePage/HeaderLoginMobile';
import { CustomMediaQuery } from 'src/components/CustomComponents/CustomMediaQuery/CustomMediaQuery';
import EditUserInputs from '../../components/BeyhadComponents/EditUser/EditUserInputs/EditUserInputs';
import Lang from '../../config/Language';
import { RoutesPath } from '../../consts/RoutesPath';
import { AUTH_STORE, MESSAGES_STORE, MINT_STORE, USER_DETAILS_STORE, VIEW_STORE } from '../../consts/stores';
import { NewOrUpdate, PremiumType } from '../../models/enums';
import rootStores from '../../stores';
import AuthStore from '../../stores/AuthStore';
import MessagesStore from '../../stores/MessagesStore';
import MintStore from '../../stores/MintStore';
import UserDetailsStore from '../../stores/UserDetailsStore';
import ViewStore from '../../stores/ViewStore';
import AlertUtils from '../../utils/AlertUtils';
import ErrorUtils from '../../utils/errorHandling/ErrorUtils';
import NofhonitStorage from '../../utils/NofhonitStorage';
import LogInWithBackImg from 'src/components/BeyhadComponents/HomePage/LogInWithBackImg';
import { useEffect, useState } from 'react';
import ContactApprovalCheckbox from 'src/components/BeyhadComponents/EditUser/ContactApproval/ContactApprovalCheckbox';

interface Props {
	history?: any;
	isMint?: boolean;
	accessToken?: string;
}

interface IState {
	ads: boolean;
}
const userDetailsStore: UserDetailsStore = rootStores[USER_DETAILS_STORE];
const messagesStore: MessagesStore = rootStores[MESSAGES_STORE];
const authStore: AuthStore = rootStores[AUTH_STORE];
const viewStore: ViewStore = rootStores[VIEW_STORE];
const mintStore: MintStore = rootStores[MINT_STORE];

const RegistrationContainer: React.FC<Props> = ({
	history,
	isMint,
	accessToken
}) => {

	const [ads, setAds] = useState<boolean>(false);
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

	useEffect(() => {
		mintStore.setMintButtonActivation(false);
		userDetailsStore.initUserDetails();
		viewStore.setLoadingView(false);
		if (!authStore.loggedInUser) {
			history.push(RoutesPath.login.login);
		}
	}, [])

	const adsChanged = (e) => {
		const value = e.target.checked;
		setAds(value)
	};

	const showSuccessMessagePremiumTypeOne = async () => {
		// Get Success message from messages Service and then finish registration
		return await messagesStore.getSingleMessageFromService(messagesStore.userFinishedRegistrationPremiumTypeOneKey);
	};
	const showSuccessMessagePremiumTypeThree = async () => {
		// Get Success message from messages Service and then finish registration
		return await messagesStore.getSingleMessageFromService(messagesStore.userFinishedRegistrationPremiumTypeThreeKey);
	};

	const registerClicked = () => {
		if (isSubmitting || authStore.isUpdateUserInProgress) return;
		if (userDetailsStore.validate()) {
			AlertUtils.confirmAlert(
				Lang.format('ForYourAttention'),
				Lang.format('EditUserInputsSubmitMessage'),
				Lang.format('Approve'),
				Lang.format('Cancel')
			).then((result) => {
				//	Enable loader
				if (result.value) {
					if (isSubmitting || authStore.isUpdateUserInProgress) return;
					setIsSubmitting(true);
					viewStore.setLoadingView(true);
					authStore
						.updateUser(userDetailsStore.currentEditingUserDetails, ads, NewOrUpdate.New)
						.then((user) => {
							// Success Actions

							const categoryId = NofhonitStorage.getCategoryIdSession();
							let premiumType = user.premiumType;
							let successMessage;

							if (premiumType == PremiumType.PaymentAccess) {
								successMessage = showSuccessMessagePremiumTypeOne();
							}
							if (premiumType == PremiumType.ReadOnly) {
								successMessage = showSuccessMessagePremiumTypeThree();
							}
							if (premiumType == PremiumType.Type5) {
								// Used Promise.resolve because the infrustructure use promises (look at previous "if"s)
								successMessage = Promise.resolve(messagesStore.premiumType5Join);
							}

							successMessage.then((message) => {
								// Once the user clicks ok or closes the alert window - redirect him.

								AlertUtils.basicAlertPromise('', message).then(() => {
									if (isMint) {
										NofhonitStorage.deleteCategoryIdSession();

										// TODO: Sagi - is it should be here?
										mintStore.setMintButtonActivation(true);

										if (categoryId != null) {
											// Move MINT user back to category
											// prettier-ignore
											history.push(`${RoutesPath.mint.category}/${categoryId}`);
										} else {
											history.push(`${RoutesPath.mint.successPage}`);
										}
									} else {
										// Move Regular user to homepage
										window.location.href = RoutesPath.root;
									}
								});
							});
						})
						.catch((err) => {
							// Check error type
							ErrorUtils.checkErrorAndShowPopUp(err, '', '');
						})
						.finally(() => {
							// Disable loader
							viewStore.setLoadingView(false);
							setIsSubmitting(false);
						});
				}
			});
		}
	};

	return (
		<LogInWithBackImg>
			<CustomMediaQuery.Mobile>
				<HeaderLoginMobile />
			</CustomMediaQuery.Mobile>
			<CustomMediaQuery.Desktop>
				<div className='header-container-injoin for-registration-form' style={{ width: "70%" }}>
					<HeaderLogin />
				</div>
			</CustomMediaQuery.Desktop>
			<div className='registration-container'>
				<div className='padding-container'>
					<div className='title'>
						<CustomHeader text={Lang.format('Register')} />
					</div>
					{/* // I removed the currentUser={authStore.currentUser} because the EditUserInputs already using one */}
					<EditUserInputs />

					<div className='agreement-registration-container'>
						<div className='agreement-registration'>
							<div className="checkbox-line">
								<ContactApprovalCheckbox />
							</div>
						</div>
						<div className='agreement-registration'>
							<div className='check-box-container'>
								<input style={{ cursor: 'pointer' }} type='checkbox' checked={ads} onChange={adsChanged} />
							</div>
							<div className='text-container'>
								אני מאשר את קבלת העדכונים על ההטבות החדשות והמבצעים.
							</div>
						</div>
						<EditorMessage textClassName={'agree-message'} message={messagesStore.registrationMessage} />

					</div>

					<div className='registration-btn'>
						<CustomButton
							text={`סיים הרשמה`}
							buttonClassName={`primary-design center`}
							onClick={registerClicked}
							disabled={isSubmitting || authStore.isUpdateUserInProgress}
						/>
					</div>
				</div>
			</div>
		</LogInWithBackImg>
	);
}
export default observer(RegistrationContainer)
