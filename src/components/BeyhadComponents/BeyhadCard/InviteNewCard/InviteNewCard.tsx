import {History} from 'history';
import {observer} from 'mobx-react';
import {CustomButton, CustomHeader} from 'nofshonit-base-web-client';
import * as React from 'react';
import CustomButtonBlueBeyahad from 'src/components/CustomComponents/CustomBlueButton/CustomButtonBlueBeyahad';
import Lang from '../../../../config/Language';
import {PROFILE_CARD_STORE, VIEW_STORE} from '../../../../consts/stores';
import rootStores from '../../../../stores';
import ProfileCardStore from '../../../../stores/ProfileCardStore';
import ViewStore from '../../../../stores/ViewStore';
import ErrorUtils from '../../../../utils/errorHandling/ErrorUtils';

export interface IInvitNewCardProps {
	onCloseModalClick: () => void;
	onOrderCardLinkClicked: () => void;
	history: History;
}

export interface IInvitNewCardState {}

const profileCardStore: ProfileCardStore = rootStores[PROFILE_CARD_STORE];
const viewStore: ViewStore = rootStores[VIEW_STORE];

const InvitNewCard : React.FC<IInvitNewCardProps> = ({
	onCloseModalClick,
	onOrderCardLinkClicked,
	history
}) => {

	const onOrderCardClicked = async () => {
		try {
			viewStore.setLoadingView(true);
			const allow = await profileCardStore.possibleToOrderCard();
			if (allow) {
				history.replace('/category/productpage/16534');
			}
		} catch (err) {
			ErrorUtils.checkErrorAndShowPopUp(err, '', '');
		} finally {
			if (onOrderCardLinkClicked) {
				onOrderCardLinkClicked();
			}
			viewStore.setLoadingView(false);
		}
	};

	return (
		<div className='actions-nocard-modal'>
			<div className='headers-container'>
				<div className='nocard-black-text'>
					<CustomHeader text={Lang.format('NoCardModal1')} />
				</div>
				<div className='nocard-link cursor-pointer' onClick={onOrderCardClicked}>
					<u><CustomHeader text={Lang.format('NoCardModal2')} /></u>
				</div>
			</div>
			<CustomButtonBlueBeyahad
				// buttonClassName={'primary-design center'}
				isOneButton={true}
				buttonText={Lang.format('Close')}
				onClick={onCloseModalClick}
			/>
		</div>
	);
}
export default InvitNewCard;
