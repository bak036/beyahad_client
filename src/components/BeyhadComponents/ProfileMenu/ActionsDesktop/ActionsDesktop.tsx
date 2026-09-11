import * as React from 'react';
import TabsHorizontalComponent from 'src/components/CustomComponents/TabsHorizontalComponent/TabsHorizontalComponent';
import OrdersHistoryContainer from 'src/containers/OrdersHistoryContainer/OrdersHistoryContainer';
import ProfileRoutes from 'src/containers/ProfileMain/ProfileRoutes/ProfileRoutes';
import Lang from '../../../../config/Language';
import { RoutesPath } from '../../../../consts/RoutesPath';
import { AUTH_STORE, PROFILE_CARD_STORE, VIEW_STORE } from '../../../../consts/stores';
import rootStores from '../../../../stores';
import AuthStore from '../../../../stores/AuthStore';
import ProfileCardStore from '../../../../stores/ProfileCardStore';
import ViewStore from '../../../../stores/ViewStore';
import ErrorUtils from '../../../../utils/errorHandling/ErrorUtils';
import { tryNavigateToLoadCard } from '../../../../utils/WalletNavigationUtils';
import CustomLink from '../../../CustomComponents/CustomLink/CustomLink';
import CustomModal from '../../../CustomComponents/CustomModal';
import InvitNewCard from '../../BeyhadCard/InviteNewCard/InviteNewCard';
import EditUserMain from '../../EditUser/EditUserMain/EditUserMain';
// import ChangePassword from '../../components/BeyhadComponents/Passwords/ChangePassword/ChangePassword';
import ChangePassword from '../../../BeyhadComponents/Passwords/ChangePassword/ChangePassword';
import CustomTubs from 'src/components/CustomComponents/CustomTubs';
import GoogleAnalyticsUtils from 'src/utils/analytics/GoogleAnalyticsUtils';
import { useState } from 'react';

interface Props {
	onMyMemberCardClicked: () => void;
	history?: any;
	disableLink?: boolean;
}

type IState = { noCardModal: boolean };
const profileCardStore: ProfileCardStore = rootStores[PROFILE_CARD_STORE];
const authStore: AuthStore = rootStores[AUTH_STORE];
const viewStore: ViewStore = rootStores[VIEW_STORE];

const Actions : React.FC<Props> = ({
	onMyMemberCardClicked,
	history,
	disableLink
}) => {
	const [noCardModal, setNoCardModal] = useState<boolean>(false);

	const onMyMemberCardClickedFunc = () => {
		sendGoogleAnalytics('club_card','club_card','popup_impression_club_card','כרטיס המועדון שלי');
		if (disableLink) {
			onMyMemberCardClicked();
		} else {
			setNoCardModal(true)		}
	};

	const sendGoogleAnalytics = (event:any,event_category:any,event_action:any, event_label: any) => {
		GoogleAnalyticsUtils.clickButtonAnalytics(event,event_category,event_action,event_label);
	}
	const onLoadCardClicked = () => {
		tryNavigateToLoadCard(history);
	};

	const cancelModal = () => {
		setNoCardModal(false)
	};
	const onOrderCardClicked = async () => {
		setNoCardModal(false)
	};	
	return (
			<div className={`actions-container-desktop ${authStore.canActivateAction ? '' : 'disabled'}`}>
				<CustomModal
					componentToRender={<InvitNewCard history={history} onCloseModalClick={cancelModal} onOrderCardLinkClicked={onOrderCardClicked} />}
					onCancel={cancelModal}
					visible={noCardModal}
				/>
				<div className={'link-with-icon-container'}>
					<CustomLink
						text={Lang.format('MyMemberCard')}
						onClick={onMyMemberCardClicked}
						containerClassName={'container-with-icon full-opacity'}
						textClassName={'text-container-short-width'}
						iconElement={<span className={'icon-element member-icon'} />}
					/>

					<CustomLink
						text={Lang.format('Load_Card')}
						containerClassName={'container-with-icon full-opacity'}
						iconElement={<span className={'icon-element card-icon'} />}
						onClick={onLoadCardClicked}
					/>
				</div>
			</div>

	);
}
export default Actions

