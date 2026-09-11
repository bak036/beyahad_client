import { observer } from 'mobx-react';
import * as React from 'react';
import { default as ShowsHistoryMain } from '../../components/BeyhadComponents/OrdersHistory/OrdersHistoryMain/ShowsHistoryMain/ShowsHistoryMain';
import { ORDERS_HISTORY_STORE, VIEW_STORE } from '../../consts/stores';
import rootStores from '../../stores';
import OrdersHistoryStore from '../../stores/OrdersHistoryStore';
import ViewStore from '../../stores/ViewStore';
import ErrorUtils from '../../utils/errorHandling/ErrorUtils';
import { useEffect } from 'react';

interface Props {
	history: any;
	isMint?: boolean;
}

interface IState { }

const ordersHistoryStore: OrdersHistoryStore = rootStores[ORDERS_HISTORY_STORE];
const viewStore: ViewStore = rootStores[VIEW_STORE];

const OrdersHistoryContainer : React.FC<Props> = ({
	history,
	isMint
}) => {

	useEffect(() => {
		viewStore.setLoadingView(true);
		ordersHistoryStore
			.getHistory()
			.then(() => {
				viewStore.setLoadingView(false);
				ordersHistoryStore.initBussniessNames();
			})
			.catch((err) => {
				viewStore.setLoadingView(false);
				ErrorUtils.checkErrorAndShowPopUp(err, '', '');
			});
	},[])

	return (
		< div className='orders-history-container' >
			<ShowsHistoryMain history={history} />
		</div >
	);
}

export default observer(OrdersHistoryContainer)
