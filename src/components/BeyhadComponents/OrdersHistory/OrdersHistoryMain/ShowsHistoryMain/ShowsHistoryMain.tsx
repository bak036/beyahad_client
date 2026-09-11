import Pagination from 'antd/lib/pagination';
import 'antd/lib/pagination/style/css';
import { observer } from 'mobx-react';
import { CustomHeader, CustomSpan } from 'nofshonit-base-web-client';
import * as React from 'react';
import Lang from '../../../../../config/Language';
import { RoutesPath } from '../../../../../consts/RoutesPath';
import { ORDERS_HISTORY_STORE, VIEW_STORE, MESSAGES_STORE } from '../../../../../consts/stores';
import Order from '../../../../../models/Order';
import rootStores from '../../../../../stores';
import OrdersHistoryStore from '../../../../../stores/OrdersHistoryStore';
import ViewStore from '../../../../../stores/ViewStore';
import AlertUtils from '../../../../../utils/AlertUtils';
import ErrorUtils from '../../../../../utils/errorHandling/ErrorUtils';
import { CustomMediaQuery } from '../../../../CustomComponents/CustomMediaQuery/CustomMediaQuery';
import HistoryFilters from '../../BenefitsHistory/Filters/HistoryFilters';
import ShowBox from '../../ShowsHistory/ShowBox/ShowBox';
import ShowsHeader from '../../ShowsHistory/ShowsHeader/ShowsHeader';
import HistoryVariantsItemMobile from '../../ShowsHistory/ShowVarient/HistoryVariantsItemMobile';
import MessagesStore from '../../../../../stores/MessagesStore';
import GoogleAnalyticsUtils from 'src/utils/analytics/GoogleAnalyticsUtils';
import { useEffect, useState } from 'react';
import CustomModal from 'src/components/CustomComponents/CustomModal';
import BarcodePopupDetails from 'src/models/BarcodePopupDetails';
import CuponPopup from '../../ShowsHistory/CuponPopup/CuponPopup';

interface Props {
	history: any;
}

interface IState {
	startDate: string; // Filter start date
	endDate: string; // Filter end date
	page: number;
}

enum CancelStatus {
	CancelSuccess = 'CancelledNowSuccessfully',
	CancelInProccess = 'InCancelProcess',
}

const ordersHistoryStore: OrdersHistoryStore = rootStores[ORDERS_HISTORY_STORE];
const viewStore: ViewStore = rootStores[VIEW_STORE];
const messagesStore: MessagesStore = rootStores[MESSAGES_STORE];


const ShowsHistoryMain: React.FC<Props> = ({
	history,
}) => {

	const [page, setPage] = useState<number>(1);
	const [startDate, setStartDate] = useState<string>('');
	const [endDate, setEndDate] = useState<string>('');
	const [cardModal, setCardModal] = useState<boolean>(false);
	const [order, setOrder] = useState<BarcodePopupDetails>();


	useEffect(() => {
		const currentUrl = window.location.href;
		if (currentUrl.includes("OrderAsmchta")) {
			const urlParams = new URLSearchParams(window.location.search);
			const orderAsmchta = urlParams.get('OrderAsmchta') || '';
			ordersHistoryStore.getPopupBarcodeDetails(orderAsmchta).then((order) => {
				if (order.data.data.cardNumber) {
					setOrder(order.data.data);
					setCardModal(true);
				}
			})
		}
		ordersHistoryStore.getOldHistoryLink();
	}, [])

	const onCancelOrder = async (order) => {
		try {
			if (ordersHistoryStore.shouldlShowCustomerServiceMessage(order)) {
				const messageKey = messagesStore.cancelOrderMessage;
				const message = await messagesStore.getSingleMessageFromService(messageKey);
				AlertUtils.basicAlert('', message);
				return;
			}
			viewStore.setLoadingView(true);
			ordersHistoryStore.setDisable(true);
			let result;

			result = await ordersHistoryStore.cancelOrder(order);
			if (result) {
				await ordersHistoryStore
					.getHistory()
					.then(() => {
						if (result.cancelStatusName) {
							const cancelStatusName = result.cancelStatusName;
							if (cancelStatusName === CancelStatus.CancelSuccess) {
								AlertUtils.successAlert(Lang.format('CancelSuccess', ''));
							} else if (cancelStatusName === CancelStatus.CancelInProccess) {
								AlertUtils.basicAlert('', messagesStore.inProccessCancel);
							} else {
								// General error occurd
								throw new Error('Cancelation Status not recognized');
							}
						} else {
							// General error occurd
							throw new Error('No status of cancelation');
						}
					})
					.catch((err) => {
						ErrorUtils.checkErrorAndShowPopUp(err, '', '');
					});
			}

			viewStore.setLoadingView(false);
			ordersHistoryStore.setDisable(false);
		} catch (err) {
			viewStore.setLoadingView(false);
			ErrorUtils.checkErrorAndShowPopUp(err, '', '');
		}
	};
	const onConfirmOrderClicked = (orderGuid) => {
		history.push(`${RoutesPath.profile.confirmOrder}/${orderGuid}`);
	};


	const onPagingChanged = (page) => {
		setPage(page)
	};

	const initPage = (page) => {
		setPage(page)
	};

	const orders = ordersHistoryStore.loadBulkOrders(page);
	const oldHistoryLink = ordersHistoryStore.oldHistoryLink;
	const size = ordersHistoryStore.getOrdersAndEvents ? ordersHistoryStore.getOrdersAndEvents.length : 0;

	return (
		<div className={'purchase-history-container'}>
			<CustomModal
				onCancel={() => setCardModal(false)}
				visible={cardModal}
				componentToRender={
					<CuponPopup
						isMobile={false}
						cardNumber={order?.cardNumber}
						digitalCodeType={order?.digitalCodeType}
						lastImplementationDate={order?.lastImplementationDate}
						variantName={order?.shortNameVar}
						categoryName={order?.categoryName}
					></CuponPopup>
				}
			/>
			<div className={'history-body-container'}>
				<CustomMediaQuery.Desktop>
					<div className={'sub-text-order-history'} onClick={() => GoogleAnalyticsUtils.clickButtonAnalytics('profile_menu', 'profile_menu', '', Lang.format('OrderHistory'))}>
						<CustomHeader text={Lang.format('OrderHistory')} />
					</div>
					<div className='visit-old-purchases-container'>
						<CustomSpan text={Lang.format('VisitOldPurchases')} classNameSpan='visit-old-purchases' />
						<a className='underline' href={oldHistoryLink} target='_blank'>
							{Lang.format('ClickHere')}
						</a>
					</div>

					<HistoryFilters businessNames={ordersHistoryStore.getBusinessNames} onFilter={() => initPage(1)} />
					<ShowsHeader />
					<ShowBox
						history={history}
						onConfirmOrderClicked={onConfirmOrderClicked}
						orders={orders}
						onCancelOrder={onCancelOrder}
					//onShowVariantClicked={onShowVariantClicked}
					/>
				</CustomMediaQuery.Desktop>
				<CustomMediaQuery.Mobile>
					<div className='header-history-orders' onClick={() => GoogleAnalyticsUtils.clickButtonAnalytics('profile_menu', 'profile_menu', '', Lang.format('OrderHistory'))}>
						<CustomHeader text={Lang.format('OrderHistory')} headerClassName={'hedear-text-order-history'} containerClassName={'right'} />
					</div>
					<div className='visit-old-purchases-container'>
						<CustomSpan text={Lang.format('VisitOldPurchases')} classNameSpan='visit-old-purchases' />
						<a className={'underline'} href={oldHistoryLink}>{Lang.format('ClickHere')}</a>
					</div>

					<HistoryFilters businessNames={ordersHistoryStore.getBusinessNames} onFilter={() => initPage(1)} />

					<HistoryVariantsItemMobile
						history={history}
						onConfirmOrderClicked={onConfirmOrderClicked}
						variants={orders}
						onCancelOrder={onCancelOrder}
					/>
				</CustomMediaQuery.Mobile>
			</div>
			<div className='pagination-container'>
				<Pagination defaultCurrent={1} total={size} pageSize={20} onChange={onPagingChanged} />
			</div>
		</div>
	);
}
export default observer(ShowsHistoryMain)
