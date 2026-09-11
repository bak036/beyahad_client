import { observable } from "mobx";

export default class Street {
	@observable cityId?: number;
    @observable streetId:number;
    @observable streetName:string;
    @observable cityName:string;
    @observable regionID:number;
    @observable regionName:string;
    @observable israelPostId?:number;
    @observable govId?:number;
}