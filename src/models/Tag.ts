import { observable, action, makeAutoObservable } from 'mobx';
import Category from './Category';
import TagCategoryInfo from './TagCategoryInfo';

export default class Tag {
	tagId: number;
	@observable tagName: string = '';
	@observable tagCategoryInfo: TagCategoryInfo[] = [];
	@observable isFilterEnabled: boolean = false;
	@observable filterParameters: string | Set<number> | number[] = [];
	@observable prices: number[] = [];
	@observable cityIds: number[] = [];
	@observable regionIds: number[] = [];
	@observable dateRanges: Array<{ startDate: string | Date; endDate: string | Date }> = [];

	constructor(tag?: any) {
		makeAutoObservable(this);
		if (tag) {
			this.tagId = tag.tagId;
			this.tagName = tag.tagName;
			this.tagCategoryInfo =
				tag.tagCategoryInfo && Array.isArray(tag.tagCategoryInfo)
					? tag.tagCategoryInfo.map((x) => new TagCategoryInfo(x))
					: [];
			this.isFilterEnabled = tag.isFilterEnabled === true;
			this.filterParameters = tag.filterParameters || [];
			this.prices = tag.prices || [];
			this.cityIds = tag.cityIds || [];
			this.regionIds = tag.regionIds || [];
			this.dateRanges = tag.dateRanges || [];
		} else {
			this.tagId = -1;
			this.tagName = '';
			this.tagCategoryInfo = [];
			this.isFilterEnabled = false;
			this.filterParameters = [];
			this.prices = [];
			this.cityIds = [];
			this.regionIds = [];
			this.dateRanges = [];
		}
	}
}