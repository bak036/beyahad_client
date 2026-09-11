import {Logger} from 'nofshonit-base-web-client';
import ClientConfig from '../config';
import BaseHTTPService from './BaseHTTPService';

class HomePageService extends BaseHTTPService {
	constructor(baseUrl) {
		super(baseUrl);
	}

	getTopTags = async (tops: number, skipTags: number) => {
		try {
			return await this.httpGet(`/tags/GetCategorysByTopTag?selectTop=${tops}&skipTags=${skipTags}`).then(
				(res) => {
					if (res && res.data) {
						const x = res.data.data
							.filter((tag) => {
								if (tag.tagCategoryInfo) {
									if (tag.tagCategoryInfo.length <= 0) {
										return false;
									}
								} else {
									return false;
								}

								return true;
							})
							.map((tag) => {
								// This is the mapping
								tag.tagCategoryInfo = tag.tagCategoryInfo.filter((objectInTheArray) => {
									if (objectInTheArray && objectInTheArray.categoryId) {
										objectInTheArray.categories.isLeaf = true;
										return true;
									}
									return false;
								});
								return tag;
							});
						return x;
					} else {
						return [];
					}
				}
			);
		} catch (err) {
			Logger.error('err iis ', err);
		}
	};

	GetCategorysByTagID(tagId: number) {

		return this.httpGet(`/tags/GetCategorysByTagID?tagid=${tagId}`).then((res) => {
			if (res && res.data && res.data.data) {
				res.data.data.tagCategoryInfo.map((tag) => {
					tag.categories.isLeaf = true;
					return tag;
				});
				return res.data.data;
			} else {
				return null;
			}
		});
	}
}

export default new HomePageService(ClientConfig.apiBaseHost);
