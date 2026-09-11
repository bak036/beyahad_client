// import {CustomHeader, CustomSeperator, HeaderType} from 'nofshonit-base-web-client';
// import * as React from 'react';
// import Lang from '../../../../../config/Language';
// import Category from '../../../../../models/Category';
// import OrderItem from '../OrderItem/OrderItem';

// // interface Props {
// // 	variant: Order;
// // }

// // interface IState {
// // 	isCollapsed: boolean; // Order collapsible status
// // }

// export default class OrderBox extends React.Component<Props, IState> {
// 	constructor(props) {
// 		super(props);
// 		this.state = {
// 			isCollapsed: false,
// 		};
// 	}

// 	setCollapsible = () => {
// 		// Variable Definition
// 		const currentState: boolean = this.state.isCollapsed;
// 		// Code Section
// 		this.setState({isCollapsed: !currentState});
// 	};

// // 	// renderItems = () => {
// // 	// 	// Variable Definition
// // 	// 	const varients = this.props.variant.variants || [];

// // 	// 	// Code Section
// // 	// 	return varients.map((varient, index) => (
// // 	// 		<div key={varient.id}>
// // 	// 			{index > 0 ? <CustomSeperator /> : null}
// // 	// 			<OrderItem item={varient} />
// // 	// 		</div>
// // 	// 	));
// // 	// };

// // 	// TODO: Daniel - Add this
// // 	//     <DanielCollapse className={``} trigger={component}>
// // 	//     <div>this is the inside div</div>
// // 	//      </DanielCollapse>

// 	render() {
// 		const {eventDate, categoryId, description, categoryName} = this.props.benefit;
// 		return (
// 			<div className={'order-box-container'}>
// 				<span
// 					onClick={this.setCollapsible}
// 					className={`arrow-container cursor-pointer ${this.state.isCollapsed ? 'arrow-down' : 'arrow-left'}`}
// 				/>

// // 				<div className={'row info-text'}>{Lang.format('OrderDate') + ' ' + order.orderDate}</div>

// // 				<div className={'row info-text'}>{Lang.format('OrderNumber') + ' ' + categoryId}</div>

// // 				<div className={'row'}>
// // 					<CustomHeader text={name} type={HeaderType.Title} />
// // 				</div>

// 				<div className={'row'}>
// 					<div className={'description-container info-text'}>
// 						<CustomHeader text={description || ''} type={HeaderType.Text} />
// 					</div>
// 				</div>

// // 				<div className={`${this.state.isCollapsed ? 'display-items' : 'hide-items'}`}>{this.renderItems()}</div>
// // 			</div>
// // 		);
// // 	}
// // }
