import { observer } from 'mobx-react';
import { CustomButton, CustomInputText, CustomSelector, CustomSpan, TextTypes } from 'nofshonit-base-web-client';
import * as React from 'react';
import { Link } from 'react-router-dom';
import Lang from '../../../config/Language';
import { RoutesPath } from '../../../consts/RoutesPath';
import { CONFIGURATION_STORE, CREDIT_CARD_STORE } from '../../../consts/stores';
import rootStores from '../../../stores';
import CreditCardStore from '../../../stores/CreditCardStore';
import ValidationService from '../../../utils/ValidationService';
import { useEffect, useState } from 'react';
import ConfigurationStore from 'src/stores/ConfigurationStore';

interface Props {
    onShortCodeChanged: (value: string) => void;
    onForgotShortCodeClicked: (forgot: boolean) => void;
    onPay: () => void;
    numofPaymentOprtions: any[];
    loadCard?: boolean;
    disableNumOfPayments?: boolean;
    addedValidations?: () => boolean;
    clearErrors?: () => void;
    onePaymentDefualt?: boolean;
}
interface IState {

    forgot: boolean;
    agreement: boolean;
    shortCodeError: string;
    numOfPaymentError: string;
    agreementError: string;
    numOfPayment: string;
}
const creditCardStore: CreditCardStore = rootStores[CREDIT_CARD_STORE];
const configurationStore: ConfigurationStore = rootStores[CONFIGURATION_STORE];


const ShortCodePay: React.FC<Props> = ({
    onShortCodeChanged,
    onForgotShortCodeClicked,
    onPay,
    numofPaymentOprtions,
    loadCard,
    disableNumOfPayments,
    addedValidations,
    clearErrors,
    onePaymentDefualt
}) => {

    const [forgot, setForgot] = useState<boolean>(false);
    const [agreement, setAgreement] = useState<boolean>(false);
    const [shortCodeError, setShortCodeError] = useState<string>('');
    const [numOfPaymentError, setNumOfPaymentError] = useState<string>('');
    const [agreementError, setAgreementError] = useState<string>('');
    const [numOfPayment, setNumOfPayment] = useState<string>('');

    useEffect(() => {
        if (onePaymentDefualt) {
            const numOfPayment = numofPaymentOprtions[0];
            creditCardStore.setNumOfPayments(numOfPayment.key);
            setNumOfPayment(numOfPayment)
        }
    }, [])

    const onShortCodeChangedFunc = (value) => {
        clearError();

        const shortCode = value;
        onShortCodeChanged(shortCode);
    };
    const clearError = () => {
        setShortCodeError('')
        setNumOfPaymentError('')
        setAgreementError('')
        if (clearErrors && addedValidations) {
            clearErrors();
        }
    };

    const onForgotShortCodeClickedFunc = (e) => {
        e.preventDefault();
        const forgot = e.target.checked;
        onForgotShortCodeClicked(forgot);
        creditCardStore.setShortCode('');
        setForgot(forgot)
    };

    const onForgotShortCodeClickedText = () => {
        const val = forgot ? false : true;
        setForgot(val)
        onForgotShortCodeClicked(val);
        creditCardStore.setShortCode('');
    };

    const sendPaymnetClicked = () => {
        if (validate()) onPay();
    };

    const validate = () => {
        let retVal = true;
        if (!ValidationService.validateShortCode(creditCardStore.shortCode)) {
            setShortCodeError('יש להזין קוד מקוצר בעל 5 ספרות בלבד')
            retVal = false;
        }

        if (!agreement) {
            setAgreementError(Lang.format('ValidateAgreement'))
            retVal = false;
        }
        if (!disableNumOfPayments) {
            if (numOfPayment.length === 0) {
                setNumOfPaymentError('יש להזין מספר תשלומים')
                retVal = false;
            }
        }
        if (addedValidations) {
            if (!addedValidations()) retVal = false;
        }
        return retVal;
    };

    const onnumOfPaymentSelected = (value) => {
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
    const aggrementChecked = (e) => {
        clearError();
        const val = agreement ? false : true;
        setAgreement(val)
    };
    const numOfPayments = numofPaymentOprtions;
    let NumberOfPaymentsDiv;
    disableNumOfPayments ? creditCardStore.setNumOfPayments(numofPaymentOprtions[0].key) : null;
    if (disableNumOfPayments) {
        NumberOfPaymentsDiv = '';
    } else {
        NumberOfPaymentsDiv = (
            <div className='num-of-paymnents'>
                <CustomSelector
                    selectClassName={`${numOfPaymentError ? 'red-border' : ''}`}
                    required
                    options={numOfPayments}
                    keyAttribute={'key'}
                    valueAttribute={'value'}
                    text={Lang.format('NumOfPaymnents')}
                    placeholder={'בחר מספר תשלומים'}
                    value={numOfPayment}
                    onSelected={onnumOfPaymentSelected}
                    error={numOfPaymentError}
                />
            </div>
        );
    }
    const termsLink = loadCard ? `${RoutesPath.iframe}?link=https://www.dts.co.il/HtmlView/26042018-1 ` : `${RoutesPath.iframe}?link=https://www.dts.co.il/HtmlView/10042018-1`;
    const termsTextLink = loadCard ? 'תקנון' : Lang.format('Regulations');
    const termsText = loadCard ? 'הכרטיס הנטען' : 'של מועדון ביחד בשבילך';

    return (
        <div className='short-code-payment-form'>
            <div className='short-code-container'>
                <div className='code-header'>
                    <CustomSpan classNameSpan='short-code-header bold' text={Lang.format('ShortCodeHeader')} />
                </div>
                <div className='input-and-btn'>
                    <div className='input-code'>
                        <CustomInputText
                            labelText={Lang.format('PaymentCode')}
                            type={TextTypes.Number}
                            id={'short-code'}
                            value={creditCardStore.shortCode}
                            onChange={onShortCodeChangedFunc}
                            error={shortCodeError}
                        />
                    </div>
                    <div className='num-of-paymnents'>{NumberOfPaymentsDiv}</div>
                    <div className='forgot-short-code'>
                        <div className='text-checkbox' onClick={onForgotShortCodeClickedText}>
                            <CustomSpan text={Lang.format('ForgotShortCode')} />
                        </div>
                    </div>

                </div>
            </div>
            <div className='short-code-payment-btn'>
                <div className='agreement-container' onClick={aggrementChecked}>
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
                        <CustomSpan classNameSpan='agree-item-text required' text={'אני מאשר שקראתי את הכתוב ב'} />
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
                <CustomButton buttonClassName='center' text={'סיום טעינת כרטיס'} onClick={sendPaymnetClicked} />
            </div>
        </div>
    );
}
export default observer(ShortCodePay)
