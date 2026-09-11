import {CustomSeperator} from 'nofshonit-base-web-client';
import * as React from 'react';
import Order from '../../../../../models/Order';
import HistoryVarientItem from './HistoryVarientItem';
import { useState } from 'react';
const moment = require('moment');

interface Props {
	variants: Order[];
	isCollapsed: boolean;
	onCancelOrder: (order: Order) => void;
	onConfirmOrderClicked: (orderGuid) => void;
	history: any;
}

interface IState {
	display: boolean;
}

const ShowVarient : React.FC<Props> = ({
	variants,
	isCollapsed,
	onCancelOrder,
	onConfirmOrderClicked,
	history
}) => {

	const [display, setDisplay] = useState<boolean>(false);

	const onCancelOrderFunc = (order: Order) => {
		onCancelOrder(order);
	};
	const orderStatus = (status: string) => {
		switch (status) {
			case 'NotImplemented': {
				return 'זמין למימוש';
			}
			case 'Implemented': {
				return 'מומש';
			}
			default: {
				return 'פג תוקף';
			}
		}
	};

	const onMoreDetailsClicked = () => {
		setDisplay(!display)
	};

	const renderVarients = (varients?: Order[]) => {
		if (varients) {
			return varients.map((v: Order, index) => (
				<React.Fragment key={index}>
					{index ? <CustomSeperator /> : null}
					<HistoryVarientItem
						history={history}
						onConfirmOrderClicked={(orderGuid) => onConfirmOrderClicked(orderGuid)}
						onCancelOrder={onCancelOrderFunc}
						order={v}
					/>
				</React.Fragment>
			));
		} else {
			return null;
		}
	};

	return <>{renderVarients(variants)}</>;
}
export default ShowVarient;
