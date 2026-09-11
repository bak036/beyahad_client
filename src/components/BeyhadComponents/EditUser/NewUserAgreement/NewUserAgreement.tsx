import { CustomButton, CustomSpan } from 'nofshonit-base-web-client';
import * as React from 'react';
import Lang from '../../../../config/Language';
import rootStores from '../../../../stores';
import UserDetailsStore from '../../../../stores/UserDetailsStore';
import { USER_DETAILS_STORE, AUTH_STORE, VIEW_STORE, MESSAGES_STORE } from '../../../../consts/stores';
import { observer } from 'mobx-react';
import AuthStore from '../../../../stores/AuthStore';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import AlertUtils from '../../../../utils/AlertUtils';
import ViewStore from '../../../../stores/ViewStore';
import ErrorUtils from '../../../../utils/errorHandling/ErrorUtils';
import { NewOrUpdate } from '../../../../models/enums';
import { registrationStatus } from '../../../../utils/authentication/enums';
import { RoutesPath } from '../../../../consts/RoutesPath';
import NofhonitStorage from '../../../../utils/NofhonitStorage';
import MessagesStore from '../../../../stores/MessagesStore';
import EditorMessage from '../../EditorMessage/EditorMessage';
import ContactApprovalCheckbox from '../ContactApproval/ContactApprovalCheckbox';

import { useEffect, useState } from 'react';
const MySwal = withReactContent(Swal);
interface Props {
	history?: any;
	submitButtonText: string;
	isMint?: boolean;
	accessToken?: string;
	markCheckBox: boolean;
	handleClick?: () => void;
}

interface IState {
	agreeCheckBox: boolean;
	agreeToMarketing: string;
}
const viewStore: ViewStore = rootStores[VIEW_STORE];
const userDetailsStore: UserDetailsStore = rootStores[USER_DETAILS_STORE];
const authStore: AuthStore = rootStores[AUTH_STORE];
const messagesStore: MessagesStore = rootStores[MESSAGES_STORE];

const NewUserAgreement : React.FC<Props> = ({
	history,
	submitButtonText,
	isMint,
	accessToken,
	markCheckBox,
	handleClick
}) => {

	const [agreeCheckBox, setAgreeCheckBox] = useState<boolean>(true);
	const [agreeToMarketing, setAgreeToMarketing] = useState<string>('');

	useEffect(() => {
		initMessageStore()
	}, [])

	const initMessageStore = async () => {
		await messagesStore
			.getSingleMessageFromService(messagesStore.userAcceptToRecieveMarketing)
			.then((agreeToMarketing) => {
				setAgreeToMarketing(agreeToMarketing)
			});
		setAgreeCheckBox(markCheckBox)
		viewStore.setLoadingView(false);
	}

	// TODO: move this action to the container and not use it in this component
	const submitButtonClicked = () => {
		if (userDetailsStore.validate()) {
			AlertUtils.confirmAlert(
				Lang.format('ForYourAttention'),
				Lang.format('EditUserInputsSubmitMessage'),
				Lang.format('Approve'),
				Lang.format('Cancel')
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
				}
			});
		}
	};

	const checkBoxClicked = (e) => {
		userDetailsStore.setAllowSmsAndEmail(!agreeCheckBox);
		setAgreeCheckBox(!agreeCheckBox)
	};

	return (
		<div className='new-user-agreement-container'>
			<div className={'new-user-agreement'}>
				<div className='agreement-container'>
					<input
						className={'checkbox'}
						type='checkbox'
						style={{ cursor: 'pointer' }}
						checked={agreeCheckBox}
						onChange={checkBoxClicked}
					/>

				</div>
				<div className='agreement-text-container'>
					<div className='agreement-text'>
						<EditorMessage textClassName='agree-message1' message={agreeToMarketing} />
					</div>
					<EditorMessage textClassName={'agree-message'} message={messagesStore.registrationMessage} />
				</div>

			</div>
			<div className={'submit-button-container'}>
				<CustomButton
					buttonClassName='primary-design center'
					text={submitButtonText}
					onClick={() =>handleClick && handleClick()}
					disabled={viewStore.loadingView}
				/>
			</div>
		</div>
	);
}
export default NewUserAgreement;
