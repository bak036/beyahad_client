import * as React from 'react';
import {CustomMediaQuery} from '../../../CustomComponents/CustomMediaQuery/CustomMediaQuery';
import BalanceAndUses from './BalanceAndUses';
import BalanceAndUsesDesktop from './BalanceAndUsesDesktop';

const BalanceAndUsesContainer : React.FC = () => {
	return (
		<>
			<CustomMediaQuery.Desktop>
				<BalanceAndUsesDesktop />
			</CustomMediaQuery.Desktop>
			<CustomMediaQuery.Mobile>
				<BalanceAndUses />
			</CustomMediaQuery.Mobile>
		</>
	);
}
export default BalanceAndUsesContainer;
