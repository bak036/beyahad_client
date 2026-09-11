import {CustomSeperator} from 'nofshonit-base-web-client';
import * as React from 'react';
import Lang from '../../../../../config/Language';
import Varient from '../../../../../models/Varient';
import ShowTicket from '../ShowTicket/ShowTicket';
import ShowVarient from '../ShowVarient/ShowVarient';
import Orders from '../../../../../models/Orders';
import Order from '../../../../../models/Order';
import { useState } from 'react';

interface Props {
	orders: Order[];
	onCancelOrder: (order: Order) => void;
	onConfirmOrderClicked: (orderGuid) => void;
	history: any;
}

interface IState {
	isCollapsed: boolean; // Order collapsible status9
}

const ShowBox : React.FC<Props> = ({
	orders,
	onCancelOrder,
	onConfirmOrderClicked,
	history
}) => {
	const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

	const setCollapsible = () => {
		// Variable Definition
		const currentState: boolean = isCollapsed;
		// Code Section
		setIsCollapsed(!currentState)
	};

	const onCancelOrderFunc = (order: Order) => {
		onCancelOrder(order);
	};

	const variants = orders && orders ? orders : [];
	return(
		<div className={'show-box-container'}>
			<ShowVarient
				history={history}
				onConfirmOrderClicked={(orderGuid) => onConfirmOrderClicked(orderGuid)}
				onCancelOrder={onCancelOrderFunc}
				variants={variants}
				isCollapsed={isCollapsed}
			/>

			{/* <div className={`${this.state.isCollapsed ? 'display-items' : 'hide-items'}`}>{this.renderItems()}</div> */}
		</div>
		);
}
export default ShowBox;

// renderItems = () => {
// 	// Variable Definition
// 	const tickets = this.props.show.tickets || [];
// 	const {onCancelClick} = this.props;

// 	// Code Section
// 	return tickets.map((ticket, index) => (
// 		<div className={'ticket-spot-container'} key={index}>
// 			<ShowTicket onCancelClick={onCancelClick} ticket={ticket} />
// 		</div>
// 	));
// };

// TODO: Daniel - Add this
//     <DanielCollapse className={``} trigger={component}>
//     <div>this is the inside div</div>
//      </DanielCollapse>
// const varients: Varient[] = [
// 	{
// 		id: '1',
// 		name: 'מבצע חורף - חבילת ספר זוגי כ6 דקות + 2 כוסות יין',
// 		price: 100,
// 		quantity: 3,
// 		expireDate: '10.10.10',
// 		purchaseDate: '28.08.19',
// 		stock: 3,
// 		categoryName: 'חמי געש אוצר טבע במרחק נגיעה',
// 		totalPurchase: 550,
// 		status: 'מומש',
// 	},
// 	{
// 		id: '2',
// 		name: 'מבצע חורף - חבילת ספר זוגי כ6 דקות + 2 כוסות יין',
// 		price: 100,
// 		quantity: 3,
// 		expireDate: '10.10.10',
// 		purchaseDate: '14.08.19',
// 		stock: 3,
// 		categoryName: 'חמי געש אוצר טבע במרחק נגיעה',
// 		totalPurchase: 240,
// 		status: 'פג תוקף',
// 	},
// ];
