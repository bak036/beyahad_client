import { CustomHeader, HeaderType } from 'nofshonit-base-web-client';
import * as React from 'react';
import { observer } from 'mobx-react';
import ViewStore from '../../../stores/ViewStore';
import rootStores from '../../../stores';
import { VIEW_STORE } from '../../../consts/stores';
import BreadCrumbs, { Crumbs } from '../BreadCrumbs/BreadCrumbs';
import { RoutesPath } from '../../../consts/RoutesPath';
import Category from '../../../models/Category';

interface Props {
	text?: string;
}
interface IState {}

const viewStore: ViewStore = rootStores[VIEW_STORE];

const CustomEmptyState : React.FC<Props> = ({
	text
}) => {
	const textRender = text ? text : 'אין תוצאות';
	return (
		<div className="empty-state-container">
			{!viewStore.loadingView && <CustomHeader type={HeaderType.Title} text={textRender} />}
		</div>
	);
}
export default observer(CustomEmptyState)
