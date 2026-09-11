import * as React from 'react';
import { CustomHeader, HeaderType } from 'nofshonit-base-web-client';
import Lang from '../../../../../config/Language';

const ChangesAndNotification : React.FC = () => {
return (
		<div className="changes-main-container">
			<CustomHeader
				type={HeaderType.Title}
				text={Lang.format('ChangesNotifcation')}
				containerClassName={'header-changes-container'}
			/>
			<div className="changes-content-container">
				<span className="changes-content-item">{Lang.format('YorContent')}</span>
			</div>
		</div>
	);
}
export default ChangesAndNotification;
