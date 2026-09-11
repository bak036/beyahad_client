import { makeAutoObservable, observable } from 'mobx';

export default class CategoriesLevel {
	@observable id?: number;
	@observable name?: string;

	constructor(categoriesLevel?: any) {
		makeAutoObservable(this);
		if (categoriesLevel) {
			this.id = categoriesLevel.id ? categoriesLevel.id : undefined;
			this.name = categoriesLevel.name ? categoriesLevel.name : '';
		} else {
			this.id = undefined;
			this.name = '';
		}
	}
}
