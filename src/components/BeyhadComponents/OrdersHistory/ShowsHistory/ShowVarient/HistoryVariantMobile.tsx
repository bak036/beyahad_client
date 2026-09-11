import { debug } from 'console';
import * as moment from 'moment';
import { CustomButton, CustomHeader, CustomSeperator, CustomSpan } from 'nofshonit-base-web-client';
import * as React from 'react';
import { NavLink } from 'react-router-dom';
import Lang from '../../../../../config/Language';
import { RoutesPath } from '../../../../../consts/RoutesPath';
import { BusinessSubType, OrderStatus } from '../../../../../models/enums';
import Order from '../../../../../models/Order';
import StringFormatUtils from '../../../../../utils/StringFormatUtils';
import CustomModal from '../../../../CustomComponents/CustomModal';
import TicketItem from '../../../PaymentPage/Products/TicketItem';
import TicketItemCancel from '../../../PaymentPage/Products/TicketItemCancel';
import CancelatioLevelTwoModal from './CancelatioLevelTwoModal';
import CancelationLevelOneModal from './CancelationLevelOneModal';
import ConfigurationStore from '../../../../../stores/ConfigurationStore';
import rootStores from '../../../../../stores';
import { MESSAGES_STORE, VIEW_STORE, ORDERS_HISTORY_STORE, CONFIGURATION_STORE, AUTH_STORE } from '../../../../../consts/stores';
import AuthStore from '../../../../../stores/AuthStore';
import OrdersHistoryStore from '../../../../../stores/OrdersHistoryStore';
import ViewStore from '../../../../../stores/ViewStore';
import AlertUtils from '../../../../../utils/AlertUtils';
import MessagesStore from '../../../../../stores/MessagesStore';
import ExternalLinkConfirm from 'src/services/ExternalLinkConfirm';
import { useState } from 'react';
import CuponPopup from '../CuponPopup/CuponPopup';

const messagesStore: MessagesStore = rootStores[MESSAGES_STORE];


interface Props {
	variant: Order | any;
	onCancelOrder: (order) => void;
	onConfirmOrderClicked: (orderGuid) => void;
	history: any;
}
interface IState {
	display: boolean;
	cancelLevelOne: boolean;
	cancelLevelTwo: boolean;
	requriedAproove: boolean;
}

const authStore: AuthStore = rootStores[AUTH_STORE];
const configurationStore: ConfigurationStore = rootStores[CONFIGURATION_STORE];
const orderHistoryStore: OrdersHistoryStore = rootStores[ORDERS_HISTORY_STORE];
const viewStore: ViewStore = rootStores[VIEW_STORE];

const HistoryVariantMobile: React.FC<Props> = ({
	variant,
	onCancelOrder,
	onConfirmOrderClicked,
	history
}) => {

	const [display, setDisplay] = useState<boolean>(false);
	const [cancelLevelOne, setCancelLevelOne] = useState<boolean>(false);
	const [cancelLevelTwo, setCancelLevelTwo] = useState<boolean>(false);
	const [requriedAproove, setRequriedAproove] = useState<boolean>(false);
	const [cardModal, setCardModal] = useState<boolean>(false);

	const renderTickets = (event) => {
		if (event && event.tickets) {
			return event.tickets.map((ticket, index) => (
				<>
					{/* {index > 0 ? <CustomSeperator /> : null} */}
					<TicketItemCancel mobile ticket={ticket} key={index} />
				</>
			));
		} else {
			return null;
		}
	};

	const onOrderDetailsClicked = () => {
		setDisplay(!display)
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
	const onCancelLevelOne = () => {
		setCancelLevelOne(false)
	};
	const onContinue = async () => {
		setCancelLevelOne(false)
		if (variant.dtsRedimCode) {
			viewStore.setLoadingView(true);
			let res = await orderHistoryStore.validateCancelOrderAproove(variant);
			setRequriedAproove(Boolean(res))
			viewStore.setLoadingView(false);
		}
		setCancelLevelOne(false)
		setCancelLevelTwo(true)
	};

	const OnCancelButtonClickedTzarchanot = async () => {
		let message: string = await messagesStore.getSingleMessageFromService(messagesStore.cancelTzarchanotOrder);
		message = message.replace('{0}', variant.businessName);
		message = message.replace('{1}', variant.businessPhoneNumber);
		AlertUtils.confirmAlertCustom('', message, { confirmButtonText: 'הבנתי' });
	}

	const OnCancelButtonClickedHotelsOrSubscriptions = async () => {
		let message: string = await messagesStore.getSingleMessageFromService(messagesStore.cancelHotelsOrSubscriptions);
		message = `<div style="padding: 10px; display: grid; place-items: center;">${message}</div>`;
		AlertUtils.confirmAlertCustom('', message, { showConfirmButton: false });
	}


	const onMoreDetailsClicked = () => {
		setDisplay(!display)
	};

	const renderLevelOne = () => {
		return (
			<CancelationLevelOneModal
				onCancel={onCancelLevelOne}
				onContinue={onContinue}
				order={variant}
			/>
		);
	};

	const onCancelLevelTwo = () => {
		setCancelLevelTwo(false)
		AlertUtils.infoWarning('', messagesStore.MessageForCancelExternalCouponExit);
	};

	const onCancelOrderFunc = () => {
		onCancelOrder(variant);
		setCancelLevelTwo(false)
	};

	const renderLevelTwo = () => {
		return <CancelatioLevelTwoModal onCancel={onCancelLevelTwo} onCancelOrderClicked={onCancelOrderFunc} requriedAproove={requriedAproove} agreeCheckBox={false} />;
	};

	const onCancelButtonClicked = () => {
		onCancelOrder(variant);
	};

	const onOrderConfirmClicked = () => {
		onConfirmOrderClicked(variant.orderGuid);
	};
	const quantity = variant.quantity * (variant.tickets ? variant.tickets.length : 1);
	const isCancelable = ![BusinessSubType.Consumerism, BusinessSubType.Subscriptions, BusinessSubType.Hotels].includes(parseInt(variant.businessSubTypeId))
		|| new Date(variant.orderDate).toDateString() === new Date(Date.now()).toDateString();
	return (
		<div className='variant-history'>
			<CustomModal
				onCancel={() => setCardModal(false)}
				visible={cardModal}
				componentToRender={
					<CuponPopup
						isMobile={true}
						cardNumber={variant.dtsRedimCode}
						categoryName={variant.name}
						digitalCodeType={variant.digitalCodeType}
						lastImplementationDate={variant.expiredDate}
						variantName={variant.variantName}
					></CuponPopup>
				}
			/>
			<CustomModal
				visible={cancelLevelOne}
				componentToRender={renderLevelOne()}
				onCancel={onCancelLevelOne}
				closable={false}
			/>
			<CustomModal
				visible={cancelLevelTwo}
				componentToRender={renderLevelTwo()}
				onCancel={onCancelLevelTwo}
				closable={false}
			/>
			<div className='order-date'>
				<CustomSpan text={`תאריך רכישה ${moment(variant.orderDate).format('DD/MM/YY')}`} />
				<CustomSpan
					classNameSpan={`redemptionDetails ${orderStatus(variant.benefitStatusName) === 'זמין למימוש' ? 'availableForRedemption' :
						['בהליך ביטול', 'בוטל'].includes(orderStatus(variant.benefitStatusName)) ? 'cancellation' : 'disabledForRedemption'}`}
					text={variant && variant.benefitStatusName ? orderStatus(variant.benefitStatusName) : ''}
				/>
			</div>
			<NavLink to={`${RoutesPath.category.rootProductPage}/${variant.benefitId}`}>
				<CustomHeader text={variant.name} headerClassName='product-page-link' />
			</NavLink>
			<div className={'shows-item-container shows-header-container'}>
				<div className={'shows-item-body-container shows-header-body-container'}>
					<div className='shows-headers-item-name'>
						<CustomSpan classNameSpan={'black'} text={'שם המוצר'} />
					</div>
					<div className='shows-headers-items-quantity-total'>
						<div className='shows-headers-item-quantity'>
							<CustomSpan classNameSpan={'black'} text={Lang.format('OrdersHistoryAmount')} />
						</div>
						<div className='shows-headers-item-total'>
							<CustomSpan classNameSpan={'black'} text={Lang.format('סה"כ')} />
						</div>
					</div>
				</div>
			</div>
			<div className='shows-item-container'>
				<div className={'shows-item-body-container shows-items-body-container'}>
					<div className='shows-items-item-name item'>
						<CustomSpan classNameSpan='blue-normal underline' text={variant.variantName} />
					</div>
					<div className='shows-headers-items-quantity-total'>
						<div className='quantity-mobile item'>
							<CustomSpan text={variant ? `${variant.quantity * quantity}` : '0'} />
						</div>
						<div className={'sum-price-mobile item'}>
							<CustomSpan
								text={`${variant ? StringFormatUtils.tryConvertToLocaleString(variant.customerPrice) : 0} ₪`}
							/>
						</div>
					</div>
				</div>
			</div>
			<div className='btn-group'>
				<div className='order-details-container'>
					<div className='custom-button-container'>
						<button
							className={`button center ${display ? 'order-details-active' : 'order-details'}`}
							onClick={onOrderDetailsClicked}
						>
							<span>פרטי הזמנה</span>
							<img src={require('../../../../../assets/arrow-down.png')} className='icon'></img>
						</button>
					</div>
				</div>
				{variant.benefitStatusName !== OrderStatus.Canceled && (
					<div className={`order-cancel-button ${variant.isCancelable === 0 ? `order-cancel-button-style` : ``}`}>
						<CustomButton
							disabled={
								variant.isCancelable === 0 || orderStatus(variant.benefitStatusName) === 'מומש' ? true : false
							}
							buttonClassName={`cancel-order center `}
							text={isCancelable ? 'ביטול הזמנה' : 'איך מבטלים?'}
							onClick={isCancelable ? OnCancelButtonClicked :
								BusinessSubType.Consumerism == variant.businessSubTypeId ? OnCancelButtonClickedTzarchanot :
									OnCancelButtonClickedHotelsOrSubscriptions
							}
						/>
					</div>
				)}
			</div>
			<div className='all-details'>
				{display && !variant.orderTicketId && variant.benefitStatusName !== OrderStatus.Canceled && (
					<div className='more-order-details'>
						{/* <CustomSpan text={'פרטי הזמנה'} classNameSpan={'bold'} /> */}
						<div className='item confirmation-id'>
							<CustomSpan text={'מספר אסמכתא'} classNameSpan={`bold`} />
							<CustomSpan text={`${variant && variant.orderConfirmation ? variant.orderConfirmation : '0000'}`} />
						</div>

						<div className='item business-name'>
							<CustomSpan text={'שם בית העסק'} classNameSpan={`bold`} />
							<CustomSpan text={variant.businessName} />
						</div>
						{variant.businessSubTypeId == 26 && <div className='item business-name'>
							<CustomSpan text={'סטטוס ההזמנה'} classNameSpan={`bold`} />
							<CustomSpan text={variant.orderStatus != null ? variant.orderStatus : ""} />
						</div>}
						{variant.businessSubTypeId == 26 && <div className='item business-name'>
							<CustomSpan text={'פרטי בית העסק'} classNameSpan={`bold`} />
							<CustomSpan text={variant.businessAddress != null ? variant.businessAddress + " " + variant.businessStreetNumber + ", " + variant.businessCity + "." : ""} />
						</div>}
						{variant.businessSubTypeId == 26 && <div className='item business-name'>
							<CustomSpan text={'טלפון בית העסק'} classNameSpan={`bold`} />
							{variant.businessPhoneNumber != null ? <a href={"tel:" + variant.businessPhoneNumber} target="_blank">{variant.businessPhoneNumber}</a> : ""}
						</div>}
						{variant.businessSubTypeId == 26 && <div className='item business-name'>
							<CustomSpan text={'מספר מעקב'} classNameSpan={`bold`} />
							<CustomSpan text={variant.trackingNumber != null ? variant.trackingNumber : ""} />
						</div>}
						{variant.businessSubTypeId == 26 && <div className='item business-name'>
							<CustomSpan text={'קישור לחברת השילוח'} classNameSpan={`bold`} />
							<span
								className="trackingNumberVariant"
								onClick={() => variant.trackingWebsite != null ? ExternalLinkConfirm.OpenLinkExternal(variant.trackingWebsite, "_blank") : ""}
							>
								{variant.trackingWebsite != null ? "לחץ כאן" : ""}
							</span>
						</div>}
						{variant.businessSubTypeId == 26 && variant.deliveryAddress != "" && <div className='item business-name'>
							<CustomSpan text={'כתובת למשלוח'} classNameSpan={`bold`} />
							<CustomSpan text={variant.deliveryAddress} />
						</div>}
						{variant.businessSubTypeId != 26 /*&& v.dtsRedimCode.includes("http")*/
							&& variant.dtsRedimCode != authStore.currentUser.cardNumber && <div className='item business-name'>
								<CustomSpan text={'קוד הקופון'} classNameSpan={`bold`} />
								{variant.dtsRedimCode.includes("http") ? <a href={variant.dtsRedimCode} target="_blank">{variant.dtsRedimCode}</a> : <div className='redim-code'><CustomSpan text={variant.dtsRedimCode} /><img className='copy-icon' style={{ cursor: 'pointer' }}
									onClick={() => { window.navigator['clipboard'].writeText(variant.dtsRedimCode); }} src={require('../../../../../assets/copy.png')}></img></div>}

							</div>
						}
						{variant.isDisplayButton && !variant.dtsRedimCode.includes("http") &&
							<div className='btn-container'>
								<CustomButton
									onClick={() => { setCardModal(true) }}
									buttonClassName={`center smallHeight`}
									text={'הצגת ההטבה'}
								/>
							</div>
						}
						<div className='btn-container'>
							<CustomButton
								onClick={onOrderConfirmClicked}
								buttonClassName={`center order-details`}
								text={'אישור ההזמנה'}
							/>
						</div>
						
					</div>
				)}
				{display && variant.orderTicketId && variant.benefitStatusName !== OrderStatus.Canceled && (
					<>
						<div className='more-order-details-events' >
							<div className='top-details'>
								<div className='item'>
									<CustomSpan text='מועד האירוע:' classNameSpan='bold small-font' />
									{/* &nbsp; */}
									<div>

										<CustomSpan text={variant.eventTime} classNameSpan={'small-font'} />
										{/* &nbsp; &nbsp;&nbsp; */}
										&nbsp;
										<CustomSpan
											text={moment(variant.eventDate, 'DD-MM-YYYY').format('DD.MM.YY')}
											classNameSpan={'small-font'}
										/>
									</div>
								</div>

								<div className='item'>

									{/* <br />
								<br /> */}
									<CustomSpan text={'מקום האירוע'} classNameSpan={'bold small-font'} />
									{/* &nbsp; */}
									<CustomSpan text={variant.venueName} classNameSpan={'small-font'} />
									{/* &nbsp; &nbsp;&nbsp; */}
									{/* <br />
								<br /> */}
								</div>
								<div className='item'>
									<CustomSpan text={'מספר אסמכתא'} classNameSpan='bold small-font' />
									{/* &nbsp; */}
									<CustomSpan text={variant.orderConfirmation} classNameSpan={'small-font'} />
								</div>
								<div className='tickets-container item'>
									<CustomSpan text='פרטי כרטיסים' classNameSpan='bold small-font' />
									<div className='tickets-item-cancel'>
										{renderTickets(variant)}
									</div>
								</div>
							</div>
							<div className='btn-group-ticket' style={{ paddingTop: 5 }}>
								<div >
									<CustomButton
										text={'הצגת כרטיסים'}
										buttonClassName={'order-details center'}
										onClick={() => {
											history.push(`${RoutesPath.iframe}?link=${variant.tickets[0].eventsTicketLink}`);
										}}
									/>
								</div>
								<div>
									<CustomButton
										text={'אישור ההזמנה'}
										buttonClassName={'order-details center'}
										onClick={onOrderConfirmClicked}
									/>
								</div>
							</div>
						</div>
					</>
				)}
				{display && variant.benefitStatusName === OrderStatus.Canceled && (
					<div className='more-order-details'>
						{/* <CustomSpan text={'פרטי הזמנה'} classNameSpan={'bold'} /> */}
						<div className='confirmation-id item'>
							<CustomSpan text={'מספר הזמנה'} classNameSpan={`bold`} />
							<CustomSpan text={variant.orderConfirmation} />
						</div>

						<div className='cancel-date item'>
							<CustomSpan text={'תאריך ביטול'} classNameSpan={`bold`} />
							<CustomSpan text={moment(variant.cancelDate).format('DD.MM.YY')} />
						</div>
						<div className='confirmation-id item'>
							<CustomSpan text={'מספר אישור'} classNameSpan={`bold`} />
							<CustomSpan text={variant.orderConfirmation} />
						</div>
						<div className='quantity-cancel item'>
							<CustomSpan text={'כמות לביטול'} classNameSpan={`bold`} />
							<CustomSpan text={`${variant.quantity * -1}`} />
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
export default HistoryVariantMobile;
