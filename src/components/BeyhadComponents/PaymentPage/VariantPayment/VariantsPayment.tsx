import * as React from 'react';
import CartItem from '../../../../models/CartItem';
import VarientPayment from './VarientPayment';
import {CustomSeperator,CustomSpan} from 'nofshonit-base-web-client';
import TextCustomItemComponent from 'src/components/CustomComponents/TextCustomItemComponent/TextCustomItemComponent';
import { CustomMediaQuery } from '../../../CustomComponents/CustomMediaQuery/CustomMediaQuery';
interface Props {
	categories: CartItem[];
}
interface IState {}
const VariantsPayment : React.FC<Props> = ({
	categories,
}) => {
	const renderAllcategories = () => {
		if (categories) {
			return categories.map((category, index) => {
				let totalCategorySum: number = 0;
				{category && category.variants && category.variants.forEach(v => totalCategorySum += (v.price * v.quantity));}
				return (<React.Fragment key={index}>
					<div key={index} className='varient-payment-container'>
						<div className='category-name'>
							<CustomSpan classNameSpan='large-text-item' text={`${category.name}`} />
						</div>
						<VarientPayment category={category} key={index} />

						{/* <CustomMediaQuery.Mobile>
							<div className='category-total'>
								<TextCustomItemComponent  text='סה"כ' isBold={true}/>
								<TextCustomItemComponent  text={`${totalCategorySum} ₪`} isBold={true}/>
							</div>
						</CustomMediaQuery.Mobile> */}

					</div>
				</React.Fragment>
			)});
		} else {
			return null;
		}
	};
	return (<div className='all-categories'>
				<div className='all-categories-inner'>
					{renderAllcategories()}
				</div>
			</div>);
}
export default VariantsPayment;
