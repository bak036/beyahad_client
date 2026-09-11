import Category from '../../models/Category';
import Varient from '../../models/Varient';
import Commercial from '../../models/Comercial';
import Tag from '../../models/Tag';
import {CategoryType, QuantityType} from '../../models/enums';
import TagCategoryInfo from '../../models/TagCategoryInfo';
import Breadcrumbs from '../../models/Breadcrumbs';
import CartItem from '../../models/CartItem';
import rootStores from '../../stores';
import {CART_STORE} from '../../consts/stores';
import BreadCrumbs, {Crumbs} from '../../components/CustomComponents/BreadCrumbs/BreadCrumbs';
import {RoutesPath} from '../../consts/RoutesPath';
import EventimEvent from '../../models/EventimEvent';
import Ticket from '../../models/Ticket';
import { IObservableArray } from 'mobx';
import { forEach } from 'lodash';
import Advertisement from 'src/models/Advertisement';
import Lang from 'src/config/Language';
import { toJS } from 'mobx';
import { Variant } from 'react-bootstrap/esm/types';

const dataLayer = window['dataLayer'];


interface AnalyticsDTO {
	tagName?: string;
	tagId?: any;
	categoryInfo?: any;
	name?: string;
	id?: any;
	price?: any;
	brand?: any;
	category?: any;
	list?: string;
	position?: any;
	quantity?: any;
	variant?: any;
	productRevenue?: any;
}


interface AnalyticsCategoriesDTO {
	event?: string;
	ecommerce?: any;
	value? :string;
	shipping? :string;
	transaction_id? :string;
	currency? : string;
}

interface AnalyticsItemDTO {
	item_id?: string;
	item_name?: string;
	price?: string;
	item_category?: string;
	item_category2?: string;
	item_list_name?: string;
	item_list_id?: string;
	index?: string;
	item_category3?: string;
	item_category4?: string;
	item_category5?: string;
	item_category6?: string;
	item_category7?: string;
	item_category8?: string;
	item_category9?: string;
	item_category10?: string;
	item_variant? : string;
	quantity? :string;
	coupon?: string;
	discount? : string;
	promotion_name?: string;
	creative_name?: string;
}

export interface PromoDTO {
	id: number | undefined;
	name: string | undefined;
	creative: string;
	position: string | undefined;
}

class GoogleAnalyticsUtils {
	public onLocationChange = (path) => {
		const data = {
			event: 'Pageview',
			pagePath: path,
			pageTitle: 'ביחד בשבילך',
		};
		dataLayer.onPush(data);
	};

	public impressions = (tagArray: Tag[]) => {
		if (tagArray) {
			const converted = tagArray.map((tag: Tag, tagIndex: number) => this.convertTagToAnalytics(tag, tagIndex));
			const tagConv = [].concat.apply([], converted);
			if (tagConv && tagConv.length > 0) {
				dataLayer.onPush({
					event: 'impressions',
					ecommerce: {
						currencyCode: 'ILS',
						impressions: tagConv,
					},
				});
			}
		}
	};

	public singleImpression = (item, tagIndex) => {
		if (item) {
			const converted = this.convertSingleTagToAnalytics(item, tagIndex);
			const dataObj = {
				event: 'impressions',
				ecommerce: {
					currencyCode: 'ILS',
					impressions: [converted],
				},
			};
			dataLayer.onPush(dataObj);
		}
	};

	public sendProductToAnalytics(categories: any, category: Category,event:string, productJsonForGA? : string,productIndexForGA? : string,
		creativeNameForGA? : string,promotionNameForGA? : string) {
		try{
			if (category) {
				const variants = category.variants;
				let min:any = 0;
				if(category.variants){
					min = category.variants[0].price ? category.variants[0].price : 0;
					for(let index = 0; index < category.variants.length;index++){
						if(category.variants[0].price && category.variants[0].price < min){
							min = category.variants[0].price;
						}
					}
				}
				const converted = this.convertCategoriesArrayToAnalytics(categories, category,event,productJsonForGA,undefined,min,productIndexForGA,creativeNameForGA,promotionNameForGA);
				dataLayer.onPush(converted)
			}
		}catch{

		}
	}


	public clickOnProduct(categories: any, category: Category,isFromHomePage? : boolean,tagName? : string) {
		if (categories && category) {
			const converted = this.convertCategoryToAnalytics(categories, category);
			// dataLayer.onPush(converted)
			dataLayer.onPush({
				event: 'productClick',
				ecommerce: {
					click: {
						actionField: {list: this.getListFromUrl()},
						products: [converted],
					},
				},
			});
		}
	}

	public listOfProducts(categories: any) {
		if (categories) {
			const converted = categories.map((category: Category, index: number) =>
				this.convertCategoryToAnalytics(categories, category)
			);
			dataLayer.onPush({
				ecommerce: {
					currencyCode: 'ILS',
					impressions: converted,
				},
			});
		}
	}


	public clickButtonAnalytics = (event: string, event_category: string,event_action?: string,event_label?: string,type? : string,uid?: string,cc? : string,value? : any) => {
		try{
			let clickButtonAnalyticsObject = {};
			if(event){
				Object.assign(clickButtonAnalyticsObject,{event})
			}
			if(event_category){
				Object.assign(clickButtonAnalyticsObject,{event_category})
			}
			if(event_action){
				Object.assign(clickButtonAnalyticsObject,{event_action})
			}
			if(event_label){
				Object.assign(clickButtonAnalyticsObject,{event_label})
			}
			if(type){
				Object.assign(clickButtonAnalyticsObject,{type})
			}
			if(uid){
				Object.assign(clickButtonAnalyticsObject,{uid})
			}
			if(cc){
				Object.assign(clickButtonAnalyticsObject,{cc})
			}
			if(value){
				Object.assign(clickButtonAnalyticsObject,{value})
			}
			dataLayer.onPush(clickButtonAnalyticsObject)
		} catch {
			console.log('failed push to google analitics')
		}
	}


	// public sendGoogleAnalyticsAfterPaid(res: any){
	// 	const categories = cartStore.getCartForPayment;
	// }

	public details = (category: Category, varientMap: Varient[]) => {
		if (category && varientMap) {
			const converted = this.convertVarientToAnalytics(varientMap[0], category);
			dataLayer.onPush({
				event: 'detail',
				ecommerce: {
					detail: {
						actionField: {list: this.getListFromUrl()},
						products: [converted],
					},
				},
			});
		}
	};

	public detailsEvents = (category: Category, eventMap: EventimEvent[]) => {
		if (category && eventMap) {
			const converted = this.convertEventToAnalytics(eventMap[0], category);
			dataLayer.onPush({
				event: 'detail',
				ecommerce: {
					detail: {
						products: [converted],
					},
				},
			});
		}
	};

	private convertEventsToGoogleAnalytics(category: Category,min : any,event:string, productJsonForGA? : string,productIndexForGA? : string,promotion_name?: string,creative_name?: string){
		let itemsArray : AnalyticsItemDTO[] = [];
		const breadcrumbs = category.breadcrumbs ? category.breadcrumbs : undefined;
		let item : AnalyticsItemDTO = {
			item_id: category.categoryId.toString(),
			item_name: category.categoryName,
			price: min,
			item_category: breadcrumbs ? breadcrumbs[0].name + '_' + breadcrumbs[0].id : undefined,
			item_category2: category.categoryUrl ? 'out_to_vendor' : 'on_site',
			item_list_name: productJsonForGA ? productJsonForGA : '',
			index: productIndexForGA ? productIndexForGA : '1',
			item_category3: category.categoryUrl ? category.categoryUrl : 'on_site',
			quantity : '1',
			item_variant : undefined,
			item_category4: breadcrumbs  && breadcrumbs.length > 1 ? breadcrumbs[0].name : undefined,
			item_category5: breadcrumbs  && breadcrumbs.length > 2 ? breadcrumbs[1].name : undefined,
			item_category6: breadcrumbs  && breadcrumbs.length > 3 ? breadcrumbs[2].name : undefined,
			item_category7: breadcrumbs  && breadcrumbs.length > 4 ? breadcrumbs[3].name : undefined,
			item_category8: breadcrumbs  && breadcrumbs.length > 5 ? breadcrumbs[4].name : undefined,
			item_category9: breadcrumbs  && breadcrumbs.length > 6 ? breadcrumbs[5].name : undefined,
			item_category10: breadcrumbs  && breadcrumbs.length > 7 ? breadcrumbs[6].name : undefined,
			coupon: undefined,
			discount: undefined,
			creative_name: creative_name,
			promotion_name: promotion_name
		};
		itemsArray.push(item);
		
		const items = {items: itemsArray}

		const converted: AnalyticsCategoriesDTO = {
			event: event,
			ecommerce: {
				items: itemsArray,
				currency: 'ILS'
			}
		};
		return converted;
	}

	public sendEventsToAnalytics(category: Category,tickets : Ticket[],event:string, productJsonForGA? : string,productIndexForGA? : string,promotion_name?: string,creative_name?: string) {
	try{
		let min:any = 0;
		const b = toJS(tickets);
		if(tickets && b != null && b.length > 0){
			min = tickets[0].price ? tickets[0].price : 0;
			for(let index = 0; index < tickets.length; index++){
				if(tickets[index].price && tickets[index].price < min){
					min = tickets[index].price;
				}
			}
		}
		const converted = this.convertEventsToGoogleAnalytics(category,min,event,productJsonForGA,productIndexForGA,promotion_name,creative_name);
		dataLayer.onPush(converted);
		}
		catch{

		}
	}

	public convertEventForGA(category: Category,variant : any,productJsonForGA? : string,productIndexForGA? : string
		,creativeNameForGA? : string,promotionNameForGA? : string){
		try{
			let itemsArray : AnalyticsItemDTO[] = [];
			const breadcrumbs = category.breadcrumbs ? category.breadcrumbs : undefined;
			let item : AnalyticsItemDTO = {
				item_id: category.categoryId.toString(),
				item_name: category.categoryName,
				price: variant.price,
				item_category: breadcrumbs ? breadcrumbs[0].name + '_' + breadcrumbs[0].id : undefined,
				item_category2: category.categoryUrl ? 'out_to_vendor' : 'on_site',
				item_list_name: productJsonForGA ? productJsonForGA : '',
				index: productIndexForGA ? productIndexForGA : '1',
				item_category3: category.categoryUrl ? category.categoryUrl : 'on_site',
				quantity : '1',
				item_variant : variant.ticketTypeName,
				item_category4: breadcrumbs  && breadcrumbs.length > 1 ? breadcrumbs[0].name : undefined,
				item_category5: breadcrumbs  && breadcrumbs.length > 2 ? breadcrumbs[1].name : undefined,
				item_category6: breadcrumbs  && breadcrumbs.length > 3 ? breadcrumbs[2].name : undefined,
				item_category7: breadcrumbs  && breadcrumbs.length > 4 ? breadcrumbs[3].name : undefined,
				item_category8: breadcrumbs  && breadcrumbs.length > 5 ? breadcrumbs[4].name : undefined,
				item_category9: breadcrumbs  && breadcrumbs.length > 6 ? breadcrumbs[5].name : undefined,
				item_category10: breadcrumbs  && breadcrumbs.length > 7 ? breadcrumbs[6].name : undefined,
				coupon: undefined,
				discount: undefined,
				creative_name: creativeNameForGA,
				promotion_name: promotionNameForGA
			};
			itemsArray.push(item);
			
			const items = {items: itemsArray}

			const converted: AnalyticsCategoriesDTO = {
				event: 'add_to_cart',
				ecommerce: {
					items: itemsArray,
					currency: 'ILS',
				}
			};
			return JSON.stringify(converted);
		}catch{
			return undefined;
		}
	}

	public convertProductVarForGA(variant: Varient,category: Category,event: string,productJsonForGA? :string,productIndexForGA?: string,creativeNameForGA? : string,promotionNameForGA? : string){
		let itemsArray : AnalyticsItemDTO[] = [];
		const breadcrumbs = category.breadcrumbs ? category.breadcrumbs : undefined;
		let item : AnalyticsItemDTO = {
			item_id: category.categoryId.toString(),
			item_name: category.categoryName,
			price: variant.irgunPrice ? variant.irgunPrice.toString() : undefined,
			item_category: breadcrumbs ? breadcrumbs[0].name + '_' + breadcrumbs[0].id : undefined,
			item_category2: category.categoryUrl ? 'out_to_vendor' : 'on_site',
			item_list_name: productJsonForGA,
			index: productIndexForGA,
			item_category3: category.categoryUrl ? category.categoryUrl : 'on_site',
			quantity : variant.quantity.toString(),
			item_variant : variant.name,
			item_category4: breadcrumbs  && breadcrumbs.length > 1 ? breadcrumbs[0].name : undefined,
			item_category5: breadcrumbs  && breadcrumbs.length > 2 ? breadcrumbs[1].name : undefined,
			item_category6: breadcrumbs  && breadcrumbs.length > 3 ? breadcrumbs[2].name : undefined,
			item_category7: breadcrumbs  && breadcrumbs.length > 4 ? breadcrumbs[3].name : undefined,
			item_category8: breadcrumbs  && breadcrumbs.length > 5 ? breadcrumbs[4].name : undefined,
			item_category9: breadcrumbs  && breadcrumbs.length > 6 ? breadcrumbs[5].name : undefined,
			item_category10: breadcrumbs  && breadcrumbs.length > 7 ? breadcrumbs[6].name : undefined,
			coupon: undefined,
			discount: undefined,
			creative_name: creativeNameForGA,
			promotion_name: promotionNameForGA
		};
		itemsArray.push(item);
		
		const items = {items: itemsArray}

		const converted: AnalyticsCategoriesDTO = {
			event: event,
			ecommerce: {
				items: itemsArray,
				currency: 'ILS'
			}
		};
		
		return JSON.stringify(converted);
	}

	public GetAddToCardConverted(filteredArray: any[], category: Category,productJsonForGA? :string,productIndexForGA?: string
		,creativeNameForGA? : string,promotionNameForGA? : string){
		const converted = this.convertCategoriesArrayToAnalytics(undefined,category,'add_to_cart',productJsonForGA,filteredArray,undefined,productIndexForGA,creativeNameForGA,promotionNameForGA);
		return JSON.stringify(converted);
	}

	public addToCart(filteredArray: any[], category: Category,productJsonForGA? :string,productIndexForGA? :string) {
		try{
			if(filteredArray){
				let itemsArray:  any = [];
				for(let i = 0;i < filteredArray.length;i++){
					if(filteredArray[i].productJsonForGA){
						const productJsonConverted = JSON.parse(filteredArray[i].productJsonForGA);
						const item = productJsonConverted.ecommerce.items[0];
						itemsArray.push(item);
					}
				}
				
			
				const items = {items: itemsArray}
	
				const converted: AnalyticsCategoriesDTO = {
					event: 'add_to_cart',
					ecommerce: {
						items: itemsArray,
						currency: 'ILS',
					}
				};
				//const converted = this.convertCategoriesArrayToAnalytics(undefined,category,'add_to_cart',productJsonForGA,filteredArray,undefined,productIndexForGA);
				dataLayer.onPush(converted)
			}
		}catch{

		}
	}

	public userLoggedIn(memberCardNumber: string) {
		dataLayer.onPush({
			userId: memberCardNumber,
			propertyType: isMobile() ? 'app' : 'website',
			event: 'login',
		});

		function isMobile() {
			if (
				navigator.userAgent.match(/Android/i) ||
				navigator.userAgent.match(/webOS/i) ||
				navigator.userAgent.match(/iPhone/i) ||
				navigator.userAgent.match(/iPad/i) ||
				navigator.userAgent.match(/iPod/i) ||
				navigator.userAgent.match(/BlackBerry/i) ||
				navigator.userAgent.match(/Windows Phone/i) ||
				navigator.userAgent.match(/Opera Mini/i)
			) {
				return true;
			}
			return false;
		}
	}

	public addEventToCart(reservationBodyConverted,isMap : boolean) {
		try{
			let itemsArray : AnalyticsItemDTO[] = [];
			if(isMap){
				if(reservationBodyConverted && reservationBodyConverted.ListOfSeats){
					for(let i = 0; i < reservationBodyConverted.ListOfSeats.length;i++){
						if(reservationBodyConverted.ListOfSeats[i].productJsonForGA){
							const productJsonForGAConverted = JSON.parse(reservationBodyConverted.ListOfSeats[i].productJsonForGA);
							itemsArray.push(productJsonForGAConverted.ecommerce.items[0]);
						}
					}
				}
			}
			else{
				if(reservationBodyConverted){
					for(let i = 0; i < reservationBodyConverted.length;i++){
						if(reservationBodyConverted[i].productJsonForGA){
							const productJsonForGAConverted = JSON.parse(reservationBodyConverted[i].productJsonForGA);
							itemsArray.push(productJsonForGAConverted.ecommerce.items[0]);
						}
					}
				}
			}
			const items = {items: itemsArray}
			const converted: AnalyticsCategoriesDTO = {
				event: 'add_to_cart',
				ecommerce: {
					items: itemsArray,
					currency: 'ILS'
				},
				
			};
			dataLayer.onPush(converted);
		}catch{

		}
	}

	public remove(varient: Varient,categories : CartItem[]) {
		try
		{
		if (varient) {
			let categoryIndex;
			categories.forEach((category: CartItem, index: number) => {
				if (category['variant']) {
					if (category['variant'].barCode === varient.barCode) {
						categoryIndex = index;
					}
				}
			});
			if (categoryIndex !== undefined) {
				let cartItem = categories[categoryIndex];
				const converted = this.convertCategoriesCartArrayToAnalytics(varient, cartItem);
				dataLayer.onPush(converted);
			}
		}
		}
		catch{

		}
	}

	public sendShopingBasketDetailsToAnalytics(event:string,categories : CartItem[]) {
		try{
			//const categories = cartStore.getCartForPayment;
			let itemsArray : any[] = [];
			if(categories){
				for(let index = 0; index < categories.length;index++){
				const productJsonArrTickets = categories[index]['tickets'];
				if(productJsonArrTickets){
					for(let i = 0;i < productJsonArrTickets.length;i++){
						if(productJsonArrTickets[i].productJsonForGA){
							const jsonConverted = JSON.parse(productJsonArrTickets[i]['productJsonForGA'])
							itemsArray.push(jsonConverted.ecommerce.items[0])
						}
					}
				}
				else{
					const productJsonArrVars = categories[index];
					if(productJsonArrVars && productJsonArrVars.productJsonForGA){
							const jsonConverted = JSON.parse(productJsonArrVars['productJsonForGA'])
							itemsArray.push(jsonConverted.ecommerce.items[0])
						}	
					}
				}
			}
			const items = {items: itemsArray}

			if(itemsArray.length > 0){
			const converted: AnalyticsCategoriesDTO = {
				event: event,
				ecommerce: {
					items: itemsArray,
					currency: 'ILS',
				}
			};
			//const converted = this.convertCategoriesCartShopingBasketArrayToAnalytics(categories,event);
			dataLayer.onPush(converted);
		}
		}catch{

		}
	}

	public removeCartItem(cartItem: CartItem) {
		if (cartItem) {
			const tickets = cartItem.tickets;
			if(tickets){
				let itemsArray : AnalyticsItemDTO[] = [];
				for(let i = 0; i < tickets.length; i++){
					if(tickets[i].productJsonForGA){
						const productConverted = JSON.parse(tickets[i].productJsonForGA)
						itemsArray.push(productConverted.ecommerce.items[0])
					}
				}
				const items = {items: itemsArray}
				const converted: AnalyticsCategoriesDTO = {
					event: 'remove_from_cart',
					ecommerce: {
						items: itemsArray,
						currency: 'ILS',
					}
				};
				dataLayer.onPush(converted);
			}
		}
	}

	public checkoutStepOne(cart: any) {
		if (cart) {
			const converted: AnalyticsDTO[] = cart.map((cartItem: CartItem) => this.convertCartToAnalytics(cartItem));
			let obj = {
				event: 'checkout',
				ecommerce: {
					checkout: {
						actionField: {step: 1},
						products: this.flatten(converted),
					},
				},
			};
			dataLayer.onPush(obj);
		}
	}

	flatten = (list) => list.reduce((a, b) => a.concat(Array.isArray(b) ? this.flatten(b) : b), []);

	public checkoutStepTwo(cart: any) {
		if (cart) {
			const converted = cart.map((cartItem: CartItem) => this.convertCartToAnalytics(cartItem));
			let obj = {
				event: 'checkout',
				ecommerce: {
					checkout: {
						actionField: {step: 2},
						products: this.flatten(converted),
					},
				},
			};
			dataLayer.onPush(obj);
		}
	}

	public onLoadCard(cardNumber: string, sum: number | string) {
		const cardNumberAsUserId = cardNumber ? cardNumber.trim() : '';
		const loadCardObject = {
			event: 'loadValue',
			userId: cardNumberAsUserId,
			loadValue: sum.toString(),
		};
		dataLayer.onPush(loadCardObject);
	}

	public sendTagsAnalyticsHomePage(tag : Tag[],from?: any){
		try{
			const tagsArrayToAnalytics = this.convertTagsArrayToAnalytics(tag,from);
			for(let index = 0;index < tagsArrayToAnalytics.length;index++){
				dataLayer.onPush(tagsArrayToAnalytics[index]);
			}
		}catch {
			
		}
	}

	public onPurchaseComplete(coupon: string, cart: any, sum: number, orderId: any,cartForPayment?: any) {
		try{
			let itemsArray : any[] = [];
			if(cartForPayment && cartForPayment.length > 0){
				for(let i = 0;i < cartForPayment.length;i++){
					if(cartForPayment[i].tickets){
						for(let index = 0; index < cartForPayment[i].tickets.length;index++){
							if(cartForPayment[i].tickets[index].productJsonForGA){
								const productJsonForGAConverted = JSON.parse(cartForPayment[i].tickets[index].productJsonForGA);
								itemsArray.push(productJsonForGAConverted.ecommerce.items[0]);
							}
						}
					}
					else if(cartForPayment[i].productJsonForGA){
						const productJsonForGAConverted = JSON.parse(cartForPayment[i].productJsonForGA);
						itemsArray.push(productJsonForGAConverted.ecommerce.items[0]);
					}
				}
				const items = {items: itemsArray}
				if(itemsArray.length > 0){
				const converted: AnalyticsCategoriesDTO = {
				event: 'purchase',
				ecommerce: {
					items: itemsArray,
					currency: 'ILS',
					shipping: '0',
					transaction_id: orderId,
					value: sum.toString()
				}
				};
				dataLayer.onPush(converted);
			}
		}
		}catch{

		}
	}

	private isUrlHist(url: string){
		if(url.includes('hist')){
			const arr = url.split('/');
			return arr[arr.length - 1].toString();
		}
		return undefined;
	}

	private converPromoClick = (commercial: any, position: any) => {
		let itemsArray : AnalyticsItemDTO[] = [];
		
		const item : AnalyticsItemDTO = {
			item_id : commercial.messageKey,
			item_name : commercial.messageName,
			coupon: undefined,
			discount: undefined,
			index: position,
			price: '0',
			quantity: '1',
			item_category: undefined,
			item_category4: undefined,
			item_category5: undefined,
			item_category6: undefined,
			item_category7: undefined,
			item_category8: undefined,
			item_category9: undefined,
			item_category10: undefined,
			item_list_name : Lang.format('HomePage')
		}
		itemsArray.push(item);
	
		const converted = {
			event: 'select_promotion',
			ecommerce : {
				creative_name: 'banner',
				promotion_name : 'HomePageBanner',
				currency: 'ILS',
				items : itemsArray
			}
		}
		return converted;
	};

	private converAnalyticsBanner = (imagesSlider: Advertisement[] | any,event: string) => {
		let itemsArray : AnalyticsItemDTO[] = [];

		for(let index = 0;index < imagesSlider.length;index++){
			const u = this.isUrlHist(imagesSlider[index].link);
			const item : AnalyticsItemDTO = {
				item_id : u ? u : undefined,
				item_name : imagesSlider[index].alt,
				coupon: undefined,
				discount: undefined,
				index: imagesSlider[index].sortOrder,
				price: '0',
				quantity: '1',
				item_category: undefined,
				item_category2: u ? 'on_site' :  'out_to_vendor',
				item_category3: u ? undefined : imagesSlider[index].link,
				item_category4: undefined,
				item_category5: undefined,
				item_category6: undefined,
				item_category7: undefined,
				item_category8: undefined,
				item_category9: undefined,
				item_category10: undefined,
				item_list_name : Lang.format('HomePage')
			}
			itemsArray.push(item);
		}
		const converted = {
			event: event,
			ecommerce : {
				creative_name: 'banner',
				promotion_name : 'HomePageBanner',
				currency: 'ILS',
				items : itemsArray
			}
		}
		return converted;
	};

	public sendAnalyticsResultProducts(categorys: any,from? : any){
		try{
		if(categorys){
		const itemsArray : AnalyticsItemDTO[] = [];
		for(let index = 0; index < categorys.length;index++){
			const breadcrumbs = categorys[index].breadcrumbs ? categorys[index].breadcrumbs : undefined;
			let item : AnalyticsItemDTO = {
				item_id: categorys[index].categoryId,
				item_name: categorys[index].categoryName,
				price: categorys[index].price ? '' + categorys[index].price : '0',
				item_category: undefined,
				item_category2: categorys[index].categoryUrl ? 'out_to_vendor' : 'on_site',
				item_list_name: from,
				index: index.toString(),
				item_category3: categorys[index].categoryUrl ? categorys[index].categoryUrl : 'on_site',
				quantity : '1',
				item_variant : undefined,
				item_category4: breadcrumbs  && breadcrumbs.length > 1 ? breadcrumbs[0].name : undefined,
				item_category5: breadcrumbs  && breadcrumbs.length > 2 ? breadcrumbs[1].name : undefined,
				item_category6: breadcrumbs  && breadcrumbs.length > 3 ? breadcrumbs[2].name : undefined,
				item_category7: breadcrumbs  && breadcrumbs.length > 4 ? breadcrumbs[3].name : undefined,
				item_category8: breadcrumbs  && breadcrumbs.length > 5 ? breadcrumbs[4].name : undefined,
				item_category9: breadcrumbs  && breadcrumbs.length > 6 ? breadcrumbs[5].name : undefined,
				item_category10: breadcrumbs  && breadcrumbs.length > 7 ? breadcrumbs[6].name : undefined,
				coupon: undefined,
				discount: undefined
			};
			itemsArray.push(item);
			}

			const items = {items: itemsArray}

			const converted: AnalyticsCategoriesDTO = {
				event: 'view_item_list',
				ecommerce: items,
				currency: 'ILS',
			};
			dataLayer.onPush(converted);
			
			}
			}catch{
				
		}

	}

	public sendAnalyticsBanner(imagesSlider: Advertisement[] | any,event: string){
		try{
			const converted = this.converAnalyticsBanner(imagesSlider,event);
			dataLayer.onPush(converted);
		}catch{

		}
	}

	public onPromoView = (commercial: any, position: string | undefined = undefined) => {
		const promo = this.convertCommercialToAnalyticsProduct(commercial, position);
		const promoObject = {
			event: 'promoView',
			ecommerce: {
				promoView: {
					promotions: [promo],
				},
			},
		};
		//dataLayer.onPush(promoObject);
	};

	public onPromoClick = (commercial: any, position: string | undefined = undefined) => {
		try
		{
			const promo = this.converPromoClick(commercial, position);
			dataLayer.onPush(promo);
		}
		catch
		{

		}
	};

	convertCommercialToAnalyticsProduct = (commercial: Commercial, position: string | undefined = undefined) => {
		if (commercial) {
			const promoDTO: PromoDTO = {
				id: commercial.messageKey && commercial.messageKey, // ID or Name is required.
				name: position,
				creative: commercial.messageName && commercial.messageName,
				position: position, //Popup or On the page
			};
			return promoDTO;
		} else {
			return {};
		}
	};
	
	private convertSingleTagToAnalytics(item, tagIndex): AnalyticsDTO {
		const innerCategory: AnalyticsDTO = {
			name: item.categories.categoryName,
			id: item.categoryId,
			brand: item.categories.supplierName,
			category: item.categories.breadCrumbs ? item.categories.breadCrumbs!.map((e) => e.name).join('/') : '/',
			list: this.getListFromUrl(),
			position: [{tagNum: tagIndex, index: item.categoryTagSort}],
		};

		return innerCategory;
	}

	private convertTagToAnalytics(tag: Tag, tagIndex: number): AnalyticsDTO[] {
		const converted: AnalyticsDTO[] = [];
		for (let i = 0; i < tag.tagCategoryInfo.length; i++) {
			if (tag && tag.tagCategoryInfo && tag.tagCategoryInfo[i].categories) {
				const innerCategory = {
					name: tag.tagCategoryInfo[i].categories.categoryName,
					id: tag.tagCategoryInfo[i].categoryId,
					brand: tag.tagCategoryInfo[i].categories.supplierName,
					category: tag.tagCategoryInfo[i].categories.breadcrumbs
						? tag.tagCategoryInfo[i].categories.breadcrumbs!.map((e) => e.name).join('/')
						: '/',
					list: this.getListFromUrl(),
					position: [{tagNum: tagIndex, index: i}],
				};
				converted.push(innerCategory);
			}
		}
		return converted;
	}
	private convertCategoryToAnalytics(categories: any, category: Category): AnalyticsDTO {
		const breadcrumbs = this.getBreadCrumbs(category);
		const converted: AnalyticsDTO = {
			name: category.categoryName,
			id: category.categoryId,
			brand: category.supplierName,
			category: breadcrumbs,
			position: categories instanceof Array ? categories.indexOf(category) : category['sortOrder'],
		};
		return converted;
	}

	private convertEventToAnalytics(event: EventimEvent, category: Category): AnalyticsDTO {
		const converted: AnalyticsDTO = {
			name: category.categoryName,
			id: category.categoryId,
			brand: category.supplierName,
			category: category.breadcrumbs ? category.breadcrumbs!.map((e) => e.name).join('/') : '/',
			variant: event ? event.name : '',
		};
		return converted;
	}
	private convertVarientToAnalytics(varient: Varient, category: Category): AnalyticsDTO {
		const converted: AnalyticsDTO = {
			name: category.categoryName,
			id: category.categoryId,
			price: varient.irgunPrice ? varient.irgunPrice.toString() : '',
			brand: category.supplierName,
			category: category.breadcrumbs ? category.breadcrumbs!.map((e) => e.name).join('/') : '/',
			variant: varient.name,
		};
		return converted;
	}

	private convertTagsArrayToAnalytics(tags: Tag[],from?: any) : any{
		let itemsArray : AnalyticsItemDTO[] = [];
		for(let index = 0; index < tags.length; index++){
			for(let index2 = 0; index2 < tags[index].tagCategoryInfo.length;index2++){
				let item : AnalyticsItemDTO = {
					item_id: tags[index].tagCategoryInfo[index2].categoryId.toString(),
					item_name: tags[index].tagCategoryInfo[index2].categories.categoryName,
					price: tags[index].tagCategoryInfo[index2].categories.price ? '' + tags[index].tagCategoryInfo[index2].categories.price : '0',
					item_category: undefined,
					item_category2: tags[index].tagCategoryInfo[index2].categories.categoryUrl ? 'out_to_vendor' : 'on_site',
					item_list_name: from + ' - '  + tags[index].tagName,
					index: tags[index].tagCategoryInfo[index2].categoryTagSort.toString(),
					item_category3: tags[index].tagCategoryInfo[index2].categories.categoryUrl ? tags[index].tagCategoryInfo[index2].categories.categoryUrl : 'on_site',
					quantity : '1',
					item_variant : undefined,
					item_category4: undefined,
					item_category5: undefined,
					item_category6: undefined,
					item_category7: undefined,
					item_category8: undefined,
					item_category9: undefined,
					item_category10: undefined,
					coupon: undefined,
					discount: undefined
				};
				itemsArray.push(item);
			}
		}

		const arrayConverted: any = [];

		while(itemsArray.length > 0){
			const items = {items: itemsArray.splice(0,180)}

			const converted: AnalyticsCategoriesDTO = {
				event: 'view_item_list',
				ecommerce: {
					items: itemsArray.splice(0,180),
					currency: 'ILS',
				}
			};
			arrayConverted.push(converted)
		}
		return arrayConverted;
	}

	private convertCategoriesArrayToAnalytics(categories: any, category: Category,event:string,productJsonForGA? : string,filteredArray?: any[],price?: any,productIndexForGA? :any
		,creativeNameForGA? : string,promotionNameForGA? : string) : AnalyticsCategoriesDTO{
		let itemsArray : AnalyticsItemDTO[] = [];
		const breadcrumbs = category.breadcrumbs ? category.breadcrumbs : undefined;
		let item : AnalyticsItemDTO = {
			item_id: category.categoryId.toString(),
			item_name: category.categoryName,
			price: filteredArray ? filteredArray[0].irgunPrice : price,
			item_category: breadcrumbs ? breadcrumbs[0].name + '_' + breadcrumbs[0].id : undefined,
			item_category2: category.categoryUrl ? 'out_to_vendor' : 'on_site',
			item_list_name: productJsonForGA,
			index: productIndexForGA,
			item_category3: category.categoryUrl ? category.categoryUrl : 'on_site',
			quantity : filteredArray ? filteredArray[0].quantity : '1',
			item_variant : filteredArray ? filteredArray[0].name : undefined,
			item_category4: breadcrumbs  && breadcrumbs.length > 1 ? breadcrumbs[0].name : undefined,
			item_category5: breadcrumbs  && breadcrumbs.length > 2 ? breadcrumbs[1].name : undefined,
			item_category6: breadcrumbs  && breadcrumbs.length > 3 ? breadcrumbs[2].name : undefined,
			item_category7: breadcrumbs  && breadcrumbs.length > 4 ? breadcrumbs[3].name : undefined,
			item_category8: breadcrumbs  && breadcrumbs.length > 5 ? breadcrumbs[4].name : undefined,
			item_category9: breadcrumbs  && breadcrumbs.length > 6 ? breadcrumbs[5].name : undefined,
			item_category10: breadcrumbs  && breadcrumbs.length > 7 ? breadcrumbs[6].name : undefined,
			coupon: undefined,
			discount: undefined,
			creative_name : creativeNameForGA,
			promotion_name : promotionNameForGA
		};
		itemsArray.push(item);
		
		const items = {items: itemsArray}

		const converted: AnalyticsCategoriesDTO = {
			event: event,
			ecommerce: {
				items: itemsArray,
				currency: 'ILS'
			}
		};
		return converted;
	}
	
	private convertCategoriesCartArrayToAnalytics(varient: Varient, cartItem: CartItem) : AnalyticsCategoriesDTO{
		let itemsArray : AnalyticsItemDTO[] = [];
		const productJsonForGA = JSON.parse(cartItem.productJsonForGA);
		let item : AnalyticsItemDTO = {
			item_id: cartItem.categoryId.toString(),
			item_name: cartItem['categoryName'],
			price: varient.irgunPrice ? varient.irgunPrice.toString(): '0',
			item_category: undefined,
			item_category2: undefined,
			item_list_name: cartItem ? productJsonForGA.ecommerce.items[0].item_list_name : '',
			item_list_id: 'listid1',
			index: '0',
			item_category3: undefined,
			quantity : varient.quantity.toString(),
			item_variant : varient.name,
			item_category4:productJsonForGA.ecommerce.items[0].item_category4,
			item_category5: productJsonForGA.ecommerce.items[0].item_category5,
			item_category6: productJsonForGA.ecommerce.items[0].item_category6,
			item_category7: productJsonForGA.ecommerce.items[0].item_category7,
			item_category8: productJsonForGA.ecommerce.items[0].item_category8,
			item_category9: productJsonForGA.ecommerce.items[0].item_category9,
			item_category10: productJsonForGA.ecommerce.items[0].item_category10,
			coupon: undefined,
			discount: undefined
		};
		itemsArray.push(item);

		const items = {items: itemsArray}

		const converted: AnalyticsCategoriesDTO = {
			event: 'remove_from_cart',
			ecommerce: {
				items: itemsArray,
				currency: 'ILS'
			}
		};
		return converted;
	}
	
	private convertCartToAnalytics(cartItem: CartItem): AnalyticsDTO[] {
		try {
			let variants: any = [];
			let productRevenue = 0;
			if (cartItem.variants) {
				for (let i = 0; i < cartItem.variants.length; i++) {
					const currentVariant = cartItem.variants[i];
					if (currentVariant) {
						const innerCategory = {
							name: currentVariant.name ? currentVariant.name : '',
							id: currentVariant.id ? currentVariant.id : '',
							price: currentVariant.irgunPrice ? currentVariant.irgunPrice : 0,
							quantity: currentVariant.quantity ? currentVariant.quantity : 0,
						};
						productRevenue += innerCategory.price;
						variants.push(innerCategory);
					}
				}
			}
			// Convert Tickets to Variants Array
			if (!cartItem.variants && cartItem.tickets) {
				let {variants: ticketVariants, productRevenue: newProductRevenue} = this.convertTicketsToVariantsArray(
					cartItem
				);
				variants = ticketVariants;
				productRevenue += variants.price;
				variants = variants.map((v) => {
					v.quantity = 1;
					return v;
				});
			}

			let convertedArray: AnalyticsDTO[] = [];
			variants &&
				variants.forEach((v) => {
					let converted: AnalyticsDTO = {
						name: this.valueOrDefault(cartItem.name, ''),
						id: this.valueOrDefault(cartItem.categoryId, 0),
						brand: this.valueOrDefault(cartItem.supplierName, ''),
						category: this.valueOrDefault(v.categoryName, ''),
						price: this.valueOrDefault(v.price, 0),
						variant: this.valueOrDefault(v.name, ''),
						quantity: this.valueOrDefault(v.quantity, 0),
					};
					convertedArray.push(converted);
				});

			return convertedArray;
		} catch (error) {
			console.log('Google Analytics Error at convertCartToAnalytics');
		}
		return [];
	}

	valueOrDefault = (value: any, other: any) => {
		return value ? value : other;
	};

	convertTicketsToVariantsArray = (cartItem) => {
		const variants: any = [];
		let productRevenue = 0;
		if (!cartItem.variants && cartItem.tickets) {
			for (let i = 0; i < cartItem.tickets.length; i++) {
				const variant = cartItem.tickets[i];
				if (variant) {
					const name =
						variant.ticketTypeName && variant.priceLevelName
							? variant.priceLevelName + ' ' + variant.ticketTypeName
							: '';
					const innerCategory = {
						name: name,
						id: variant.orderTicketId ? variant.orderTicketId : '',
						price: variant.price ? variant.price : 0,
						quantity: variant.quantity ? variant.quantity : 0,
					};
					productRevenue += innerCategory.price;
					variants.push(innerCategory);
				}
			}
		}
		return {variants, productRevenue};
	};

	public getListFromUrl = () => {
		let homePage = 'דף הבית';
		if (location.href.indexOf('productPage') != -1) {
			return `${homePage}/דף הטבה/${location.href.substring(location.href.lastIndexOf('/') + 1)}`;
		}
		if (location.href.indexOf('lobby') != -1) {
			return `${homePage}/לובי/${location.href.substring(location.href.lastIndexOf('/') + 1)}`;
		}
		// if (location.hostname == )

		return homePage;
	};
	public getBreadCrumbs = (product: Category) => {
		if (product) {
			// Render BreadCrumbs based on url
			let crumbsRoute: Crumbs[] = [];
			crumbsRoute.push(new Crumbs('דף הבית', RoutesPath.root));

			if (product.breadcrumbs) {
				for (let i = 0; i < product.breadcrumbs.length; i++) {
					if (product.breadcrumbs[i]) {
						if (i === product.breadcrumbs.length - 1) {
							crumbsRoute.push(
								new Crumbs(
									product.breadcrumbs[i].name,
									`${RoutesPath.category.rootProducts}/${product.breadcrumbs[i].id}`
								)
							);
						} else
							crumbsRoute.push(
								new Crumbs(product.breadcrumbs[i].name, `${RoutesPath.category.rootLobby}/${product.breadcrumbs[i].id}`)
							);
					}
				}
			}
			return crumbsRoute.map((e) => e.routeDisplayName).join('/');
		} else {
			return '/';
		}
	};
}
export default new GoogleAnalyticsUtils();
