import * as React from 'react';
import { CustomSpan, CustomSeperator, CustomButton } from 'nofshonit-base-web-client';
import Transaction from '../../../../models/Transaction';
import { useState } from 'react';
const moment = require('moment');
interface Props {
	transaction: Transaction;
}
interface IState {
	displayBlock: boolean;
}
const TransactionComponent : React.FC<Props> = ({
	transaction
}) => {
	const [displayBlock, setDisplayBlock] = useState<boolean>(false);

	const displayBlockClicked = () => {
		setDisplayBlock(!displayBlock);
	};
	let total = transaction.amount ? parseFloat(transaction.amount).toFixed(2) : '';
	return (
		<React.Fragment>
			<div className='transaction-component-container'>
				<div className='transaction-item'>
					<CustomSpan text={moment(`${transaction.dateTime}`).format('DD/MM/YY')} />
				</div>
				<div className='transaction-item'>
					<CustomSpan text={transaction.activityTypeName} />
				</div>
				<div className='transaction-item overflow sum'>
					<CustomSpan
						classNameSpan={`${Number(total) > 0 ? 'green' : 'red'}`}
						text={total.length > 0 ? Number(total) > 0 ? ` ₪ ${total}` : `- ₪ ${Number(total) * -1}` : ''}
					/>
				</div>
				<div className='transaction-item btn'>
					<div className={'btn-open-and-close-details'} onClick={displayBlockClicked}>
						{displayBlock ? <img src={require('../../../../assets/next-down.png')} /> : <img src={require('../../../../assets/next-copy.png')} />}
					</div>
				</div>
			</div>
			{displayBlock && (
				<div className={'transaction-component-container-block'}>
					<div className='transaction-component-block-item'>
						<CustomSpan text={`רשת: ${transaction.chainName}`} />
					</div>
					<div className='transaction-component-block-item'>
						<CustomSpan text={`סניף: ${transaction.businessName}`} />
					</div>
					<div className='transaction-component-block-item'>
						<CustomSpan text={`מספר פעולה: ${transaction.activityID}`} />
					</div>
					<div className='transaction-component-block-item'>
						<CustomSpan text={`מזהה פתקית: ${transaction.invoiceNumber}`} />
					</div>
				</div>
			)}
			<CustomSeperator />
		</React.Fragment>
	);
}
export default TransactionComponent;
