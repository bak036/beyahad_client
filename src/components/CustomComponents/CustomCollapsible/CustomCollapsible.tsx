import * as React from 'react';
import MenuStore from '../../../stores/MenuStore';
import { MENU_STORE } from '../../../consts/stores';
import { observer } from 'mobx-react';
import rootStores from '../../../stores';

interface Props {
	title: string;
	index: number;
	fontSize?: string;
	children?: React.ReactNode;
}
interface IState {}

const menuStore: MenuStore = rootStores[MENU_STORE];


const CustomCollapsible : React.FC<Props> = ({
	title,
	index,
	fontSize,
	children
}) => {

	const closeCollapsible = () => {
		menuStore.hideSideBarCollapsible = 0;
		menuStore.closeSideBarCollapsible = false;
		menuStore.toggleSideBarCollapsible;
	}

	const openSubCategories = () => {
		menuStore.hideSidebarSubCategories = false;
	}
		const hide = menuStore.hideSidebarSubCategories ? 'hide' : '';
		const fontSizeObject = fontSize ? {fontSize:fontSize+"px"} : {};
		return (
			<div className="side-bar-custom-collapsible-main-container">
				<div className={`side-bar-custom-collapsible-header`} style={fontSizeObject} onClick={openSubCategories}>
					{title}
				</div>
				{index === menuStore.hideSideBarCollapsible &&
				menuStore.closeSideBarCollapsible && (
					<div className={`side-bar-custom-collapsible-item ${hide}`} onClick={closeCollapsible}>
						{children}
					</div>
				)}
			</div>
		);
	}
export default observer(CustomCollapsible)
