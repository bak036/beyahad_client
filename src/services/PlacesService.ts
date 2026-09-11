import BaseHTTPService from './BaseHTTPService';
import ClientConfig from '../config';
import {Logger} from 'nofshonit-base-web-client';

class PlacesService extends BaseHTTPService {
	constructor(baseUrl: string) {
		super(baseUrl);
	}

	getAllCities = () => {
		return this.httpGet('/addresses/getCities')
			.then((res) => {
				if (res && res.data && res.data.data) {
					// Order cities by name
					let newResults = res.data.data.sort(function(a, b) {
						return a.cityName.localeCompare(b.cityName);
					});

					return newResults;
				} else {
					return [];
				}
			})
			.catch((err) => {
				Logger.error('get cities faild', err);
				return [];
			});
	};

	getAllStreets = () => {
		return this.httpPost('/addresses/getStreets', {});
	};

	getStreetsByCity = (cityId: number) => {
		const url = '/addresses/getCityStreets' + '?cityid=' + cityId.toString();

		return this.httpGet(url)
		.then((res) =>{
			if (res && res.data && res.data.data) {
				let newResults = res.data.data.sort(function(a, b) {
					return a.streetName.localeCompare(b.streetName);
				});
				return newResults;
			}
		})
		.catch((err) => {
			Logger.error('the fetching for streets error', err);
		});
	};
}

export default new PlacesService(ClientConfig.apiBaseHost);
