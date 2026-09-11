import ExternalLinkConfirm from 'src/services/ExternalLinkConfirm';
import { RoutesPath } from '../consts/RoutesPath';
import Category from '../models/Category';
import GoogleAnalyticsUtils from './analytics/GoogleAnalyticsUtils';

export default class CategoryUtils {
	// Used for Header Categories
	static renderSubCategory(category: Category, history: any, openConfirm = false) {
		if (category) {

			if (history) {
				if (category.isLeaf || category.hasChildren === false) {
					switch (category.categoryType) {
						case 100:
							// Iframe
							history.push(`${RoutesPath.category.rootProductPage}/${category.categoryId}`);
							break;

						case 101:
							// Popup - category.webSite
							if (openConfirm) {
								ExternalLinkConfirm.OpenLinkExternal(category.categoryUrl);
							} else {
								window.open(category.categoryUrl, '__blank', 'height=470,width=750');
							}
							break;
						case 102:
							// New window
							if (openConfirm) {
								ExternalLinkConfirm.OpenLinkExternal(category.categoryUrl);
							} else {
								window.open(category.categoryUrl);
							}
							// ExternalLinkConfirm.OpenLinkExternal(category.categoryUrl);
							break;
						case 103:
						default:
							// Same window
							history.push(`${RoutesPath.category.rootProductPage}/${category.categoryId}`);
							break;
					}
				} else if (category.isAllGrandchildren) {
					history.push(`${RoutesPath.category.rootProducts}/${category.categoryId}`);
				} else {
					history.push(`${RoutesPath.category.rootLobby}/${category.categoryId}`);
				}
				window.scrollTo(0, 0);
			}
		}
	}

	// Used for tags
	static renderPage = (id: string, canActivateAction: boolean | null, category: any, history: any) => {

		if (id && canActivateAction && category && history) {
			if (category.categories) {
				switch (category.categories && category.categories.categoryType) {
					case 100:
						// Iframe
						history.push(`${RoutesPath.category.rootProductPage}/${category.categoryId}`);
						break;

					case 101:
						// Popup - category.webSite
						ExternalLinkConfirm.OpenLinkExternal(category.categories.categoryUrl);
						break;
					case 102:
						// New window
						ExternalLinkConfirm.OpenLinkExternal(category.categories.categoryUrl,true);
						break;
					case 103:
					default:
						// Same window
						history.push(`${RoutesPath.category.rootProductPage}/${category.categoryId}`);
						break;
				}
			} else {
				switch (category && category.categoryType) {
					case 100:
						// Iframe
						history.push(`${RoutesPath.category.rootProductPage}/${category.categoryId}`);
						break;

					case 101:
						// Popup - category.webSite
						ExternalLinkConfirm.OpenLinkExternal(category.categoryUrl);
						break;
					case 102:
						// New window
						ExternalLinkConfirm.OpenLinkExternal(category.categoryUrl,true);
						break;
					case 103:
					default:
						// Same window
						history.push(`${RoutesPath.category.rootProductPage}/${category.categoryId}`);
						break;
				}
			}


		}
	};
	// Used for search
	static renderPageBySearchItem = (category: any, history: any) => {
		if (category && history) {
			switch (category && category.categoryType) {
				case 100:
					// Iframe
					history.push(`${RoutesPath.category.rootProductPage}/${category.categoryId}`);
					break;

				case 101:
					// Popup - category.webSite
					window.open(category.categoryUrl, '__blank', 'height=470,width=750');
					break;
				case 102:
					// New window
					window.open(category.categoryUrl);
					break;
				case 103:
				default:
					// Same window
					history.push(`${RoutesPath.category.rootProductPage}/${category.categoryId}`);
					break;
			}
		}
	};

	// static renderCategoryForSideNavBar(category: Category, history: any) {
	// 	//GoogleAnalyticsUtils.clickOnProduct(category.subCategories, category);
	// 	if (category) {
	// 		if (history) {
	// 			if (category.isAllGrandchildren) {
	// 				history.push(`${RoutesPath.category.rootProducts}/${category.categoryId}`);
	// 			} else if (!category.hasChildren) {
	// 				history.push(`${RoutesPath.category.rootProductPage}/${category.categoryId}`);
	// 			} else {
	// 				history.push(`${RoutesPath.category.rootLobby}/${category.categoryId}`);
	// 			}
	// 			window.scrollTo(0, 0);
	// 		}
	// 	}
	// }
}
