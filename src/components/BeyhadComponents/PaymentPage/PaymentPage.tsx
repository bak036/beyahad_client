import { observer } from 'mobx-react';
import * as moment from 'moment';
import {
	CustomAutoComplete,
	CustomHeader,
	CustomInputText,
	CustomSelector,
	CustomSeperator,
	CustomSpan,
	TextTypes,
	HeaderType,
} from 'nofshonit-base-web-client';
import * as React from 'react';
import { isNullOrUndefined } from 'util';
import Lang from '../../../config/Language';
import {
	CART_STORE,
	CREDIT_CARD_STORE,
	MESSAGES_STORE,
	ORDERS_HISTORY_STORE,
	PROFILE_CARD_STORE,
	USER_DETAILS_STORE,
	VIEW_STORE,
	CONFIGURATION_STORE,
} from '../../../consts/stores';
import CartItem from '../../../models/CartItem';
import rootStores from '../../../stores';
import CartStore from '../../../stores/CartStore';
import CreditCardStore from '../../../stores/CreditCardStore';
import MessagesStore from '../../../stores/MessagesStore';
import OrdersHistoryStore from '../../../stores/OrdersHistoryStore';
import ProfileCardStore from '../../../stores/ProfileCardStore';
import UserDetailsStore from '../../../stores/UserDetailsStore';
import ViewStore from '../../../stores/ViewStore';
import AlertUtils from '../../../utils/AlertUtils';
import GoogleAnalyticsUtils from '../../../utils/analytics/GoogleAnalyticsUtils';
import ErrorUtils from '../../../utils/errorHandling/ErrorUtils';
import StringFormatUtils from '../../../utils/StringFormatUtils';
import CreditCardComponentVer2 from './CreditCardComponentVer2/CreditCardComponentVer2';
import ShortCodeComponent from './ShortCodeComponent';
import VariantsPayment from './VariantPayment/VariantsPayment';
import ValidationService from '../../../utils/ValidationService';
import EditorMessage from '../EditorMessage/EditorMessage';
import { CreditCardType } from '../../../models/enums';
import { RoutesPath } from '../../../consts/RoutesPath';
const $ = require('jquery');
import Swal from 'sweetalert2';
import { CustomMediaQuery } from '../../CustomComponents/CustomMediaQuery/CustomMediaQuery';
import { stringify } from 'querystring';
import ConfigurationStore from '../../../stores/ConfigurationStore';
import TimeOutModal from './TimeOutModal';
import CustomModal from '../../CustomComponents/CustomModal';
import { CustomButton, Logger } from 'nofshonit-base-web-client';
import { Link } from 'react-router-dom';
import CustomButtonBeyahad from 'src/components/CustomComponents/CustomButtonBeyahad/CustomButtonBeyahad';
import StickyBar from 'src/components/CustomComponents/StickyBar/StickyBar';
import { useEffect, useRef, useState } from 'react';
import City from 'src/models/City';
import ListBox from '../EditUser/EditUserInputs/ListBox';
import Street from 'src/models/Street';
import PlacesService from 'src/services/PlacesService';
import Address from 'src/models/Address';

interface Props {
	history: any;
	setAccess: (accessPaymnnent: boolean) => void;
	isMint?: boolean;
	accessToken?: string;
}
interface IState {
	code: string;
	firstNameError: string;
	lastNameError: string;
	cityError: string;
	postalCodeError: string;
	streetError: string;
	streetNumberError: string;
	apartmentNumberError: string;
	phoneNumberError: string;
	emailError: string;
	crditCardNumError: string;
	ownerIdError: string;
	cardValidDateYearError: string;
	cardValidDateMonthError: string;
	cvvError: string;
	shortCodeError: string;
	numOfPaymentError: string;
	numOfPaymentShortCodeError: string;
	confiremCodeError: string;
	codeError: string;
	agreementError: string;
	agreement: boolean;
	prefixPhoneError: string;
	shortCodeModal: boolean;
	saveCard: boolean;
	hasShortCode: boolean;
	city: string;
	disable: boolean;
	streetName: string;
	streetNumber: string;
	apartmentNumber: string;
	postalCode: string;
	allowZeroPrice: boolean;
	benefitOnlyForBeyahadCardHoldersDesktop: string;
	benefitOnlyForBeyahadCardHoldersMobile: string;
	timeOutModal: boolean;
	messageAdrresOrder: string;
	entrance: string;
	mailbox: string;
	entranceError: string;
	mailboxError: string;
	ispaymentDetailsPopupShow: boolean;
	hasShortCodeByForgotCode: boolean;
}

const cartStore: CartStore = rootStores[CART_STORE];
const creditCardStore: CreditCardStore = rootStores[CREDIT_CARD_STORE];
const userDetailsStore: UserDetailsStore = rootStores[USER_DETAILS_STORE];
const profileCardStore: ProfileCardStore = rootStores[PROFILE_CARD_STORE];
const viewStore: ViewStore = rootStores[VIEW_STORE];
const orderHistoryStore: OrdersHistoryStore = rootStores[ORDERS_HISTORY_STORE];
const messagesStore: MessagesStore = rootStores[MESSAGES_STORE];
const configurationStore: ConfigurationStore = rootStores[CONFIGURATION_STORE];

const PaymentPage: React.FC<Props> = ({
	history,
	setAccess,
	isMint,
	accessToken,

}) => {
	let clubCreditCardSubsidizedOnlyForHolders: boolean = false;

	const allStreets: Street[] = userDetailsStore.allStreets;
	const errorStreet = Lang.format('PleaseChooseAStreetFromList');
	let selectingCity: Promise<void> | null = null;

	const [code, setCode] = useState<string>('');
	const [firstNameError, setFirstNameError] = useState<string>('');
	const [lastNameError, setLastNameError] = useState<string>('');
	const [cityError, setCityError] = useState<string>('');
	const [postalCodeError, setPostalCodeError] = useState<string>('');
	const [streetError, setStreetError] = useState<string>('');
	const [streetNumberError, setStreetNumberError] = useState<string>('');
	const [apartmentNumberError, setApartmentNumberError] = useState<string>('');
	const [phoneNumberError, setPhoneNumberError] = useState<string>('');
	const [emailError, setEmailError] = useState<string>('');
	const [crditCardNumError, setCrditCardNumError] = useState<string>('');
	const [ownerIdError, setOwnerIdError] = useState<string>('');
	const [cardValidDateYearError, setCardValidDateYearError] = useState<string>('');
	const [cardValidDateMonthError, setCardValidDateMonthError] = useState<string>('');
	const [cvvError, setCvvError] = useState<string>('');
	const [numOfPaymentError, setNumOfPaymentError] = useState<string>('');
	const [numOfPaymentShortCodeError, setNumOfPaymentShortCodeError] = useState<string>('');
	const [prefixPhoneError, setPrefixPhoneError] = useState<string>('');
	const [agreement, setAgreement] = useState<boolean>(false);
	const [shortCodeModal, setShortCodeModal] = useState<boolean>(false);
	const [saveCard, setSaveCard] = useState<boolean>(false);
	const [forgotCode, setForgotCode] = useState<boolean>(false);
	const [hasShortCode, setHasShortCode] = useState<boolean>(false);
	const [city, setCity] = useState<any>(userDetailsStore.address.city);
	const [disable, setDisable] = useState<boolean>(false);
	const [streetName, setStreetName] = useState<string>(userDetailsStore.address.streetName);
	const [streetNumber, setStreetNumber] = useState<string>(userDetailsStore.address.streetNumber);
	const [allowZeroPrice, setAllowZeroPrice] = useState<boolean>(false);
	const [postalCode, setPostalCode] = useState<string>(userDetailsStore.address.postalCode);
	const [apartmentNumber, setApartmentNumber] = useState<string>(userDetailsStore.address.apartmentNumber);
	const [timeOutModal, setTimeOutModal] = useState<boolean>(false);
	const [ispaymentDetailsPopupShow, setIspaymentDetailsPopupShow] = useState<boolean>(false);
	const [hasShortCodeByForgotCode, setHasShortCodeByForgotCode] = useState<boolean>(false);
	const [benefitOnlyForBeyahadCardHoldersMobile, setBenefitOnlyForBeyahadCardHoldersMobile] = useState<string>('');
	const [benefitOnlyForBeyahadCardHoldersDesktop, setBenefitOnlyForBeyahadCardHoldersDesktop] = useState<string>('');
	const [mailboxError, setMailboxError] = useState<string>('');
	const [shortCodeError, setShortCodeError] = useState<string>('');
	const [confiremCodeError, setConfiremCodeError] = useState<string>('');
	const [codeError, setCodeError] = useState<string>('');
	const [agreementError, setAreementError] = useState<string>('');
	const [entranceError, setEntranceError] = useState<string>('');
	const [mailbox, setMailbox] = useState<string>(userDetailsStore.address.mailbox);
	const [entrance, setEntrance] = useState<string>(userDetailsStore.address.entrance);
	const [messageAdrresOrder, setMessageAdrresOrder] = useState<string>('');
	const mounted = useRef(false);
	const [showCityError, setShowCityError] = React.useState<boolean>(false);
	const [cityName, setCityName] = React.useState<string>('');
	const [allCitiesFilter, setAllCitiesFilter] = React.useState<City[]>([]);
	const errorCity = Lang.format('PleaseChooseACityFromList');
	const [showCitiesListBox, setShowCitiesListBox] = React.useState<boolean>(false);
	const [isFirstTimeCity, setIsFirstTimeCity] = React.useState<boolean>(true);
	const [isFirstTimeStreet, setIsFirstTimeStreet] = React.useState<boolean>(true);
	const [street, setStreet] = React.useState<string>('');
	const [allStreetsFilter, setAllStreetsFilter] = React.useState<Street[]>(allStreets);
	const [allStreetsForCity, setAllStreetsForCity] = React.useState<Street[]>(allStreets);
	const [showStreerError, setShowStreetError] = React.useState<boolean>(false);
	const [showStreetsListBox, setShowStreetsListBox] = React.useState<boolean>(false);
	const [isSelectingStreet, setIsSelectingStreet] = React.useState(false);
	const [isSelectingCity, setIsSelectingCity] = React.useState(false);
	const [isBlurredCity, setIsBlurredCity] = React.useState(true);
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const isSubmittingRef = useRef(false);

	clubCreditCardSubsidizedOnlyForHolders = configurationStore.getConfiguration.ClubCreditCardSubsidizedOnlyForHolders && !userDetailsStore.authStore.currentUser.memberSpecial;

	useEffect(() => {
		userDetailsStore.initConfig();
		userDetailsStore.initUserDetails();
		userDetailsStore.getAllCities();

		initMessages();
		initAllData();

		if (userDetailsStore.address.city) {
			setCityName(userDetailsStore.address.city.cityName);
			setStreet(userDetailsStore.address.streetName);
			setPostalCode(userDetailsStore.address.postalCode);
			setApartmentNumber(userDetailsStore.address.apartmentNumber);
			setStreetNumber(userDetailsStore.address.streetNumber);
			setMailbox(userDetailsStore.address.mailbox);
			setEntrance(userDetailsStore.address.entrance);
		}
	}, []);
	const changeCityName = (val) => {
		if (showCityError)
			setShowCityError(false);
		if (userDetailsStore.cityError)
			userDetailsStore.setCityError('');

		if (city)
			setCity(new City());

		if (!ValidationService.ValidateCharactersOnly(val.currentTarget.value))
			val.currentTarget.value = val.currentTarget.value.slice(0, val.currentTarget.value.length - 1);

		setCityName(val.currentTarget.value);
		if (val.currentTarget.value && allCities) {
			setIsBlurredCity(false);
			let tempCities = allCities.filter(c => c.cityName && c.cityName.includes(val.currentTarget.value))
				.reduce((unique: City[], city: City) => {
					if (!unique.some(c => c.cityName === city.cityName)) {
						unique.push(city);
					}
					return unique;
				}, []);
			setAllCitiesFilter(tempCities);
			if (tempCities.length > 0) {
				setShowCityError(false);
				setShowCitiesListBox(true);
			}
			else
				setShowCitiesListBox(false);

		}
		else {
			setAllCitiesFilter(allCities);
			setShowCitiesListBox(true);
		}

	}
	const blurChangeCity = () => {
		setIsBlurredCity(true);
		setTimeout(async () => {
			if (selectingCity) {
				await selectingCity;
				return;
			}
			if (isSelectingCity)
				return;
			const foundCity = allCities.find(c => c.cityName === cityName);
			if (foundCity) {
				await clearChoiceStreet(foundCity);
				setCity(foundCity);
			} else {
				setShowCityError(true);
				setCityName("");
				setShowStreetsListBox(false);
			}

			if (showCitiesListBox) {
				setShowCitiesListBox(false);
			}
		}, 200);

	};
	const selectCityFromList = async (city: City) => {
		setIsSelectingCity(true);

		selectingCity = (async () => {
			await clearChoiceStreet(city);
			setCity(city);
			setCityName(city.cityName);
			setShowCitiesListBox(false);
			setIsSelectingCity(false);
		})();

		await selectingCity;
		selectingCity = null;
	};
	const clearChoiceStreet = async (city: City) => {
		if (userDetailsStore.address.city.cityName != city.cityName || (allStreetsFilter && allStreetsFilter[0] && allStreetsFilter[0].cityId !== city.cityId)) {
			setShowStreetError(true);
			setStreetName('');
		}
		await initAllStreets(city.cityId);

	}
	const initAllStreets = async (cityId) => {
		if (!cityId)
			return;

		await PlacesService.getStreetsByCity(cityId).then((res) => {
			let streetsList = res.filter(function (item, pos) {
				return res.indexOf(item) == pos;
			});
			let allStreets = streetsList || [];
			let tempStreets = allStreets.reduce((unique: Street[], street: Street) => {
				if (!unique.some(s => s.streetName === street.streetName)) {
					unique.push(street);
				}
				return unique;
			}, []);
			setAllStreetsFilter(tempStreets);
			setAllStreetsForCity(allStreets);
		});
	}
	const onFocusCityInput = () => {
		setShowCityError(false);
		setCityError('');
		setShowCitiesListBox(true);
		let tempCities;
		if (cityName)
			tempCities = allCities.filter(c => c.cityName && c.cityName.includes(cityName))
				.reduce((unique: City[], city: City) => {
					if (!unique.some(c => c.cityName === city.cityName)) {
						unique.push(city);
					}
					return unique;
				}, []);
		else
			tempCities = allCities.reduce((unique: City[], city: City) => {
				if (!unique.some(c => c.cityName === city.cityName)) {
					unique.push(city);
				}
				return unique;
			}, []);;
		setAllCitiesFilter(tempCities);
	};
	const onFocusStreetInput = () => {

		console.log(streetName)
		if (!streetName || isBlurredCity) {
			setIsBlurredCity(false);
			setShowStreetError(false);
			setShowStreetsListBox(true);
		}
	};
	const changeStreetName = (val) => {
		if (showStreerError)
			setShowStreetError(false);
		if (userDetailsStore.streetNameError)
			userDetailsStore.setStreetNameError('')

		if (!ValidationService.ValidateCharactersAndNumbersOnly(val.currentTarget.value))
			val.currentTarget.value = val.currentTarget.value.slice(0, val.currentTarget.value.length - 1);

		setStreetName(val.currentTarget.value);

		if (val.target.value && allStreetsForCity) {
			let tempStreets = allStreetsForCity.filter(s => s.streetName && s.streetName.includes(val.target.value));
			setAllStreetsFilter(tempStreets);
			if (tempStreets.length > 0)
				setShowStreetsListBox(true);
			else
				setShowStreetsListBox(false);
		}
		else {
			setAllStreetsFilter(allStreetsForCity);
			setShowStreetError(false);
			setShowStreetsListBox(true);
		}
	};
	const blurChangeStreet = () => {
		setTimeout(() => {
			if (isSelectingStreet) {
				return; // Exit early if a selection is in progress
			}
			const foundStreet = allStreetsForCity.find(s => s.streetName === streetName);
			if (foundStreet) {
				setStreetName(foundStreet.streetName);
			} else {
				setShowStreetError(true);
				setStreetName("");
			}

			setShowStreetsListBox(false);
		}, 0);
	};
	const selectStreetFromList = (street: Street) => {
		setIsSelectingStreet(true);
		setStreetName(street.streetName);
		setShowStreetsListBox(false);
		setIsSelectingStreet(false);
	};
	const initMessages = async () => {
		const benefitOnlyForBeyahadCardHoldersDesktop = await messagesStore.getSingleMessageFromService(messagesStore.benefitOnlyForBeyahadCardHoldersDesktopKey);
		const benefitOnlyForBeyahadCardHoldersMobile = await messagesStore.getSingleMessageFromService(messagesStore.benefitOnlyForBeyahadCardHoldersMobileKey);
		const messageAdrresOrder = await messagesStore.getSingleMessageFromService(messagesStore.messageAdrresOrderInfo);

		setBenefitOnlyForBeyahadCardHoldersDesktop(benefitOnlyForBeyahadCardHoldersDesktop)
		setBenefitOnlyForBeyahadCardHoldersMobile(benefitOnlyForBeyahadCardHoldersMobile)
		setMessageAdrresOrder(messageAdrresOrder)
	}
	const setAccessFunc = () => {
		setAccess(true);
	};
	const redirectToCart = () => {
		if (isMint) {
			history.replace('/mint/cart/payment');
		} else {
			history.replace('/cart');
		}
	};
	const validate = () => {
		let retVal = true;

		if (cartStore.hasConsumerProduct) {
			if (!apartmentNumber) {
				setApartmentNumberError(Lang.format('ApartmentNumberError'))
				retVal = false;
			}
			if (!streetNumber) {
				setStreetNumberError(Lang.format('StreetNumberError'))
				retVal = false;
			}
			if (!city || !city['cityId'] || !city['cityName']) {
				setCityError(Lang.format('CityError'))
				retVal = false;
			}
			else {
				if (city['cityName']) {
					let tempCities = allCities
						.filter((c) => c.cityName && c.cityName.includes(city['cityName']))
						.reduce((unique: City[], city: City) => {
							if (!unique.some((c) => c.cityName === city['cityName'])) {
								unique.push(city);
							}
							return unique;
						}, []);
					if (tempCities.length == 0) {
						setCityError(Lang.format('CityError'));
						retVal = false;
					}
				}
			}
			if (!streetName) {
				setStreetError(Lang.format('StreetError'))
				retVal = false;
			}
			if (!postalCode || (postalCode.length != 5 && postalCode.length != 7)) {
				setPostalCodeError(Lang.format('PleaseEnterYourPostalCode'))
				retVal = false;
			}
			if (creditCardStore.creditCardDetails.phoneNumber.length !== 7) {
				setPhoneNumberError(Lang.format('ValidatePhone'))
				retVal = false;
			} else {
				setPhoneNumberError('')
			}
			if (ValidationService.validateNumbersOnly(creditCardStore.creditCardDetails.phoneNumber) == false) {
				setPhoneNumberError(Lang.format('ValidatePhone'))
				retVal = false;
			}
			if (ValidationService.validateEmail(creditCardStore.creditCardDetails.email) === false) {
				setEmailError(Lang.format('ValidateEmail'))
				retVal = false;
			}

			if (creditCardStore.creditCardDetails.phoneNumber.length === 0) {
				setPhoneNumberError(Lang.format('ValidatePhoneEmpty'))
				retVal = false;
			}
			if (!creditCardStore.creditCardDetails.phoneNumberPrefix) {
				setPrefixPhoneError(Lang.format('ValidatePhonePrefixEmpty'))
				retVal = false;
			}
			if (!creditCardStore.creditCardDetails.email) {
				setEmailError(Lang.format('ValidateEmailEmpty'))
				retVal = false;
			}

		}
		if (!hasShortCode || (hasShortCode && hasShortCodeByForgotCode)) {
			let month = new Date().getMonth();
			let year = new Date()
				.getFullYear()
				.toString()
				.slice(2, 4);

			if (creditCardStore.creditCardDetails.phoneNumber.length !== 7) {
				setPhoneNumberError(Lang.format('ValidatePhone'))
				retVal = false;
			} else {
				setPhoneNumberError('')
			}
			if (ValidationService.validateNumbersOnly(creditCardStore.creditCardDetails.phoneNumber) == false) {
				setPhoneNumberError(Lang.format('ValidatePhone'))
				retVal = false;
			}
			if (ValidationService.validateEmail(creditCardStore.creditCardDetails.email) === false) {
				setEmailError(Lang.format('ValidateEmail'))
				retVal = false;
			}

			if (creditCardStore.creditCardDetails.phoneNumber.length === 0) {
				setPhoneNumberError(Lang.format('ValidatePhoneEmpty'))
				retVal = false;
			}
			if (!creditCardStore.creditCardDetails.phoneNumberPrefix) {
				setPrefixPhoneError(Lang.format('ValidatePhonePrefixEmpty'))
				retVal = false;
			}
			if (!creditCardStore.creditCardDetails.email) {
				setEmailError(Lang.format('ValidateEmailEmpty'))
				retVal = false;
			}
			if (creditCardStore.creditCardDetails.cardNumber.length === 0) {
				setCrditCardNumError(Lang.format('ValidateCreditCardEmpty'))
				retVal = false;
			}
			if (!creditCardStore.validateCreditCardNumber(creditCardStore.creditCardDetails.cardNumber)) {
				setCrditCardNumError(Lang.format('ValidateCreditCard'))
				retVal = false;
			}
			if (creditCardStore.creditCardDetails.identity.length !== 9) {
				setOwnerIdError(Lang.format('ValidateId'))
				retVal = false;
			}
			if (ValidationService.validateID(creditCardStore.creditCardDetails.identity) == false) {
				setOwnerIdError(Lang.format('ValidateId'))
				retVal = false;
			}
			if (
				creditCardStore.creditCardDetails.validateYear === null ||
				creditCardStore.creditCardDetails.validateYear.length === 0
			) {
				setCardValidDateYearError(Lang.format('ValidateCreditCardDate'))
				retVal = false;
			}
			if (
				!creditCardStore.creditCardDetails.validateMonth ||
				creditCardStore.creditCardDetails.validateMonth.length === 0
			) {
				setCardValidDateMonthError(Lang.format('ValidateCreditCardDate'))
				retVal = false;
			}
			if (creditCardStore.creditCardDetails.cvv.length !== 3 && creditCardStore.creditCardDetails.cvv.length !== 4) {
				setCvvError(Lang.format('ValidateCreditCardBackDigits'))
				retVal = false;
			}
			if (
				parseInt(creditCardStore.creditCardDetails.validateMonth) < month &&
				parseInt(creditCardStore.creditCardDetails.validateYear) <= parseInt(year)
			) {
				setCardValidDateMonthError('חודש זה אינו תקף')
				retVal = false;
			}
		}

		if (hasShortCode && !hasShortCodeByForgotCode) {
			if (!ValidationService.validateShortCode(creditCardStore.shortCode)) {
				setShortCodeError('יש להזין קוד מקוצר בעל 5 ספרות בלבד')
				retVal = false;
			}
		}

		if (saveCard) {
			if (!validateShortCode()) {
				retVal = false;
			}
		}


		if (creditCardStore.creditCardDetails.numOfPayments == null || creditCardStore.creditCardDetails.numOfPayments.length == 0) {
			if ((!hasShortCode || hasShortCodeByForgotCode))
				setNumOfPaymentError('יש להזין מספר תשלומים')
			else
				setNumOfPaymentShortCodeError('יש להזין מספר תשלומים')
			retVal = false;
		}

		return retVal;
	};
	const checkTicketExpired = (paymentItems: CartItem[]) => {
		if (paymentItems && paymentItems.length > 0) {
			const nowMoment = moment();
			for (let i = 0; i < paymentItems.length; i++) {
				const currentItem = paymentItems[i];
				if (!isNullOrUndefined(currentItem) && !isNullOrUndefined(currentItem.expireDate)) {
					const itemExpireDate = moment(currentItem.expireDate);
					const isSameOrAfter = itemExpireDate.isSameOrBefore(nowMoment);
					if (isSameOrAfter) {
						return true;
					}
				}
			}
		}

		// In any other case, return false
		return false;
	}
	const onContinue = () => {
		setTimeOutModal(false)
		cartStore.cartOne.clear();
		cartStore.cartPayment.clear();
		cartStore.cartCopy.clear();
		history.replace('/');
	};
	const timeOutMethod = () => {
		viewStore.setLoadingView(false);
		setTimeOutModal(true)
	}
	const renderTimeOutModal = () => {
		return <TimeOutModal onContinue={onContinue} onCancel={onContinue} />;
	};
	const onPayClicked = async () => {
		if (isSubmittingRef.current) {
			return;
		}

		isSubmittingRef.current = true;
		setIsSubmitting(true);

		let timeOutTimer;
		viewStore.setLoadingView(true);
		cartStore.setCartCopy(cartStore.getCart);

		// Check If ticket from
		if (checkTicketExpired(cartStore.getCartForPayment)) {
			AlertUtils.basicAlert('', messagesStore.eventimTicketExpired);
			return;
		}


		try {
			timeOutTimer = setTimeout(timeOutMethod, configurationStore.config.timeOutSeconds);
			viewStore.setLoadingView(true);
			const res = await generateSendPayRequest(CreditCardType.MaxCard);
			onPurchaseComplete(res);

		} catch (err) {
			if (timeOutTimer) {
				clearTimeout(timeOutTimer);
			}

			if (err.message === "ThisIsNotMaxCard") {
				await cartStore.updateCreditCardType(CreditCardType.RegularCard);
				viewStore.setLoadingView(false);
				const alertRes = await Swal.fire({
					html: `<span style="color: #00173a">${Lang.format("PriceChagedForRegularCardHolders")} ${cartStore.getSumCart} ש"ח</span>`,
					showCancelButton: true,
					cancelButtonText: Lang.format("ChangePaymentMethod"),
					confirmButtonColor: '#a6ce3a',
					cancelButtonColor: '#00173a',
					confirmButtonText: Lang.format("ContinueToPayment"),
					footer: `<a id="GoBackToShoppingCart" href="javascript:void(0)">${Lang.format('GoBackToShoppingCart')}</a>`,
					reverseButtons: true,
					allowOutsideClick: false,
				})

				if (alertRes.value) { // user agree to pay non benifit price
					try {
						viewStore.setLoadingView(true);
						const res = await generateSendPayRequest(CreditCardType.RegularCard);

						onPurchaseComplete(res);
						viewStore.setLoadingView(false);
					} catch (error) {
						await cartStore.updateCreditCardType(CreditCardType.MaxCard); // if some error accours show prices with benefits
						viewStore.setLoadingView(false);
						ErrorUtils.checkErrorAndShowPopUp(error, '', '').then(() => {
							redirectToCart();
						});
					}
				} else { // user want to change credit card
					viewStore.setLoadingView(true);
					creditCardStore.clearCreditCardDetails();
					deleteShortCode();
					await cartStore.updateCreditCardType(CreditCardType.MaxCard);
					viewStore.setLoadingView(false);
				}

			} else if (err.message === messagesStore.pinCodeBlockMessages) {

				ErrorUtils.checkErrorAndShowPopUp(err, '', '').then(async () => {
					creditCardStore.authStore.setHasPinCode(false);
					setHasShortCode(false)

					viewStore.setLoadingView(false);

				});

			} else {
				viewStore.setLoadingView(false);
				ErrorUtils.checkErrorAndShowPopUp(err, '', '');
			}
		} finally {
			if (timeOutTimer) {
				clearTimeout(timeOutTimer);
			}
			isSubmittingRef.current = false;
			setIsSubmitting(false);
			viewStore.setLoadingView(false);
		}
	};
	const onPurchaseComplete = (res) => {
		orderHistoryStore.setLastOrder(res, creditCardStore.creditCardDetails.identity);
		setAccessFunc();
		GoogleAnalyticsUtils.onPurchaseComplete(
			cartStore.getCoupon,
			cartStore.getCart,
			cartStore.getSumCart,
			res.orderConfirmation,
			cartStore.getCartForPayment,
		);
		cartStore.init().then(() => {
			creditCardStore.clearCreditCardDetails();
			viewStore.setLoadingView(false);
		});
	}
	const goBackToShoppingCart = async () => {
		viewStore.setLoadingView(true);
		await cartStore.updateCreditCardType(CreditCardType.MaxCard);
		Swal.close();
		viewStore.setLoadingView(false);
		redirectToCart();
	}
	const goBackToShoppingCartHelper = () => { // Todo: haim: this is not the best practice but this is the only way I could find to handle click from inside SWAL (custom button)
		$('body').on('click', "#GoBackToShoppingCart", goBackToShoppingCart);
	}
	const generateSendPayRequest = async (creditCardType) => {
		let request;
		let cartItemsForPayment: any = cartStore.getCartForPayment;
		let sumPrice = cartStore.getSumCart;
		// Take only products with price zero when allowZeroPrice is true
		if (isAllowPriceZero()) {
			cartItemsForPayment = cartItemsForPayment.filter((c) => c.allowPriceZero == true);
			sumPrice = 0;
			creditCardStore.setNumOfPayments('1')
		}

		if (cartStore.hasConsumerProduct) {
			request = await creditCardStore.sendPaymnet(
				cartItemsForPayment,
				sumPrice,
				cartStore.getEventsGuid,
				creditCardType,
				new Address({
					city: city,
					streetNumber: streetNumber,
					streetName: streetName,
					apartmentNumber: apartmentNumber,
					postalCode: postalCode,
					cityTextName: cityName,
					mailbox: mailbox,
					entrance: entrance
				})
			);
		} else {
			request = await creditCardStore.sendPaymnet(cartItemsForPayment, cartStore.getSumCart, cartStore.getEventsGuid, creditCardType);
		}
		return request;
	}
	const saveShortCode = (shortCode) => {
		creditCardStore.setShortCode(shortCode);
	};
	const deleteShortCode = () => {
		creditCardStore.setShortCode('');
	};
	const onShortCodeChanged = (value) => {
		const code = value;
		creditCardStore.setShortCode(code);
	};
	const onForgotShortCodeClicked = (e) => {
		if (e && e.target)
			setHasShortCodeByForgotCode(e.target.checked)
	};
	const onStreetNumberChanged = (streetNumber) => {
		setStreetNumber(streetNumber)
	};
	const onApartmentNumberChanged = (apartmentNumber) => {
		setApartmentNumber(apartmentNumber)
	};
	const onEntranceChanged = (entrance) => {
		if (entrance && entrance.length <= 10) {
			if (!ValidationService.ValidateCharactersAndNumbersOnly(entrance)) return;
			setEntrance(entrance)
		} if (!entrance) {
			setEntrance('')
		}
	};
	const onMailboxChanged = (mailbox) => {
		if (mailbox && mailbox.length <= 5) {
			setMailbox(mailbox)
		} if (!mailbox) {
			setMailbox('')
		}

	};
	const onPostalCodeChanged = (postalCode) => {
		clearErrors();
		if (postalCode && ValidationService.validateNumbersOnly(postalCode)) {
			setPostalCode(postalCode)
		} else if (!postalCode) {
			setPostalCode('')
		}
	}
	const clearErrors = () => {
		setFirstNameError('')
		setLastNameError('')
		setPhoneNumberError('')
		setEmailError('')
		setCityError('')
		setPostalCodeError('')
		setStreetError('')
		setStreetError('')
		setStreetNumberError('')
		setApartmentNumberError('')
		setPhoneNumberError('')
		setAreementError('')
		setCrditCardNumError('')
		setOwnerIdError('')
		setCardValidDateYearError('')
		setCardValidDateMonthError('')
		setCvvError('')
		setCodeError('')
		setConfiremCodeError('')
		setNumOfPaymentError('')
		setNumOfPaymentShortCodeError('')
		setShortCodeError('')
	};
	const initAllData = () => {
		if (!mounted.current) {
			mounted.current = true;
			GoogleAnalyticsUtils.sendShopingBasketDetailsToAnalytics('begin_checkout', cartStore.getCartForPayment);
			const { streetName, streetNumber, city, apartmentNumber, postalCode, entrance, mailbox } = creditCardStore.authStore.currentUser.address;
			if (cartStore.getCart.length === 0) {
				if (isMint) {
					history.replace('/mint/cart');
				} else {
					history.replace('/cart');
				}
			}
			if (cartStore.hasConsumerProduct) {
				userDetailsStore.setCity(city);
				userDetailsStore.address.setStreetName(streetName);
				userDetailsStore.address.setApartmentNumber(apartmentNumber);
				userDetailsStore.address.setStreetNumber(streetNumber);
				userDetailsStore.address.setPostalCode(postalCode);
				userDetailsStore.address.setEntrance(entrance);
				userDetailsStore.address.setMailbox(mailbox);

			}
			creditCardStore.initConfig();

			if (isAllowPriceZero()) {
				setAllowZeroPrice(true);
				onForgotShortCodeClicked(true);
			}
			setHasShortCode(profileCardStore.authStore.hasShortCode)
			setCity(city)
			setStreetNumber(streetNumber)
			setStreetName(streetName)
			// if (cartStore.getCart.filter((c) => c.allowPriceZero == true).length == 0) {
			// 	this.setState({cartSum: cartStore.getSumCart});
			// }
			goBackToShoppingCartHelper();
		} else {
			if (isAllowPriceZero()) {
				if (!allowZeroPrice) {
					setAllowZeroPrice(true)
					onForgotShortCodeClicked(true);
				}
			}
		}
	}
	const isAllowPriceZero = () => {
    // If the actual cart total is greater than 0, credit card is required
    if (cartStore.getSumCart > 0) {
        return false;
    }
    const cart = cartStore.getCart;
    for (let i = 0; i < cart.length; i++) {
        const variants = cart[i].variants;
        if (variants) {
            for (let b = 0; b < variants.length; b++) {
                if (variants[b].barCode === '1002486-4') {
                    return true;
                }
            }
        }
    }
    if (cart.filter((c: any) => c.allowPriceZero == true).length > 0
        && cart.filter((c: any) => !c.allowPriceZero).length < 1) {
        return true;
    }
    return false;
}
	const fillTestCreditCard = () => {
		// Just for Test Environment
		creditCardStore.setCardNumber('4580458045804580');
		creditCardStore.setNumOfPayments('1');
		creditCardStore.setCvv('123');
		creditCardStore.setValidateMonth('12');
		creditCardStore.setValidateYear('27');
	};
	const getSumfItems = () => {
		let itemsSum = 0;
		let stroeIncludeCardFriend = 1;
		const categories: CartItem[] = cartStore.getCart;
		categories.forEach(c => {
			if (c && c.variants && c.variants.filter(v => v.barCode == '1002486-4').length > 0)
				stroeIncludeCardFriend = 0;
			else if (c && c.variants && c.variants.length)
				c.variants.forEach(v => itemsSum += v.quantity)
			else if (c && c.tickets && c.quantity)
				itemsSum += c.quantity
		})
		if (stroeIncludeCardFriend == 0) {
			return 1;
		}
		return itemsSum;
	}
	const getSumCart = () => {
		let itemsSum = 1;
		const categories: CartItem[] = cartStore.getCart;
		categories.forEach(c => {
			if (c && c.variants && c.variants.filter(v => v.barCode == '1002486-4').length > 0)
				itemsSum = 0;
		})
		if (itemsSum === 0)
			return 0;
		return cartStore.getSumCart;
	}
	const onFirstNameChanged = (value) => {
		clearErrors();
		const firstName = value;

		creditCardStore.setOwnerFirstName(firstName);
	}
	const onLastNameChanged = (value) => {
		clearErrors();
		const lastName = value;
		creditCardStore.setOwnerLastName(lastName);
	}
	const onEmailChanged = (value) => {
		clearErrors();
		const email = value;
		creditCardStore.setEmail(email);
	}
	const onPrefixPhoneNumSelected = (value) => {
		clearErrors();
		const prefix = value;
		creditCardStore.setPrefixNumber(prefix);
	}
	const onPhoneNumberChanged = (value) => {
		// this.clearError();
		const phone = value;
		creditCardStore.setPhoneNumber(phone);
	}

	const onForgotCodeChanged = (e) => {
		e.preventDefault();
		if (onForgotCodeChanged) onForgotCodeChanged(e.target.checked);
	}
	const onForgotCodeChangedText = () => {
		if (onForgotCodeChanged) onForgotCodeChanged(false);
	}
	const onConfiremedCodeChanged = (value) => {
		clearErrors();
		creditCardStore.setConfirmShortCode(value)
	}


	const validationForItemsWithZeroPrice = () => {
		let retVal: boolean = true;

		if (creditCardStore.creditCardDetails.phoneNumber.length !== 7) {
			setPhoneNumberError(Lang.format('ValidatePhone'))
			retVal = false;
		} else {
			setPhoneNumberError('')
		}
		if (ValidationService.validateNumbersOnly(creditCardStore.creditCardDetails.phoneNumber) == false) {
			setPhoneNumberError(Lang.format('ValidatePhone'))
			retVal = false;
		}
		if (ValidationService.validateEmail(creditCardStore.creditCardDetails.email) === false) {
			setEmailError(Lang.format('ValidateEmail'))
			retVal = false;
		}
		if (creditCardStore.creditCardDetails.phoneNumber.length === 0) {
			setPhoneNumberError(Lang.format('ValidatePhoneEmpty'))
			retVal = false;
		}
		if (!creditCardStore.creditCardDetails.phoneNumberPrefix) {
			setPrefixPhoneError(Lang.format('ValidatePhonePrefixEmpty'))
			retVal = false;
		}
		if (!creditCardStore.creditCardDetails.email) {
			setEmailError(Lang.format('ValidateEmailEmpty'))
			retVal = false;
		}
		return retVal;
	}

	const validateShortCode = () => {
		if (!ValidationService.validateShortCode(creditCardStore.newShortCode)) {
			setCodeError('יש להזין קוד בעל 5 ספרות בלבד')
			return false;
		}
		if (!ValidationService.validateShortCode(creditCardStore.confirmShortCode)) {
			setConfiremCodeError('יש להזין קוד בעל 5 ספרות בלבד')
			return false;
		}
		if (!ValidationService.validateMatchPasswords(creditCardStore.newShortCode, creditCardStore.confirmShortCode)) {
			setConfiremCodeError('קוד אישי לא תואם בין השדות, הזן שנית.')
			return false;
		}

		return true;
	}

	const aggrementChecked = (e) => {
		clearErrors();
		const val = agreement ? false : true;
		setAgreement(val)
	}

	const onShortCodeChange = (value) => {
		clearErrors();
		const code = value;
		creditCardStore.setNewShortCode(value)
		creditCardStore.setShortCode(code);
	}

	const sendPaymnetClicked = async () => {
		if (isSubmittingRef.current) {
			return;
		}

		let moreValidations = validate();

		if (allowZeroPrice) {
			if (validationForItemsWithZeroPrice() && agreement) {
				await onPayClicked();
			} else {
				if (agreement == false) {
					setAreementError(Lang.format('ValidateAgreement'))
				}
			}
		} else {
			if (validate() && agreement && moreValidations) {
				if (hasShortCode && saveCard) {
					if (validateShortCode()) {
						saveShortCode(creditCardStore.newShortCode);
						// console.log(this.onPayClicked().toString())
						await onPayClicked();
					}
				} else {
					await onPayClicked();
				}
			} else {
				Logger.debug('validate');
				if (agreement == false) {
					setAreementError(Lang.format('ValidateAgreement'))
				}
			}
		}
	};

	const saveCardChanged = (e) => {
		const val = e.target.checked;
		if (!val) {
			creditCardStore.setConfirmShortCode('');
			creditCardStore.setShortCode('');
		}
		setSaveCard(val)
		creditCardStore.setSaveCard(val);
	}

	const showPaymentDetailsMobile = () => {
		setIspaymentDetailsPopupShow(true)
	}
	const hidePaymentDetailsMobile = () => {
		setIspaymentDetailsPopupShow(false)
	}

	const getTotalSumDataForSticky = () => {
		return (
			<div className='sum-sticky-container'>
				<div className='num-allproducts'>
					<div className='num-text'>
						<CustomSpan classNameSpan={'sum-text-item'} text={`מוצרים`} />
					</div>
					<div className='total'>
						<CustomSpan classNameSpan={'total-text'} text={`${getSumfItems()}`} />
					</div>
				</div>
				<div className='sum-allproducts'>
					<div className='sum-text'>
						<CustomSpan classNameSpan={'sum-text-item'} text={`סה"כ לתשלום`} />
					</div>
					<div className='total'>
						<CustomSpan
							classNameSpan={'total-text'}
							text={`${StringFormatUtils.tryConvertToLocaleString(getSumCart())} ₪`}
						/>
					</div>
				</div>
				<CustomButtonBeyahad
					buttonText='לפרטים'
					isBackgroundColor={false}
					onClick={showPaymentDetailsMobile} />
			</div>
		)

	}


	const getVariantNumber = () => {
		let itemsSum = 0;
		const categories: CartItem[] = cartStore.getCart;
		categories.forEach(c => {
			if (c && c.variants && c.variants.length)
				c.variants.forEach(v => itemsSum += v.quantity)
			if (c && c.tickets && c.tickets.length)
				itemsSum += c.tickets.length
		})
		return itemsSum;
	};

	let categories = cartStore.getCart;
	let cartOnlyWithPriceZero: any = categories.filter((c: any) => c.allowPriceZero == true && c.barCode == '1002486-4');
	if (cartOnlyWithPriceZero.length > 0) {
		categories = cartOnlyWithPriceZero;
	}
	const cartLength = cartStore.getCart.length > 0 ? true : false;
	const consumerProduct = cartStore.hasConsumerProduct;
	//const { city } = creditCardStore.authStore.currentUser.address;
	const { otherCityName } = userDetailsStore;
	const allCities: City[] = profileCardStore.allCities;
	const numOfPayments = cartStore.getSumCart > 150 ? cartStore.numOfPayment : [{ key: 1, value: 'תשלום אחד' }];
	const onePaymentDefualt = cartStore.getSumCart < 300;
	const prefixNumbers: string[] = creditCardStore.getPrefixNumbers;
	const termsLink = `${RoutesPath.iframe}?link=https://www.dts.co.il/HtmlView/10042018-1`;
	const termsText = 'של מועדון ביחד בשבילך';
	useEffect(() => {
		if (cartStore.hasConsumerProduct) {
			if (!allCities || allCities.length === 0) return;
			if (city && city.cityId && city.cityName && allCities) {
				let tempCities = allCities
					.filter((c) => c.cityName && c.cityName.includes(city.cityName))
					.reduce((unique: City[], city: City) => {
						if (!unique.some((c) => c.cityName === city.cityName)) {
							unique.push(city);
						}
						return unique;
					}, []);
				if (tempCities.length > 0) {
					userDetailsStore.setCity(city.cityId);
				} else {
					setCityError(Lang.format('CityError'));
					setShowCityError(true);
					setCityName('');
				}
			}
			userDetailsStore.address.setStreetName(streetName);
			userDetailsStore.address.setApartmentNumber(apartmentNumber);
			userDetailsStore.address.setStreetNumber(streetNumber);
			userDetailsStore.address.setPostalCode(postalCode);
			userDetailsStore.address.setEntrance(entrance);
			userDetailsStore.address.setMailbox(mailbox);

		}
	}, [city, allCities]);

	return (
		<>
			<CustomMediaQuery.Mobile>
				{ispaymentDetailsPopupShow && (
					<div className='payment-details-mobile-container'>
						<div className='nav-with-prod'>

							<div className='top-left-close-btn'>
								<img
									onClick={hidePaymentDetailsMobile}
									src={require('../../../assets/icons/close.svg')}
								/>
							</div>

							<CustomHeader
								headerClassName={'large-font'}
								text={Lang.format('MyProducts').replace('{{}}', getVariantNumber())}
							/>
							<div className='nav-with-prod-inner'>
								<div className='allproduct-container'>
									<VariantsPayment categories={categories} />
									<div className='sum-allproducts'>
										<div className='sum-text'>
											<CustomSpan classNameSpan={'sum-text-item'} text={`סה"כ לתשלום:`} />
										</div>
										<div className='total'>
											<CustomSpan
												classNameSpan={'total-text'}
												text={`${StringFormatUtils.tryConvertToLocaleString(cartStore.getSumCart)} ₪`}
											/>
										</div>
									</div>
								</div>
								{process.env.NODE_ENV == 'development' && (
									<div
										style={{ backgroundColor: 'green', color: 'white', padding: '5px' }}
										onClick={fillTestCreditCard}>
										מלא אשראי טסטים
									</div>
								)}
							</div>
						</div>
					</div>
				)}

				<StickyBar children={getTotalSumDataForSticky()} />
			</CustomMediaQuery.Mobile>

			<div className='payment-main-container'>
				<CustomModal
					visible={timeOutModal}
					componentToRender={renderTimeOutModal()}
					onCancel={onContinue}
				/>
				{cartLength && (
					<>
						<CustomMediaQuery.Mobile>
							<div className="customer-with-payment-header">
								<CustomHeader
									headerClassName={'large-font'}
									text={Lang.format('Payment')}
								/>
							</div>
						</CustomMediaQuery.Mobile>

						<div className='header-payment-container'>
							{clubCreditCardSubsidizedOnlyForHolders &&
								<div>
									<CustomMediaQuery.Desktop>
										<EditorMessage message={benefitOnlyForBeyahadCardHoldersDesktop} />
									</CustomMediaQuery.Desktop>

									<CustomMediaQuery.Mobile>
										<EditorMessage message={benefitOnlyForBeyahadCardHoldersMobile} />
									</CustomMediaQuery.Mobile>
								</div>
							}
						</div>

						<div className='payment-without-header'>
							<div className='consumer-with-payment'>
								<CustomMediaQuery.Desktop>
									<div className="customer-with-payment-header">
										<CustomHeader
											headerClassName={'large-font'}
											text={Lang.format('Payment')}
										/>
									</div>
								</CustomMediaQuery.Desktop>
								{(!allowZeroPrice && (!hasShortCode || (hasShortCode && hasShortCodeByForgotCode))) && (
									<div className='consumer-prodcut-container'>
										{cartStore.hasConsumerProduct && (
											<div className='consumer-info'>
												{/* <CustomMediaQuery.Desktop>
													<EditorMessage textClassName="info-tzarchanot" message={this.state.messageAdrresOrder} />
												</CustomMediaQuery.Desktop>
												<CustomMediaQuery.Mobile>
													<EditorMessage textClassName="info-tzarchanot" message={this.state.messageAdrresOrder} />
												</CustomMediaQuery.Mobile> */}
											</div>
										)}
										{/* paying user personal details */}
										<div className='payment-personal-details'>
											<CustomHeader
												text={Lang.format('PaymentConsumerDetails')}
												headerClassName='bold'
												type={HeaderType.SubTitle}
											/>
											<div className='name-and-phone-con'>
												<div className='full-name-detail'>
													<div className='firstName-detail'>
														<CustomInputText
															labelText={Lang.format('FirstName')}
															value={creditCardStore.creditCardDetails.ownerFirstName}
															onChange={onFirstNameChanged}
															error={firstNameError}
															disabled={true}
														/>
													</div>
													<div className='lastName-detail'>
														<CustomInputText
															labelText={Lang.format('LastName')}
															value={creditCardStore.creditCardDetails.ownerLastName}
															onChange={onLastNameChanged}
															error={lastNameError}
															disabled={true}
														/>
													</div>
												</div>
												<div className='phone-detail'>
													<div className='phone-number'>
														<CustomInputText
															required={true}
															labelText={Lang.format('PhoneNumber')}
															value={creditCardStore.creditCardDetails.phoneNumber}
															onChange={onPhoneNumberChanged}
															error={phoneNumberError}
														/>
													</div>
													<div className='prefix-number '>
														<CustomSelector
															selectClassName={`${prefixPhoneError ? 'red-border' : ''}`}
															options={prefixNumbers}
															placeholder={`קידומת`}
															isPrimitiveValue
															value={creditCardStore.creditCardDetails.phoneNumberPrefix}
															onSelected={onPrefixPhoneNumSelected}
															error={prefixPhoneError}
														/>
													</div>
												</div>
											</div>
											<div className='email-detail'>
												<CustomInputText
													required
													labelText={Lang.format('Email')}
													value={creditCardStore.creditCardDetails.email}
													onChange={onEmailChanged}
													error={emailError}
												/>
											</div>
										</div>

										{cartStore.hasConsumerProduct && (
											<>
												<div className='sub-header-container'>
													<CustomHeader
														text={Lang.format('PaymentAddressToSendOrder')}
														headerClassName='small-sub-header bold'
														type={HeaderType.SubTitle}
													/>
													<CustomHeader
														text={Lang.format('PaymentAddressToSendOrderSub')}
														headerClassName='small-sub-header'
														type={HeaderType.SubTitle}
													/>
												</div>
												<div className='inputs-container'>
													<div className={`streets-container ${streetError ? 'red-border' : ''} `}>
														<div className='streets-container-inner'>
															<div className={`city ${cityError ? 'city-red' : ''}`}>
																<label className="label-city required">{Lang.format('City')}</label>
																<input
																	type="text"
																	className={showCityError ? 'city-input red' : 'city-input'}
																	onChange={(val) => changeCityName(val)}
																	placeholder=""
																	value={cityName}
																	onBlur={blurChangeCity}
																	onFocus={onFocusCityInput}
																></input>
																{(showCityError || cityError) && <div className='custom-input-error-container'> <label className='error custom-input-error-label'>{errorCity}</label></div>}
																{showCitiesListBox && (
																	<ListBox items={allCitiesFilter} onSelected={selectCityFromList} onMouseDown={() => setIsSelectingCity(true)} />)}
															</div>

															<div className="custom-input-error-container">
																<span className={'custom-input-error-label error-message'}>{streetError}</span>
															</div>
															<div className={`city ${streetError ? 'city-red' : ''}`}>
																<label className="label-city required">{Lang.format('streetName')}</label>
																<input
																	type="text"
																	className={(showStreerError && !showStreetsListBox) ? 'city-input red' : 'city-input'}
																	onChange={(val) => changeStreetName(val)}
																	placeholder=""
																	value={streetName}
																	onBlur={blurChangeStreet}
																	onFocus={onFocusStreetInput}
																></input>
																{((showStreerError && !showStreetsListBox) || streetError) && <div className='custom-input-error-container'><label className='error custom-input-error-label'>{errorStreet}</label></div>}
																{(showStreetsListBox && allStreetsFilter.length > 0) && (
																	<ListBox items={allStreetsFilter} onSelected={(street: Street) => selectStreetFromList(street)} onMouseDown={() => setIsSelectingStreet(true)} />)}
															</div>
														</div>
													</div>
													<div className='three-fields address-numbers'>
														<div className={'row-with-2-equal-elements'}>
															<div className={'street-number'}>
																<CustomInputText
																	value={streetNumber}
																	// TODO: Eliran - use "className=required" OR props that add "required" as className
																	labelText={Lang.format('StreetNumber')}
																	onChange={onStreetNumberChanged}
																	error={streetNumberError}
																	required={true}
																/>
															</div>
															<div className='apartment-number'>
																<CustomInputText
																	value={apartmentNumber}
																	labelText={Lang.format('ApartmentNumber')}
																	onChange={onApartmentNumberChanged}
																	error={apartmentNumberError}
																	required={true}
																/>
															</div>
															<div className='apartment-number'>
																<CustomInputText
																	value={entrance}
																	labelText={Lang.format('Entrance')}
																	onChange={onEntranceChanged}
																	error={entranceError}
																	required={false}
																/>
															</div>
														</div>
													</div>
												</div>
												<CustomMediaQuery.Desktop>
													<div className='inputs-container'>
														<div className={'streets-container'}>
															<div className='streets-container-inner'>
																<div className='mailbox-container'>
																	<CustomInputText
																		value={mailbox}
																		type={TextTypes.Number}
																		labelText={Lang.format('Mailbox')}
																		onChange={onMailboxChanged}
																		error={mailboxError}
																		required={false}
																	/>
																</div>
																<div className='zip-code-container'>
																	<CustomInputText
																		value={postalCode}
																		labelText={Lang.format('PostalCode')}
																		onChange={(postalCode) => onPostalCodeChanged(postalCode)}
																		error={postalCodeError}
																		required={true}
																	/>
																</div>
															</div>
														</div>
													</div>
												</CustomMediaQuery.Desktop>
												<CustomMediaQuery.Mobile>
													<div className='inputs-container'>
														<div className="three-fields">
															<div className='row-with-2-equal-elements'>
																<div className='mailbox-container'>
																	<CustomInputText
																		value={mailbox}
																		type={TextTypes.Number}
																		labelText={Lang.format('Mailbox')}
																		onChange={onMailboxChanged}
																		error={mailboxError}
																		required={false}
																	/>
																</div>
																<div className='zip-code-container'>
																	<CustomInputText
																		value={postalCode}
																		labelText={Lang.format('PostalCode')}
																		onChange={(postalCode) => onPostalCodeChanged(postalCode)}
																		error={postalCodeError}
																		required={true}
																	/>
																</div>
															</div>
														</div>
													</div>
												</CustomMediaQuery.Mobile>
											</>
										)}
									</div>
								)}

								{(!allowZeroPrice && (hasShortCode && !hasShortCodeByForgotCode) && cartStore.hasConsumerProduct) && (
									<div className='consumer-prodcut-container'>
										{/* paying user personal details */}
										<>
											<div className='sub-header-container'>
												<CustomHeader
													text={Lang.format('PaymentAddressToSendOrder')}
													headerClassName='small-sub-header bold'
													type={HeaderType.SubTitle}
												/>
												<CustomHeader
													text={Lang.format('PaymentAddressToSendOrderSub')}
													headerClassName='small-sub-header'
													type={HeaderType.SubTitle}
												/>
											</div>
											<div className='inputs-container'>
												<div className={`streets-container ${streetError ? 'red-border' : ''} `}>
													<div className='streets-container-inner'>
														<div className={`city ${cityError ? 'city-red' : ''}`}>
															<label className="label-city required">{Lang.format('City')}</label>
															<input
																type="text"
																className={showCityError ? 'city-input red' : 'city-input'}
																onChange={(val) => changeCityName(val)}
																placeholder=""
																value={cityName}
																onBlur={blurChangeCity}
																onFocus={onFocusCityInput}
															></input>
															{(showCityError || cityError) && <div className='custom-input-error-container'><label className='error custom-input-error-label'>{errorCity}</label></div>}
															{showCitiesListBox && (
																<ListBox items={allCitiesFilter} onSelected={selectCityFromList} onMouseDown={() => setIsSelectingCity(true)} />)}
														</div>

														{/* Other city input text */}
														<div className={`city ${streetError ? 'city-red' : ''}`}>
															<label className="label-city required">{Lang.format('streetName')}</label>
															<input
																type="text"
																className={showStreerError ? 'city-input red' : 'city-input'}
																onChange={(val) => changeStreetName(val)}

																placeholder=""
																value={streetName}
																onBlur={blurChangeStreet}
																onFocus={onFocusStreetInput}
															></input>
															{((showStreerError && !showStreetsListBox) || streetError) && <div className='custom-input-error-container'><label className='error custom-input-error-label'>{errorStreet}</label></div>}
															{(showStreetsListBox && allStreetsFilter.length > 0) && (
																<ListBox items={allStreetsFilter} onSelected={(street: Street) => selectStreetFromList(street)} onMouseDown={() => setIsSelectingStreet(true)} />)}
														</div>
													</div>
												</div>
												<div className='three-fields address-numbers'>
													<div className={'row-with-2-equal-elements'}>
														<div className={'street-number'}>
															<CustomInputText
																value={streetNumber}
																labelText={Lang.format('StreetNumber')}
																onChange={onStreetNumberChanged}
																error={streetNumberError}
																required={true}
															/>
														</div>
														<div className='apartment-number'>
															<CustomInputText
																value={apartmentNumber}
																labelText={Lang.format('ApartmentNumber')}
																onChange={onApartmentNumberChanged}
																error={apartmentNumberError}
																required={true}
															/>
														</div>
														<div className='apartment-number'>
															<CustomInputText
																value={entrance}
																labelText={Lang.format('Entrance')}
																onChange={onEntranceChanged}
																error={entranceError}
																required={false}
															/>
														</div>
													</div>
												</div>
											</div>
											<CustomMediaQuery.Desktop>
												<div className='inputs-container'>
													<div className={'streets-container'}>
														<div className='streets-container-inner'>
															<div className='mailbox-container'>
																<CustomInputText
																	value={mailbox}
																	type={TextTypes.Number}
																	labelText={Lang.format('Mailbox')}
																	onChange={onMailboxChanged}
																	error={mailboxError}
																	required={false}
																/>
															</div>
															<div className='zip-code-container'>
																<CustomInputText
																	value={postalCode}
																	labelText={Lang.format('PostalCode')}
																	onChange={(postalCode) => onPostalCodeChanged(postalCode)}
																	error={postalCodeError}
																	required={true}
																/>
															</div>
														</div>
													</div>
												</div>
											</CustomMediaQuery.Desktop>
											<CustomMediaQuery.Mobile>
												<div className='inputs-container'>
													<div className="three-fields">
														<div className='row-with-2-equal-elements'>
															<div className='mailbox-container'>
																<CustomInputText
																	value={mailbox}
																	type={TextTypes.Number}
																	labelText={Lang.format('Mailbox')}
																	onChange={onMailboxChanged}
																	error={mailboxError}
																	required={false}
																/>
															</div>
															<div className='zip-code-container'>
																<CustomInputText
																	value={postalCode}
																	labelText={Lang.format('PostalCode')}
																	onChange={(postalCode) => onPostalCodeChanged(postalCode)}
																	error={postalCodeError}
																	required={true}
																/>
															</div>
														</div>
													</div>
												</div>
											</CustomMediaQuery.Mobile>
										</>
									</div>
								)}
								{!allowZeroPrice &&
									<div className='payment-content'>
										<CustomHeader
											text={Lang.format('PaymentMethod')}
											headerClassName='bold'
											type={HeaderType.SubTitle}
										/>

										{(!hasShortCode || hasShortCodeByForgotCode) && (
											<CreditCardComponentVer2
												crditCardNumError={crditCardNumError}
												ownerIdError={ownerIdError}
												cardValidDateYearError={cardValidDateYearError}
												cardValidDateMonthError={cardValidDateMonthError}
												cvvError={cvvError}
												numOfPaymentError={numOfPaymentError}
												forgotCode={!hasShortCode}
												setAccess={setAccessFunc}
												onPay={onPayClicked}
												addedValidations={validate}
												onForgotCodeChanged={onForgotShortCodeClicked}
												onShortCodesaved={saveShortCode}
												numOfPayment={numOfPayments}
												disableFirstAndLastName={true}
												clearErrors={clearErrors}
												onePaymentDefualt={onePaymentDefualt}
												allowZeroPrice={allowZeroPrice}
											/>
										)}
										{(hasShortCode && !hasShortCodeByForgotCode) && (
											<ShortCodeComponent
												onPay={onPayClicked}
												numofPaymentOprtions={numOfPayments}
												onForgotShortCodeClicked={onForgotShortCodeClicked}
												onShortCodeChanged={onShortCodeChanged}
												shortCodeError={shortCodeError}
												addedValidations={validate}
												clearErrors={clearErrors}
												onePaymentDefualt={onePaymentDefualt}
												numOfPaymentError={numOfPaymentShortCodeError}
											/>
										)}
										{hasShortCode &&
											<div className='forgot-short-code'>
												<div className='input-container'>
													<input
														style={{ cursor: 'pointer' }}
														type='checkbox'
														checked={hasShortCode && hasShortCodeByForgotCode}
														onChange={onForgotShortCodeClicked}
													/>
												</div>
												<div className='text-checkbox'>
													<CustomSpan classNameSpan='agree-item-text' text={Lang.format('ForgotShortCode')} />
												</div>
											</div>}
									</div>
								}
								<div className='approve-customer-details-container'>
									{/* approve payment */}
									<div className='agree-with-forgot' style={{ margin: 0 }}>

										<div className='agreement-container' style={{ margin: 0 }} onClick={aggrementChecked}>
											<div className='agree-checkbox'>
												<input
													onChange={() => { }} //this is for the console if you remove it will be some error
													style={{ cursor: 'pointer' }}
													type='checkbox'
													value='agreement'
													checked={agreement}
												/>
											</div>
											<div className='agree-text'>
												<CustomSpan classNameSpan='agree-item-text' text={'אני מאשר שקראתי את הכתוב ב'} />
												<Link
													className='bold-link'
													onClick={() => setAgreement(true)}
													to={termsLink}
												>
													{Lang.format('Regulations')}
												</Link>
												<span className='black-text'> {termsText}</span>
												&nbsp;ו
												<Link
													className='bold-link'
													onClick={() => setAgreement(true)}
													to={configurationStore.getConfiguration.privacyPolicy}
												>
													{Lang.format('privacyPolicy')}
												</Link>
												<div className='agreement-error' style={{ color: 'red' }}>
													{agreementError}
												</div>
											</div>
										</div>
									</div>
									{(!hasShortCode || (hasShortCode && hasShortCodeByForgotCode)) && !allowZeroPrice && (
										<>
											<div className='agreement-container'>
												<div className='agree-checkbox'>
													<input
														style={{ cursor: 'pointer' }}
														type='checkbox'
														checked={saveCard}
														onChange={saveCardChanged}
													/>
												</div>
												<div className='agree-text'>
													<CustomSpan
														classNameSpan='agree-item-text'
														text={'האם לשמור את פרטי הכרטיס לקניה נוספת באמצעות קוד מקוצר?'}
													/>
												</div>
											</div>
											{saveCard && (
												<div className='save-short-code-inputs-container'>
													<div className='code-container'>
														<CustomInputText
															labelText={'בחירת קוד מקוצר'}
															type={TextTypes.Number}
															value={creditCardStore.newShortCode}
															onChange={onShortCodeChange}
															error={codeError}
														/>
													</div>
													<div className='confirmed-code'>
														<CustomInputText
															type={TextTypes.Number}
															labelText={'אימות קוד מקוצר'}
															value={creditCardStore.confirmShortCode}
															error={confiremCodeError}
															onChange={onConfiremedCodeChanged}
														/>
													</div>
												</div>
											)}
										</>
									)}

									<div className='payment-btn'>
										<CustomButtonBeyahad
											buttonText='לתשלום'
											disabled={isSubmitting}
											onClick={sendPaymnetClicked}
										/>
									</div>

								</div>
							</div>
							<CustomMediaQuery.Desktop>
								{/* products list */}
								<div className='nav-with-prod'>
									<CustomHeader
										headerClassName={'large-font'}
										text={Lang.format('MyProducts').replace('{{}}', getVariantNumber())}
									/>
									<div className='nav-with-prod-inner'>
										<div className='allproduct-container'>
											<VariantsPayment categories={categories} />
											<div className='sum-allproducts'>
												<div className='sum-text'>
													<CustomSpan classNameSpan={'sum-text-item'} text={`סה"כ לתשלום:`} />
												</div>
												<div className='total'>
													<CustomSpan
														classNameSpan={'total-text'}
														text={`${StringFormatUtils.tryConvertToLocaleString(cartStore.getSumCart)} ₪`}
													/>
												</div>
											</div>
										</div>
										{process.env.NODE_ENV == 'development' && (
											<div
												style={{ backgroundColor: 'green', color: 'white', padding: '5px' }}
												onClick={fillTestCreditCard}>
												מלא אשראי טסטים
											</div>
										)}
									</div>
								</div>
							</CustomMediaQuery.Desktop>
						</div>
					</>
				)}
				{!cartLength && redirectToCart()}
			</div>
		</>
	);
}
export default observer(PaymentPage);
