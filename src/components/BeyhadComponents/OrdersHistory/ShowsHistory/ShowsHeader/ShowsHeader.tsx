import * as React from 'react';
import Lang from '../../../../../config/Language';
import {CustomSpan} from 'nofshonit-base-web-client';

interface Props {}

interface IState {}

const ShowsHeader : React.FC<Props> = ({
}) => {
	return (
		<div className={'shows-header-container'}>
			<div className={'shows-header-body-container'}>
				<div className='allItems'>
					<div className='shows-headers-item-purchase-data'>
						<CustomSpan text={'תאריך רכישה'} />
					</div>
					<div className='shows-headers-item-categoryName'>
						<CustomSpan text={'שם ההטבה'} />
					</div>
					<div className='shows-headers-item-name'>
						<CustomSpan text={'שם המוצר'} />
					</div>
					<div className='shows-headers-item-quantity'>
						<CustomSpan text={Lang.format('OrdersHistoryAmount')} />
					</div>
					<div className='shows-headers-item-total'>
						<CustomSpan text={Lang.format('סה"כ')} />
					</div>
					<div className='shows-headers-item-status'>
						<CustomSpan text={Lang.format('סטטוס')} />
					</div>
				</div>
			</div>
		</div>
	);
}
export default ShowsHeader;
