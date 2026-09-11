import * as React from 'react';
import {CustomSpan} from 'nofshonit-base-web-client';
import TextCustomItemComponent from 'src/components/CustomComponents/TextCustomItemComponent/TextCustomItemComponent';
import Lang from 'src/config/Language';

interface Props {
	ticket: any;
	mobile?: boolean;
}
const TicketItem : React.FC<Props> = ({
	ticket,
	mobile,
}) => {
	return (
		<div className='ticket-container'>
			<TextCustomItemComponent
				text={`${Lang.format('OrderTicketArea')}: ${ticket.area ? ticket.area : 'לא מסומן'}`}
				icon = {{src:require('../../../../assets/icons/chair.svg'), name:'chair icon'}}
			/>
			<TextCustomItemComponent
				spanClassName='shows-property-row'	text={`${Lang.format('OrdersTicketRow')}: ${ticket.row ? ticket.row : 'לא מסומן'}`}
				/>
			<TextCustomItemComponent 
				customClass='shows-property-row' text={`${Lang.format('OrdersTicketChairNumber')}: ${ticket.seat ? ticket.seat : 'לא מסומן'}`}
			/>
		</div>
	);
}
export default TicketItem;
