import {CustomHeader, HeaderType, CustomSelector} from 'nofshonit-base-web-client';
import * as React from 'react';
import Lang from '../../../../config/Language';
import Category from '../../../../models/Category';
import EventimEvent from '../../../../models/EventimEvent';
import {CustomMediaQuery} from '../../../CustomComponents/CustomMediaQuery/CustomMediaQuery';
import ProductPageTabsDesktop from '../../ProductPage/ProductPageTabs/ProductPageTabsDesktop';
import ProductPageTabs from '../../ProductPage/ProductPageTabs/ProductPageTabs';
import ProductPageInfoTab from '../../ProductPage/ProductPageTabs/ProductPageInfoTab';
interface Props {
	productPageCategory: Category;
	renderComponents: {};
}
interface IState {}

const ProductTabs : React.FC<Props> = ({
	productPageCategory,
	renderComponents
}) => {
	const showDesktopTabs = (componentsToRender) => {
		return (
			<div className='tabs-desktop'>
				<div className='product-page-tab-desktop'>
					<ProductPageTabsDesktop components={componentsToRender} />
				</div>
			</div>
		);
	};

	const showMobileTabs = (productPageCategory, componentsToRender) => {
		return (
			<React.Fragment>
				<div className='product-page-tabs'>
					{componentsToRender.map((component, index) => {
						return (
							<ProductPageTabs
								key={index}
								ComponentName={component.title}
								ComponentImg={component.icon}
								ComponentData={component.content}
								isHtml={component.isHtml}
							/>
						);
					})}
				</div>
				<div className='product-page-info-tab'>
					<ProductPageInfoTab isMobile={true} catergory={productPageCategory} />
				</div>
			</React.Fragment>
		);
	};

	return (
		<div className='eventim-product-page-tabs-container'>
			<CustomMediaQuery.Mobile>
				{showMobileTabs(productPageCategory, renderComponents)}
			</CustomMediaQuery.Mobile>
			<CustomMediaQuery.Desktop>{showDesktopTabs(renderComponents)}</CustomMediaQuery.Desktop>
		</div>
	);
}
export default ProductTabs;
