import { CustomButton, CustomSpan } from 'nofshonit-base-web-client';
import * as React from 'react';
import { RoutesPath } from '../../../../consts/RoutesPath';
import Wallet from '../../../../models/Wallet';
import ProfileCardStore from '../../../../stores/ProfileCardStore';
import rootStores from '../../../../stores';
import { PROFILE_CARD_STORE, MESSAGES_STORE, VIEW_STORE, WALLET_STORE } from '../../../../consts/stores';
import { observer } from 'mobx-react';
import { PremiumType } from '../../../../models/enums';
import MessagesStore from '../../../../stores/MessagesStore';
import EditorMessage from '../../EditorMessage/EditorMessage';
import AlertUtils from '../../../../utils/AlertUtils';
import Lang from '../../../../config/Language';
import * as _ from 'lodash';
import { WalletsEnum } from './../../../../stores/ShopsStore';
import ViewStore from '../../../../stores/ViewStore';
import WalletStore from '../../../../stores/WalletStore';
import { useEffect, useState } from 'react';
import MonthlyLoadBalanceHint from '../MonthlyLoadBalanceHint/MonthlyLoadBalanceHint';

interface Props {
    wallet: Wallet;
    history?: any;
    withLoad: boolean;
    withRegisterPayemnt?: boolean;
    isLoadAllowed?: boolean;
    withDischarge?: boolean; // Only For Discharge UI Button
    withDischargeAmount?: boolean; // For Showing Available Dischar Amount
    withChains?: boolean;
    maxDischargeAmount?: number; // Actual Amount to display
}
interface IState {
    errorMessage: any;
    errorExist: boolean;
    expiryDate?: number;
    maxAmountToLoadThisMonth: number;
}

const profileCardStore: ProfileCardStore = rootStores[PROFILE_CARD_STORE];
const messagesStore: MessagesStore = rootStores[MESSAGES_STORE];
const walletStore: WalletStore = rootStores[WALLET_STORE];
const viewStore: ViewStore = rootStores[VIEW_STORE];

const CardDetails : React.FC<Props> = ({
	wallet,
	history,
	withLoad,
	withRegisterPayemnt,
	isLoadAllowed,
	withDischarge,
	withDischargeAmount,
	withChains,
	maxDischargeAmount,
}) => {

    const [errorMessage, setErrorMessage] = useState<any>(null);
	const [errorExist, seterrorExist] = useState<boolean>(false);
	const [expiryDate, setexpiryDate] = useState<number>(0);
	const [maxAmountToLoadThisMonth, setMaxAmountToLoadThisMonth] = useState<number>(0);

    useEffect(() => {
       calculateMaxAmountToLoad();
       timeBetweenDischargeAndCharge();
       messagesStore.getSingleMessageFromService(725).then((res) => setErrorMessage(res));
    },[])

    useEffect(() => {
		calculateMaxAmountToLoad();
	},[wallet])

    const calculateMaxAmountToLoad = () => {
        const maxLoadedThisMonth = parseInt(wallet.maxDeposit) - parseInt(wallet.loadedThisMonth);
        const maxLoadByBalance = parseInt(wallet.maxBalance) - wallet.walletBalance;
        setMaxAmountToLoadThisMonth(Math.min(maxLoadByBalance, maxLoadedThisMonth))
    }
    const getAllowedToDischarge = async () => {
        viewStore.setLoadingView(true);
        const res = await AllowedToDischarge(wallet && wallet.walletID);
        viewStore.setLoadingView(false);
        return res;
    };
    const AllowedToDischarge = async (walletID) => {
        return await walletStore.AllowedToDischarge(walletID);
    };
    const timeBetweenDischargeAndCharge = async () => {
        await getTimeBetweenDischargeAndCharge()
            .then((data) => {
                setexpiryDate(data)
            })
            .catch((err) => {
                setexpiryDate(0)
            }).finally(() => {
                viewStore.setLoadingView(false);
            });

    };
    const getTimeBetweenDischargeAndCharge = async () => {
        return await walletStore.getTimeBetweenDischargeAndCharge();
    };
    const loadCardClicked = () => {
        scrollToProfileContent();
        const premiumType = profileCardStore.authStore.currentUser.premiumType;
        if (premiumType === PremiumType.PaymentAccess || premiumType === PremiumType.Type5) {
            history.push(`${RoutesPath.card.cardCharging}/${wallet.walletID}`);
        } else {
            seterrorExist(true)
        }
    };
    const dischargeCardClicked = async () => {
        const res = await getAllowedToDischarge();
        if (res) {
            scrollToProfileContent();
            const premiumType = profileCardStore.authStore.currentUser.premiumType;
            if (premiumType === PremiumType.PaymentAccess || premiumType === PremiumType.Type5) {
                history.push(`${RoutesPath.card.dischargeCard}/${wallet.walletID}`);
            } else {
                seterrorExist(true)
            }
        } else {
            AlertUtils.infoAlert('', `הביטול יתאפשר בתום ${expiryDate && expiryDate / 60} דקות מביצוע הפעולה האחרונה, אפשר לנסות שוב בעוד מספר דקות `);
        }

    };
    const loadBarcodePaymentClicked = () => {
        scrollToProfileContent();
        history.push(RoutesPath.card.barcodePayment);
    };

    const goToWalletChainsList = () => {
        scrollToProfileContent();
        history.push(`${RoutesPath.card.shopList}?walletId=${wallet.walletID}`);
    };

    const scrollToProfileContent = () => {
        let contentPosition = document.getElementsByClassName('profile-card-content')[0]['offsetTop'];
        let offset = 70;
        var i = window.pageYOffset;
        window.scrollTo({ top: contentPosition - 70, behavior: 'smooth' });
    };
    const errorPopUp = () => {
        return errorExist ? AlertUtils.infoAlert('', errorMessage) : null;
    };

    const maxMonth = wallet ? wallet.maxDepositForMonth : 0;
    const maxDep = wallet ? parseInt(wallet.maxDeposit) : 0;
    const balance = wallet ? wallet.walletBalance : 0;
    return (
        <div className='card-details-load'>
            <div className='main-container-card-details'
                style={wallet.backgroundImageUrl.length > 0 ? { backgroundImage: `url(${wallet.backgroundImageUrl})` } : {}}>
                <div className='load-container'>
                    <div className='load-balance-container'>
                        <div className='balance-title'>
                            <CustomSpan text={`יתרתך בכרטיס:`} />
                        </div>
                        <div className='balance-sum'>{balance.toFixed(2)}</div>
                    </div>
                    <div className='recharge-balance'>
                        <MonthlyLoadBalanceHint amount={maxAmountToLoadThisMonth} />
                    </div>
                </div>
            </div>
        </div>
    );
}
export default observer(CardDetails)
