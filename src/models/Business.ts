import { observable } from 'mobx';

export default class Business {
	@observable name?: string;
	@observable address?: string;
	@observable cityId?: number;
	@observable streetNumber?: number;
	@observable phone?: string;
	@observable imgUrl?: string;
	@observable parking?: string;
	@observable crippleAccess?: string;
	@observable toilet?: string;
	@observable restaurant?: string;
	@observable equipmentRenting?: string;
	@observable challenging?: string;
	@observable aboveAge?: number;
	@observable locationExplain?: string;
	@observable haveSubBranch?: string;
	@observable sumSubBranch?: number;
	@observable webSite?: string;
	@observable openHours?: string;
	@observable gpsPointer_Lat?: string;
	@observable gpsPointer_Lon?: string;
	@observable region?: string;
	@observable massage?: string;

	constructor(business?: any) {
		if (business) {
			this.name = business.name ? business.name : '';
			this.address = business.address ? business.address : '';
			this.cityId = business.cityId ? business.cityId : undefined;
			this.streetNumber = business.streetNumber ? business.streetNumber : undefined;
			this.phone = business.phone ? business.phone : undefined;
			this.imgUrl = business.imgUrl ? business.imgUrl : '';
			this.parking = business.parking ? business.parking : '';
			this.crippleAccess = business.crippleAccess ? business.crippleAccess : '';
			this.toilet = business.toilet ? business.toilet : '';
			this.restaurant = business.restaurant ? business.restaurant : '';
			this.equipmentRenting = business.equipmentRenting ? business.equipmentRenting : '';
			this.challenging = business.challenging ? business.challenging : '';
			this.aboveAge = business.aboveAge ? business.aboveAge : undefined;
			this.locationExplain = business.locationExplain ? business.locationExplain : '';
			this.haveSubBranch = business.haveSubBranch ? business.haveSubBranch : '';
			this.sumSubBranch = business.sumSubBranch ? business.sumSubBranch : undefined;
			this.webSite = business.webSite ? business.webSite : '';
			this.openHours = business.openHours ? business.openHours : '';
			this.gpsPointer_Lat = business.gpsPointer_Lat ? business.gpsPointer_Lat : '';
			this.gpsPointer_Lon = business.gpsPointer_Lon ? business.gpsPointer_Lon : '';
			this.region = business.region ? business.region : '';
			this.massage = business.massage ? business.massage : '';
		} else {
			this.name = '';
			this.address = '';
			this.cityId = undefined;
			this.streetNumber = undefined;
			this.phone = undefined;
			this.imgUrl = '';
			this.parking = '';
			this.crippleAccess = '';
			this.toilet = '';
			this.restaurant = '';
			this.equipmentRenting = '';
			this.challenging = '';
			this.aboveAge = undefined;
			this.locationExplain = '';
			this.haveSubBranch = '';
			this.sumSubBranch = undefined;
			this.webSite = '';
			this.openHours = '';
			this.gpsPointer_Lat = '';
			this.gpsPointer_Lon = '';
			this.region = '';
			this.massage = '';
		}
	}
}
