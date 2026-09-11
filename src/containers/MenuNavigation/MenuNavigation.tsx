import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import LogoutModal from '../../components/BeyhadComponents/Logout/LogoutModal';
import { CustomMediaQuery } from '../../components/CustomComponents/CustomMediaQuery/CustomMediaQuery';
import CustomModal from '../../components/CustomComponents/CustomModal';
import { AUTH_STORE, CONFIGURATION_STORE, MENU_STORE, WALLET_STORE } from '../../consts/stores';
import rootStores from '../../stores';
import AuthStore from '../../stores/AuthStore';
import MenuStore from '../../stores/MenuStore';
import SideBarSearchHover from '../MenuNavigation/SideBar/SideBarSearchHover/SideBarSearchHover';
import NavBar from './NavBar/NavBar';
import SideBar from './SideBar/SideBar';
import ExternalLinkConfirm from 'src/services/ExternalLinkConfirm';
import ConfigurationStore from 'src/stores/ConfigurationStore';
import { useState } from 'react';
import WalletStore from 'src/stores/WalletStore';

const menuStore: MenuStore = rootStores[MENU_STORE];
const configurationStore: ConfigurationStore = rootStores[CONFIGURATION_STORE];

interface Props {
	history?: any;
}
interface IState {
	logOutModal: boolean;
}

const authStore: AuthStore = rootStores[AUTH_STORE];

const MenuNavigation: React.FC<Props> = ({
	history
}) => {

	const [logOutModal, setLogOutModal] = useState<boolean>(false)
	const [navBarVisable, setNavBarVisible] = useState<boolean>(false)

	const onLogOutModalClicked = () => {
		setLogOutModal(true)
	};
	const onCancel = () => {
		setLogOutModal(false)
	};

	const onLogoutButtonClicked = () => {
		setLogOutModal(false)
		authStore.logout();
	};

	const componentToRender = () => {
		return <LogoutModal onLogoutButtonClicked={onLogoutButtonClicked} onCancel={onCancel} />;
	};

	const openNewPage = (url) => {
		ExternalLinkConfirm.OpenLinkExternal(url, '_blank');
	};
	React.useEffect(() => {
		const fetchData = async () => {
			const isNavBarVisible = authStore.isUserLoggedIn && 
				!history.location.pathname.includes('login') && 
				!history.location.pathname.includes('register');
	
			if (isNavBarVisible && menuStore.categoriesForMenu.length === 0) {
				await menuStore.init();
			}
			
			setNavBarVisible(isNavBarVisible);
		};
	
		fetchData();
	}, [authStore.isUserLoggedIn, history.location.pathname, menuStore.categoriesForMenu.length]);
	
	const hideSideBarSearchBox = menuStore.showSearchContainerInMobile ? '' : 'hide';



	return (
		<>
			<CustomMediaQuery.Desktop>
				{navBarVisable && <NavBar categories={toJS(menuStore.categoriesForMenu)} history={history} />}
			</CustomMediaQuery.Desktop>
			<CustomMediaQuery.Mobile>
				{authStore.isUserLoggedIn && !history.location.pathname.includes('login') &&
					<>
						<SideBar
							onLogoutClicked={onLogOutModalClicked}
							categories={menuStore.categoriesForMenu}
							history={history}
						/>
						<div className='side-bar-bottom'>
							<div className='max-button right-button' onClick={() => openNewPage(configurationStore.getConfiguration.pointsSkyMaxLink)}>צברת {authStore.currentUser.points_skymax} <br />נקודות ב &nbsp; <img className='sky-img' src={require('../../assets/sky-logo.png')}></img>&nbsp; &#62;</div>
							<div className='max-button left-button' onClick={() => openNewPage(configurationStore.getConfiguration.benefitsMaxLink)}>צברת החודש {authStore.currentUser.total_Benefit_quantity}<br /> פינוקי &nbsp;<img className='max-img' src={require('../../assets/max-logo.png')}></img>&nbsp; &#62;</div>
						</div>
					</>}
				<div className={`side-bar-search-hover-component ${hideSideBarSearchBox}`}>
					<SideBarSearchHover history={history} />
				</div>
				<CustomModal
					visible={logOutModal}
					componentToRender={componentToRender()}
					onCancel={onCancel}
				/>
			</CustomMediaQuery.Mobile>
		</>
	);
}
export default observer(MenuNavigation)
