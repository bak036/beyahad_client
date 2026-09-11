import { action, computed, makeAutoObservable, observable } from 'mobx';
import Address from '../models/Address';
import { Gender, LoginType } from '../models/enums';
import User from '../models/User';
import UserService from '../services/UserService';
import AuthStore from './AuthStore';
import PlacesService from '../services/PlacesService';
import { Logger } from 'nofshonit-base-web-client';
import { toJS } from 'mobx';
import Lang from '../config/Language';
import NofhonitConfigurationLoader from '../utils/NofhonitConfigurationLoader';
import ValidationService from '../utils/ValidationService';
import City from 'src/models/City';
import Street from 'src/models/Street';
export default class UserDetailsStore {
	@observable currentEditingUserDetails: User = new User();

	authStore: AuthStore;

	// Error fields
	prefixPhoneNumbers: string[] = [];
	@observable firstNameError: string = '';

	@observable lastNameError: string = '';

	@observable allowSmsAndEmail: boolean = false;

	@observable emailError: string = '';

	@observable identityNumberError: string = '';

	@observable birthDateError: string = '';

	@observable genderError: string = '';

	@observable workingPlaceError: string = '';

	@observable childrenNumberError: string = '';

	@observable friendEmailError: string = '';

	@observable phoneNumberAreaCodeError: string = '';

	@observable phoneNumberWithoutAreaCodeError: string = '';

	@observable phoneNumberError: string = '';

	@observable CityTextName: string = '';

	// Address error fields

	@observable cityError: string = '';

	@observable streetNameError: string = '';

	@observable streetNumberError: string = '';

	@observable apartmentNumberError: string = '';

	@observable postalCodeError: string = '';

	// Helper properties
	@observable entranceError: string = '';
	@observable mailboxError: string = '';
	@observable phoneNumberAreaCode: string = '';

	@observable phoneNumberWithoutAreaCode: string = '';

	@observable allCities: City[] = [];

	@observable allStreets: Street[] = [];

	@observable otherCityName: string = '';

	@observable partnerPhoneAreaCode: string = '';

	@observable partnerPhoneWithoutAreaCode: string = '';

	@observable partnerPhoneError: string = '';

	@observable partnerPhone: string = '';

	@observable partnerPhoneAreaCodeError: string = '';

	@observable partnerPhoneWithoutAreaCodeError: string = '';

	@observable isUpdateDetailsApproved: boolean = false;

	@observable isUpdateDetailsApprovedError: string = '';

	@observable isRegistrationMode: boolean = false;

	constructor(authStore: AuthStore) {
		this.authStore = authStore;
		this.currentEditingUserDetails = new User();
		makeAutoObservable(this)
	}

	// API requests
	initConfig = async () => {

		const config = await NofhonitConfigurationLoader.loadConfiguration();
		if (config) {
			this.setPrefix(config.prefixCellPhoneNumbers);
		}
	};
	@action
	initUserDetails() {

		if (this.authStore.loggedInUser) {
			this.currentEditingUserDetails = new User(this.authStore.loggedInUser);
			// Set Login Type
			this.currentEditingUserDetails.loginType = LoginType.IdentityAndPassword;
			// Set Partner Email / Friend Email
			this.currentEditingUserDetails.friendMail = this.authStore.loggedInUser.friendMail;
			// trim postal code spaces
			this.currentEditingUserDetails.address.postalCode = this.currentEditingUserDetails.address.postalCode
				? this.currentEditingUserDetails.address.postalCode.trim()
				: '';
			// Set City name for input element
			this.address.setCityTextName(this.authStore.loggedInUser.address.city ? this.currentEditingUserDetails.address.city.cityName : '');
			// Split phone number to areacode and phone number
			const phoneNumber = this.currentEditingUserDetails.phoneNumber;
			if (phoneNumber && phoneNumber.length > 2) {
				this.setPhoneNumberAreaCode(phoneNumber.substring(0, 3)); // Set area code
				this.setPhoneNumberWithoutAreaCode(phoneNumber.substring(3, phoneNumber.length)); // Set phone number
			} else {
				this.setPhoneNumberAreaCode(''); // Set area code
				this.setPhoneNumberWithoutAreaCode(''); // Set phone number
			}
			const partnerPhone = this.currentEditingUserDetails.partnerPhone;
			if (partnerPhone && partnerPhone.length > 2) {
					this.setPartnerPhoneAreaCode(partnerPhone.substring(0, 3));
					this.setPartnerPhoneWithoutAreaCode(partnerPhone.substring(3));
			} else {
					this.setPartnerPhoneAreaCode('');
					this.setPartnerPhoneWithoutAreaCode('');
			}
		} else {
			this.currentEditingUserDetails = new User();
		}
	}

	@action
	getAllCities = () => {
		return PlacesService.getAllCities()
			.then((res) => {
				let citiesList = res.filter(function (item, pos) {
					return res.indexOf(item) == pos;
				});
				this.allCities = citiesList;
				this.allCities.push({ cityName: Lang.format('Other') });
			})
			.catch((err) => {
				Logger.error('the fetching for cities error', err);
			})
			.finally(() => {
				if (this.address && this.address.city && this.address.city.cityId) {
					this.initStreets(this.address.city.cityId); // -- currently getting null from get current user
				}
			});
	};

	@action
	setAllowSmsAndEmail(bool: boolean) {
		this.allowSmsAndEmail = bool;
	}

	@action initStreets = (cityId) => {
		if (!cityId)
			return
		PlacesService.getStreetsByCity(cityId).then((res) => {
			let streetsList = res.filter(function (item, pos) {
				return res.indexOf(item) == pos;
			});
			this.allStreets = streetsList || [];
		});
	};

	@computed
	get getGenderObjectBasedOnValue() {
		switch (this.currentEditingUserDetails.gender) {
			case 1:
				return { gender: Lang.format('Male'), key: Gender.MALE };
			case 2:
				return { gender: Lang.format('Female'), key: Gender.FEMALE };

			case 3:
				return { gender: Lang.format('Other'), key: Gender.OTHER };
		}
		return {};
	}

	@action
	setCity = (city: City) => {// Update selected city
		
		if (city && city.cityName) {
			city.govId = city.govId ? city.govId : -1
			if (ValidationService.ValidateCharactersOnly(city.cityName)) {
				this.currentEditingUserDetails.address.setCity(city);
				const cityId = (city && city.cityId) || -1; // Parse city id
				// Get streets by selected city
				this.initStreets(cityId);
			}
		}
		else {
			this.currentEditingUserDetails.address.setCity(city);
			const cityId = (city && city.cityId) || -1; // Parse city id
			// Get streets by selected city
			this.initStreets(cityId);
		}

	};
	@action
	setCityWithOutStore = (city: City) => {// Update selected city
		
		if (city && city.cityName) {
			city.govId = city.govId ? city.govId : -1
			if (ValidationService.ValidateCharactersOnly(city.cityName)) {
				const cityId = (city && city.cityId) || -1; // Parse city id
				// Get streets by selected city
				this.initStreets(cityId);
			}
		}
		else {
			const cityId = (city && city.cityId) || -1; // Parse city id
			// Get streets by selected city
			this.initStreets(cityId);
		}

	};

	@action
	saveUserClicked = () => {
		if (this.validate()) {
			this.sendSaveUserRequest();
		}
	};

	sendSaveUserRequest() {
		// Update city value in case of "other" option selected
		if (this.address.city && this.address.city.cityName && this.address.city.cityName === Lang.format('Other')) {
			this.address.city.cityName = this.otherCityName;
		}

		// Send update request
		UserService.updateUser(this.currentEditingUserDetails);
	}

	setPhoneNumberError() {
		if (this.phoneNumberAreaCodeError && this.phoneNumberWithoutAreaCodeError) {
			this.phoneNumberError = Lang.format('PleaseEnterNumber');
		} else if (this.phoneNumberAreaCodeError) {
			this.phoneNumberError = Lang.format('PleaseEnterNumber');
		} else if (this.phoneNumberWithoutAreaCodeError) {
			this.phoneNumberError = Lang.format('PleaseEnterNumber');
		} else {
			this.phoneNumberError = '';
		}
	}

	validate = (): boolean => {
		// need to check firstname,lastname,email,phonewitharea,phone withoutarea,city,streetName,housenumber
		// Variable Definition
		let retval = true;
		// Code Section
		
		if (!this.currentEditingUserDetails.firstName || !this.currentEditingUserDetails.firstName.length) {
			this.setFirstNameError(Lang.format('PleaseEnterFirstName'));
			retval = false;
		} else {
			this.setFirstNameError('');
		}
		if (!this.currentEditingUserDetails.lastName || !this.currentEditingUserDetails.lastName.length) {
			this.setLastNameError(Lang.format('PleaseEnterLastName'));
			retval = false;
		} else {
			this.setLastNameError('');
		}

		if (!this.currentEditingUserDetails.email || !this.currentEditingUserDetails.email.length) {
			this.setEmailError(Lang.format('PleaseEnterAVaildEmail'));
			retval = false;
		} else {
			if (!ValidationService.validateEmail(this.currentEditingUserDetails.email)) {
				this.setEmailError(Lang.format('PleaseEnterAVaildEmail'));
				retval = false;
			} else {
				this.setEmailError('');
			}
		}
		if (!this.phoneNumberAreaCode || this.phoneNumberAreaCode.length == 0) {
			// I am using the same error as WithoutAreaCode for both fields, dont change this
			this.setPhoneNumberWithoutAreaCodeError(Lang.format('PleaseEnterNumber'));
			this.setPhoneNumberAreaCodeError(Lang.format('PleaseEnterNumber'));
			this.setPhoneNumberError();
			retval = false;
		} else {
			this.setPhoneNumberAreaCodeError(Lang.format(''));
			this.setPhoneNumberError();
		}
		if (!this.phoneNumberWithoutAreaCode || !this.phoneNumberWithoutAreaCode.length) {
			this.setPhoneNumberWithoutAreaCodeError(Lang.format('PleaseEnterNumber'));
			this.setPhoneNumberError();
			retval = false;
		} else {
			if (this.phoneNumberWithoutAreaCode.length != 7) {
				this.setPhoneNumberWithoutAreaCodeError(Lang.format('PleaseEnterNumber'));
				this.setPhoneNumberError();
				retval = false;
			} else {
				this.setPhoneNumberWithoutAreaCodeError('');
				this.setPhoneNumberError();
			}
		}
		if (!this.currentEditingUserDetails.address.city || !this.currentEditingUserDetails.address.city.cityName) {
			this.setCityError(Lang.format('PleaseChooseACityFromList'));
			retval = false;
		} else {
			let tempCities = this.allCities.filter(c => c.cityName && c.cityName.includes(this.currentEditingUserDetails.address.city.cityName))
					.reduce((unique: City[], city: City) => {
						if (!unique.some(c => c.cityName === city.cityName)) {
							unique.push(city);
						}
						return unique;
					}, []);
					if (tempCities.length == 0)
					{
			this.setCityError(Lang.format('PleaseChooseACityFromList'));
			retval = false;
					}
					else{ 
									this.setCityError('');
					}

		}
		if (
			!this.currentEditingUserDetails.address.streetName ||
			!this.currentEditingUserDetails.address.streetName.length
		) {
			this.setStreetNameError(Lang.format('PleaseChooseAStreetFromList'));
			retval = false;
		} else {
			this.setStreetNameError('');
		}
		if (
			!this.currentEditingUserDetails.address.streetNumber ||
			!this.currentEditingUserDetails.address.streetNumber.length
		) {
			this.setStreetNumberError(Lang.format('PleaseEnterStreetNumber'));
			retval = false;
		} else {
			this.setStreetNumberError('');
		}

		if (
			!this.currentEditingUserDetails.address.apartmentNumber ||
			!this.currentEditingUserDetails.address.apartmentNumber.length
		) {
			this.setApartmentNumberError(Lang.format('PleaseEnterApratmentNumber'));
			retval = false;
		} else {
			this.setApartmentNumberError('');
		}
		if (this.currentEditingUserDetails.address.postalCode) {
			if (
				this.currentEditingUserDetails.address.postalCode.length != 5 &&
				this.currentEditingUserDetails.address.postalCode.length != 7
			) {
				this.setPostalCodeError(Lang.format('PleaseEnterYourPostalCode'));
				retval = false;
			} else {
				this.setPostalCodeError('');
			}
		} else {
			this.setPostalCodeError(Lang.format('PleaseEnterPostalCode'));
			retval = false;
		}
		if (this.currentEditingUserDetails.friendMail) {
			if (!ValidationService.validateEmail(this.currentEditingUserDetails.friendMail)) {
				this.setFriendEmailError(Lang.format('PleaseEnterYourFriendEmail'));
				retval = false;
			} else {
				this.setFriendEmailError(Lang.format(''));
			}
		} else {
			this.setFriendEmailError(Lang.format(''));
		}
		if (this.partnerPhoneAreaCode || this.partnerPhoneWithoutAreaCode) {
			if (!this.partnerPhoneAreaCode || this.partnerPhoneAreaCode.length !== 3) {
				this.partnerPhoneAreaCodeError = Lang.format('PleaseEnterValidPhoneNumber');
				retval = false;
			} else {
				this.partnerPhoneAreaCodeError = '';
			}

			if (!this.partnerPhoneWithoutAreaCode || this.partnerPhoneWithoutAreaCode.length !== 7) {
				this.partnerPhoneWithoutAreaCodeError = Lang.format('PleaseEnterValidPhoneNumber');
				retval = false;
			} else {
				this.partnerPhoneWithoutAreaCodeError = '';
			}
		} else {
			this.partnerPhoneAreaCodeError = '';
			this.partnerPhoneWithoutAreaCodeError = '';
		}

		if (!this.validateContactApprovalRequirement()) {
			retval = false;
		}	

		return retval;

	};

	@action
	validateContactApprovalRequirement = (): boolean => {
		
		const user = this.authStore.loggedInUser;
		const current = this.currentEditingUserDetails;

		const currentPhone = current.phoneNumber?.trim() || '';
		const currentEmail = current.email?.trim() || '';
		const currentPartnerPhone = current.partnerPhone?.trim() || '';
		const currentPartnerEmail = current.friendMail?.trim() || '';

		const prevPhone = user?.phoneNumber?.trim() || '';
		const prevEmail = user?.email?.trim() || '';
		const prevPartnerPhone = user?.partnerPhone?.trim() || '';
		const prevPartnerEmail = user?.friendMail?.trim() || '';

		let isValid = true;

		if (this.isRegistrationMode) {
			const anyFieldCurrentlyFilled =
				!!currentPhone || !!currentEmail || !!currentPartnerPhone || !!currentPartnerEmail;

			if (anyFieldCurrentlyFilled && !this.isUpdateDetailsApproved) {
				this.isUpdateDetailsApprovedError = Lang.format('YouMustApprovePartnerFields');
				isValid = false;
			} else {
				this.isUpdateDetailsApprovedError = '';
			}
		} else {
			const anyFieldChangedAndAdded =
				(prevPhone !== currentPhone && !!currentPhone) ||
				(prevEmail !== currentEmail && !!currentEmail) ||
				(prevPartnerPhone !== currentPartnerPhone && !!currentPartnerPhone) ||
				(prevPartnerEmail !== currentPartnerEmail && !!currentPartnerEmail);


			if (anyFieldChangedAndAdded && !this.isUpdateDetailsApproved) {
				this.isUpdateDetailsApprovedError = Lang.format('YouMustApprovePartnerFields');
				isValid = false;
			} else {
				this.isUpdateDetailsApprovedError = '';
			}
		}

		return isValid;
	};

	@action
	setFirstName = (name: string) => {
		if (ValidationService.ValidateCharactersOnly(name)) {
			this.currentEditingUserDetails.firstName = name;
		}
	};
	@action
	setLastName = (name: string) => {
		if (ValidationService.ValidateCharactersOnly(name)) {
			this.currentEditingUserDetails.lastName = name;
		}
	};
	@action
	setIdentity = (id: string) => {
		this.currentEditingUserDetails.identityNumber = id;
	};
	@action
	setEmail = (email: string) => {
		this.currentEditingUserDetails.email = email;
	};

	@action
	setGender = (gender: Gender) => {
		this.currentEditingUserDetails.gender = gender;
	};
	@action
	setEntrance = (entrance: string) => {
		if (entrance && entrance.length <= 10)
			this.currentEditingUserDetails.entrance = entrance;
		if (!entrance)
			this.currentEditingUserDetails.entrance = "";
	};
	@action
	setMailbox = (mailbox: string) => {
		if (mailbox && mailbox.length <= 5)
			this.currentEditingUserDetails.mailbox = mailbox;
		if (!mailbox)
			this.currentEditingUserDetails.mailbox = "";
	};
	@action
	setWorkingPlace = (workingPlace: string) => {
		if (ValidationService.ValidateCharactersOnly(workingPlace)) {
			this.currentEditingUserDetails.workingPlace = workingPlace;
		}
	};

	@action
	setBirthDate = (birthDate: string) => {
		this.currentEditingUserDetails.birthDate = birthDate;
	};

	@action
	setPhoneNumber = (phoneNumber: string) => {
		this.currentEditingUserDetails.phoneNumber = phoneNumber;
	};

	@action
	setPhoneNumberAreaCode = (areaCode: string) => {
		this.phoneNumberAreaCode = areaCode ? areaCode : ''; // Set area code
		this.setPhoneNumber(this.phoneNumberAreaCode.concat(this.phoneNumberWithoutAreaCode)); // Update full phone number
	};

	@action
	setPhoneNumberWithoutAreaCode = (phoneNumberWithoutAreaCode: string) => {
		if (phoneNumberWithoutAreaCode) {
			if (phoneNumberWithoutAreaCode.length < 8 && ValidationService.validateNumbersOnly(phoneNumberWithoutAreaCode)) {
				this.phoneNumberWithoutAreaCode = phoneNumberWithoutAreaCode;
				if (this.phoneNumberAreaCode) {
					this.setPhoneNumber(this.phoneNumberAreaCode.concat(this.phoneNumberWithoutAreaCode)); // Update full phone number
				}
			}
		} else {
			this.phoneNumberWithoutAreaCode = '';
		}
	};


	@action
	setPartnerPhoneAreaCode = (areaCode: string) => {
		this.partnerPhoneAreaCode = areaCode ? areaCode : '';
		if (this.partnerPhoneAreaCode && this.partnerPhoneWithoutAreaCode) {
			this.setPartnerPhone(this.partnerPhoneAreaCode.concat(this.partnerPhoneWithoutAreaCode));
		} else {
			this.setPartnerPhone('');
		}
	};



	@action
	setPartnerPhoneWithoutAreaCode = (phoneNumberWithoutAreaCode: string) => {
	if (phoneNumberWithoutAreaCode) {
		if (phoneNumberWithoutAreaCode.length < 8 && ValidationService.validateNumbersOnly(phoneNumberWithoutAreaCode)) {
		this.partnerPhoneWithoutAreaCode = phoneNumberWithoutAreaCode;
		if (this.partnerPhoneAreaCode) {
			this.setPartnerPhone(this.partnerPhoneAreaCode.concat(this.partnerPhoneWithoutAreaCode));
		}
		}
	} else {
		this.partnerPhoneWithoutAreaCode = '';
	}
	};


	@action
	setPartnerPhone = (phone: string) => {
	this.partnerPhone = phone;
	this.currentEditingUserDetails.partnerPhone = phone;
	};


	@action
	setChildrenNumber = (childrenNumber: string) => {
		this.currentEditingUserDetails.childrenNumber = childrenNumber;
	};

	@action
	setFriendEmail = (email: string) => {
		this.currentEditingUserDetails.friendMail = email;
	};

	@action
	setOtherCityName = (city: string) => {
		this.otherCityName = city;
	};

	@action
	setCityTextName = (city: string) => {
		this.CityTextName = city;
	};


	// Error indicators

	@action
	setUserIdError = (errorMessage: string) => {
		this.identityNumberError = errorMessage;
	};

	@action
	setFirstNameError = (errorMessage: string) => {
		this.firstNameError = errorMessage;
	};
	@action
	setLastNameError = (errorMessage: string) => {
		this.lastNameError = errorMessage;
	};
	@action
	setIdentityError = (errorMessage: string) => {
		this.identityNumberError = errorMessage;
	};
	@action
	setEmailError = (errorMessage: string) => {
		this.emailError = errorMessage;
	};

	@action
	setGenderError = (errorMessage: string) => {
		this.genderError = errorMessage;
	};

	@action
	setWorkingPlaceError = (errorMessage: string) => {
		this.workingPlaceError = errorMessage;
	};

	@action
	setBirthDateError = (errorMessage: string) => {
		this.birthDateError = errorMessage;
	};

	@action
	setChildrenNumberError = (errorMessage: string) => {
		this.childrenNumberError = errorMessage;
	};

	@action
	setFriendEmailError = (errorMessage: string) => {
		this.friendEmailError = errorMessage;
	};

	@action
	setCityError = (errorMessage: string) => {
		this.cityError = errorMessage;
	};

	@action
	setStreetNameError = (errorMessage: string) => {
		this.streetNameError = errorMessage;
	};

	@action
	setStreetNumberError = (errorMessage: string) => {
		this.streetNumberError = errorMessage;
	};

	@action
	setApartmentNumberError = (errorMessage: string) => {
		this.apartmentNumberError = errorMessage;
	};

	@action
	setPostalCodeError = (errorMessage: string) => {
		this.postalCodeError = errorMessage;
	};

	@action
	setPhoneNumberAreaCodeError = (errorMessage: string) => {
		this.phoneNumberAreaCodeError = errorMessage;
	};

	@action
	setPhoneNumberWithoutAreaCodeError = (errorMessage: string) => {
		this.phoneNumberWithoutAreaCodeError = errorMessage;
	};

	@action
	updatePassword = (newPassword) => {
		UserService.updatePassword(newPassword).then((res) => { });
	};

	@action
	setPrefix = (prefix: string[]) => {
		prefix.forEach((phone) => {
			this.prefixPhoneNumbers.push(phone);
		});
	};

	@action
	deleteUserRequest() {
		return UserService.deleteMember(this.currentEditingUserDetails);
	}

	@action
	setIsUpdateDetailsApproved = (val: boolean) => {
	this.isUpdateDetailsApproved = val;
	this.currentEditingUserDetails.isUpdateDetailsApproved = val;
	};

	// Computed

	@computed
	get user(): User {
		return this.currentEditingUserDetails || {};
	}

	@computed
	get address(): Address {
		return this.user.address || {};
	}

	@computed
	get getCities() {
		return toJS(this.allCities) || [];
	}

	@computed
	get getPrefixPhoneNumbers() {
		return this.prefixPhoneNumbers || [];
	}
}

