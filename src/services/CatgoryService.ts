import {categoryEvent} from './CategoriesMock1';
import {Logger} from 'nofshonit-base-web-client';
import ClientConfig from '../config';
import CategoryDTO from '../dto/CategoryDTO';
import Category from '../models/Category';
import BaseHTTPService from './BaseHTTPService';
import EventimEvent from '../models/EventimEvent';
import Varient from '../models/Varient';
import ErrorUtils from '../utils/errorHandling/ErrorUtils';
import * as _ from 'lodash';

class CategoryService extends BaseHTTPService {
	constructor(baseUrl: string) {
		super(baseUrl);
	}

	async getCategoryByID(categoryId: string) {
		try {
			const res = await this.httpGet(`/category/GetCategoryById?categoryId=${categoryId}`);
			if (res && res.status) {
				const category = res.data;
				return category;
			}
			throw new Error('Error in response from getCategoryByID');
		} catch (err) {
			Logger.error(`error in getCategoryByID`, err);
			throw err;
		}
	}

	async getCategoryProductsByID(categoryId: string) {
		try {
			let outOfStockArray: Varient[] = [];
			let onSaleArray: Varient[] = [];
			let varientsArray: Varient[] = [];
			let tempArray: Varient[] = [];
			const res = await this.httpGet(`/category/GetCategoryProducts?categoryId=${categoryId}`);


			// Extract the error of product page
			const error = ErrorUtils.extractError(res);
			if (error) {
				throw error;
			}
			if (res && res.data && res.status) {
				const category = res.data.data;

				if (!category.isEvents) {
					for (let i = 0; i < category.variants.length; i++) {
						if (category.variants[i].isCampaign) {
							onSaleArray.push(category.variants[i]);
						} else {
							varientsArray.push(category.variants[i]);
						}
					}
					tempArray = onSaleArray.concat(varientsArray);
					varientsArray = [];
					for (let i = 0; i < tempArray.length; i++) {
						if (tempArray[i].isEmpty) {
							outOfStockArray.push(category.variants[i]);
						} else {
							varientsArray.push(category.variants[i]);
						}
					}
					category.variants = [];
					category.variants = varientsArray.concat(outOfStockArray);
				}
				return new Category(category);
			}
			throw new Error('no data in "res" of "GetCategoryProducts"');
		} catch (err) {
			Logger.error(`error in getCategoryProductsByID`, err);
			throw err;
		}
	}

	async getCategoryProductsById_WithDTO(categoryId: string) {
		return this.httpGet(`/category/GetCategoryProducts?categoryId=${categoryId}`).then((res) => {
			const error = ErrorUtils.extractError(res);
			if (error) {
				throw error;
			}
			// When no error field, return the data from the response
			if (res && res.data && res.data.data) {
				const categoryDTO: CategoryDTO = res.data.data;
				return Category.convertFromCategoryDTO(categoryDTO);
			} else {
				throw new Error('Response data not found');
			}
		});
	}

	async GetAutoCompleteResults(text: string, selectTop: number) {
		try {
			text = encodeURIComponent(text);
			const res = await this.httpGet(`/search/GetAutoCompleteResults?selectTop=${selectTop}&text=${text}`);
			if (res && res.status) {
				var filterArray: any = _.uniqBy(res.data.data, 'categoryName');
				return filterArray;
			}
			throw new Error('Error in response from getCategoryProductsByID');
		} catch (err) {
			Logger.error(`error in getCategoryProductsByID`, err);
			throw err;
		}
	}

	async GetSearchData(text?: string, selectTop?: number, superCategory?: number, region?: string) {
		if (selectTop === undefined) {
			selectTop = 10;
		}
		if (text === undefined) {
			text = '';
		}
		if (region === undefined) {
			region = '';
		}
		if (superCategory === undefined) {
			superCategory = -1;
		}
		try {
			text = encodeURIComponent(text);
			const res = await this.httpGet(
				`/search/GetSearchData?selectTop=${selectTop}&text=${text}&superCategory=${superCategory}&region=${region}`
			);
			if (res && res.status) {
				const searchData = res.data;
				return searchData;
			}
			throw new Error('Error in response from getCategoryProductsByID');
		} catch (err) {
			Logger.error(`error in getCategoryProductsByID`, err);
			throw err;
		}
	}

	async initCategoriesForMenu() {
		return this.httpGet('/category/GetCategoryHeader').then((res) => {
			if (res && res.status && res.data && res.data.data) {
				const categories = res.data.data;
				return categories;
			}
			return [];
		});
	}
}

export default new CategoryService(ClientConfig.apiBaseHost);
