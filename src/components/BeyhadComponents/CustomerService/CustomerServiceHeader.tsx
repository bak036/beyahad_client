import { observer } from 'mobx-react';
import * as React from 'react';
import { MESSAGES_STORE } from '../../../consts/stores';
import rootStores from '../../../stores';
import MessagesStore from '../../../stores/MessagesStore';
import EditorMessage from '../EditorMessage/EditorMessage';
import Lang from '../../../config/Language';

const messagesStore: MessagesStore = rootStores[MESSAGES_STORE];

const CustomerServiceHeader : React.FC = ({
}) => {
	return (
		<div className='custom-service-header-container'>
			<div className='title-container'>
				<span>
					מוקד שירות לקוחות
				</span>
			</div>
			<div className='header-content'>
				<EditorMessage message={messagesStore.activeHours} textClassName='active-hours-text' />
			</div>
		</div>
	);
}

export default observer(CustomerServiceHeader);
