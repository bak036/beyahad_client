import {observer} from 'mobx-react';
import {CustomButton, CustomInputText, CustomSelector, CustomSpan, Logger, TextTypes,CustomHeader,HeaderType} from 'nofshonit-base-web-client';
import * as React from 'react';
import Lang from '../../../../config/Language';
import {CREDIT_CARD_STORE} from '../../../../consts/stores';
import rootStores from '../../../../stores';
import CreditCardStore from '../../../../stores/CreditCardStore';
import ValidationService from '../../../../utils/ValidationService';
import {isNullOrUndefined} from 'util';
import { RoutesPath } from '../../../../consts/RoutesPath';
import { Link } from 'react-router-dom';

interface Props {
	history?: any;
	setAccess?: () => void;
	onPay: () => void;
	addedValidations?: () => boolean;
	forgotCode?: boolean;
	clearErrors?: () => void;
	onForgotCodeChanged?: (value) => void;
	onShortCodesaved?: (shortCode) => void;
	loadCard?: boolean;
	numOfPayment: any[];
	disableNumOfPayments?: boolean;
	disableFirstAndLastName?: boolean;
	totalPrice?: number;
	onePaymentDefualt?: boolean;
	hideShortCode?: boolean;
	onDischarge?: any;
	isDischarge?: boolean;
	allowZeroPrice?: boolean;
	cardId?: any;
	crditCardNumError: string;
	ownerIdError: string;
	cardValidDateYearError: string;
	cardValidDateMonthError: string;
	cvvError: string;
	numOfPaymentError: string;

}
interface IState {
	firstNameError: string;
	lastNameError: string;
	emailError: string;
	prefixPhoneError:string;
	phoneNumberError: string;
	crditCardNumError: string;
	ownerIdError: string;
	cardValidDateYearError: string;
	cardValidDateMonthError: string;
	cvvError: string;
	numOfPaymentError: string;
	agreement: boolean;
	shortCodeModal: boolean;
	saveCard: boolean;
	codeError: string;
	confiremCodeError: string;
	agreementError: string;
	numOfPayment: string;
	showShortCode?: boolean;
}

const creditCardStore: CreditCardStore = rootStores[CREDIT_CARD_STORE];

@observer
export class CreditCardComponentVer2 extends React.Component<Props, IState> {
	private history: any;
	constructor(props) {
		super(props);
		this.history = this.props.history;
		this.state = {
			firstNameError: '',
			lastNameError: '',
			phoneNumberError: '',
			emailError: '',
			crditCardNumError: this.props.crditCardNumError,
			ownerIdError: this.props.ownerIdError ,
			cardValidDateYearError: this.props.cardValidDateYearError ,
			cardValidDateMonthError: this.props.cardValidDateMonthError,
			cvvError: this.props.cvvError,
			numOfPaymentError: this.props.numOfPaymentError,
			prefixPhoneError: '',
			agreement: false,
			shortCodeModal: false,
			saveCard: false,
			codeError: '',
			confiremCodeError: '',
			agreementError: '',
			numOfPayment: '',
		};
	}

	componentDidMount() {
		creditCardStore.initConfig();
		creditCardStore.clearCreditCardDetails();
		creditCardStore.setOwnerFirstName(creditCardStore.authStore.currentUser.firstName);
		creditCardStore.setOwnerLastName(creditCardStore.authStore.currentUser.lastName);
		const prefix = creditCardStore.authStore.currentUser.phoneNumber
			? creditCardStore.authStore.currentUser.phoneNumber.slice(0, 3).trim()
			: '050';
		const phoneNumber = creditCardStore.authStore.currentUser.phoneNumber
			? creditCardStore.authStore.currentUser.phoneNumber.slice(3, 10).trim()
			: '';
		creditCardStore.setPrefixNumber(prefix);
		creditCardStore.setPhoneNumber(phoneNumber);
		creditCardStore.setEmail(creditCardStore.authStore.currentUser.email);
		creditCardStore.setIdentity(creditCardStore.authStore.currentUser.identityNumber);
		this.props.disableNumOfPayments ? creditCardStore.setNumOfPayments(this.props.numOfPayment[0].key) : null;
		if (this.props.onePaymentDefualt) {
			const numOfPayment = this.props.numOfPayment[0];
			creditCardStore.setNumOfPayments(numOfPayment.key);
			this.setState({numOfPayment});
		}
	}
	componentDidUpdate(prevProps){
		if (prevProps.cardId != this.props.cardId) {
			creditCardStore.clearCreditCardDetails();
		}
		if(prevProps.crditCardNumError != this.props.crditCardNumError)
			this.setState({crditCardNumError: this.props.crditCardNumError})

		if(prevProps.ownerIdError != this.props.ownerIdError)
			this.setState({ownerIdError: this.props.ownerIdError})

		if(prevProps.cardValidDateYearError != this.props.cardValidDateYearError)
			this.setState({cardValidDateYearError: this.props.cardValidDateYearError})

		if(prevProps.cardValidDateMonthError != this.props.cardValidDateMonthError)
			this.setState({cardValidDateMonthError: this.props.cardValidDateMonthError})

		if(prevProps.cvvError != this.props.cvvError)
			this.setState({cvvError: this.props.cvvError})
		
		if(prevProps.numOfPaymentError != this.props.numOfPaymentError)
			this.setState({numOfPaymentError: this.props.numOfPaymentError})
	}
	clearError = () => {
		this.setState({
			confiremCodeError: '',
			codeError: '',
			firstNameError: '',
			lastNameError: '',
			emailError: '',
			prefixPhoneError: '',
			phoneNumberError: '',
			cvvError: '',
			ownerIdError: '',
			cardValidDateMonthError: '',
			cardValidDateYearError: '',
			crditCardNumError: '',
			numOfPaymentError: '',
			agreementError: '',
		});
		if (this.props.clearErrors && this.props.addedValidations) {
			this.props.clearErrors();
		}
	};

	onDischarge = () => {
		if (this.validate() && this.state.agreement) {
			this.props.onPay();
		} else {
			if (this.state.agreement == false) {
				this.setState({agreementError: Lang.format('ValidateAgreement')});
			}
		}
	};

	sendPaymnetClicked = () => {
		
		let moreValidations;
		//if no addedValidations in props
		if (this.props.addedValidations) {
			moreValidations = this.props.addedValidations();
		} else {
			moreValidations = true;
		}
		// Pick validation based on product with zero price or Regular product
		// Zero price product is a digital member card

		if (this.props.allowZeroPrice) {
			if (this.validationForItemsWithZeroPrice() && this.state.agreement) {
				this.props.onPay();
			} else {
				if (this.state.agreement == false) {
					this.setState({agreementError: Lang.format('ValidateAgreement')});
				}
			}
		} else {
			if (this.validate() && this.state.agreement && moreValidations) {
				if (this.props.onShortCodesaved && this.state.saveCard) {
					if (this.validateShortCode()) {
						this.props.onShortCodesaved(creditCardStore.newShortCode);
						this.props.onPay();
					}
				} else {
					this.props.onPay();
				}
			} else {
				Logger.debug('validate');
				if (this.state.agreement == false) {
					this.setState({agreementError: Lang.format('ValidateAgreement')});
				}
			}
		}
	};

	validationForItemsWithZeroPrice = () => {
		let retVal: boolean = true;

		if (creditCardStore.creditCardDetails.phoneNumber.length !== 7) {
			this.setState({phoneNumberError: Lang.format('ValidatePhone')});
			retVal = false;
		} else {
			this.setState({phoneNumberError: ''});
		}
		if (ValidationService.validateNumbersOnly(creditCardStore.creditCardDetails.phoneNumber) == false) {
			this.setState({phoneNumberError: Lang.format('ValidatePhone')});
			retVal = false;
		}
		if (ValidationService.validateEmail(creditCardStore.creditCardDetails.email) === false) {
			this.setState({emailError: Lang.format('ValidateEmail')});
			retVal = false;
		}
		if (creditCardStore.creditCardDetails.phoneNumber.length === 0) {
			this.setState({phoneNumberError: Lang.format('ValidatePhoneEmpty')});
			retVal = false;
		}
		if (!creditCardStore.creditCardDetails.phoneNumberPrefix) {
			this.setState({prefixPhoneError: Lang.format('ValidatePhonePrefixEmpty')});
			retVal = false;
		}
		if (!creditCardStore.creditCardDetails.email) {
			this.setState({emailError: Lang.format('ValidateEmailEmpty')});
			retVal = false;
		}
		return retVal;
	};

	validate = () => {
		let retVal: boolean = true;
		let month = new Date().getMonth();
		let year = new Date()
			.getFullYear()
			.toString()
			.slice(2, 4);


		if (creditCardStore.creditCardDetails.cardNumber.length === 0) {
			this.setState({crditCardNumError: Lang.format('ValidateCreditCardEmpty')});
			retVal = false;
		}
		if (creditCardStore.creditCardDetails.identity.length !== 9) {
			this.setState({ownerIdError: Lang.format('ValidateId')});
			retVal = false;
		}
		if (ValidationService.validateID(creditCardStore.creditCardDetails.identity) == false) {
			this.setState({ownerIdError: Lang.format('ValidateId')});
			retVal = false;
		}
		if (
			creditCardStore.creditCardDetails.validateYear === null ||
			creditCardStore.creditCardDetails.validateYear.length === 0
		) {
			this.setState({cardValidDateYearError: Lang.format('ValidateCreditCardDate')});
			retVal = false;
		}
		if (
			!creditCardStore.creditCardDetails.validateMonth ||
			creditCardStore.creditCardDetails.validateMonth.length === 0
		) {
			this.setState({cardValidDateMonthError: Lang.format('ValidateCreditCardDate')});
			retVal = false;
		}
		if (creditCardStore.creditCardDetails.cvv.length !== 3 && creditCardStore.creditCardDetails.cvv.length !== 4) {
			this.setState({cvvError: Lang.format('ValidateCreditCardBackDigits')});
			retVal = false;
		}
		if (!this.props.disableNumOfPayments) {
			if (
				!creditCardStore.creditCardDetails.numOfPayments ||
				creditCardStore.creditCardDetails.numOfPayments.length === 0
			) {
				this.setState({numOfPaymentError: 'יש להזין מספר תשלומים'});
				retVal = false;
			}
		}
		if (
			parseInt(creditCardStore.creditCardDetails.validateMonth) < month &&
			parseInt(creditCardStore.creditCardDetails.validateYear) <= parseInt(year)
		) {
			this.setState({cardValidDateMonthError: 'חודש זה אינו תקף'});
			retVal = false;
		}

		if (this.state.saveCard) {
			if (!this.validateShortCode) {
				retVal = false;
			}
		}
		return retVal;
	};

	onShortCodeChange = (value) => {
		this.clearError();
		const code = value;
		creditCardStore.setNewShortCode(value)
		creditCardStore.setShortCode(code);
	};

	onCodeDiscountClicked = () => {
		if (creditCardStore.newShortCode) {
			//need to check if the code is valid with the server.

			Logger.debug('check the code');
		} else {
			Logger.debug('the code are not exsist');
		}
	};

	onFirstNameChanged = (value) => {
		this.clearError();
		const firstName = value;

		creditCardStore.setOwnerFirstName(firstName);
	};
	onLastNameChanged = (value) => {
		this.clearError();
		const lastName = value;
		creditCardStore.setOwnerLastName(lastName);
	};
	onEmailChanged = (value) => {
		this.clearError();
		const email = value;
		creditCardStore.setEmail(email);
	};

	onPrefixPhoneNumSelected = (value) => {
		this.clearError();
		const prefix = value;
		creditCardStore.setPrefixNumber(prefix);
	};

	onPhoneNumberChanged(value) {
		// this.clearError();
		const phone = value;
		creditCardStore.setPhoneNumber(phone);
	}

	onValidateYearSelected = (value) => {
		this.clearError();
		const year = value;
		creditCardStore.setValidateYear(year);
	};

	onValidateMonthSelected = (value) => {
		this.clearError();
		const month = value;
		creditCardStore.setValidateMonth(month);
	};

	onCardNumberCanged = (value) => {
		this.clearError();
		this.setState({crditCardNumError:''})
		const card = value;
		creditCardStore.setCardNumber(card);
	};

	onIdentityChanged = (value) => {
		this.clearError();
		const id = !isNullOrUndefined(value) && value.trim ? value.trim() : value;
		creditCardStore.setIdentity(id);
	};

	onNumOfPaymentSelected = (value) => {
		this.clearError();
		const numOfPayment = value;
		if (numOfPayment) {
			this.setState({numOfPayment});
			creditCardStore.setNumOfPayments(numOfPayment.key);
		} else {
			creditCardStore.setNumOfPayments(numOfPayment);
			this.setState({numOfPayment});
		}
	};

	onCvvChanged = (value) => {
		this.clearError();
		let invalidChars = ['-', '+', 'e', ')', '(', ';'];
		if ((/^\d+$/.test(value) || value == '') && value.length < 5 && !invalidChars.includes(value.key)) {
			const cvv = value;
			creditCardStore.setCvv(cvv);
		}
	};

	aggrementChecked = (e) => {
		this.clearError();
		const val = this.state.agreement ? false : true;
		this.setState({agreement: val});
	};

	saveCardChanged = (e) => {
		const val = e.target.checked;
		if(!val) {
			creditCardStore.setConfirmShortCode('');
			creditCardStore.setShortCode('');
		}
		this.setState({saveCard: val}, () => {
			creditCardStore.setSaveCard(val);
		});
	};

	onForgotCodeChanged = (e) => {
		e.preventDefault();
		if (this.props.onForgotCodeChanged) this.props.onForgotCodeChanged(e.target.checked);
	};
	onForgotCodeChangedText = () => {
		if (this.props.onForgotCodeChanged) this.props.onForgotCodeChanged(false);
	};
	onConfiremedCodeChanged = (value) => {
		this.clearError();
		creditCardStore.setConfirmShortCode(value)
	};

	validateShortCode = () => {
		if (!ValidationService.validateShortCode(creditCardStore.newShortCode)) {
			this.setState({codeError: 'יש להזין קוד בעל 5 ספרות בלבד'});
			return false;
		}
		if (!ValidationService.validateShortCode(creditCardStore.confirmShortCode)) {
			this.setState({confiremCodeError: 'יש להזין קוד בעל 5 ספרות בלבד'});
			return false;
		}
		if (!ValidationService.validateMatchPasswords(creditCardStore.newShortCode, creditCardStore.confirmShortCode)) {
			this.setState({confiremCodeError: 'קוד אישי לא תואם בין השדות, הזן שנית.'});
			return false;
		}

		return true;
	};

	getYearValidate = () => {
		const currentYear = new Date()
			.getFullYear()
			.toString()
			.slice(2, 4);
		let years: string[] = [];
		years.push(currentYear);
		for (let i = 0; i < 15; i++) {
			let year = parseInt(currentYear) + i + 1;
			const stringYear = year.toString();
			years.push(stringYear);
		}
		return years;
	};

	render() {
		const validDateOptionYear = this.getYearValidate();
		const validDateOptionMonth = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
		const numOfPaymnents = this.props.numOfPayment;
		const prefixNumbers: string[] = creditCardStore.getPrefixNumbers;
		const disableFirstAndLastName = this.props.disableFirstAndLastName ? this.props.disableFirstAndLastName : false;
		let paymentButtonText = '';
		if (this.props.allowZeroPrice) {
			paymentButtonText = Lang.format('FinishOrder');
		} else {
			paymentButtonText = this.props.isDischarge ? Lang.format('CancelLoad') : Lang.format('FinishPayment');
		}
		const termsLink = this.props.loadCard?`${RoutesPath.iframe}?link=https://www.dts.co.il/HtmlView/26042018-1 `:`${RoutesPath.iframe}?link=https://www.dts.co.il/HtmlView/10042018-1`;
		const termsText = this.props.loadCard ? 'הכרטיס הנטען' : 'של מועדון ביחד בשבילך';

		const {
			numOfPaymentError,
			cvvError,
			cardValidDateMonthError,
			cardValidDateYearError,
			ownerIdError,
			crditCardNumError,
			saveCard,
			codeError,
			confiremCodeError,
			agreementError,
			numOfPayment,
		} = this.state;
		const forgotCode = this.props.forgotCode ? this.props.forgotCode : false;
		const allowZeroPrice = this.props.allowZeroPrice ? this.props.allowZeroPrice : false;

		let NumberOfPaymentsDiv;
		if (this.props.disableNumOfPayments) {
			NumberOfPaymentsDiv = '';
		} else {
			NumberOfPaymentsDiv = (
				<div className='num-of-paymnents'>
					<CustomSelector
						selectClassName={`${this.state.numOfPaymentError ? 'red-border' : ''}`}
						required
						options={numOfPaymnents}
						keyAttribute={'key'}
						valueAttribute={'value'}
						text={Lang.format('NumOfPaymnents')}
						placeholder={'בחירה'}
						value={numOfPayment}
						onSelected={this.onNumOfPaymentSelected}
						error={this.state.numOfPaymentError}
					/>
				</div>
			);
		}
		return (
			<div className='payment-form'>
				<div className='payment-form-content'>
					{!allowZeroPrice && (
						<>
							<div className='credit-card-details-container'>
								<div className='credit-and-id'>
									<div className='credit-card-detail'>
										<CustomInputText
											required
											labelText={Lang.format('CreditCard')}
											value={creditCardStore.creditCardDetails.cardNumber}
											onChange={this.onCardNumberCanged}
											error={this.state.crditCardNumError}
											autocomplete={'cc-number'}
										/>
									</div>
									<div className='id-detail'>
										<CustomInputText
											required
											labelText={Lang.format('IDCard')}
											value={creditCardStore.creditCardDetails.identity}
											onChange={this.onIdentityChanged}
											error={this.state.ownerIdError}
											disabled={this.props.loadCard ? true : false}
										/>
									</div>
								</div>
								<div className='validation-card-with-payments'>
									<div className='validation-card'>
										<div className='date-detail-year'>
											<CustomSelector
												selectClassName={`${cardValidDateYearError ? 'red-border' : ''}`}
												required
												text={'שנה'}
												options={validDateOptionYear}
												placeholder={'שנה'}
												isPrimitiveValue
												value={creditCardStore.creditCardDetails.validateYear}
												onSelected={this.onValidateYearSelected}
												error={this.state.cardValidDateYearError}
												autocomplete={'cc-exp-year'}


											/>
										</div>
										<div className='date-detail-month'>
											<CustomSelector
												selectClassName={`${cardValidDateMonthError ? 'red-border' : ''}`}
												options={validDateOptionMonth}
												isPrimitiveValue
												text={'חודש'}
												placeholder={'חודש'}
												value={creditCardStore.creditCardDetails.validateMonth}
												onSelected={this.onValidateMonthSelected}
												error={this.state.cardValidDateMonthError}
												autocomplete={'cc-exp-month'}
												required
											/>
										</div>
										<div className='cvv-input'>
											<CustomInputText
												required
												labelText='CVV'
												type={TextTypes.Telephone}
												value={creditCardStore.creditCardDetails.cvv}
												onChange={this.onCvvChanged}
												error={this.state.cvvError}
												id={'CVV Details'}
												autocomplete={'cc-csc'} 
											/>
										</div>
									</div>
								</div>
							</div>
							{NumberOfPaymentsDiv}
						</>
					)}
				</div>
			</div>				
		);
	}
}

export default CreditCardComponentVer2;
