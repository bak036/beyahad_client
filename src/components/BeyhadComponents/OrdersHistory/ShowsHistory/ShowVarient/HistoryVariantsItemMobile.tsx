import {CustomSeperator} from 'nofshonit-base-web-client';
import * as React from 'react';
import Order from '../../../../../models/Order';
import HistoryVariantMobile from './HistoryVariantMobile';
import { useState } from 'react';

interface Props {
	variants: Order[];
	onCancelOrder: (order) => void;
	onConfirmOrderClicked: (orderGuid) => void;
	history: any;
}
interface IState {
	display: boolean;
}
const HistoryVariantsItemMobile : React.FC<Props> = ({
	variants,
	onCancelOrder,
	onConfirmOrderClicked,
	history
 }) => {
   const [display, setDisplay] = useState<boolean>(false);

   const onCancelOrderFunc = (order: Order) => {
		onCancelOrder(order);
	};

const renderAllVariants = () => {
	return variants.map((variant, index) => (
		<React.Fragment key={index}>
			<HistoryVariantMobile
				history={history}
				onConfirmOrderClicked={(orderGuid) => onConfirmOrderClicked(orderGuid)}
				variant={variant}
				key={index}
				onCancelOrder={onCancelOrderFunc}
			/>
		</ React.Fragment>
	));
	};
	return <div className='mobile-history'>{renderAllVariants()}</div>;
}
export default HistoryVariantsItemMobile;
