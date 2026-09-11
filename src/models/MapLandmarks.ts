import { makeAutoObservable } from "mobx";

class MapLandmarks {
	altitude?: number;
	latitude?: number;

	constructor(mapLandmarks?: any) {
		makeAutoObservable(this);
		if (mapLandmarks) {
			this.altitude = mapLandmarks.altitude;
			this.latitude = mapLandmarks.latitude;
		} else {
			this.altitude = undefined;
			this.latitude = undefined;
		}
	}
}

export default MapLandmarks;
