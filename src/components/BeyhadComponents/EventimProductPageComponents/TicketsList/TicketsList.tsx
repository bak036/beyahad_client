import { CustomButton, CustomHeader, CustomSeperator, CustomSpan, HeaderType } from 'nofshonit-base-web-client';
import * as React from 'react';
import Lang from '../../../../config/Language';
import Ticket from '../../../../models/Ticket';
import CustomEmptyState from '../../../CustomComponents/CustomEmptyState/CustomEmptyState';
import AlertUtils from '../../../../utils/AlertUtils';
import StringFormatUtils from '../../../../utils/StringFormatUtils';
import VarientItem, { QuantityAction } from '../../PaymentPage/Products/VarientItem';
import {CategoryType, QuantityType} from '../../../../models/enums';
import TextCustomItemComponent from '../../../CustomComponents/TextCustomItemComponent/TextCustomItemComponent';
import CustomButtonBeyahad from '../../../CustomComponents/CustomButtonBeyahad/CustomButtonBeyahad';
import MessagesStore from 'src/stores/MessagesStore';
import rootStores from 'src/stores';
import { MESSAGES_STORE } from 'src/consts/stores';

interface Props {
	ticketsWithoutSeatArray: Ticket[];
	onQuantityIncrease: (ticketWithoutSeat: Ticket) => void;
	onQuantityDecrease: (ticketWithoutSeat: Ticket) => void;
	onPayClick: () => void;
	showMap: boolean;
}

interface IState {}
const messagesStore: MessagesStore = rootStores[MESSAGES_STORE];

const TicketsList : React.FC<Props> = ({
	ticketsWithoutSeatArray,
	onQuantityIncrease,
	onQuantityDecrease,
	onPayClick,
	showMap
}) => {

	

	const [showMessage, setShowMessage] = React.useState<string>('');

	const [touchStart, setTouchStart] = React.useState(false);
	React.useEffect(() => {
		const handleDocumentClick = () => {
			if (touchStart) {
				setTouchStart(false);
				return;
			}
			if (showMessage !== '') {
				setShowMessage('');
				console.log('Click after touch detected');
			} else {
				console.log('Click detected');
			}
		};

		document.addEventListener('click', handleDocumentClick);

		return () => {
			document.removeEventListener('click', handleDocumentClick);
		};
	}, [showMessage, touchStart]);

	const hasOrderLimitForUser = (ticketWithoutSeat: Ticket) => {
		return ticketWithoutSeat.orderLimit === -1;
	}

	const onIncreaseClick = (ticketWithoutSeat: Ticket) => {
		if (onQuantityIncrease) {
			if (!hasOrderLimitForUser(ticketWithoutSeat) && ticketWithoutSeat.quantity >= ticketWithoutSeat.orderLimit) {
				AlertUtils.basicAlert(
					'',
					`${Lang.format('reachedLimitPartOne')} ${ticketWithoutSeat.orderLimit} ${Lang.format('reachedLimitPartTwo')}`
				);
			} else {
				onQuantityIncrease(ticketWithoutSeat);
			}
		}
	};

	const onDecreaseClick = (ticketWithoutSeat: Ticket) => {
		if (onQuantityDecrease) {
			onQuantityDecrease(ticketWithoutSeat);
		}
	};

	const onPaymentClick = () => {
		if (onPayClick) {
			if (checkIfUserSelectedTickets()) {
				onPayClick();
			} else {
				AlertUtils.basicAlert('', Lang.format('PleaseAddATicket'));
			}
		}
	};

	const checkIfUserSelectedTickets = () => {
		let anyTicketsSelected: boolean = false;
		ticketsWithoutSeatArray.forEach((ticket) => {
			if (ticket.quantity > 0) {
				anyTicketsSelected = true;
			}
		});
		return anyTicketsSelected;
	};

	const renderTicketWithoutSeat = (ticketWithoutSeat: Ticket, uniqueKey) => {
		return (
			<div className='ticket-row' key={uniqueKey}>
				{uniqueKey > 0  ? <CustomSeperator /> : null}
				{/* event row */}
				<div className={`varient-main-container`}>
					<div className={`varient-item-container ${showMap ? 'col-2' : 'col-3'}`}>
						{/* title */}
						<div className='varient-item-text-container'>
							<div className={`main-title`}>
								<div className={`varient-item-sale-title-container`}>
									<div className='title-text-container'>
										<div className='title-text-container'>
											<div className={`varient-name`}>
												{`${ticketWithoutSeat.priceLevelName} ${ticketWithoutSeat.ticketTypeName}`}
											</div>
										</div>									
									</div>
								</div>
							</div>
						</div>

						{/* price */}
						<div className={`varient-item-prices`}>
						{ticketWithoutSeat.price && (
							<div className='varient-item-price'>
								<span className={`price-text`}>
									{`${StringFormatUtils.tryConvertToLocaleString(ticketWithoutSeat.price)} ₪`}
								</span>
							</div>
						)}
						{ticketWithoutSeat.kupaPrice && ticketWithoutSeat.kupaPrice > ticketWithoutSeat.price ? (
								<div className='varient-item-discount'>
									<span className='discount-text'>
									{`${StringFormatUtils.tryConvertToLocaleString(ticketWithoutSeat.kupaPrice)} ₪`}
									</span>
									<div style={{ cursor: 'pointer' ,position:'relative'}} onMouseOver={() => { setShowMessage(uniqueKey); }} onMouseLeave={() => {setShowMessage('')}} >
										<div className='ticket-discount-explanation-icon-div' onTouchStart={() => { setTouchStart(true); showMessage == '' ? setShowMessage(uniqueKey) : setShowMessage('') }}>
											<img className='ticket-discount-explanation-icon' style={{ cursor: 'pointer' }} src={require('../../../../assets/Error_Outline_Icon_2.png')}></img>
										</div>
										{showMessage === uniqueKey &&
											<div className='ticket-discount-explanation-message'>{messagesStore.priceInfo}</div>
										}
									</div>
								</div>
							) : null}
						</div>

						{/* quantity */}
						{!showMap  && (
						<div className={`varient-item-quantity`}>
							{renderQuantity(ticketWithoutSeat)}
						</div>
						)}

					</div>
				</div>
				{/* description */}
				{!hasOrderLimitForUser(ticketWithoutSeat) && (
					<div className='desc-container'>
						<TextCustomItemComponent 
							text = {`${Lang.format('canPurchaseLimitPartOne')} ${ticketWithoutSeat.orderLimit}  ${Lang.format('canPurchaseLimitPartTwo')}`}
							icon={{src:require('../../../../assets/icons/bag.svg'), name:''}} />
					</div>
				)}
			</div>
		);
	};

	const renderQuantity = (ticketWithoutSeat:Ticket) => {
		return (
			<div
				style={{display: 'flex'}}>
				<div className='quantity-counter'>
					<div
						className={`upper-arrow-container cursor-pointer`}
						onClick={() => {
							onIncreaseClick(ticketWithoutSeat);
						}}>
						<img style={{width:'1.5rem', height: '1.5rem'}} src={require('../../../../assets/icons/add.svg')} className='arrow-up-item' />
					</div>
					<div className={`quantity-input-container`}
						 style={{display: 'flex'}}>
						<input
							className='input-data'
							onChange={() => {}} //if you remove it we has errors in console
							disabled
							type='tel'
							value={ticketWithoutSeat.quantity ? ticketWithoutSeat.quantity : 0}
						/>
					</div>
					<div
						className={`down-arrow-container cursor-pointer`}
						onClick={() => {
							onDecreaseClick(ticketWithoutSeat);
						}}>
						<img style={{width:'1.5rem', height: '1.5rem'}} src={require('../../../../assets/icons/minus.svg')} className='arrow-down-item' />
					</div>
				</div>
			</div>
		);
	};

	const renderCartButton = () => {
		return (
				<CustomButtonBeyahad
					customClass = {''}
					onClick={onPaymentClick}
					isCurserPointer={true}
					icon = {{src: require(`../../../../assets/icons/shopping_cart.svg`), alt: Lang.format('Add_to_Cart')}}
					buttonText = {Lang.format('Add_to_Cart')}
				/>
		);
	};

	const eventCatalogList = ticketsWithoutSeatArray;

	if (eventCatalogList && eventCatalogList.length > 0) {
		return (
			<>
				<div className={`tickets-variants-list-container ${showMap ? 'col-2' : 'col-3'}`}>
					{/* Title */}
					<div className='events-header-page-sub-title-varients'>
						<CustomHeader
							text={Lang.format('Order_Tickets')}
							headerClassName='product-header-page-sub-title-varients'
							type={HeaderType.SubTitle}
						/>
					</div>

					{/* All tickets */}
					<div className={`events-header-varient-titles ${showMap ? 'col-2' : 'col-3'}`}>
						<div className={'events-header-varient-title-name'}>{Lang.format('Item')}</div>
						<div className={'events-header-varient-title-price'}>{Lang.format('Price')}</div>
						{!showMap && (
							<div className={'events-header-varient-title-quantity'}>{Lang.format('Amount')}</div>
						)}
					</div>
					<div className='tickets-list-rows'>
						{eventCatalogList.map((ticket: Ticket, index) => renderTicketWithoutSeat(ticket, index))}
					</div>
				</div>
				{!showMap && (
					<div className='product-header-page-cart-button'>{renderCartButton()}</div>
				)}
			</>
		);
	} else {
		return <CustomEmptyState />;
	}
}
export default TicketsList;
