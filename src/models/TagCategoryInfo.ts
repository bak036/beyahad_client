import { makeAutoObservable, observable } from 'mobx';
import Category from './Category';

export default class TagCategoryInfo {
	@observable categoryId: number;
	@observable categoryTagSort: number;
	@observable categories: Category;

	constructor(categoryInfo?: any) {
		makeAutoObservable(this);
		if (categoryInfo) {
			this.categoryId = categoryInfo.categoryNumber;
			this.categoryTagSort = categoryInfo.categoryTagSort;
			this.categories = categoryInfo.categories ? categoryInfo.categories.map((x) => new Category(x)) : [];
		} else {
			this.categoryId = 0;
			this.categoryTagSort = 0;
			//this.categories = [];
		}
	}
}
