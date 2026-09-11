import * as React from 'react';
import Lang from '../../../../config/Language';
import {CategoryType, QuantityType} from '../../../../models/enums';
import Varient from '../../../../models/Varient';
import {CustomSpan, CustomInputText, TextTypes} from 'nofshonit-base-web-client';
import CartItem from '../../../../models/CartItem';
import Ticket from '../../../../models/Ticket';
import TicketItem from './TicketItem';
import StringFormatUtils from '../../../../utils/StringFormatUtils';
import TextCustomItemComponent from 'src/components/CustomComponents/TextCustomItemComponent/TextCustomItemComponent';
import { useState } from 'react';
const moment = require('moment');
interface Props {
	event: any;

	description?: boolean;
	quantityValue?: number;
	quantity: QuantityType;
	eventDate: Date;
	payment?: boolean;
}

interface IState {
	quantityItem: number;
}

export enum QuantityAction {
	Increce = 'increce',
	Decrece = 'decrece',
	Empty = 'Empty',
}

const EventItem : React.FC<Props> = ({
	event,
	description,
	quantityValue,
	quantity,
	eventDate,
	payment
}) => {

	const [quantityItem, setQuantityItem] = useState<number>(quantityValue || 0);
	const renderQuantity = (quantity: QuantityType) => {

		switch (quantity) {
			case QuantityType.OutOfStock: {
				return <span className='out-of-stock'>{Lang.format('OutOfStock')}</span>;
			}

			case QuantityType.View: {
				return (
					<div className='varient-quantity-container'>
						<TextCustomItemComponent
							text={event.tickets.length}
						/>
					</div>
				);
			}
			default:
				return null;
		}
	}

	const renderTickets = () => {
		return event.tickets.map((ticket, index) => (
			<div>
				<TicketItem ticket={ticket} key={index} />
			</div>
		));
	};
	const quantityToDisplay = quantity ? quantity : QuantityType.View;
	return (
		<>
	<React.Fragment>
		{payment && (
		<div className='nav-top-variants'>
			<div className='variant-name'>
				<TextCustomItemComponent isBold={true} text={`שם ההטבה`} />
			</div>
			<div className='quantity'>
				<TextCustomItemComponent isBold={true} text={`כמות`} />
			</div>
			<div className='price-per-variant'>
				<TextCustomItemComponent isBold={true} text={`מחיר ליחידה`} />
			</div>
		</div>
		)}
		{payment ? (
		<div className='varient-payment-container-inner'>
			<div className='variant-name'>
				<TextCustomItemComponent text={`${event.eventimTicketTypeName}`} />
			</div>
			<div className='quantity'>
				{renderQuantity(quantity)}
			</div>
			<div className='price-per-variant'>
				<TextCustomItemComponent text={`${StringFormatUtils.tryConvertToLocaleString(event.price)} ₪`} />
			</div>
		</div>
		) : (
			<div className='varient-payment-container-inner'>
			<div className='variant-name'>
				<TextCustomItemComponent text={`${event.eventimTicketTypeName}`} />
			</div>
			<div className='price-per-variant'>
				<TextCustomItemComponent text={`${StringFormatUtils.tryConvertToLocaleString(event.price)} ₪`} />
			</div>
			<div className='quantity'>
				{renderQuantity(quantityToDisplay)}
			</div>
		</div>
		)}

		<div className='desc-container' style={{direction:'rtl'}} title={Lang.format('ValidDate')}>
									<TextCustomItemComponent
										text = {`${Lang.format('location')}: ${event.venuName}`} 
										icon = {{src:require('../../../../assets/icons/pin.svg'), name:'location icon'}}
										/>

									<TextCustomItemComponent
										text = {`${moment(`${event.eventDate}`).format('DD/MM/YY')} ${Lang.format('inHour')}: ${event.eventTime}`} 
										icon = {{src:require('../../../../assets/icons/calendar.svg'), name:''}}
										/>
		</div>
		{renderTickets()}
		</React.Fragment>
	</>
	);
}
export default EventItem;
