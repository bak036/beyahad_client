import {action, computed, IObservableArray, makeAutoObservable, observable, toJS} from 'mobx';
import Category from '../models/Category';
import Tag from '../models/Tag';
import HomePageService from '../services/HomePageService';
import AuthStore from './AuthStore';
import NofhonitConfigurationLoader from '../utils/NofhonitConfigurationLoader';
import {Logger} from 'nofshonit-base-web-client';

export default class HomePageStore {
	@observable tags: IObservableArray<Tag> = observable([]);

	@observable categories: IObservableArray<Category> = observable([]);

	@observable tag: Tag = new Tag();

	authStore: AuthStore;

	@observable tops: number;

	@observable searchPageNumber: number = 1;

	constructor(authStore: AuthStore) {
		this.authStore = authStore;
		makeAutoObservable(this);
	}

	@action
	async init() {
		try {
			const configs = await NofhonitConfigurationLoader.loadConfiguration();
			this.tops = configs.numberofselectTop;
		} catch (err) {
			Logger.error('err iis ', err);
		}
	}

	@action
	getTopTags = async (tags: number, skipTags: number = 0) => {
		try {
			return await HomePageService.getTopTags(tags, skipTags).then((res) => {
				if (res) {
					this.tags.replace(res);
				}
			});
		} catch (err) {
			Logger.error('err iis ', err);
		}
	};

	@action
	clearTags = () => {
		this.tags.clear();
	};

	@action
	GetCategorysByTagID = (tagId: number) => {
		return HomePageService.GetCategorysByTagID(tagId).then((res) => {
			if (res) {
				this.tag = res;
			}
		});
	};

	@computed
	get getTags() {
		return toJS(this.tags);
	}

	@computed
	get getTag() {
		return toJS(this.tag);
	}
}
