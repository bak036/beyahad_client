import {CustomSeperator, CustomSpan} from 'nofshonit-base-web-client';
import * as React from 'react';
import CartItem from '../../../../models/CartItem';
import {QuantityType} from '../../../../models/enums';
import EventItem from '../Products/EventItem';
import * as _ from 'lodash';
import StringFormatUtils from '../../../../utils/StringFormatUtils';
import TextCustomItemComponent from 'src/components/CustomComponents/TextCustomItemComponent/TextCustomItemComponent';

interface Props {
	category: CartItem;
}
interface IState {}
const VarientPayment : React.FC<Props> = ({
	category,
}) => {
	const renderAllVariants = () => {
		if (category && category.variants) {
			return category.variants.map((variant, index) => (
				<React.Fragment key={index}>
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
						<div className='varient-payment-container-inner'>

							<div className='variant-name'>
								<TextCustomItemComponent text={`${variant.name}`} />
							</div>

							<div className='quantity'>
								<TextCustomItemComponent text={`${variant.quantity}`} />
							</div>

							<div className='price-per-variant'>
								<TextCustomItemComponent text={`${StringFormatUtils.tryConvertToLocaleString(variant.price)} ₪`} />
							</div>
						</div>
				</React.Fragment>
			));
		} else {
			return null;
		}
	};
	const orgnaizEvents = (event: CartItem) => {
		var eventsArray: any[] = [];
		var result = _.groupBy(event.tickets, 'variantFullBarcode');
		for (let key in result) {
			const item = {
				variantFullBarcode: key,
				orderLimit: result[key][0].orderLimit,
				price: result[key][0].price,
				eventimTicketTypeName: result[key][0].eventimTicketTypeName,
				venuName: result[key][0].venuName,
				eventTime: result[key][0].eventTime,
				eventDate: category.eventDate,
				eventsGuid: result[key][0].orderGuid,
				tickets: result[key].map((ticket, index) => {
					return {
						area: ticket.area,
						priceLevelName: ticket.priceLevelName,
						row: ticket.row,
						seat: ticket.seat,
						ticketTypeName: ticket.ticketTypeName,
						quantity: ticket.quantity,
					};
				}),
			};
			eventsArray.push(item);
		}
		return eventsArray;
	};

	const renderAllEvents = () => {
		const events = orgnaizEvents(category);
		if (events) {
			return events.map((event, index) => (
				<>
					{index > 0 ? <CustomSeperator /> : null}
					<EventItem
						event={event}
						eventDate={category.eventDate}
						quantity={QuantityType.View}
						quantityValue={category.quantity}
						key={index}
						payment
					/>
				</>
			));
		} else return null;
	};

	return (
		<>
			{category && category.variants && renderAllVariants()}
			{category && category.tickets && renderAllEvents()}
		</>
	);
}
export default VarientPayment;

