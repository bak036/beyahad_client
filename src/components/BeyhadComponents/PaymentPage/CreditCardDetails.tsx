import { observer } from 'mobx-react';
import { CustomButton, CustomInputText, CustomSelector, CustomSpan, Logger, TextTypes } from 'nofshonit-base-web-client';
import * as React from 'react';
import Lang from '../../../config/Language';
import { CONFIGURATION_STORE, CREDIT_CARD_STORE } from '../../../consts/stores';
import rootStores from '../../../stores';
import CreditCardStore from '../../../stores/CreditCardStore';
import ValidationService from '../../../utils/ValidationService';
import { isNullOrUndefined } from 'util';
import { RoutesPath } from '../../../consts/RoutesPath';
import { Link } from 'react-router-dom';
import { CustomMediaQuery } from 'src/components/CustomComponents/CustomMediaQuery/CustomMediaQuery';
import { useEffect, useRef, useState } from 'react';
import ConfigurationStore from 'src/stores/ConfigurationStore';

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
}
interface IState {
    firstNameError: string;
    lastNameError: string;
    phoneNumberError: string;
    emailError: string;
    crditCardNumError: string;
    ownerIdError: string;
    cardValidDateYearError: string;
    cardValidDateMonthError: string;
    cvvError: string;
    numOfPaymentError: string;
    agreement: boolean;
    prefixPhoneError: string;
    shortCodeModal: boolean;
    saveCard: boolean;
    codeError: string;
    confiremCodeError: string;
    agreementError: string;
    numOfPayment: string;
    showShortCode?: boolean;
}

const creditCardStore: CreditCardStore = rootStores[CREDIT_CARD_STORE];
const configurationStore: ConfigurationStore = rootStores[CONFIGURATION_STORE];


const CreditCardDetails : React.FC<Props> = ({
	history,
	setAccess,
	onPay,
	addedValidations,
	forgotCode,
	clearErrors,
	onForgotCodeChanged,
	onShortCodesaved,
	loadCard,
	numOfPayment,
	disableNumOfPayments,
	disableFirstAndLastName,
	totalPrice,
	onePaymentDefualt,
	hideShortCode,
	onDischarge,
	isDischarge,
	allowZeroPrice,
	cardId,
}) => {
	const [firstNameError, setFirstNameError] = useState<string>('');
	const [lastNameError, setLastNameError] = useState<string>('');
	const [phoneNumberError, setPhoneNumberError] = useState<string>('');
	const [emailError, setEmailError] = useState<string>('');
	const [crditCardNumError, setCrditCardNumError] = useState<string>('');
	const [ownerIdError, setOwnerIdError] = useState<string>('');
	const [cardValidDateYearError, setCardValidDateYearError] = useState<string>('');
	const [cardValidDateMonthError, setCardValidDateMonthError] = useState<string>('');
	const [cvvError, setCvvError] = useState<string>('');
	const [numOfPaymentError, setNumOfPaymentError] = useState<string>('');
	const [prefixPhoneError, setPrefixPhoneError] = useState<string>('');
	const [agreement, setAgreement] = useState<boolean>(false);
	const [shortCodeModal, setShortCodeModal] = useState<boolean>(false);
	const [saveCard, setSaveCard] = useState<boolean>(false);
	const [codeError, setCodeError] = useState<string>('');
	const [confiremCodeError, setConfiremCodeError] = useState<string>('');
	const [agreementError, setAgreementError] = useState<string>('');
	const [numOfPaymentVar, setNumOfPayment] = useState<string>('');
	const [checkboxRef, setCheckboxRef] = useState<any>(React.createRef());
    const [prevCardId, setPrevCardId] = useState<string>('');
	const mounted = useRef(false);


   useEffect(() => {
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
        disableNumOfPayments ? creditCardStore.setNumOfPayments(numOfPayment[0].key) : null;
        if (onePaymentDefualt) {
            const numOfPaymentVar = numOfPayment[0];
            creditCardStore.setNumOfPayments(numOfPaymentVar.key);
            setNumOfPayment(numOfPaymentVar)
        }
        setPrevCardId(cardId);
    },[])

    useEffect(() => {
		if(cardId !== prevCardId){
			setPrevCardId(cardId);
			creditCardStore.clearCreditCardDetails();
		}
	},[cardId])

    const clearError = () => {
		setConfiremCodeError('');
		setCodeError('');
		setFirstNameError('');
		setLastNameError('');
		setEmailError('');
		setPrefixPhoneError('');
		setPhoneNumberError('');
		setCvvError('');
		setOwnerIdError('');
		setCardValidDateMonthError('');
		setCardValidDateYearError('');
		setCrditCardNumError('');
		setNumOfPaymentError('');
		setAgreementError('');
		if (clearErrors && addedValidations) {
			clearErrors();
		}
	};

    const onDischargeFunc = () => {
        if (validate() && agreement) {
            onPay();
        } else {
            if (agreement == false) {
                setAgreementError(Lang.format('ValidateAgreement'))
            }
        }
    };

    const sendPaymnetClicked = () => {
        let moreValidations;
        //if no addedValidations in props
        if (addedValidations) {
            moreValidations = addedValidations();
        } else {
            moreValidations = true;
        }
        // Pick validation based on product with zero price or Regular product
        // Zero price product is a digital member card

        if (allowZeroPrice) {
            if (validationForItemsWithZeroPrice() && agreement) {
                onPay();
            } else {
                if (agreement == false) {
                    setAgreementError(Lang.format('ValidateAgreement'))
                }
            }
        } else {
            if (validate() && agreement && moreValidations) {
                if (onShortCodesaved && saveCard) {
                    if (validateShortCode()) {
                        onShortCodesaved(creditCardStore.newShortCode);
                        onPay();
                    }
                } else {
                    onPay();
                }
            } else {
                Logger.debug('validate');
                if (agreement == false) {
                    setAgreementError(Lang.format('ValidateAgreement'))
                }
            }
        }
    };

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
    };

    const validate = () => {
        let retVal: boolean = true;
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
        if (ValidationService.validateNumbersOnly(creditCardStore.creditCardDetails.cardNumber) == false) {
            setCrditCardNumError(Lang.format('ValidateCreditCard'))
            retVal = false;
        }
        if (
            creditCardStore.creditCardDetails.cardNumber.length < 8 ||
            creditCardStore.creditCardDetails.cardNumber.length > 16
        ) {
            setCrditCardNumError(Lang.format('ValidateCreditCard'))
            retVal = false;
        }
        if(!creditCardStore.validateCreditCardNumber(creditCardStore.creditCardDetails.cardNumber)) {
            setCrditCardNumError(Lang.format('ValidateCreditCard'))
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
        if (!disableNumOfPayments) {
            if (
                !creditCardStore.creditCardDetails.numOfPayments ||
                creditCardStore.creditCardDetails.numOfPayments.length === 0
            ) {
                setNumOfPaymentError('יש להזין מספר תשלומים')
                retVal = false;
            }
        }
        if (
            parseInt(creditCardStore.creditCardDetails.validateMonth) < month &&
            parseInt(creditCardStore.creditCardDetails.validateYear) <= parseInt(year)
        ) {
            setCardValidDateMonthError('חודש זה אינו תקף')
            retVal = false;
        }

        if (saveCard) {
            if (!validateShortCode) {
                retVal = false;
            }
        }
        return retVal;
    };

    const onShortCodeChange = (value) => {
        clearError();
        const code = value;
        creditCardStore.setNewShortCode(value)
        creditCardStore.setShortCode(code);
    };

    const onCodeDiscountClicked = () => {
        if (creditCardStore.newShortCode) {
            //need to check if the code is valid with the server.

            Logger.debug('check the code');
        } else {
            Logger.debug('the code are not exsist');
        }
    };

    const onFirstNameChanged = (value) => {
        clearError();
        const firstName = value;

        creditCardStore.setOwnerFirstName(firstName);
    };
    const onLastNameChanged = (value) => {
        clearError();
        const lastName = value;
        creditCardStore.setOwnerLastName(lastName);
    };
    const onEmailChanged = (value) => {
        clearError();
        const email = value;
        creditCardStore.setEmail(email);
    };

    const onPrefixPhoneNumSelected = (value) => {
        clearError();
        const prefix = value;
        creditCardStore.setPrefixNumber(prefix);
    };

    const onPhoneNumberChanged = (value) => {
        // this.clearError();
        const phone = value;
        creditCardStore.setPhoneNumber(phone);
    }

    const onValidateYearSelected = (value) => {
        clearError();
        const year = value;
        creditCardStore.setValidateYear(year);
    };

    const onValidateMonthSelected = (value) => {
        clearError();
        const month = value;
        creditCardStore.setValidateMonth(month);
    };

    const onCardNumberCanged = (value) => {
        clearError();
        const card = value;
        creditCardStore.setCardNumber(card);
    };

    const onIdentityChanged = (value) => {
        clearError();
        const id = !isNullOrUndefined(value) && value.trim ? value.trim() : value;
        creditCardStore.setIdentity(id);
    };

    const onNumOfPaymentSelected = (value) => {
        clearError();
        const numOfPayment = value;
        if (numOfPayment) {
            setNumOfPayment(numOfPayment)
            creditCardStore.setNumOfPayments(numOfPayment.key);
        } else {
            creditCardStore.setNumOfPayments(numOfPayment);
            setNumOfPayment(numOfPayment)
        }
    };

    const onCvvChanged = (value) => {
        clearError();
        let invalidChars = ['-', '+', 'e', ')', '(', ';'];
        if ((/^\d+$/.test(value) || value == '') && value.length < 5 && !invalidChars.includes(value.key)) {
            const cvv = value;
            creditCardStore.setCvv(cvv);
        }
    };

    const aggrementChecked = (e) => {
        clearError();
        const val = agreement ? false : true;
        setAgreement(val)
    };

    const saveCardChanged = (e) => {
        const val = e.target.checked;
        if (!val) {
            creditCardStore.setConfirmShortCode('');
            creditCardStore.setShortCode('');
        }
        setSaveCard(val);
        creditCardStore.setSaveCard(val);
    };

    const onForgotCodeChangedFunc = (e) => {
        e.preventDefault();
        if (onForgotCodeChanged) onForgotCodeChanged(e.target.checked);
    };
    const onForgotCodeChangedText = () => {
        if (onForgotCodeChanged) onForgotCodeChanged(false);
    };
    const onConfiremedCodeChanged = (value) => {
        clearError();
        creditCardStore.setConfirmShortCode(value)
    };

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
    };

    const getYearValidate = () => {
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

    const validDateOptionYear = getYearValidate();
    const validDateOptionMonth = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    const numOfPaymnents = numOfPayment;
    const prefixNumbers: string[] = creditCardStore.getPrefixNumbers;
    const disableFirstAndLastNameVar = disableFirstAndLastName ? disableFirstAndLastName : false;
    let paymentButtonText = '';
    if (allowZeroPrice) {
        paymentButtonText = Lang.format('FinishOrder');
    } else {
        paymentButtonText = isDischarge ? Lang.format('CancelLoad') : Lang.format('FinishPayment');
    }
    const termsLink = loadCard?`${RoutesPath.iframe}?link=https://www.dts.co.il/HtmlView/26042018-1 `:`${RoutesPath.iframe}?link=https://www.dts.co.il/HtmlView/10042018-1`;;
    const termsTextLink = loadCard?'תקנון':Lang.format('Regulations');
    const termsText = loadCard ? 'הכרטיס הנטען' : 'של מועדון ביחד בשבילך';

    let NumberOfPaymentsDiv;
    if (disableNumOfPayments) {
        NumberOfPaymentsDiv = '';
    } else {
        NumberOfPaymentsDiv = (
            <div className='num-of-paymnents'>
                <CustomSelector
                    selectClassName={`${numOfPaymentError ? 'red-border' : ''}`}
                    required
                    options={numOfPaymnents}
                    keyAttribute={'key'}
                    valueAttribute={'value'}
                    text={Lang.format('NumOfPaymnents')}
                    placeholder={'בחר מספר תשלומים'}
                    value={numOfPayment}
                    onSelected={onNumOfPaymentSelected}
                    error={numOfPaymentError}
                />
            </div>
        );
    }
    return (
        <div className='form-details-payment'>
            <CustomMediaQuery.Mobile>
                <div className='card-details-container title-container bold'>
                    <CustomSpan text={`פרטי כרטיס אשראי לחיוב`} />
                </div>
            </CustomMediaQuery.Mobile>
            <div className='payment-form-content-details'>
                <div className='user-details row'>
                    <div className='firstName-detail input'>
                        <CustomInputText
                            labelText={Lang.format('FirstName')}
                            value={creditCardStore.creditCardDetails.ownerFirstName}
                            onChange={onFirstNameChanged}
                            error={firstNameError}
                            disabled={disableFirstAndLastName}
                        />
                    </div>
                    <div className='lastName-detail input'>
                        <CustomInputText
                            labelText={Lang.format('LastName')}
                            value={creditCardStore.creditCardDetails.ownerLastName}
                            onChange={onLastNameChanged}
                            error={lastNameError}
                            disabled={disableFirstAndLastName}
                        />
                    </div>
                    <CustomMediaQuery.Desktop>
                        <div className='id-detail input'>
                            <CustomInputText
                                required
                                labelText={Lang.format('IDCard')}
                                value={creditCardStore.creditCardDetails.identity}
                                onChange={onIdentityChanged}
                                error={ownerIdError}
                                disabled={loadCard ? true : false}
                            />
                        </div>
                    </CustomMediaQuery.Desktop>
                </div>
                <div className='phone-and-email row'>
                    <div className='email-detail input'>
                        <CustomInputText
                            required
                            labelText={Lang.format('Email')}
                            value={creditCardStore.creditCardDetails.email}
                            onChange={onEmailChanged}
                            error={emailError}
                        />
                    </div>
                    <div className='phone-detail input'>
                        <div className='phone-number'>
                            <CustomInputText
                                required
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
                
                <div className='details-card row'>
                    <div className='credit-card-details input'>
                        <CustomInputText
                            required
                            labelText={Lang.format('CreditCard')}
                            value={creditCardStore.creditCardDetails.cardNumber}
                            onChange={onCardNumberCanged}
                            error={crditCardNumError}
                            autocomplete={'cc-number'}
                        />
                    </div>
                    <CustomMediaQuery.Mobile>
                    <div className='id-detail input'>
                        <CustomInputText
                            required
                            labelText={Lang.format('IDCard')}
                            value={creditCardStore.creditCardDetails.identity}
                            onChange={onIdentityChanged}
                            error={ownerIdError}
                            disabled={loadCard ? true : false}
                        />
                    </div>
                </CustomMediaQuery.Mobile>
                    <div className='validation-card-with-payments input'>
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
                                    onSelected={onValidateYearSelected}
                                    error={cardValidDateYearError}
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
                                    onSelected={onValidateMonthSelected}
                                    error={cardValidDateMonthError}
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
                                    onChange={onCvvChanged}
                                    error={cvvError}
                                    id={'CVV Details'}
                                    autocomplete={'cc-csc'}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='agree-with-forgot'>
                {!isDischarge && forgotCode && !allowZeroPrice && creditCardStore.authStore.currentUser.hasPinCode && (
                    <div className='agreement-container'>
                        <div className='forgot-checkbox'>
                            <input
                                style={{ cursor: 'pointer' }}
                                type='checkbox'
                                checked={forgotCode}
                                onChange={onForgotCodeChanged}
                            />
                        </div>
                        <div className='agree-text' onClick={onForgotCodeChangedText}>
                            <CustomSpan classNameSpan='agree-item-text' text={Lang.format('ForgotShortCode')} />
                        </div>
                    </div>
                )}

                <div className='agreement-container' onClick={aggrementChecked}>
                    <div className='agree-checkbox'>
                        <input
                            type='checkbox'
                            value='agreement'
                            style={{ cursor: 'pointer' }}
                            onChange={() => { }} //this is for the console if you remove it will be some error
                            checked={agreement}
                        />
                    </div>
                    <div className='agree-text'>
                        <CustomSpan classNameSpan='agree-item-text required' text={'קראתי את הכתוב ב'} />
                        <Link
                            className='bold-link'
                            onClick={() => setAgreement(true)}
                            to={termsLink}
                        >
                            {termsTextLink}
                        </Link>
                        &nbsp;
                        <span className='black-text'>{termsText}</span>
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
            {/* <>
                <div className='attention-container'>
                    <CustomSpan classNameSpan='attention-text title-attention' text={`לתשומת ליבך!`} />
                </div>
                <div className='long-text-attention'>
                    <CustomSpan
                        classNameSpan={`long-text-attention-item`}
                        text={`*עדכון פרטים בעמוד זה יעדכן את פרטיך הרשומים במאגר המידע של המועדון וישמש מעתה לקבל דבר פרסום`}
                    />
                </div>
                <div className='long-text-attention'>
                    <CustomSpan
                        classNameSpan={`long-text-attention-item`}
                        text={`* בכפוף לאישור המעודכן בעמוד \"פרטים אישיים\".`}
                    />
                </div>
            </> */}
            {!isDischarge && !hideShortCode && !allowZeroPrice && (
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

            <div className='payment-button'>
                <CustomButton
                    buttonClassName='center payment-button-credit-card'
                    text={paymentButtonText}
                    onClick={sendPaymnetClicked}
                />
            </div>
        </div>
    );
}
export default observer(CreditCardDetails);
