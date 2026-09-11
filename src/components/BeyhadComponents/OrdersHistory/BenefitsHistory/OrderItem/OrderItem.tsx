import * as React from 'react';
import {CustomButton} from 'nofshonit-base-web-client';
import Lang from '../../../../../config/Language';
import Varient from '../../../../../models/Varient';

interface Props {
	item: Varient;
	// TODO: Daniel - add the onClicks events
	// onCancelClick: Function;
}

interface IState {}

const OrderItem : React.FC<Props> = ({item}) => {

	const {orderLimit, name, price, discount, expireDate} = item;
	return (
		<div className={'order-item-container'}>
			<div className={'row data-container'}>
				<div className={'info-item title-container title-text-align'}>
					<span className={'text bold-text'}>{name}</span>
					<span className={'text sub-title'}>
						{Lang.format('OrdersHistoryLimit') + ' ' + orderLimit + ' ' + Lang.format('OrdersHistoryItemsPerMonth')}
					</span>
				</div>

				<div className={'info-container'}>
					<div className={'info-item'}>
						<span className={'text'}>&#x20aa;{discount}</span>
						<span className={'text original-price'}>&#x20aa;{price}</span>
					</div>

					<div className={'info-item'}>
						<span className={'text bold-text'}>{Lang.format('OrdersHistoryExpireDate')}</span>
						<span className={'text date-text'}>{expireDate}</span>
					</div>

					<div className={'info-item'}>
						<span className={'text bold-text'}>{Lang.format('OrdersHistoryAmount')}</span>
						<span className={'text'}>1</span>
					</div>
				</div>
			</div>

			<div className={'row buttons-container'}>
				<div className={'button-container'}>
					<CustomButton text={Lang.format('CancelOrder')} />
				</div>
				<div className={'button-container'}>
					<CustomButton text={Lang.format('OrderAgain')} buttonClassName={'primary-design'} />
				</div>
				<div className={'button-container'}>
					<CustomButton text={Lang.format('OrderInfo')} buttonClassName={'primary-design'} />
				</div>
			</div>
		</div>
	);
}
export default OrderItem;
