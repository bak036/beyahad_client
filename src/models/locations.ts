import {makeAutoObservable, observable} from 'mobx';

export default class Locations {
	@observable address?: string;

	@observable phone?: string;

	@observable regionId?: string;

	@observable regionName?: number;

	@observable friendlyName?: string;

	@observable cityId?: number;

	@observable cityName?: string;

	@observable openHours?: string;

	@observable businessModeId?: number;

	@observable businessModeName?: string;

	@observable businessUniqueNumber?: number;

	@observable businessTaxName?: string;

	@observable gpsPointer_Lat?: number;

	@observable gpsPointer_Lon?: number;

	constructor(location?: any) {
		makeAutoObservable(this);
		if (location) {
			this.address = location.address ? location.address : '';
			this.phone = location.phone ? location.phone : '';
			this.regionId = location.regionId ? location.regionId : 0;
			this.friendlyName = location.friendlyName ? location.friendlyName : '';
			this.cityId = location.cityId ? location.cityId : 0;
			this.cityName = location.cityName ? location.cityName : '';
			this.openHours = location.openHours ? location.openHours : '';
			this.businessModeId = location.businessModeId ? location.businessModeId : 0;
			this.businessModeName = location.businessModeName ? location.businessModeName : '';
			this.businessUniqueNumber = location.businessUniqueNumber ? location.businessUniqueNumber : 0;
			this.businessTaxName = location.businessTaxName ? location.businessTaxName : '';
			this.gpsPointer_Lat = location.gpsPointer_Lat ? location.gpsPointer_Lat : '';
			this.gpsPointer_Lon = location.gpsPointer_Lon ? location.gpsPointer_Lon : '';
		} else {
			this.address = '';
			this.phone = '';
			this.regionId = '';
			this.friendlyName = '';
			this.cityId = 0;
			this.cityName = '';
			this.openHours = '';
			this.businessModeId = 0;
			this.businessModeName = '';
			this.businessUniqueNumber = 0;
			this.businessTaxName = '';
		}
	}
}
