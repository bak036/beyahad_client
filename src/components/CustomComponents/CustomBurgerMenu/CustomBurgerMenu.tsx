import * as React from 'react';
import { slide as Menu } from 'react-burger-menu';
import { observer } from 'mobx-react';
import MenuStore from '../../../stores/MenuStore';
import rootStores from '../../../stores';
import { MENU_STORE } from '../../../consts/stores';

interface Props {
	width: string;
	direction: string;
	contianerId: string;
	image: any;
	isOpen?: boolean;
	children?: React.ReactNode;
}

interface IState {}
const menuStore: MenuStore = rootStores[MENU_STORE];

const CustomMenu : React.FC<Props> = ({
	width,
	direction,
	contianerId,
	image,
	isOpen,
	children
}) => {


	const handleStateChange = (state) => {
		menuStore.isOpenBurgerMenu = state.isOpen;
	}
	const handleIsOpen = () => {
		menuStore.isOpenBurgerMenu = !menuStore.isOpenBurgerMenu
	  }
	
	const closeSideBar = () => {
		menuStore.isOpenBurgerMenu = true
	}
	const imglink = image;
	return (
		<Menu
			customCrossIcon={imglink}
			width={width}
			direction
			onStateChange={(state) => handleStateChange(state)}
			isOpen={menuStore.isOpenBurgerMenu}
			onOpen={handleIsOpen}
			onClose={handleIsOpen}
			outerContainerId={contianerId}
		>
			{children}
		</Menu>
	);
}
export default observer(CustomMenu)
