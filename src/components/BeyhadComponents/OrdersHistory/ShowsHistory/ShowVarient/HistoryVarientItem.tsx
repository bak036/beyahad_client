import { observer } from 'mobx-react';
import { CustomButton, CustomSpan, CustomSeperator } from 'nofshonit-base-web-client';
import * as React from 'react';
import { MESSAGES_STORE, ORDERS_HISTORY_STORE, VIEW_STORE, CONFIGURATION_STORE, AUTH_STORE } from '../../../../../consts/stores';
import { BusinessSubType, OrderStatus } from '../../../../../models/enums';
import Order from '../../../../../models/Order';
import rootStores from '../../../../../stores';
import OrdersHistoryStore from '../../../../../stores/OrdersHistoryStore';
import ViewStore from '../../../../../stores/ViewStore';
import CustomModal from '../../../../CustomComponents/CustomModal';
import CancelatioLevelTwoModal from './CancelatioLevelTwoModal';
import CancelationLevelOneModal from './CancelationLevelOneModal';
import TicketItem from '../../../PaymentPage/Products/TicketItem';
import TicketItemCancel from '../../../PaymentPage/Products/TicketItemCancel';
import * as _ from 'lodash';
import EventItem from '../../../PaymentPage/Products/EventItem';
import StringFormatUtils from '../../../../../utils/StringFormatUtils';
import ConfigurationStore from '../../../../../stores/ConfigurationStore';
import AuthStore from '../../../../../stores/AuthStore';
import AlertUtils from '../../../../../utils/AlertUtils';
import MessagesStore from '../../../../../stores/MessagesStore';
import { RoutesPath } from 'src/consts/RoutesPath';
import ScreenUtils from 'src/utils/ScreenUtils';
import ExternalLinkConfirm from 'src/services/ExternalLinkConfirm';
import { useEffect, useState } from 'react';
import CuponPopup from '../CuponPopup/CuponPopup';



const messagesStore: MessagesStore = rootStores[MESSAGES_STORE];

const moment = require('moment');

interface Props {
	order: Order | any;
	onCancelOrder: (order) => void;
	onConfirmOrderClicked: (orderGuid) => void;
	history: any;
}
interface IState {
	display: boolean;
	cancelLevelOne: boolean;
	cancelLevelTwo: boolean;
	requriedAproove: boolean;
	confirmHtml: any;
	disabled: boolean;
	varaintDetails: Order;
}

const authStore: AuthStore = rootStores[AUTH_STORE];
const viewStore: ViewStore = rootStores[VIEW_STORE];
const orderHistoryStore: OrdersHistoryStore = rootStores[ORDERS_HISTORY_STORE];
const configurationStore: ConfigurationStore = rootStores[CONFIGURATION_STORE];

const HistoryVarientItem: React.FC<Props> = ({
	order,
	onCancelOrder,
	onConfirmOrderClicked,
	history
}) => {

	const [display, setDisplay] = useState<boolean>(false);
	const [cancelLevelOne, setCancelLevelOne] = useState<boolean>(false);
	const [cancelLevelTwo, setCancelLevelTwo] = useState<boolean>(false);
	const [requriedAproove, setRequriedAproove] = useState<boolean>(false);
	const [confirmHtml, setConfirmHtml] = useState<any>('');
	const [disabled, setDisabled] = useState<boolean>(false);
	const [varaintDetails, setVaraintDetails] = useState<Order>(new Order());
	const [cardModal, setCardModal] = useState<boolean>(false);

	useEffect(() => {
		viewStore.setLoadingView(false);
	}, [])

	const renderTickets = (event) => {
		if (event && event.tickets) {
			return event.tickets.map((ticket, index) => (
				<>
					{/* {index > 0 ? <CustomSeperator /> : null} */}
					<TicketItemCancel ticket={ticket} key={index} />
				</>
			));
		} else {
			return null;
		}
	};

	const orderStatus = (status: OrderStatus) => {
		switch (status) {
			case OrderStatus.NotImplemented: {
				return 'זמין למימוש';
			}
			case OrderStatus.Implemented: {
				return 'מומש';
			}
			case OrderStatus.Expired: {
				return 'פג תוקף';
			}
			case OrderStatus.InCancelProcess: {
				return 'בהליך ביטול';
			}
			case OrderStatus.Canceled: {
				return 'בוטל';
			}

			default: {
				return 'זמין למימוש';
			}
		}
	};

	const OnCancelButtonClicked = () => {
		setCancelLevelOne(true)
	};

	const OnCancelButtonClickedTzarchanot = async () => {
		let message: string = await messagesStore.getSingleMessageFromService(messagesStore.cancelTzarchanotOrder);
		message = message.replace('{0}', order.businessName);
		message = message.replace('{1}', order.businessPhoneNumber);
		AlertUtils.confirmAlertCustom('', message, { confirmButtonText: 'הבנתי' });
	}

	const OnCancelButtonClickedHotelsOrSubscriptions = async () => {
		let message: string = await messagesStore.getSingleMessageFromService(messagesStore.cancelHotelsOrSubscriptions);
		message = `<div style="padding: 10px; display: grid; place-items: center;">${message}</div>`;
		AlertUtils.confirmAlertCustom('', message, { showConfirmButton: false });
	}


	const onCancelLevelOne = () => {
		setCancelLevelOne(false)
	};

	const onContinue = async () => {
		setCancelLevelOne(false)
		if (order.dtsRedimCode) {
			viewStore.setLoadingView(true);
			let res = await orderHistoryStore.validateCancelOrderAproove(order);
			setRequriedAproove(Boolean(res))
			viewStore.setLoadingView(false);
		}
		setCancelLevelTwo(true)

	};

	const onMoreDetailsClicked = () => {
		setDisplay(!display)
	};

	const renderLevelOne = () => {
		return (
			<CancelationLevelOneModal
				onCancel={onCancelLevelOne}
				onContinue={onContinue}
				order={order}
			/>
		);
	};

	const onCancelLevelTwo = () => {
		setCancelLevelTwo(false);
		if(IsExternalCoupon)
		{
		    AlertUtils.infoWarning('', messagesStore.MessageForCancelExternalCouponExit);
		}
	};

	const onCancelOrderFunc = () => {
		onCancelOrder(order);
		setCancelLevelTwo(false)
	};

	const renderLevelTwo = () => {
		return <CancelatioLevelTwoModal onCancel={onCancelLevelTwo} onCancelOrderClicked={onCancelOrderFunc} requriedAproove={requriedAproove} agreeCheckBox={false} />;
	};
	const v = order;
	const IsExternalCoupon = v.IsExternalCoupon;
	const quantity = v.quantity * (v.tickets ? v.tickets.length : 1);
	const isMobile = ScreenUtils.IsMobile();
	const isCancelable = ![BusinessSubType.Consumerism, BusinessSubType.Subscriptions, BusinessSubType.Hotels].includes(parseInt(v.businessSubTypeId))
		|| new Date(v.orderDate).toDateString() === new Date(Date.now()).toDateString();
	return (
		<>
			<CustomModal
				onCancel={() => setCardModal(false)}
				visible={cardModal}
				width='30rem'
				componentToRender={
					<CuponPopup
						isMobile={false}
						cardNumber={order.dtsRedimCode}
						categoryName={order.name}
						digitalCodeType={order.digitalCodeType}
						lastImplementationDate={order.expiredDate}
						variantName={order.variantName}
					></CuponPopup>
				}
			/>
			<CustomModal
				visible={cancelLevelOne}
				componentToRender={renderLevelOne()}
				onCancel={onCancelLevelOne}
				closable={false}
				width={isMobile ? '360px' : '733px'}
			/>
			<CustomModal
				visible={cancelLevelTwo}
				componentToRender={renderLevelTwo()}
				onCancel={onCancelLevelTwo}
				closable={false}
				width={isMobile ? '360px' : '733px'}
			/>
			<div className={`show-varient-main-container ${v.benefitStatusName === OrderStatus.Canceled ? 'cancel' : ''}`}>
				<div className='show-varient-main-items'>
					<div className='show-varient-inner-container'>
						<div className='show-varient-item-purchase-data'>
							<CustomSpan text={v && v.orderDate ? moment(v.orderDate).format('DD/MM/YY') : ''} />
						</div>
						<div className='show-varient-item-categoryName'>
							{/* <CustomSpan text={v && v.name ? v.name : ''} /> */}
							<a href={`/category/productPage/${v.benefitId}`}>
								{v && v.name ? v.name : ''}
							</a>
						</div>
						<div className='show-varient-item-name'>
							{/* <a href={`/category/porductPage/${v.benefitId}`}>{v && v.variantName ? v.variantName : ''}</a> */}
							<CustomSpan text={v && v.variantName ? v.variantName : ''} />
						</div>
						<div className='show-varient-item-quantity'>
							<CustomSpan text={v && v.quantity < 0 ? `${v.quantity}-` : `${v.quantity * quantity}`} />
						</div>
						<div className='show-varient-item-total'>
							<CustomSpan
								text={v && v.customerPrice ? `${StringFormatUtils.tryConvertToLocaleString(v.customerPrice)} ₪` : ''}
							/>
						</div>
						<div className='show-varient-item-status'>
							<CustomSpan
								classNameSpan={`redemptionDetails ${orderStatus(v.benefitStatusName) === 'זמין למימוש' ? 'availableForRedemption' :
									['בהליך ביטול', 'בוטל'].includes(orderStatus(v.benefitStatusName)) ? 'cancellation' : 'disabledForRedemption'}`}
								text={v && v.benefitStatusName ? orderStatus(v.benefitStatusName) : ''}
							/>
						</div>
					</div>
					<div className='btn-group'>
						<div className='order-details-button'>
							<div className='custom-button-container'>
								<button
									className={`button center ${display ? 'order-details-active' : 'order-details'}`}
									onClick={onMoreDetailsClicked}
								>
									<span>פרטי הזמנה</span>
									<img src={require('../../../../../assets/arrow-down.png')} className='icon'></img>
								</button>
							</div>
						</div>
						{v.benefitStatusName !== OrderStatus.Canceled && (
							<div className={`order-cancel-button ${v.isCancelable === 0 ? `order-cancel-button-style` : ``}`}>
								<CustomButton
									disabled={v.isCancelable === 0 || orderStatus(v.benefitStatusName) === 'מומש' ? true : false}
									buttonClassName={`cancel-order center `}
									text={isCancelable ? 'ביטול הזמנה' : 'איך מבטלים?'}
									onClick={isCancelable ? OnCancelButtonClicked :
										BusinessSubType.Consumerism == v.businessSubTypeId ? OnCancelButtonClickedTzarchanot :
											OnCancelButtonClickedHotelsOrSubscriptions
									}
								/>
							</div>
						)}
					</div>
				</div>
			</div>
			{display && !v.orderTicketId && v.benefitStatusName !== OrderStatus.Canceled && (
				<div className='more-order-details'>
					{/* <CustomSpan text={'פרטי הזמנה'} classNameSpan={'bold'} /> */}
					<div className='more-order-details-container'>
						<div className='item'>
							<CustomSpan text={'מספר אסמכתא'} classNameSpan={`bold`} />
							<CustomSpan text={`${v && v.orderConfirmation ? v.orderConfirmation : '0000'}`} />
						</div>
						<div className='item'>
							<CustomSpan text={'שם בית העסק'} classNameSpan={`bold`} />
							<CustomSpan text={v.businessName} />
						</div>
						{v.businessSubTypeId == 26 && <div className='item'>
							<CustomSpan text={'סטטוס ההזמנה'} classNameSpan={`bold`} />
							<CustomSpan text={v.orderStatus != null ? v.orderStatus : ""} />
						</div>}
						{v.businessSubTypeId == 26 && <div className='item'>
							<CustomSpan text={'פרטי בית העסק'} classNameSpan={`bold`} />
							<CustomSpan text={v.businessAddress != null ? v.businessAddress + `${v.businessStreetNumber ? v.businessStreetNumber : ''}` + ", " + v.businessCity + "." : ""} />
						</div>}
						{v.businessSubTypeId == 26 && <div className='item'>
							<CustomSpan text={'טלפון בית העסק'} classNameSpan={`bold`} />
							{v.businessPhoneNumber != null ? <a href={"tel:" + v.businessPhoneNumber} target="_blank">{v.businessPhoneNumber}</a> : ""}
						</div>}
						{v.businessSubTypeId == 26 && <div className='item'>
							<CustomSpan text={'מספר מעקב'} classNameSpan={`bold`} />
							<CustomSpan text={v.trackingNumber != null ? v.trackingNumber : ""} />
						</div>}
						{v.businessSubTypeId == 26 && <div className='item'>
							<CustomSpan text={'קישור לחברת השילוח'} classNameSpan={`bold`} />
							<span
								className="trackingNumberVariant"
								onClick={() => v.trackingWebsite != null ? ExternalLinkConfirm.OpenLinkExternal(v.trackingWebsite, "_blank") : ""}
							>
								{v.trackingWebsite != null ? "לחץ כאן" : ""}
							</span>
						</div>}
						{v.businessSubTypeId == 26 && v.deliveryAddress != "" && <div className='item'>
							<CustomSpan text={'כתובת למשלוח'} classNameSpan={`bold`} />
							<CustomSpan text={v.deliveryAddress} />
						</div>}
						{v.businessSubTypeId != 26 /*&& v.dtsRedimCode.includes("http")*/
							&& v.dtsRedimCode != authStore.currentUser.cardNumber && <div className='item'>
								<CustomSpan text={'קוד הקופון'} classNameSpan={`bold`} />
								{v.dtsRedimCode.includes("http") ? <a href={v.dtsRedimCode} target="_blank">{v.dtsRedimCode}</a> : <div><CustomSpan text={v.dtsRedimCode} /><img className='copy-icon' style={{ cursor: 'pointer' }}
									onClick={() => { window.navigator['clipboard'].writeText(v.dtsRedimCode); }} src={require('../../../../../assets/copy.png')}></img></div>}
							</div>
						}
					</div>
					<div className='btn-group'>
						<div className='btn-container' >
							{v.isDisplayButton && !v.dtsRedimCode.includes("http") && <CustomButton
								onClick={() => {setCardModal(true) }}
								buttonClassName={`center smallHeight`}
								text={'הצגת ההטבה'}
							/>

							}
						</div>
						<div className='btn-container'>
							<CustomButton
								onClick={() => onConfirmOrderClicked(v.orderGuid)}
								buttonClassName={`center smallHeight`}
								text={'אישור ההזמנה'}
							/>
						</div>
					</div>
				</div>
			)}
			{display && v.orderTicketId && v.benefitStatusName !== OrderStatus.Canceled && (
				<div className='order-details-events-container'>
					<div className='more-order-details-events'>
						<div className='top-details'>
							<div className='item'>
								<CustomSpan text='מועד האירוע' classNameSpan='bold' />
								{/* &nbsp; */}
								<div>
									<CustomSpan text={moment(v.eventDate, 'DD-MM-YYYY').format('DD/MM/YY')} />
									&nbsp;
									<CustomSpan text={v.eventTime} />
								</div>
							</div>
							{/* &nbsp; &nbsp;&nbsp; */}
							<div className='item'>
								<CustomSpan text={'מקום האירוע'} classNameSpan={'bold'} />
								{/* &nbsp; */}
								<CustomSpan text={v.venueName} />
							</div>
							{/* &nbsp; &nbsp;&nbsp; */}
							<div className='item'>
								<CustomSpan text={'מספר אסמכתא'} classNameSpan='bold' />
								{/* &nbsp; */}
								<CustomSpan text={v.orderConfirmation} />
							</div>
							{/* <br />
							<br /> */}
						</div>
						<div className='tickets-container-desktop'>
							<CustomSpan text='פרטי כרטיסים' classNameSpan='bold' />
							<div className='tickets-item-cancel'>
								{renderTickets(v)}
							</div>
						</div>
					</div>
					<div className='btn-group-order-details-events' >
						<div>
							<CustomButton
								text={'הצגת כרטיסים'}
								buttonClassName={'center'}
								onClick={() => {
									history.push(`${RoutesPath.iframe}?link=${v.tickets[0].eventsTicketLink}`);
								}}
							/>
						</div>
						<div>
							<CustomButton
								text={'אישור ההזמנה'}
								buttonClassName={'center'}
								onClick={() => onConfirmOrderClicked(v.orderGuid)}
							/>
						</div>
					</div>
				</div>
			)}
			{display && v.benefitStatusName === OrderStatus.Canceled && (
				<div className='more-order-details'>
					<div className='more-order-details-container'>
						{/* <CustomSpan text={'פרטי הזמנה'} classNameSpan={'bold'} /> */}
						<div className='confirmation-id item'>
							<CustomSpan text={'מספר הזמנה'} classNameSpan={`bold`} />
							<CustomSpan text={`${v.dtsOrderId}`} />
						</div>

						<div className='cancel-date item'>
							<CustomSpan text={'תאריך ביטול'} classNameSpan={`bold`} />
							<CustomSpan text={moment(v.cancelDate).format('DD.MM.YY')} />
						</div>
						<div className='confirmation-id item'>
							<CustomSpan text={'מספר אישור'} classNameSpan={`bold`} />
							<CustomSpan text={`${v.transactionID}`} />
						</div>
						<div className='quantity-cancel item'>
							<CustomSpan text={'כמות לביטול'} classNameSpan={`bold`} />
							<CustomSpan text={`${v.quantity * quantity}-`} />
						</div>
					</div>
				</div>

			)}
		</>
	);
}

export default HistoryVarientItem;
