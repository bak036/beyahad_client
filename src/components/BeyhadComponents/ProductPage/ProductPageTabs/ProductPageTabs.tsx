import { CustomCollapsible } from 'nofshonit-base-web-client';
import * as React from 'react';
import CustomAntdCollapsible from '../../../CustomComponents/CustomAntdCollapsible/CustomAntdCollapsible';
import EditorMessage from '../../EditorMessage/EditorMessage';
import GoogleAnalyticsUtils from 'src/utils/analytics/GoogleAnalyticsUtils';
interface Props {
	ComponentName: string;
	isHtml?: boolean;
	ComponentImg?: any;
	ComponentData?: string;
	ComponentDataArray?: string[];
	OnClick?: any;
}
interface IState {}

const ProductPageTabs : React.FC<Props> = ({
	ComponentName,
	isHtml,
	ComponentImg,
	ComponentData,
	ComponentDataArray
}) => {

	const renderDataArray = (dataArray) => {
		if (dataArray) {
			return dataArray.map((data: string, index: number) => (
				<EditorMessage doNotCheckLink={false} key={index} textClassName={'product-page-tabs-component-data'} message={data} />
			));
		} else {
			return null;
		}
	};

	const sendGoogleAnalytics = () => {
		GoogleAnalyticsUtils.clickButtonAnalytics('product_page','product_page','click',ComponentName)
	}

	const dataArray = ComponentDataArray ? ComponentDataArray : [];
	return (
		<div className="product-page-tabs-main-container" onClick={sendGoogleAnalytics}>
			<CustomAntdCollapsible
				isSideBar={false}
				showArrow={true}
				className="product-page-tabs-component-name"
				trigger={ComponentName}
			>
				{isHtml && (
					<div className="product-page-tabs-component-data">
						{ComponentDataArray && renderDataArray(dataArray)}
						{ComponentData && <EditorMessage doNotCheckLink={false} message={ComponentData} />}
					</div>
				)}
				{!isHtml && (
					<div className="product-page-tabs-component-data">{ComponentData}</div>
				)}
			</CustomAntdCollapsible>
		</div>
	);
}
export default ProductPageTabs;
