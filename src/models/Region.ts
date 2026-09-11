import { makeAutoObservable, observable } from 'mobx';

export default class Region {
	@observable regionId: number;
	@observable regionName: string;

	constructor(region?: any, regionId?: number, regionName?: string) {
		makeAutoObservable(this);
		if (region) {
			this.regionId = region.regionId;
			this.regionName = region.regionName.trim();
		} else if (regionId === 0 && regionName) {
			this.regionId = regionId;
			this.regionName = regionName;
		} else {
			this.regionId = -1;
			this.regionName = '';
		}
	}
}
