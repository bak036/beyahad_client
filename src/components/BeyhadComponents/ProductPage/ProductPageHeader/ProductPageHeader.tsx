import { observer } from 'mobx-react';
import { CustomButton, CustomHeader, CustomSeperator, CustomSpan, HeaderType } from 'nofshonit-base-web-client';
import * as React from 'react';
import Lang from '../../../../config/Language';
import { AUTH_STORE, CART_STORE, CATEGORY_STORE, MESSAGES_STORE, VIEW_STORE } from '../../../../consts/stores';
import Category from '../../../../models/Category';
import { CategoryType, QuantityType, PremiumType } from '../../../../models/enums';
import Varient from '../../../../models/Varient';
import rootStores from '../../../../stores';
import CartStore from '../../../../stores/CartStore';
import CategoryStore from '../../../../stores/CategoryStore';
import CustomModal from '../../../CustomComponents/CustomModal';
import VarientItem, { QuantityAction } from '../../PaymentPage/Products/VarientItem';
import ProductPageHeaderAreaAndDate from '../ProductPageHeader/ProductPageHeaderAreaAndData';
import ErrorUtils from '../../../../utils/errorHandling/ErrorUtils';
import EditorMessage from '../../EditorMessage/EditorMessage';
import AlertUtils from '../../../../utils/AlertUtils';
import MessagesStore from '../../../../stores/MessagesStore';
import GoogleAnalyticsUtils from '../../../../utils/analytics/GoogleAnalyticsUtils';
import ViewStore from '../../../../stores/ViewStore';
import CustomButtonBeyahad from '../../../CustomComponents/CustomButtonBeyahad/CustomButtonBeyahad';
import { get } from 'lodash';
import StringFormatUtils from '../../../../utils/StringFormatUtils';
import TextCustomItemComponent from '../../../CustomComponents/TextCustomItemComponent/TextCustomItemComponent';
import ScreenUtils from 'src/utils/ScreenUtils';
import CustomButtonBlueBeyahad from 'src/components/CustomComponents/CustomBlueButton/CustomButtonBlueBeyahad';
import AuthStore from 'src/stores/AuthStore';
import { useState } from 'react';

interface Props {
	category: Category;
	history?: any;
	isMint?: boolean;
	accessToken?: string;
}
interface IState {
	quantityType: QuantityType;
	varients: Varient[];
	varientsbySale: Varient[];
	popUpVisible: boolean;
	variantOrderLimit;
	totalPrice?: number;
}
const viewStore: ViewStore = rootStores[VIEW_STORE];
const categoryStore: CategoryStore = rootStores[CATEGORY_STORE];
const cartStore: CartStore = rootStores[CART_STORE];
const messagesStore: MessagesStore = rootStores[MESSAGES_STORE];
const authStore: AuthStore = rootStores[AUTH_STORE];
const isMobile = ScreenUtils.IsMobile();

const ProductPageHeader : React.FC<Props> = ({
	category,
	history,
	isMint,
	accessToken
}) => {

	const [quantityType, setQuantityType] = useState<QuantityType>(QuantityType.Edit);
	const [varients, setVarients] = useState<Varient[]>([]);
	const [popUpVisible, setPopUpVisible] = useState<boolean>(false);
	const [variantOrderLimit, setVariantOrderLimit] = useState<any>(undefined);
	const [varientsbySale, setVarientsbySale] = useState<Varient[]>([]);
	const [totalPrice, setTotalPrice] = useState<number>(0);
	const [isExternalCoupon, setIsExternalCoupon] = useState<boolean>(false);

	const sumTotalPrice = () => {
		let sum = 0;
		if (category && category.variants) {
			category.variants.forEach((varient) => {
				sum += varient.price * varient.quantity;
			});
		}
		setTotalPrice(sum)
	};

	const renderCartButton = () => {
		const cartButton = categoryStore.buttonColor ? 'green' : '';
		const cartImage = categoryStore.buttonColor ? 'VectorVe' : 'cart';
		return (
			<CustomButtonBeyahad
				customClass={''}
				onClick={addToCartOnClick}
				isCurserPointer={true}
				icon={{ src: require(`../../../../assets/icons/shopping_cart.svg`), alt: Lang.format('Add_to_Cart') }}
				buttonText={cartButton ? Lang.format('Item_Added_to_Shopping_Cart') : Lang.format('Add_to_Cart')}
			/>
		);
	};
	const addToCartOnClick = () => {
		var filteredArray: any[] = [];
		if (category && category.variants) {
			category.variants.forEach((varient) => {
				if (varient.quantity !== 0) {
				    varient.productJsonForGA = GoogleAnalyticsUtils.convertProductVarForGA(varient,category,'add_to_cart',authStore.productJsonForGA,authStore.productIndexForGA
																							,authStore.creativeNameForGA,authStore.promotionNameForGA);
					filteredArray.push(varient);
				}
			});
			if (filteredArray.length !== 0) {
				viewStore.setLoadingView(true);
				const request = {
					categoryNumber: category.categoryId.toString(),
					categoryName: category.categoryName.trim(),
					variants: filteredArray
				};
				cartStore
					.addToCart(request)
					.then((res) => {
						if (res) {
							GoogleAnalyticsUtils.addToCart(filteredArray, categoryStore.productPageCategory,authStore.productJsonForGA,authStore.productIndexForGA);
							if (isMint) {
								history.push('/mint/cart');
								if (cartStore.authStore.currentUser.premiumType === PremiumType.PaymentAccess) {
									categoryStore.buttonColor = true;
								}
							} else {
								history.push('/cart');
								categoryStore.buttonColor = false;
							}
						}
					})
					.catch((err) => {
						categoryStore.buttonColor = false;
						ErrorUtils.checkErrorAndShowPopUp(err, '', '');
					}).finally(() => {
						viewStore.setLoadingView(false);
					})
			} else {
				AlertUtils.infoAlert(messagesStore.shoppingbasketEmpty, '');
			}
		}
	};

	const onQuantityCanged = async (barcode, quantityAction: QuantityAction) => {
		if (category.variants) {
			var i;
			const filtered: Varient | any = category.variants.filter((varient, index) => {
				if (varient.barCode === barcode) {
					i = index;
				}
				return varient.barCode === barcode;
			});
			if (quantityAction === QuantityAction.Increce) {
				category.variants[i].quantity = category.variants[i].quantity + 1;
			} else if (quantityAction === QuantityAction.Decrece) {
				category.variants[i].quantity = category.variants[i].quantity - 1;
			} else if (quantityAction === QuantityAction.CardItem) {
				category.variants[i].quantity = 1;
			}
			sumTotalPrice();
		}
	};

	const overLimit = (orderLimit) => {
		setPopUpVisible(true)
		setVariantOrderLimit(orderLimit)
	};
	const onCancel = () => {
		setPopUpVisible(false)
	};

	const renderAllVariants = (varientMap: Varient[], varientCatergoryType: CategoryType) => {
		return varientMap.map((varient, index) => (
			<div key={index}>
				{index > 0 ? <CustomSeperator /> : null}
				<VarientItem
					isProductPage={true}
					key={index}
					varient={varient}
					description={true}
					onQuantityChanged={onQuantityCanged}
					quantity={varient.outofStock ? QuantityType.OutOfStock : QuantityType.Edit}
					catergoryType={varientCatergoryType}
					overLimit={overLimit}
					onExternalCouponLimit={handleExternalCoupon}

				/>
			</div>
		));
	};

	const getDescriptionDesignWithMoney = (desc: string) => {
		let newDesc: string[] = [];
		const moneyFromStrRegex = /([0-9]+\s?₪)/g;
		newDesc = desc.split(moneyFromStrRegex);
		return ((newDesc && newDesc.length == 3) ? (
			<div className='description_modified_container'>
				<div className='line_1'>
					<span>{newDesc[0]}</span>
					<span className='amount_description'>{newDesc[1]}</span>
				</div>
				<div className='line_2'>
					<span>{newDesc[2]}</span>
				</div>
			</div>)
			: <span>{desc}</span>
		);
	}

	const setVarientsFunc = (varients) => {
		setVarients(varients)
	};

  const handleExternalCoupon = (variant: Varient) => {
  		setIsExternalCoupon(variant.isExternalCoupon); 
  };


	const product: Category | any = category ? category : [];
	const varientsVar =
		category && category.variants
			? category.variants.map((x) => new Varient(x))
			: [];
	const catergoryType: CategoryType = product.categoryType;
	const location = category.business.address ? category.business.address : '';
	const isConsumption = product.isConsumption;

	return (
		<>
			<div className='prouct-page-header-container'>
				{/* start modal */}
				<CustomModal
					visible={popUpVisible}
					componentToRender={
						<div className='product-page-header-pop-up'>
							{isExternalCoupon ? (
							<div className='external-coupon-message'
								dangerouslySetInnerHTML={{
								__html: messagesStore.externalCouponLimitMessage.replace('X', variantOrderLimit)
								}}
							/>
							) : (
							<><div className="internal-coupon-message"
								dangerouslySetInnerHTML={{
									__html: messagesStore.couponLimitMessage.replace('X', variantOrderLimit)
								}}
							/>
							</>
							)}
							<CustomButtonBlueBeyahad
								buttonText={'סגור'}
								onClick={onCancel}
								isOneButton={true}
							/>
						</div>
					}
					onCancel={onCancel}
				/>
				{/* end modal */}

				<div className='-page-headerprouct-title'>
					<CustomHeader text={product.categoryName} type={HeaderType.Title} />
				</div>
				<div style={{ display: 'flex', flexDirection: 'column' }}>
					{(product.description &&
						<div className='prouct-page-header-info' style={{ borderBottom: '1px solid #f0f0f2', padding: '5px 0' }}>
							<TextCustomItemComponent
								html={getDescriptionDesignWithMoney(product.description)}
								icon={{ src: require('../../../../assets/icons/price_tag.svg'), name: 'price tag' }}
								customClass={'location-event'}
							/>
						</div>)
					}
					{product && !product.isConsumption && product.business && product.business.address && (
						<div style={{ borderBottom: '1px solid #f0f0f2', padding: '5px 0' }}>
							{product.locations.length > 1 ?
								<TextCustomItemComponent
									text={'מגוון סניפים'}
									icon={{ src: require('../../../../assets/icons/pin.svg'), name: 'pin icon' }}
									customClass={'location-event'}
								/>
								: <TextCustomItemComponent
									text={product.business.address ? product.business.address : ''}
									icon={{ src: require('../../../../assets/icons/pin.svg'), name: 'pin icon' }}
									customClass={'location-event'}
								/>
							}
						</div>
					)}
				</div>
				{(product.eventVanue || product.eventDate) &&
					<div className='prouct-page-header-info'>
						{!isConsumption && location && (
							<TextCustomItemComponent
								text={get(product, 'business.sumSubBranch') <= 1 ? location : Lang.format('VarietyOfBranches')}
								icon={{ src: require('../../../../assets/icons/pin.svg'), name: Lang.format('Location') }}
							/>
						)}
						{product.eventDate && (
							<TextCustomItemComponent
								text={product.eventDate}
								icon={{ src: require('../../../../assets/icons/calendar.svg'), name: Lang.format('EventDate') }}
							/>
						)}
					</div>
				}

				{product.shortDescription && (
    				<>
        				<div className='prouct-page-header-sub-title'>
            				<CustomHeader
                				headerClassName='prouct-page-header-sub-title-black'
                				text={Lang.format('Short_Description')}
                				type={HeaderType.SubTitle}
            				/>
        				</div>
        				<EditorMessage textClassName={'product-header-page-short-discripton'} message={product.shortDescription} />
    				</>
				)}
				<div>{catergoryType === CategoryType.Show && <ProductPageHeaderAreaAndDate />}</div>
				{product.description != 'אזל המלאי' && (
					<div className='product-header-page-sub-title-varients'>
						<CustomHeader
							text={Lang.format('Order_Tickets')}
							headerClassName='product-header-page-sub-title-varients'
							type={HeaderType.SubTitle}
						/>
					</div>
				)}
				<div className='product-header-varient-titles'>
					<div className={'product-header-varient-title-name'}>{Lang.format('Item')}</div>
					<div className={'product-header-varient-title-price'}>{Lang.format('Price')}</div>
					<div className={'product-header-varient-title-quantity'}>{Lang.format('Amount')}</div>
				</div>
				<div className='product-header-page-varient'>{renderAllVariants(varientsVar, product.categoryType)}</div>
			</div>
			{varientsVar.length > 0 && (
				<div className={`bottom-product-page-cart`}>
					{!isMobile && <div className='product-header-page-cart-sum'>{Lang.format('Total_to_Pay')}: {`${StringFormatUtils.tryConvertToLocaleString(totalPrice)} ₪`}</div>}
					<div className='product-header-page-cart-button'>{renderCartButton()}</div>
				</div>
			)
			}
		</>
	);
}
export default observer(ProductPageHeader);

