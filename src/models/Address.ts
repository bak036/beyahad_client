import {action, makeAutoObservable, observable} from 'mobx';
import PlacesService from '../services/PlacesService';
import ValidationService from '../utils/ValidationService';
import City from './City';

export default class Address {
	@observable
	city: City;

	@observable
	streetNumber: string = '';

	@observable
	streetName: string = '';

	@observable
	apartmentNumber: string = '';

	@observable
	postalCode: string = '';

	@observable cityTextName: string = '';
	@observable mailbox: string = '';
	@observable entrance: string = '';
	constructor(address?: any) {
		// Set address properties
		makeAutoObservable(this);
		if (address) {
			this.city = address.city;
			this.streetNumber = address.streetNumber;
			this.streetName = address.streetName;
			this.apartmentNumber = address.apartmentNumber;
			this.postalCode = address.postalCode;
			this.cityTextName = address.cityTextName;
			this.mailbox = address.mailbox;
			this.entrance = address.entrance;
		}
	}

	@action
	setPostalCode = (postalCode) => {
		if (postalCode) {
			if (ValidationService.validateNumbersOnly(postalCode) && postalCode.length <= 7) {
				this.postalCode = postalCode.trim();
			}
		} else {
			this.postalCode = '';
		}
	};

	@action
	setApartmentNumber = (apartmentNumber) => {
		this.apartmentNumber = apartmentNumber;
	};

	@action
	setStreetName = (streetName) => {
		if(ValidationService.ValidateCharactersAndNumbersOnly(streetName))
		this.streetName = streetName;
	};

	@action
	setStreetNumber = (streetNumber) => {
		this.streetNumber = streetNumber;
	};

	@action
	setCity = (city : City) => {
		// Code Section
		if(city)
			{
			if (ValidationService.ValidateCharactersOnly(city.cityName))
				this.city = city;
		}
		else
		{
			this.city = new City();
		}
	};

	setCityTextName = (city) => {
		if (ValidationService.ValidateCharactersOnly(city)) 
		this.cityTextName = city;
	};
	@action
	setMailbox = (mailbox) => {
		if(mailbox && mailbox.length<=5)
			this.mailbox = mailbox;
		if(!mailbox)
			this.mailbox =""
	};
	@action
	setEntrance = (entrance) => {
		if(entrance && entrance.length<=10)
		if(ValidationService.ValidateCharactersAndNumbersOnly(entrance))
			this.entrance = entrance;
		if(!entrance)
			this.entrance =""
	};
}
