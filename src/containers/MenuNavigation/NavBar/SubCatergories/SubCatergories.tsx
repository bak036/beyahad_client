import {observer} from 'mobx-react';
import {CustomSeperator} from 'nofshonit-base-web-client';
import {CustomSeperatorStyle} from 'nofshonit-base-web-client/builds/0.0.1/components/CustomSeperator';
import * as React from 'react';
import EditorMessage from '../../../../components/BeyhadComponents/EditorMessage/EditorMessage';
import {RoutesPath} from '../../../../consts/RoutesPath';
import {CONFIGURATION_STORE, MENU_STORE, MESSAGES_STORE, VIEW_STORE} from '../../../../consts/stores';
import Category from '../../../../models/Category';
import rootStores from '../../../../stores';
import MenuStore from '../../../../stores/MenuStore';
import MessagesStore from '../../../../stores/MessagesStore';
import ViewStore from '../../../../stores/ViewStore';
import CategoryUtils from '../../../../utils/categoryUtils';
import GoogleAnalyticsUtils, {PromoDTO} from '../../../../utils/analytics/GoogleAnalyticsUtils';
import Commercial from '../../../../components/BeyhadComponents/CustomService/Advertisement/Commercial';
import ExternalLinkConfirm from 'src/services/ExternalLinkConfirm';
import ConfigurationStore from 'src/stores/ConfigurationStore';

interface Props {
	history?: any;
}
interface IState {}

const menuStore: MenuStore = rootStores[MENU_STORE];
const viewStore: ViewStore = rootStores[VIEW_STORE];
const messagesStore: MessagesStore = rootStores[MESSAGES_STORE];
const configurationStore: ConfigurationStore = rootStores[CONFIGURATION_STORE];

const SubCatergories : React.FC<Props> = ({
	history
}) => {

	// function that rendring all the sub catergories , function get catergory array and display all the sub catergories into the screen
	const renderAllSubCatergories = (categories?: Category[]) => {
		if (categories) {
			return categories.map((c: Category, index: number) => (
				<div
					key={index}
					className='BySubCatergories-right-container item cursor-pointer'
					onClick={() => {
						CategoryUtils.renderSubCategory(c, history, true);
						menuStore.toggleAllHovers();
					}}>
					{c.categoryName}
				</div>
			));
		} else {
			return null;
		}
	};

	const renderSubCategory = (category: Category) => {
		if (category) {
			if (category.isAllGrandchildren === false) {
				viewStore.setLoadingView(false);
				history.push(`${RoutesPath.category.rootLobby}/${category.categoryId}`);
			} else {
				history.push(`${RoutesPath.category.rootProducts}/${category.categoryId}`);
			}
		}
	};

	const onMouseLeaveBySubCatergoriesMainContainer = () => {
		//menuStore.subCategoriesShow = false;
		menuStore.borderBottom = false;
	};

	const categories = menuStore.getSubCurrentCategories;
	const currentCategory = menuStore.getCurrentCategorie;
	let imgAltRight = '';
	let imgLinkRight = '';
	let imgUrlRight = '';
	let imgAltLeft = '';
	let imgLinkLeft = '';
	let imgUrlLeft = '';
	if(currentCategory.image && currentCategory.image && currentCategory.image.length > 0){
		const imageIconRight = currentCategory.image.filter(i => i.imageTypeId == 18);
		const imageIconLeft = currentCategory.image.filter(i => i.imageTypeId == 19);
		if(imageIconRight && imageIconRight.length > 0){
			imgAltRight = imageIconRight[0].alt
			imgLinkRight = `${configurationStore.getConfiguration.picsUrl}/share/${imageIconRight[0].file}`;
			imgUrlRight = imageIconRight[0].externalUrl;
		}
		if(imageIconLeft && imageIconLeft.length > 0){
			imgLinkLeft = `${configurationStore.getConfiguration.picsUrl}/share/${imageIconLeft[0].file}`;
			imgUrlLeft = imageIconLeft[0].externalUrl;
			imgAltLeft = imageIconLeft[0].alt;
		}
	}
	const rightAdvertisement = messagesStore.rightAdvertisement ? messagesStore.rightAdvertisement : '';
	const rightCommercial = {
		messageContext: 'Top Advertisment',
		messageKey: 'Right Advertisment',
		messageName: 'Right Advertisment',
	};

	const leftAdvertisement = messagesStore.leftAdvertisement ? messagesStore.leftAdvertisement : '';
	const leftCommercial = {
		messageContext: 'Top Advertisment',
		messageKey: 'Left Advertisment',
		messageName: 'Left Advertisment',
	};
	return (
		<div
			className='BySubCatergories-main-container'
			// onMouseEnter={() => (menuStore.subCategoriesShow = true)}
			// onMouseLeave={() => this.onMouseLeaveBySubCatergoriesMainContainer}
			>
			<div className='BySubCatergories-right-container'>{categories && renderAllSubCatergories(categories)}</div>
			<div className='subcatergories-custom-seperator'>
				<CustomSeperator style={CustomSeperatorStyle.Vertical} />
			</div>
			<div className='BySubCatergories-left-container'>
				<div className='BySubCatergories-left-container-items'>
					<div className='first-line'>
						<div className='BySubCatergories-left-container-text'>מבצעים חדשים</div>
						<div className='close' onClick={() => menuStore.toggleAllHovers()}>X</div>
					</div>
					<div className='BySubCatergories-left-container-image-item'>
						<div title={imgAltRight}>
							<img src={imgLinkRight} alt={imgAltRight} onClick={() => ExternalLinkConfirm.OpenLinkExternal(imgUrlRight)}/>
						</div>
						<div title={imgAltLeft} onClick={()=> {ExternalLinkConfirm.OpenLinkExternal(imgUrlLeft)}}>
							<img src={imgLinkLeft} alt={imgAltLeft} />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
export default observer(SubCatergories)
