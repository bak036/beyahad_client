import {action, makeAutoObservable, observable} from 'mobx';
import ContactService from '../services/ContactService';
import AuthStore from './AuthStore';
import {isInterfaceDeclaration} from '@babel/types';
import rootStores from '.';
import {AUTH_STORE} from '../consts/stores';
import User from '../models/User';
import NofhonitConfigurationLoader from '../utils/NofhonitConfigurationLoader';
import ValidationService from '../utils/ValidationService';

export interface ContactReason {
	crmTypeID: string;
	crmTypeDescription: string;
}
export default class ContactStore {
	@observable fullName: string = '';

	@observable email: string = '';

	@observable id: string = '';

	@observable phoneNumber: string = '';

	@observable descreption: string = '';

	@observable optionSelected: string = '';

	@observable crmTypes: ContactReason[] = [];

	@observable contactReason: ContactReason = {crmTypeDescription: '',crmTypeID : ''};

	@observable phoneNumberAreaCode: string = '';

	@observable phoneNumberWithoutAreaCode: string = '';

	prefixPhoneNumbers: string[] = [];

	authStore: AuthStore;

	constructor(authStore: AuthStore) {
		this.authStore = authStore;
		makeAutoObservable(this);
	}

	@action
	init = async () => {
		const user: User = this.authStore.currentUser;
		let firstName = user.firstName ? user.firstName : '';
		let lastName = user.lastName ? user.lastName : '';
		this.setFullName(firstName + ' ' + lastName);
		this.setEmail(user.email);
		this.setId(user.identityNumber);
		if (user.phoneNumber) {
			this.setPhoneNumberAreaCode(user.phoneNumber.slice(0, 3));
			this.setPhoneNumberWithoutAreaCode(user.phoneNumber.slice(3, 10));
		}
		this.setPhoneNumber(user.phoneNumber);

		const config = await NofhonitConfigurationLoader.loadConfiguration();
		if (config) {
			this.setPrefix(config.prefixCellPhoneNumbers);
		}
	};

	@action
	setPrefix = (prefix: string[]) => {
		prefix.forEach((phone) => {
			this.prefixPhoneNumbers.push(phone);
		});
	};

	@action
	setPhoneNumberAreaCode = (areaCode: string) => {
		this.phoneNumberAreaCode = areaCode; // Set area code
	};

	setPhoneNumberWithoutAreaCode = (phoneNumberWithoutAreaCode: string) => {
		if (phoneNumberWithoutAreaCode) {
			if (ValidationService.validateNumbersOnlyAndMaxLength(phoneNumberWithoutAreaCode, 7)) {
				this.phoneNumberWithoutAreaCode = phoneNumberWithoutAreaCode;
			}
		} else {
			this.phoneNumberWithoutAreaCode = '';
		}
	};

	@action
	setFullName(name: string) {
		this.fullName = name;
	}

	@action
	setEmail(email: string) {
		this.email = email;
	}

	@action
	setPhoneNumber(phoneNumber: string) {
		this.phoneNumber = phoneNumber;
	}

	@action
	setId(id: string) {
		this.id = id;
	}

	@action
	setOption(option: string) {
		this.optionSelected = option;
	}

	@action
	setDescreption(descreption: string) {
		this.descreption = descreption;
	}

	@action
	setReason = (reason: ContactReason) => {
		this.contactReason = reason;
	};

	@action
	getCrmTypes = () => {
		ContactService.getCrmTypes().then((crmTypes) => {
			this.crmTypes = crmTypes && crmTypes.data && crmTypes.data.data ? crmTypes.data.data : ''; // crmTypes.data causes error, use this instead!
		});
	};

	@action
	sendContactRequest() {
		// set Full Phone Number - Area code + without area code
		this.setPhoneNumber(
			this.phoneNumberAreaCode ? this.phoneNumberAreaCode.concat(this.phoneNumberWithoutAreaCode) : ''
		);
		return ContactService.sendContactRequest(
			this.fullName,
			this.phoneNumber,
			this.id,
			this.descreption,
			this.email,
			this.contactReason,
		);
	}
}
