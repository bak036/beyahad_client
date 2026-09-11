import { observer } from 'mobx-react';
import { CustomSelector, CustomSeperator } from 'nofshonit-base-web-client';
import * as React from 'react';
import Lang from '../../../../../config/Language';
import { ORDERS_HISTORY_STORE } from '../../../../../consts/stores';
import { Orders } from '../../../../../models/enums';
import rootStores from '../../../../../stores';
import OrdersHistoryStore from '../../../../../stores/OrdersHistoryStore';
import { useEffect, useState } from 'react';

const options = ['option 1', 'option 2', 'option 3'];

interface Props {
	// startDateChange: (value) => void;
	// endDateChange: (value) => void;
	// orderOptionsChange: (value) => void;
	// startDate: string; // Filter start date
	// endDate: string; // Filter end date
	businessNames: string[];
	onFilter: () => void;
}

interface IState {
	statusSelected: string;
}
const ordersHisoryStore: OrdersHistoryStore = rootStores[ORDERS_HISTORY_STORE];

const HistoryFilters : React.FC<Props> = ({
	businessNames,
	onFilter,
}) => {
	const [statusSelected, setStatusSelected] = useState<string>('');

	useEffect(() => {
		setStatusSelected(ordersHisoryStore.statusArray[0]);
		onStatusSelected(ordersHisoryStore.statusArray[0]);
	},[])

	const onStatusSelected = (status) => {
		if (status) {
			ordersHisoryStore.setStatusSelected(status.key);
		} else {
			ordersHisoryStore.setStatusSelected(status);
		}
		setStatusSelected(status);
		onFilter();
	};

	return (
		<div className={'history-filters-container'}>
			<div className={'history-filters-container-selectors'}>
				<div className={'history-filters-container-business-slector'}>
					<div>{Lang.format('filterByBusiness')}</div>
					<CustomSelector
						placeholder={'כל בתי העסק'}
						options={businessNames}
						isPrimitiveValue
						onSelected={(selected) => {
							onFilter();
							ordersHisoryStore.setBusibessSelected(selected);
						}}
						value={ordersHisoryStore.businessSelected}
					/>
				</div>
				<div className='history-filters-container-status-slector'>
				<div>{Lang.format('filterByStatus')}</div>
					<CustomSelector
						keyAttribute={'key'}
						valueAttribute={'value'}
						placeholder={'סטטוס מימוש'}
						options={ordersHisoryStore.getStatusArray}
						onSelected={onStatusSelected}
						value={statusSelected}
					/>
				</div>
			</div>
			{/* <div className='history-filters-container-sperator'>
				<CustomSeperator />
			</div> */}
		</div>
	);
}
export default observer(HistoryFilters);
