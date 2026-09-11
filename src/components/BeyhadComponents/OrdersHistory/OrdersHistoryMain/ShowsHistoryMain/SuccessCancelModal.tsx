import * as React from 'react';
import {CustomSpan, CustomButton} from 'nofshonit-base-web-client';
import Lang from '../../../../../config/Language';

interface Props {
	onCancel: () => void;
}
const SuccessCancelModal : React.FC<Props> = ({
	onCancel
}) => {
	return (
		<div className='success-modal'>
			<div className='text-modal'>
				<CustomSpan text={`הפעולה בוצעה בהצלחה`} />
			</div>
			<div className='cancel-btn'>
				<CustomButton
					buttonClassName={'primary-design center smallHeight'}
					text={Lang.format('Cancel')}
					onClick={() => onCancel()}
				/>
			</div>
		</div>
	);
}
export default SuccessCancelModal;
