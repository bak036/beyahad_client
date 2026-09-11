// import {observer} from 'mobx-react';
// import {CustomHeader, CustomSeperator, HeaderType} from 'nofshonit-base-web-client';
// import * as React from 'react';
// import Lang from '../../../../../config/Language';
// import {ORDERS_HISTORY_STORE} from '../../../../../consts/stores';
// import Category from '../../../../../models/Category';
// import rootStores from '../../../../../stores';
// import OrdersHistoryStore from '../../../../../stores/OrdersHistoryStore';
// import HistoryFilters from '../../BenefitsHistory/Filters/HistoryFilters';
// // import OrderBox from '../../BenefitsHistory/OrderBox/OrderBox';
// import OrderItem from '../../../../../models/Order';
// import Order from '../../../../../models/Order';

// interface Props {}

// interface IState {
// 	startDate: string; // Filter start date
// 	endDate: string; // Filter end date
// }

// const ordersHistoryStore: OrdersHistoryStore = rootStores[ORDERS_HISTORY_STORE];

// @observer
// export default class BenefitsHistoryMain extends React.Component<Props, IState> {
// 	constructor(props) {
// 		super(props);
// 		this.state = {
// 			startDate: '',
// 			endDate: '',
// 		};
// 	}

// 	renderOrders = () => {
// 		// Variable Definitions
// 		const benefits = ordersHistoryStore.getOrders;

// 		// Code Section
// 		if (benefits.variants) {
// 			return benefits.variants.map((varient: Order) => (
// 				<div key={varient.benefitId}>
// 					<CustomSeperator />
// 					<OrderBox variant={varient} />
// 				</div>
// 			));
// 		}
// 	};

// 	startDateChange = (value) => {
// 		// Code Section
// 		this.setState({
// 			startDate: value,
// 		});
// 	};

// 	endDateChange = (value) => {
// 		// Code Section
// 		this.setState({
// 			endDate: value,
// 		});
// 	};

// 	orderOptionsChange = (value) => {
// 		// Code Section
// 		// TODO - send order request
// 	};

// 	render() {
// 		const {startDate, endDate} = this.state;
// 		return (
// 			<div className={'purchase-history-container'}>
// 				<div className={'history-body-container'}>
// 					<div className={'history-title-container'}>
// 						<CustomHeader text={Lang.format('OrdersHistory')} type={HeaderType.Title} />
// 					</div>

// 					<CustomHeader
// 						text={Lang.format('PurchaseHistorySecondTitle')}
// 						type={HeaderType.SubTitle}
// 						containerClassName={'sub-title-container'}
// 					/>
// 					<HistoryFilters
// 						startDate={startDate}
// 						endDate={endDate}
// 						orderOptionsChange={this.orderOptionsChange}
// 						endDateChange={this.endDateChange}
// 						startDateChange={this.startDateChange}
// 					/>
// 					{/* Todo : Tom remove orderbox component  */}
// 					{/* {this.renderOrders()} */}
// 				</div>
// 			</div>
// 		);
// 	}
// }
