import { action, computed, IObservableArray, makeAutoObservable, observable, toJS } from 'mobx';
import { Logger } from 'nofshonit-base-web-client';
import Category from '../models/Category';
import CatgoryService from '../services/CatgoryService';
import AuthStore from './AuthStore';
import { BusinessSubType } from '../models/enums';

export default class CategoryStore {
	@observable category: Category | any = new Category();

	@observable productPageCategory: Category = new Category();

	@observable categories: IObservableArray<Category> = observable([]);

	@observable page: number = 1;

	authStore: AuthStore;

	@observable buttonColor: boolean = false;

	@observable caruselImg = undefined;

	constructor(authStore: AuthStore) {
		this.authStore = authStore;
		makeAutoObservable(this);
	}

	@action
	getCategoryById = (Id: string) => {
		return CatgoryService.getCategoryByID(Id)
			.then((res) => {
				this.category = res.data;
				return this.category;
			})
			.catch((err) => {
				Logger.debug(err);
			});
	};

	@action
	isCategoriesImgContainCatId = (Id: string) => {
		const categoriesImg = ['44501', '19119', '18375', '8851', '4627', '1590', '678', '671','8852'];
		let categoriesImgIncludesCatId = false;
		if (Id)
			categoriesImgIncludesCatId = categoriesImg.includes(Id.toString());
		return categoriesImgIncludesCatId;
	};

	@action
	getCategoryProductsByID = (id: string) => {
		return CatgoryService.getCategoryProductsByID(id)
			.then((category: Category) => {
				this.productPageCategory = category;
				return this.productPageCategory;
			})
			.catch((err) => {
				Logger.debug(err);
				throw err;
			});
	};

	@action
	toggleButtonColor = () => {
		this.buttonColor = !this.buttonColor;
	};

	@computed
	get getCurrentCategory() {
		return toJS(this.category) || {};
	}

	@computed
	get getProductPageCategory() {
		return toJS(this.productPageCategory);
	}

	@action
	hasConsumerProduct = (category: Category) => {
		let hasConsumer = false;
		if (category && category.variants) {
			category.variants.forEach((variant) => {
				if (
					variant.businessSubTypeId == BusinessSubType.Consumerism ||
					variant.businessSubTypeId == BusinessSubType.ConsumerismCoupons
				) {
					hasConsumer = true;
				}
			});
		}
		return hasConsumer;
	};
}
