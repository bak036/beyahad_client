import * as React from 'react';
import {CustomSpan, CustomSeperator, CustomButton} from 'nofshonit-base-web-client';
import Transaction from '../../../../models/Transaction';
const moment = require('moment');
interface Props {
	transaction: Transaction;
}
interface IState {}
const TransactionDesktopComponent : React.FC<Props> = ({
	transaction
}) => {
	let total = transaction.amount ? parseFloat(transaction.amount).toFixed(2) : '';
	return (
		<React.Fragment>
			<div className='transaction-container'>
				<div className='transaction-item'>
					<CustomSpan text={moment(transaction.dateTime).format('DD/MM/YY')} />
				</div>
				<div className='transaction-item overflow'>
					<CustomSpan text={transaction.activityID} />
				</div>
				<div className='transaction-item overflow'>
					<CustomSpan text={transaction.invoiceNumber ? transaction.invoiceNumber : '- - - - - - - - -'} />
				</div>
				<div className='transaction-item overflow'>
					<CustomSpan text={transaction.chainName} />
				</div>
				<div className='transaction-item overflow'>
					<CustomSpan text={transaction.businessName} />
				</div>
				<div className='transaction-item'>
					<CustomSpan text={transaction.activityTypeName} />
				</div>
				<div className='transaction-item sum'>
					<CustomSpan
						classNameSpan={`${parseInt(total) > 0 ? 'green' : 'red'}`}
						text={total.length > 0 ? Number(total) > 0 ?` ₪ ${total}`:`- ₪ ${Number(total)*-1}`  : ''}
					/>
				</div>
			</div>
		</React.Fragment>
	);
}
export default TransactionDesktopComponent;
