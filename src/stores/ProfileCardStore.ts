import {action, computed, makeAutoObservable, observable, toJS} from 'mobx';
import {Logger} from 'nofshonit-base-web-client';
import Region from '../models/Region';
import User from '../models/User';
import Wallet from '../models/Wallet';
import PlacesService from '../services/PlacesService';
import ProfileService from '../services/ProfileService';
import WalletService from '../services/WalletService';
import AuthStore from './AuthStore';

export default class ProfileCardStore {
	authStore: AuthStore;
	@observable allCities: any[];
	@observable allStreets: any[];
	@observable allRegions: Region[] = [];

	constructor(authStore: AuthStore) {
		this.authStore = authStore;
		this.allRegions = [];
		makeAutoObservable(this)
	}

	@action
	init() {
		this.getAllCities();
		this.getAllRegions();
	}

	@action
	possibleToOrderCard = async () => {
		try {
			const allow = await ProfileService.possibleToOrderCard();
			return allow;
		} catch (err) {
			throw err;
		}
	};

	@action
	getAllRegions = () => {
		return ProfileService.getAllRegions().then((res: any[]) => {
			if (res) {
				// const reg = new Region();
				// reg.regionId = 0;
				// reg.regionName = 'כל האזורים';
				// res.unshift(reg);
				this.setRegions(res);
			}
		});
	};

	@action
	setRegions = (regions) => {
		if (regions) {
			this.allRegions = regions.map((x) => new Region(x));
		}
	};

	@action
	sendCardMemberOnSMS = () => {
		return ProfileService.sendCardMemberOnSMS();
	};

	@action
	blockCard = () => {
		return ProfileService.blockCard();
	};

	@action
	getAllCities = () => {
		return PlacesService.getAllCities().then((res) => {
			this.setAllcities(res);
		});
	};

	@action
	setAllcities = (cities: any[]) => {
		this.allCities = cities;
	};
	setAllStreets = (streets: any[]) => {
		this.allStreets = streets;
	};

	@action
	getAllStreets = () => {
		PlacesService.getAllStreets()
			.then((res) => {
				if (res) {
					this.setAllStreets(res);
				} else {
					this.setAllStreets([]);
				}
			})
			.catch((err) => {
				this.setAllStreets([]);
				Logger.error('street fatching failed');
			});
	};
	@action
	getCardDetailsByCardNumber = async(cardNumber:string) =>{
		try{
		const res = await ProfileService.GetCardDetailsByCardNumber(cardNumber)
		return res
		}
		catch(err){
			throw err
		}
	}

	@computed
	get getAllCitiesStore() {
		return this.allCities ? this.allCities : [];
	}

	@computed
	get getAllStreetsStore() {
		return this.allStreets ? this.allStreets : [];
	}

	@computed
	get getRegions() {
		return this.allRegions ? this.allRegions : [];
	}
}
