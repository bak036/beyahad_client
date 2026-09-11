import * as React from 'react';
import Category from '../../models/Category';
import {CustomCollapsible} from 'nofshonit-base-web-client';
import {PropTypes} from 'mobx-react';
import CustomAntdCollapsible from '../../components/CustomComponents/CustomAntdCollapsible/CustomAntdCollapsible';

interface Props {
	categories: Category[];
	mainClassName: string;
	subClassName: string;
	isMobile: boolean;
}

const RenderMenuItems : React.FC<Props> = ({
	categories,
	mainClassName,
	subClassName,
	isMobile
}) => {

	const renderAllSubCatergories = (classCssName?: string, categories?: Category[]) => {
		if (categories) {
			return categories.map((c: Category, index: number) => (
				<div key={index} className={classCssName}>
					{c.categoryName}
				</div>
			));
		} else {
			return null;
		}
	};

	const renderAllCategories = (mainClassName: string, subClassName: string, categories?: Category[]) => {
		if (categories) {
			return categories.map((c: Category) => (
				<CustomAntdCollapsible showArrow={false} className={mainClassName} trigger={c.categoryName} isSideBar={false}>
					{renderAllSubCatergories(subClassName, c.subCategories)}
				</CustomAntdCollapsible>
			));
		} else {
			return null;
		}
	};

	return <>{renderAllCategories(mainClassName, subClassName, categories)}</>;
}
export default RenderMenuItems;
