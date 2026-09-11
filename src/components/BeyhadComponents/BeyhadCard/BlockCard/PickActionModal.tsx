import * as React from 'react';
import { CustomHeader, CustomSelector, CustomButton, CustomSpan } from 'nofshonit-base-web-client';
import Lang from '../../../../config/Language';
import { Link, NavLink } from 'react-router-dom';
import { RoutesPath } from '../../../../consts/RoutesPath';
import CustomLink from '../../../CustomComponents/CustomLink/CustomLink';
import ProfileCardModal from '../ProfileCardModal';
import AlertUtils from '../../../../utils/AlertUtils';
import ErrorUtils from '../../../../utils/errorHandling/ErrorUtils';
import ProfileCardStore from '../../../../stores/ProfileCardStore';
import rootStores from '../../../../stores';
import { AUTH_STORE, PROFILE_CARD_STORE } from '../../../../consts/stores';
import CustomModal from '../../../CustomComponents/CustomModal';
import GoogleAnalyticsUtils from 'src/utils/analytics/GoogleAnalyticsUtils';
import { useState } from 'react';
import AuthStore from 'src/stores/AuthStore';

interface Props {
	onBlockClicked: () => void;
	onBlockAndOrderClicked: () => void;
}
interface IState { 
	cardModal: boolean;
}
const profileCardStore: ProfileCardStore = rootStores[PROFILE_CARD_STORE];
const authStore: AuthStore = rootStores[AUTH_STORE];

const PickActionModal : React.FC<Props> = ({
	onBlockClicked,
	onBlockAndOrderClicked,
}) => {

	const [cardModal, setCardModal] = useState<boolean>(false);
	const [cvv,setCvv] = useState<number>();
	const [expiredDate,setExpiredDate] = useState<string>("");
	const cardNumber =
	authStore.currentUser && authStore.currentUser.cardNumber ? authStore.currentUser.cardNumber : '';
	const onBlockClickedFunc = () => {
		GoogleAnalyticsUtils.clickButtonAnalytics('lost_your_card','lost_your_card','click','חסום');
		onBlockClicked();
	};

	const sendCardMemberOnSMS = () => {
		profileCardStore
			.sendCardMemberOnSMS()
			.then((response) => {
				AlertUtils.successAlert(Lang.format('MessageWasSentSuccessfully'), '');
			})
			.catch((err) => {
				ErrorUtils.checkErrorAndShowPopUp(err);
			});
	};
	const onCancel = () => {
		setCardModal(false)
	};

	const renderProfileModal = () => (
		<ProfileCardModal sendCardMemberOnSMS={sendCardMemberOnSMS} onCancel={onCancel} cvv={cvv} expiredDate={expiredDate} />
	);

	const onMyMemberCardClicked = async() => {
		sendGoogleAnalytics('club_card','club_card','popup_impression_club_card',Lang.format('MyMemberCard'));
		const res = await profileCardStore.getCardDetailsByCardNumber(cardNumber);
		setCvv(res.cvv);
		setExpiredDate(res.expirationDate)
		setCardModal(true)
	};

	const sendGoogleAnalytics = (event:any,event_category:any,event_action:any, event_label: any) => {
		GoogleAnalyticsUtils.clickButtonAnalytics(event,event_category,event_action,event_label);
	}

	const onBlockAndOrderClickedFunc = () => {
		sendGoogleAnalytics('lost_your_card','lost_your_card','click','חסום והזמן כרטיס חדש');
		onBlockAndOrderClicked();
	};
	return (
		<div className="first-modal-container">
			<div className='img-first-modal'>
				<img src={require('../../../../assets/card-block-icon.png')} />
			</div>
			<CustomHeader containerClassName="center" text={`חסימת כרטיס`} />

			<div className="buttons-container">
				{/* <div className="block-btn">
					<CustomButton
						buttonClassName="secondry-design center"
						text={Lang.format('Block')}
						onClick={this.onBlockClicked}
					/>
				</div> */}
				<div onClick={() => onBlockClicked()} className={'blue-button'}>
					{Lang.format('Block')}
				</div>
				{/* <div className="block-and-order">
					<CustomButton
						buttonClassName="green center"
						text={Lang.format('BlockAndOrderNewOne')}
						onClick={this.onBlockAndOrderClicked}
					/>
				</div> */}
				<div onClick={() => onBlockAndOrderClickedFunc()} className={'blue-button'}>
					{Lang.format('BlockAndOrderNewOne')}
				</div>
				<div className="footer-text">
					<CustomSpan classNameSpan="bold" text={Lang.format('OrderNewCardAndPay')} />
				</div>
				<div className='footer-text-2'>
					{Lang.format('BlockCardAlert1')}
					<br />
					{Lang.format('BlockCardAlert2')}
					<NavLink to={'#'} onClick={onMyMemberCardClicked} >
					{Lang.format('BlockCardAlertLink')}
					</NavLink>
					{Lang.format('BlockCardAlert3')}
				</div>
				<CustomModal
						onCancel={onCancel}
						visible={cardModal}
						componentToRender={renderProfileModal()}
					/>
			</div>
		</div>
	);
}
export default PickActionModal;
