import { observable } from "mobx";

export default class City {
	@observable cityId?: number;
    @observable govId?:number;
    @observable cityName:string;
    @observable regionID?:number;
}