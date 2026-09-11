import {observer} from 'mobx-react';
import {Logger, CustomHeader} from 'nofshonit-base-web-client';
import * as React from 'react';
import {WALLET_STORE, VIEW_STORE} from '../../../../consts/stores';
import rootStores from '../../../../stores';
import WalletStore from '../../../../stores/WalletStore';
import Card from './Card';
import Wallet from '../../../../models/Wallet';
import ViewStore from '../../../../stores/ViewStore';

interface Props {
	history: any;
}
interface IState {}
const viewStore: ViewStore = rootStores[VIEW_STORE];
const walletStore: WalletStore = rootStores[WALLET_STORE];

const ChargeCard : React.FC<Props> = ({
	history,
}) => {
// Sort wallets, active wallets first, disabled last
const sortFunction = (walletA, walletB) => {
	let LoadAllowedA = walletA.loadingMode.isLoadAllowed ? 1 : 0;
	let LoadAllowedB = walletB.loadingMode.isLoadAllowed ? 1 : 0;
	if (LoadAllowedA == 1 && LoadAllowedB == 0) {
		return -1;
	} else if ((LoadAllowedA == 0 && LoadAllowedB == 0) || (LoadAllowedA == 1 && LoadAllowedB == 1)) {
		return 0;
	} else {
		return 1;
	}
};

const renderAllCards = () => {
	return (
		<div className='wallet-main-container'>
			{walletStore.getWalletsArray.sort(sortFunction).map((wallet, index) => (
				<Card
					isLoadAllowed={wallet.loadingMode.isLoadAllowed === 1}
					key={index}
					withLoad={true}
					withDischarge={true}
					withChains={true}
					wallet={wallet}
					withRegisterPayemnt
					history={history}
				/>
			))}
		</div>
	);
};
const renderEmptyState = () => {
	let emptyStateText;
	if (walletStore.loadingGetWallets) {
		emptyStateText = 'טוען ארנקים...';
	} else {
		emptyStateText = 'לא נמצאו ארנקים משוייכים לכרטיס זה.';
	}

	return (
		<div className='empty-state-charge'>
			<CustomHeader text={emptyStateText} containerClassName={'center'} />
		</div>
	);
};
	return walletStore.getWalletsArray && walletStore.getWalletsArray.length > 0
		? renderAllCards()
		: renderEmptyState();
}
export default observer(ChargeCard)
