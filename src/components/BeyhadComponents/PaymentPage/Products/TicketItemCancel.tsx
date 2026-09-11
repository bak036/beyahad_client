import * as React from 'react';
import { CustomSpan } from 'nofshonit-base-web-client';
import TextCustomItemComponent from 'src/components/CustomComponents/TextCustomItemComponent/TextCustomItemComponent';
import Lang from 'src/config/Language';

interface Props {
	ticket: any;
	mobile?: boolean;
}
interface IState { }
const TicketItemCancel : React.FC<Props> = ({
	ticket,
	mobile,
}) => {
		return (
			<div className='ticket-item-cancel'>
				<CustomSpan
					classNameSpan='ticket-item-span' text={`${Lang.format('OrderTicketArea')}: ${ticket.area ? ticket.area : 'לא מסומן'} `}
				/>
				<CustomSpan
					classNameSpan='ticket-item-span' text={`${Lang.format('OrdersTicketRow')}: ${ticket.row ? ticket.row : 'לא מסומן'} `}
				/>
				<CustomSpan
					classNameSpan='ticket-item-span' text={`${Lang.format('OrdersTicketChairNumber')}: ${ticket.seat ? ticket.seat : 'לא מסומן'} `}
				/>
			</div>
		);
	}
export default TicketItemCancel;
