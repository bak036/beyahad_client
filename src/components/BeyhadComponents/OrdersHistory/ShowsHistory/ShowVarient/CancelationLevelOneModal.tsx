import * as React from 'react';
import { CustomHeader, CustomSpan, CustomButton } from 'nofshonit-base-web-client';
import Lang from '../../../../../config/Language';
import Order from '../../../../../models/Order';
import { observer } from 'mobx-react';
import MessagesStore from '../../../../../stores/MessagesStore';
import rootStores from '../../../../../stores';
import { MESSAGES_STORE } from '../../../../../consts/stores';
import EditorMessage from '../../../EditorMessage/EditorMessage';
import ScreenUtils from 'src/utils/ScreenUtils';
const moment = require('moment');

interface Props {
	onCancel: () => void;
	onContinue: () => void;
	order: any;
}
interface Istate { }
const messagesStore: MessagesStore = rootStores[MESSAGES_STORE];

const CancelatinonLevelOneModal : React.FC<Props> = ({
	onCancel,
	onContinue,
	order
}) => {
	const v = order;
	const quantity = v.quantity * (v.tickets ? v.tickets.length : 1);
	const isMobile = ScreenUtils.IsMobile();
	return (
		<div className='cancel-level-one-container'>
			<div className='icon-x'>
				<div><p>x</p></div>
			</div>
			<div className='header-container'>
				<CustomHeader containerClassName={'center'} text={'ביטול הזמנה'} />
			</div>
			<div className='text-container'>
				<EditorMessage message={messagesStore.cancelLevelOne} />
			</div>
			<div className='shows-order-detail'>
				<div className={'shows-header-container'}>
					<div className='allItems'>
						<div className='shows-headers-item-categoryName'>
							<CustomSpan classNameSpan={'white'} text={'שם המוצר'} />
						</div>
						<div className='shows-headers-item-purchase-data'>
							<CustomSpan classNameSpan={'white'} text={'תאריך רכישה'} />
						</div>

						<div className='shows-headers-item-quantity'>
							<CustomSpan classNameSpan={'white'} text={Lang.format('OrdersHistoryAmount')} />
						</div>
						{!isMobile &&<div className='shows-headers-item-total'>
							<CustomSpan classNameSpan={'white'} text={Lang.format('סכום הזמנה המקורי')} />
						</div>}
					</div>
				</div>

				<div className='show-varient-main-container'>
					<div className='show-varient-main-items'>
						<div className='show-varient-item-categoryName'>
							<CustomSpan text={v && v.variantName ? v.variantName : ''} />
						</div>
						<div className='show-varient-item-purchase-data'>
							<CustomSpan text={v && v.orderDate ? moment(v.orderDate).format('DD/MM/YY') : ''} />
						</div>
						<div className='show-varient-item-quantity'>
							<CustomSpan text={`${quantity}`} />
						</div>
						{!isMobile && <div className='show-varient-item-total'>
							<CustomSpan text={v && v.customerPrice ? `${v.customerPrice} ₪` : ''} />
						</div>}
					</div>
				</div>
				{isMobile && 
				<div className='mobile-price'>
					<div>
						{Lang.format('סכום הזמנה המקורי')}
					</div>
					<div>
						{v && v.customerPrice ? `${v.customerPrice} ₪` : ''}
					</div>
				</div>}
			</div>
			<div className='buttons-container' >
				<div onClick={() => onContinue()} className={'white-button blue-button blue-button-hover'}>
					{Lang.format('Continue')}
				</div>
				<div onClick={() => onCancel()} className={`white-button blue-button-hover`}>
					{Lang.format('CloseWithoutCancel')}
				</div>
			</div>
		</div>
	);
}
export default observer(CancelatinonLevelOneModal)
