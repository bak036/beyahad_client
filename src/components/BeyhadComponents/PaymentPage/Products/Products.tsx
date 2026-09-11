import {CustomSeperator, Logger} from 'nofshonit-base-web-client';
import * as React from 'react';
import CartItem from '../../../../models/CartItem';
import {QuantityType} from '../../../../models/enums';
import Varient from '../../../../models/Varient';
import GoogleAnalyticsUtils from '../../../../utils/analytics/GoogleAnalyticsUtils';
import Product from './Product';
const moment = require('moment');

interface Props {
	categories: CartItem[];
	cart?: boolean;
	deleteVarient?: boolean;
	description?: boolean;
	discount?: boolean;
	sale?: boolean;
	overLimit?: (productLimit) => void;
	deleteCategory?: boolean;
	quantity?: QuantityType;
	onQuantityChanged?: (varient: Varient, category: CartItem) => Promise<any>;
	onRemoveClicked?: (barcode) => Promise<any>;
	onDeleteCategoryClicked?: (categoryId) => void;
	cardVariant?: CartItem;
	history?: any;
	accessToken?: any;
	isMint?: boolean;
	variantActive?: string;
	thanksPayment?:boolean;
}

interface IState {}

const Products : React.FC<Props> = ({
	categories,
	cart,
	deleteVarient,
	description,
	discount,
	sale,
	overLimit,
	deleteCategory,
	quantity,
	onQuantityChanged,
	onRemoveClicked,
	onDeleteCategoryClicked,
	cardVariant,
	history,
	accessToken,
	isMint,
	variantActive,
	thanksPayment
}) => {

	const onDeleteCategoryClickedFunc = (categoryId) => {
		if (onDeleteCategoryClicked) {
			onDeleteCategoryClicked(categoryId);
		}
	};
	const onQuantityChangedFunc = async (variant: Varient, category: CartItem) => {
		if (onQuantityChanged) {
			return onQuantityChanged(variant, category);
		}
	};

	const onRemoveClickedFunc = async (barcode) => {
		if (onRemoveClicked) {
			return onRemoveClicked(barcode);
		}
	};

	const getVariantsSum = (cartItem: CartItem) => {
		let sum = 0;
		if (cartItem && cartItem.variants) {
			cartItem.variants.forEach((varient) => {
				sum += varient.price * varient.quantity;
			});
		}
		return sum;
	};

	const getTicketsSum = (cartItem: CartItem) => {
		let sum = 0;
		if (cartItem && cartItem.tickets) {
			for(var i=0; i<cartItem.tickets.length; i++){
				sum+=cartItem.tickets[i].price;
			}
			// const quantity = cartItem.quantity;
			// const price = cartItem.tickets[0].price;
			// sum = quantity * price;
		}
		return sum;
	};

	const renderAllProducts = () => {
		if (categories) {
			return categories.map((category, index) => (
				<React.Fragment key={index}>
					<Product
						deleteCategory={deleteCategory}
						deleteVarient={deleteVarient}
						thanksPayment={thanksPayment}
						cart={cart}
						sale={sale}
						cardVariant={cardVariant}
						quantity={quantity}
						description={description}
						key={index}
						category={category}
						overLimit={(productLimit) => {
							if (overLimit) overLimit(productLimit);
						}}
						onRemoveClicked={onRemoveClickedFunc}
						onDeleteCategoryClicked={onDeleteCategoryClickedFunc}
						onQuantityChanged={onQuantityChangedFunc}
						history={history}
						accessToken={accessToken}
						isMint={isMint}
						variantActive={variantActive}
						totalSumPrice={(category && category.variants) ? getVariantsSum(category) : getTicketsSum(category)}
					/>
				</React.Fragment>
			));
		} else {
			Logger.error('the categories are undefined');

			return null;
		}
	};
	return <>{renderAllProducts()}</>;
}
export default Products;
