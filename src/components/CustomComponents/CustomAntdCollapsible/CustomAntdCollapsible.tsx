import Collapse from 'antd/lib/collapse';
import * as React from 'react';
import MenuStore from '../../../stores/MenuStore';
import { observer } from 'mobx-react';
import rootStores from '../../../stores';
import { MENU_STORE } from '../../../consts/stores';
import { transform } from 'lodash';
import { useState } from 'react';

interface Props {
	className?: string;
	trigger?: string;
	showArrow?: boolean;
	key?: number;
	isSideBar?: boolean;
	children?: React.ReactNode;
}

interface IState {
	closeCollapsible: boolean;
}

const Panel = Collapse.Panel;
const menuStore: MenuStore = rootStores[MENU_STORE];
const CustomAntdCollapsible : React.FC<Props> = ({
	className,
	trigger,
	showArrow,
	key,
	isSideBar,
	children
}) => {
	const [closeCollapsible, setCloseCollapsible] = useState<boolean>(false);

	const changeCloseCollapsible = () => {
		setCloseCollapsible(true)
	};

	const createMarkup = () => {
		return {__html: '<img src="../../../assets/icons/left.svg" />'};
    };

	// custom ant icon image from here: https://stackoverflow.com/questions/69851089/include-an-icon-image-inside-ant-design-collapse-panel-other-than-expandicon
	const getCustomHeader = () => {
		return (
		<>
			<div className={'custom_collapse_icon'} >
				<img style={{transform:'rotate(180deg)'}} src={require('../../../assets/left.svg')} />
			</div>
			{trigger}
		</>);
	};

	const hide = menuStore.hideSideBarCollapsible ? 'hide' : '';
	return (
		<Collapse
			bordered={false} 
			destroyInactivePanel
			>
			<Panel showArrow={false} header={getCustomHeader()} key="1">
				<p
					className={`andt-collapsible ${isSideBar ? hide : ''}`}
					onClick={() => changeCloseCollapsible()}
				>
					{children}
				</p>
			</Panel>
		</Collapse>
	);
}
export default observer(CustomAntdCollapsible)

