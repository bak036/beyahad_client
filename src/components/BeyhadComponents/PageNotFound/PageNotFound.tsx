import * as React from 'react';
import CustomButtonBeyahad from 'src/components/CustomComponents/CustomButtonBeyahad/CustomButtonBeyahad';
import Lang from '../../../config/Language';
import CustomAdvertising from '../../CustomComponents/CustomAdvertising';
import ComponentContentEmpty from '../../CustomComponents/ComponentContentEmpty/ComponentContentEmpty';

interface Props {
	history?: any;
}
interface IState {
	logOutModal: boolean;
}

const PageNotFound: React.FC<Props> = ({ 
	history
 })  =>
{
	return (
		<React.Fragment>
			<div className="notfound-main-container">
				<CustomAdvertising history={history} />
				<ComponentContentEmpty text={Lang.format('PageNotFound')}
										history={history}
				/>
			</div>
		</React.Fragment>
	);
}
export default PageNotFound;
