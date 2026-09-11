import * as React from 'react';
import {CustomHeader, CustomSpan, CustomButton} from 'nofshonit-base-web-client';
import Lang from '../../../config/Language';
import Order from '../../../models/Order';
import {observer} from 'mobx-react';
import MessagesStore from '../../../stores/MessagesStore';
import rootStores from '../../../stores';
import {MESSAGES_STORE} from '../../../consts/stores';
import EditorMessage from '../EditorMessage/EditorMessage';
const moment = require('moment');

interface Props {
	onCancel: () => void;
	onContinue: () => void;
}
interface Istate {}
const messagesStore: MessagesStore = rootStores[MESSAGES_STORE];
const TimeOutModal : React.FC<Props> = ({
	onCancel,
	onContinue
}) => {
	return (
		<div className='cancel-level-one-container'>
			<div className='header-container'>
				<CustomHeader containerClassName={'center'} text={'הזמנה'} />
			</div>
			<div className='text-container'>
				<EditorMessage message={"מצטערים, אך הטיפול בהזמנה קצת מתארך. <br/> תוכל להמשיך לשוטט באתר ואנו נשלח לך מייל וסמס בסיום הטיפול בהזמנה"} />
			</div>
			<div className='btn-group'>
				<div className='continue-btn'>
					<CustomButton
						buttonClassName={`primary-design center`}
						text={Lang.format('הבנתי, המשך לדף הבית')}
						onClick={() => onContinue()}
					/>
				</div>
			</div>
		</div>
	);
}
export default observer(TimeOutModal)
