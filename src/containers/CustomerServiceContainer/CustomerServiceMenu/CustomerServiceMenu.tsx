import * as React from 'react';
import {CustomMediaQuery} from '../../../components/CustomComponents/CustomMediaQuery/CustomMediaQuery';
import {ContentType} from '../CustomerServiceContainer';
import CustomerServiceMenuDesktop from './CustomerServiceMenuDesktop';
import CustomerServiceMenuMobile from './CustomerServiceMenuMobile';

interface Props {
	onMenubuttonClicked: (selected: ContentType) => void;
}

interface IState {}

const CustomerServiceMenu : React.FC<Props> = ({
	onMenubuttonClicked
}) => {

	const onMenubuttonClickedFunc = (selected: ContentType) => {
		onMenubuttonClicked(selected);
	};
	return (
		<>
			<CustomMediaQuery.Desktop>
				<CustomerServiceMenuDesktop onMenubuttonClicked={onMenubuttonClickedFunc} />
			</CustomMediaQuery.Desktop>
			<CustomMediaQuery.Mobile>
				<CustomerServiceMenuMobile onMenubuttonClicked={onMenubuttonClickedFunc} />
			</CustomMediaQuery.Mobile>
		</>
	);
}
export default CustomerServiceMenu;
