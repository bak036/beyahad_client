import { CustomHeader, CustomSelector, HeaderType } from 'nofshonit-base-web-client';
import * as React from 'react';
import Lang from '../../../../config/Language';

const options: any[] = [ 'chocolate', 'strawberry', 'vanilla' ];

const ProductPageHeaderAreaAndData : React.FC = ({}) => {
	return (
		<div className='product-page-hedaer-area-and-date-container'>
			<div className='produnpm ct-page-hedaer-area-and-date-title'>
				<CustomHeader text={Lang.format('Choose_Area')} type={HeaderType.SubTitle} />
			</div>
			<div className="product-page-hedaer-area">
				<CustomSelector
					options={options}
					selectClassName='product-page-hedaer-area-selector'
					placeholder={Lang.format('All_Areas')}
					isPrimitiveValue
				/>
			</div>
			<div className='product-page-hedaer-area-and-date-title'>
				<CustomHeader text={Lang.format('Choose_Date')} type={HeaderType.SubTitle} />
			</div>
			<div className="product-page-hedaer-date">
				<CustomSelector
					options={options}
					containerClassName={'product-page-hedaer-selector-date'}
					selectClassName={'product-page-hedaer-selector-date-select'}
					placeholder={'16/03/2017'}
					isPrimitiveValue
				/>
				<CustomSelector
					options={options}
					containerClassName={'product-page-hedaer-selector-time'}
					selectClassName={'product-page-hedaer-selector-time-select'}
					placeholder={'16:00'}
					isPrimitiveValue
				/>
			</div>
		</div>
	);
}
export default ProductPageHeaderAreaAndData;
