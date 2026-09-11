import * as React from 'react';
import { HeaderType, CustomHeader } from 'nofshonit-base-web-client';
import Lang from '../../../../../config/Language';

const Accessibilty : React.FC = () => {
	return (
		<div className="accessbilty-main-container">
			<CustomHeader
				type={HeaderType.Title}
				text={Lang.format('Accessbilty')}
				containerClassName={'header-accessbilty-container'}
			/>
			<div className="accessbilty-content-container">
				<span className="changes-content-item">{Lang.format('YorContent')}</span>
			</div>
		</div>
	);
}

export default Accessibilty;
