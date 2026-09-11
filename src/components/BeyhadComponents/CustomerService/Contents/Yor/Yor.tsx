import { CustomHeader } from 'nofshonit-base-web-client';
import * as React from 'react';
import Lang from '../../../../../config/Language';
import MessagesStore from '../../../../../stores/MessagesStore';
import rootStores from '../../../../../stores';
import { MESSAGES_STORE } from '../../../../../consts/stores';
import { observer } from 'mobx-react';
import EditorMessage from '../../../EditorMessage/EditorMessage';

const messagesStore: MessagesStore = rootStores[MESSAGES_STORE];
const Yor : React.FC = ({}) => {
	return (
		<React.Fragment>
			<div className='yor-main-container'>
				{/* <CustomHeader text={Lang.format('DvarYor')} /> */}
				<div className='dvar-yor-text'>
					{messagesStore.dvarYorText && messagesStore.dvarYorText.length > 0 && (
						<EditorMessage message={messagesStore.dvarYorText} />
					)}
				</div>
				{messagesStore.dvarYorImage && messagesStore.dvarYorImage.length > 0 && (
					<EditorMessage message={messagesStore.dvarYorImage} />
				)}
			</div>
		</React.Fragment>
	);
}
export default observer(Yor)
