import {action, observable, computed, makeAutoObservable} from 'mobx';
import CreditCard from '../models/CreditCard';
import PaymentService from '../services/PaymentService';
import AuthStore from './AuthStore';
import OrderDetails from '../models/OrderDetails';
import NofhonitConfigurationLoader from '../utils/NofhonitConfigurationLoader';
import Address from '../models/Address';
import ValidationService from '../utils/ValidationService';
import { CreditCardType } from '../models/enums';

export default class CreditCardStore {
	@observable creditCardDetails: CreditCard = new CreditCard();

	@observable shortCode: string= '';
	@observable newShortCode: string= '';
	@observable confirmShortCode: string= '';
	@observable orderDetails: OrderDetails = new OrderDetails();
	@observable prefixPhoneNumbers: string[] = [];

	authStore: AuthStore;

	constructor(authStore: AuthStore) {
		this.creditCardDetails = new CreditCard();
		this.authStore = authStore;
		this.shortCode = '';
		this.confirmShortCode = '';
		this.newShortCode = '';
		this.orderDetails = new OrderDetails();
		makeAutoObservable(this);
	}

	@action
	initConfig = async () => {
		const config = await NofhonitConfigurationLoader.loadConfiguration();
		this.prefixPhoneNumbers = config.prefixCellPhoneNumbers;
	};
	@action
	setOrderDetails = (details) => {
		this.orderDetails = new OrderDetails(details);
	};

	@action
	setOwnerFirstName(name: string) {
		this.creditCardDetails.ownerFirstName = name;
	}
	@action
	setOwnerLastName(lastName: string) {
		this.creditCardDetails.ownerLastName = lastName;
	}

	@action
	clearCreditCardDetails = () => {
		this.setCardNumber('');
		this.setCvv('');
		this.setSaveCard(false);
		this.setValidateMonth('');
		this.setValidateYear('');
		this.setShortCode('');
		this.setNewShortCode('');
		this.setConfirmShortCode('');
	};

	@action
	setPhoneNumber(number: string) {
		if (number) {
			if (ValidationService.validateNumbersOnly(number) && number.length <= 7) {
				this.creditCardDetails.phoneNumber = number;
			}
		} else {
			this.creditCardDetails.phoneNumber = '';
		}
	}

	@action
	setPrefixNumber(prefix: string) {
		this.creditCardDetails.phoneNumberPrefix = prefix;
	}
	@action
	setEmail(email: string) {
		this.creditCardDetails.email = email;
	}
	@action
	setCardNumber(card: string) {
		if (card) {
			if (ValidationService.validateNumbersOnly(card)) {
				this.creditCardDetails.cardNumber = card;
			}
		} else {
			this.creditCardDetails.cardNumber = card;
		}
	}
	@action
	setIdentity(identity: string) {
		if (identity) {
			if (ValidationService.validateNumbersOnly(identity)) {
				this.creditCardDetails.identity = identity;
			}
		} else {
			this.creditCardDetails.identity = identity;
		}
	}

	@action
	setValidateYear(validateYear: string) {
		this.creditCardDetails.validateYear = validateYear;
	}

	@action
	setValidateMonth(validateMonth: string) {
		this.creditCardDetails.validateMonth = validateMonth;
	}
	@action
	setCvv(cvv: string) {
		this.creditCardDetails.cvv = cvv;
	}

	@action
	setSaveCard(saveCard: boolean) {
		this.creditCardDetails.saveCard = saveCard;
	}
	@action
	setNumOfPayments(numOfpayments: string) {
		this.creditCardDetails.numOfPayments = numOfpayments;
	}
	@action
 	async sendPaymnet(cart, totalPrice, eventsGuid, creditCardType: CreditCardType, address?: Address) {
		const shortCode = this.getShortCode;
		return await PaymentService.sendPaymnent(
			this.creditCardDetails,
			totalPrice,
			cart,
			shortCode,
			eventsGuid,
			creditCardType,
			address
		)
			.then((res) => {
				// Check if the user has new shortCode and update in the authStore.currentUser if needed
				if (shortCode) {
					this.authStore.refreshCurrentUserAfterUsingShortcode();
				}
				return res;
			})
			.then((res) => {
				this.clearCreditCardDetails();
				return res;
			})
			.catch((err) => {
				throw err;
			});
	}

	@action
	validateCreditCardNumber = (no) => {
		return ((no && this.checkLuhn(no)) &&
		  (no.length == 16 && (no[0] == 4 || no[0] == 5 && no[1] >= 1 && no[1] <= 5 ||
			(no.indexOf("6011") == 0 || no.indexOf("65") == 0)) ||
		  no.length == 15 && (no.indexOf("34") == 0 || no.indexOf("37") == 0) ||
		  no.length == 13 && no[0] == 4))
	}
	
    private checkLuhn = (cardNo) => {
		if(cardNo === '') return false;
		var s = 0;
		var doubleDigit = false;
		for (var i = cardNo.length - 1; i >= 0; i--) {
		  var digit = +cardNo[i];
		  if (doubleDigit) {
			digit *= 2;
			if (digit > 9)
			  digit -= 9;
		  }
		  s += digit;
		  doubleDigit = !doubleDigit;
		}
		return s % 10 == 0;
	}

	@action
	setShortCode = (code) => {
		this.shortCode = code;
	};

	@computed
	get getNewShortCode() {
		return this.newShortCode;
	}

	@action
	setNewShortCode = (code) => {
		this.newShortCode = code;
	};

	@action
	setConfirmShortCode = (code) => {
		this.confirmShortCode = code;
	};

	@computed
	get getConfirmShortCode() {
		return this.confirmShortCode;
	}

	@computed
	get getShortCode() {
		return this.shortCode;
	}

	@computed
	get getCardDetails(): OrderDetails {
		return this.orderDetails;
	}

	get getSaveCard() {
		return this.creditCardDetails.saveCard;
	}

	@computed
	get getCreditDetails() {
		return this.creditCardDetails;
	}

	@computed
	get getPrefixNumbers() {
		return this.prefixPhoneNumbers || [];
	}
}
