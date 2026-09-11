import * as React from 'react';
import rootStores from '../../../../stores';
import {
	WALLET_STORE,
	CREDIT_CARD_STORE,
	CART_STORE,
	VIEW_STORE,
	MESSAGES_STORE,
	USER_DETAILS_STORE,
	CONFIGURATION_STORE,
	AUTH_STORE
} from '../../../../consts/stores';
import WalletStore from '../../../../stores/WalletStore';
import { observer } from 'mobx-react';
import { CustomHeader, CustomSpan, CustomInputText, TextTypes } from 'nofshonit-base-web-client';
import Lang from '../../../../config/Language';
import Card from './Card';
import CardDetails from './CardDetails';
import CreditCardComponentCancel from '../../PaymentPage/CreditCardComponentCancel';
import CreditCardDetails from '../../PaymentPage/CreditCardDetails';
import { DiscountMode } from '../../../../models/enums';
import CreditCardStore from '../../../../stores/CreditCardStore';
import WalletService from '../../../../services/WalletService';
import Wallet from '../../../../models/Wallet';
import User from '../../../../models/User';
import ShortCodeComponent from '../../PaymentPage/ShortCodeComponent';
import ShortCodePay from '../../PaymentPage/ShortCodePay';
import CustomModal from '../../../CustomComponents/CustomModal';
import LoadCardModal from './LoadCardModal';
import AlertUtils from '../../../../utils/AlertUtils';
import ErrorUtils from '../../../../utils/errorHandling/ErrorUtils';
import CartStore from '../../../../stores/CartStore';
import ViewStore from '../../../../stores/ViewStore';
import { Thumbs } from 'react-responsive-carousel';
import MessagesStore from '../../../../stores/MessagesStore';
import { RoutesPath } from '../../../../consts/RoutesPath';
import GoogleAnalyticsUtils from '../../../../utils/analytics/GoogleAnalyticsUtils';
import { Console } from 'console';
import UserDetailsStore from '../../../../stores/UserDetailsStore';
import ConfigurationStore from '../../../../stores/ConfigurationStore';
import { CustomMediaQuery } from '../../../CustomComponents/CustomMediaQuery/CustomMediaQuery';
import EditorMessage from '../../EditorMessage/EditorMessage';
import { useEffect, useRef, useState } from 'react';
import ScreenUtils from 'src/utils/ScreenUtils';
import AuthStore from '../../../../stores/AuthStore';
import MonthlyLoadBalanceHint from '../MonthlyLoadBalanceHint/MonthlyLoadBalanceHint';
import { Link } from 'react-router-dom';
interface Props {
	cardId: any;
	isMint?: boolean;
	history?: any;
	accessToken?: string;
	isDischarge?: boolean;
}
interface IState {
	sumLoad: number | string;
	sumToPay: number;
	totalAfterLoad: number;
	shortCode: string;
	forgot: boolean;
	loadCardModal: boolean;
	loadError: string;
	walletFound: boolean;
	maxDischargeAmount: number;
	fromDate: string;
	benefitOnlyForBeyahadCardHoldersDesktop: string;
	benefitOnlyForBeyahadCardHoldersMobile: string;
	messageAdrresOrder: string;
}

const messagesStore: MessagesStore = rootStores[MESSAGES_STORE];
const walletStore: WalletStore = rootStores[WALLET_STORE];
const creditCardStore: CreditCardStore = rootStores[CREDIT_CARD_STORE];
const viewStore: ViewStore = rootStores[VIEW_STORE];
const configurationStore: ConfigurationStore = rootStores[CONFIGURATION_STORE];
const userDetailsStore: UserDetailsStore = rootStores[USER_DETAILS_STORE];
const authStore: AuthStore = rootStores[AUTH_STORE];

const LoadCard: React.FC<Props> = ({
	cardId,
	isMint,
	history,
	accessToken,
	isDischarge,
}) => {

	const [sumLoad, setSumLoad] = useState<number | string>(-1);
	const [sumToPay, setSumToPay] = useState<number>(0);
	const [totalAfterLoad, setTotalAfterLoad] = useState<number>(0);
	const [shortCode, setShortCode] = useState<string>('');
	const [forgot, setForgot] = useState<boolean>(walletStore.authStore.currentUser.hasPinCode);
	const [loadCardModal, setLoadCardModal] = useState<boolean>(false);
	const [loadError, setLoadError] = useState<string>('');
	const [walletFound, setWalletFound] = useState<boolean>(false);
	const [maxDischargeAmount, setMaxDischargeAmount] = useState<number>(-1);
	const [fromDate, setFromDate] = useState<string>('');
	const [benefitOnlyForBeyahadCardHoldersDesktop, setBenefitOnlyForBeyahadCardHoldersDesktop] = useState<string>('');
	const [benefitOnlyForBeyahadCardHoldersMobile, setBenefitOnlyForBeyahadCardHoldersMobile] = useState<string>('');
	const [messageAdrresOrder, setMessageAdrresOrder] = useState<string>('');
	const isMobile = ScreenUtils.IsMobile();

	const mounted = useRef(false);
	let prevCardId = useRef('');

	let clubCreditCardSubsidizedOnlyForHolders: boolean = false;

	const initMessages = async () => {
		const benefitOnlyForBeyahadCardHoldersDesktop = await messagesStore.getSingleMessageFromService(messagesStore.benefitOnlyForBeyahadCardHoldersDesktopKey);
		const benefitOnlyForBeyahadCardHoldersMobile = await messagesStore.getSingleMessageFromService(messagesStore.benefitOnlyForBeyahadCardHoldersMobileKey);
		const messageAdrresOrder = await messagesStore.getSingleMessageFromService(messagesStore.messageAdrresOrderInfo);

		setBenefitOnlyForBeyahadCardHoldersDesktop(benefitOnlyForBeyahadCardHoldersDesktop);
		setBenefitOnlyForBeyahadCardHoldersMobile(benefitOnlyForBeyahadCardHoldersMobile);
		setMessageAdrresOrder(messageAdrresOrder);
	}

	initMessages();

	clubCreditCardSubsidizedOnlyForHolders = configurationStore.getConfiguration.ClubCreditCardSubsidizedOnlyForHolders && !userDetailsStore.authStore.currentUser.memberSpecial;

	useEffect(() => {
		if (!mounted.current) {
			setFromDateFunc();
			refreshSelectedCard(cardId);
			getAvailableCancelBalance();
			mounted.current = true;
		}
		else {
			const propsCardId = cardId;
			if (prevCardId.current != propsCardId) {
				prevCardId.current = propsCardId;
				refreshSelectedCard(propsCardId);
				getAvailableCancelBalance();
				setSumLoad(-1);
			}
		}
	})

	useEffect(() => {
		authStore.showNavBarSearchBox = isMobile;
		authStore.showSearchIcon = !isMobile;
	}, [isMobile, authStore]);

	useEffect(() => {
		return () => {
			authStore.showNavBarSearchBox = true;
			authStore.showSearchIcon = true;
		};
	}, [window.location.pathname, authStore]);


	const setFromDateFunc = async () => {
		let numOfDays = walletStore.getCard && walletStore.getCard.numberOfDaysAllowingCancellation;

		if (!numOfDays) {
			numOfDays = 365;
		}
		let today = new Date();
		today.setDate(today.getDate() - numOfDays);
		let dd = String(today.getDate()).padStart(2, '0');
		let mm = String(today.getMonth() + 1).padStart(2, '0');
		let yyyy = today.getFullYear();
		setFromDate(dd + '/' + mm + '/' + yyyy);
	}
	const GetAvailableBalanceForDischarge = (walletID) => {
		return walletStore.getAvailableBalanceForDischarge(walletID);
	};
	const onDischargeClicked = () => {
		setLoadCardModal(false);
		viewStore.setLoadingView(true);
		const {
			email,
			cardNumber,
			cvv,
			phoneNumber,
			phoneNumberPrefix,
			validateYear,
			validateMonth,
		} = creditCardStore.creditCardDetails;
		walletStore
			.onDischargeClicked(
				cardId,
				sumLoad,
				email.toString(),
				cardNumber.toString(),
				(validateMonth + validateYear).toString(),
				cvv.toString(),
				(phoneNumberPrefix + phoneNumber).toString()
			)
			.then(() => {
				// Success
				walletStore.init();
				let walletBalance = walletStore.currentWallet.walletBalance;
				// Update Current Wallet Balance
				let cancelAmount = typeof sumLoad == 'string' ? parseInt(sumLoad) : sumLoad;
				GoogleAnalyticsUtils.clickButtonAnalytics('chargeCancelation', 'chargeCancelation', 'submit_unpayment_card', Lang.format('CancelLoad'), undefined, undefined, undefined, cancelAmount)
				walletStore.currentWallet.walletBalance = walletBalance - cancelAmount;
				// Update 14 Days Cancel Amount
				setMaxDischargeAmount(maxDischargeAmount - cancelAmount)
				const message = `ביטול הטעינה הסתיים בהצלחה, כרטיסך יזוכה על סך ${showFixedAmount(
					sumToPay.toString(),
					2
				)} ₪ תוך 4 ימי עסקים`;
				AlertUtils.successWithTimerAlert('', message, 7000);
				setTimeout(() => {
					history.replace(`${RoutesPath.card.cardCharging}`);
				}, 10)
			})
			.catch((err) => {
				// Check error type
				ErrorUtils.checkErrorAndShowPopUp(err, '', '');
			})
			.finally(() => {
				viewStore.setLoadingView(false);
			});
	};

	const getAvailableCancelBalance = () => {
		if (isDischarge) {
			viewStore.setLoadingView(true);

			Promise.all([
				GetAvailableBalanceForDischarge(cardId),
				walletStore.getGlobalSelfDischargeLimit()
			])
				.then(([amount]) => {
					const newAmount = amount > 0 ? amount : 0;
					setMaxDischargeAmount(newAmount);
				})
				.catch(() => {
					setMaxDischargeAmount(0);
				})
				.finally(() => {
					viewStore.setLoadingView(false);
				});
		}
	};

	const refreshSelectedCard = (cardId) => {
		console.info('refreshSelectedCard', refreshSelectedCard);
		creditCardStore.setShortCode('');
		viewStore.setLoadingView(true);
		walletStore
			.getWalletById(cardId)
			.then(() => {
				setForgot(walletStore.authStore.currentUser.hasPinCode)
				if (walletStore.getWalletId) {
					setWalletFound(true)
				} else {
					setWalletFound(false)
				}
			})
			.catch(() => {
				setWalletFound(false)
			})
			.finally(() => {
				viewStore.setLoadingView(false);
			});
	};

	const onSumToCancelBlurOrEnter = (val: any) => {
		const currentWallet = walletStore.getCurrentWallet;
		if (currentWallet.discountMode === DiscountMode.Percentage) {
			const percentage = currentWallet.discountRate / 100;
			const amount = typeof val === 'string' ? Number(val) : val;

			const dischargeAmount = amount * (1 - percentage);
			let sumAfterDischarge = dischargeAmount;
			if (walletStore.getCard.moneyPercentageCancellationCommission > 0) {
				const rounded = Number(Math.round(parseFloat(dischargeAmount * walletStore.getCard.moneyPercentageCancellationCommission + 'e2')) + 'e-2');
				sumAfterDischarge = sumAfterDischarge - Math.min(rounded, walletStore.getCard.moneyMaxCommissionAmount);
			}
			let totalAfterLoad = currentWallet.walletBalance - amount;
			totalAfterLoad = totalAfterLoad > 0 ? totalAfterLoad : 0;
			setSumToPay(sumAfterDischarge)
			setTotalAfterLoad(totalAfterLoad)
		} else {
			const percentage = currentWallet.discountRate;
			const amount = typeof val === 'string' ? Number(val) : val;

			const dischargeAmount = (amount / (100 + percentage)) * 100;
			let sumAfterDischarge = dischargeAmount;
			if (walletStore.getCard.moneyPercentageCancellationCommission > 0) {
				const rounded = Number(Math.round(parseFloat(dischargeAmount * walletStore.getCard.moneyPercentageCancellationCommission + 'e2')) + 'e-2');
				sumAfterDischarge = sumAfterDischarge - Math.min(rounded, walletStore.getCard.moneyMaxCommissionAmount);
			}

			let totalAfterLoad = currentWallet.walletBalance - amount;
			totalAfterLoad = totalAfterLoad > 0 ? totalAfterLoad : 0;

			setSumToPay(sumAfterDischarge)
			setTotalAfterLoad(totalAfterLoad)
		}
	};

	const onSumToLoadBlurOrEnter = (val: any) => {
		var sumToPay;
		var totalAfterLoad;
		const currentWallet: Wallet = walletStore.getCurrentWallet;
		if (currentWallet.discountMode === DiscountMode.Percentage) {
			const total =
				typeof val === 'string'
					? (parseInt(val) * currentWallet.discountRate) / 100
					: (val * currentWallet.discountRate) / 100;
			sumToPay =
				typeof val === 'string' ? parseInt(val) - total : val - total;
			totalAfterLoad = parseInt(val.toString());
		} else {
			var total =
				typeof val === 'string'
					? parseInt(val) / (100 + currentWallet.discountRate)
					: val / (100 + currentWallet.discountRate);
			total = total * 100;
			sumToPay = total;
			totalAfterLoad = parseInt(val.toString());
			totalAfterLoad += parseInt(currentWallet.walletBalance.toString());
		}
		totalAfterLoad = (isNaN(totalAfterLoad) ? 0 : totalAfterLoad) + currentWallet.walletBalance;
		setSumToPay(sumToPay)
		setTotalAfterLoad(totalAfterLoad)
	};
	const onLoadCardPaid = async () => {
		try {
			setLoadCardModal(false)
			viewStore.setLoadingView(true);
			const result = await walletStore.loadWallet(
				cardId,
				sumToPay,
				sumLoad,
				creditCardStore.getCreditDetails,
				creditCardStore.shortCode,
				creditCardStore.creditCardDetails.email
			);
			if (result) {
				walletStore.init().then(() => {
					viewStore.setLoadingView(false);
					const sumToLoad = typeof sumLoad === 'string' ? parseInt(sumLoad) : sumLoad;
					walletStore.currentWallet.walletBalance += sumToLoad;
					walletStore.authStore.refreshCurrentUserAfterUsingShortcode();


					setSumLoad(0)
					if (!walletStore.authStore.currentUser.hasPinCode) {
						walletStore.authStore.currentUser.hasPinCode = creditCardStore.shortCode && creditCardStore.shortCode.length > 0 ? true : false;
					}
					// After show the popup to the user, we close the window IN MINT
					AlertUtils.successAlert(Lang.format('LoadCardSuccess'), '').then((res) => {
						if (isMint) {
							history.push(`${RoutesPath.mint.successPage}`);
						} else {
							history.replace(`${RoutesPath.card.cardCharging}`);
						}
					});
				});
			}
		} catch (err) {
			viewStore.setLoadingView(false);
			const isBlocked = err?.message === messagesStore.pinCodeBlockMessages;

			// After show the popup to the user, we close the window IN MINT
			ErrorUtils.checkErrorAndShowPopUp(err, '', '').then(async () => {
				if (isBlocked) {
					creditCardStore.authStore.setHasPinCode(false);
					setForgot(false)
				}

				if (isMint) {
					window.location.href = `${RoutesPath.mint.failurePage}?accessToken=${accessToken}`;
				}
			});
		}
	};
	const onLoadCardClicked = () => {
		if (parseInt(sumLoad.toString()) > 0) {
			setLoadCardModal(true)
		} else {
			if (isDischarge) {
				AlertUtils.infoAlert('', 'לא ניתן לבטל טעינה עבור 0 ש"ח');
			} else {
				AlertUtils.infoAlert('', 'לא ניתן לטעון 0 ש"ח');
			}
		}
	};
	const onCancel = () => {
		setLoadCardModal(false)
	};
	const onSumLoadChanged = (value) => {
		clearError();
		let pay = value = value.replace('₪', '').replace(' ', '');
		let isDelete = value.length === sumLoad.toString().length && value == sumLoad;
		if (isDelete)
			pay = value = pay.substring(0, pay.length - 1);
		const currentWalletBalance = walletStore.currentWallet ? walletStore.currentWallet.walletBalance : 0;
		const maxBalance = walletStore.currentWallet ? parseInt(walletStore.currentWallet.maxBalance) : 0;
		const maxDeposit = walletStore.currentWallet ? parseInt(walletStore.currentWallet.maxDeposit) : 0;
		const loadedThisMonth = walletStore.currentWallet ? parseInt(walletStore.currentWallet.loadedThisMonth) : 0;
		const maxAmountToLoad = walletStore.currentWallet ? walletStore.currentWallet.maxAmountToLoad : 0;
		if (isDischarge) //cancel
		{
			const toPay = value == 0 ? 0 : pay;
			if (toPay == 0 || (toPay <= maxDischargeAmount && toPay >= 0)) {
				setSumLoad(value === "" ? -1 : toPay);
				onSumToCancelBlurOrEnter(value === "" ? -1 : toPay);
			} else {
				const isMonthlyLimitBlocking = maxDischargeAmount < currentWalletBalance;

				const limit = walletStore.globalSelfDischargeLimit;
				const formattedLimit = Number(limit || 0).toLocaleString('he-IL', {
					minimumFractionDigits: 0,
					maximumFractionDigits: 2
				});

				const monthlyLimitMessage = (messagesStore.cancelCardMonthlyLimitError || '')
					.replace('{X}', formattedLimit)
					.replace('{{X}}', formattedLimit);

				setLoadError(
					isMonthlyLimitBlocking
						? monthlyLimitMessage
						: messagesStore.cancelCardLimitationError
				);
			}
		}
		else //load
		{
			const toPay = value == 0 ? 0 : parseInt(pay);
			if (isNaN(toPay)) return;

			// Priority 1: monthly load limit for this wallet (msg 10012649)
			if (toPay + loadedThisMonth > maxDeposit) {
				setLoadError(messagesStore.loadCardMonthlyLimitError || messagesStore.loadCardLimitationError);
				return;
			}

			// Priority 2: total balance across all wallets of the card (msg 10012650)
			const maxBalanceAllWallets = walletStore.currentWallet ? walletStore.currentWallet.maxBalanceAllWallets : null;
			if (maxBalanceAllWallets != null) {
				const walletsList = walletStore.card && walletStore.card.wallets ? walletStore.card.wallets : [];
				const totalBalanceAllWallets = walletsList.reduce(
					(sum, w) => sum + (w.walletBalance || 0),
					0
				);
				if (toPay + totalBalanceAllWallets > maxBalanceAllWallets) {
					const formattedLimit = Number(maxBalanceAllWallets).toLocaleString('he-IL');
					setLoadError(
						(messagesStore.loadCardTotalBalanceAllWalletsError || messagesStore.loadCardLimitationError)
							.replace('{מגבלת היתרה המצטברת}', formattedLimit)
							.replace('{{מגבלת היתרה המצטברת}}', formattedLimit)
					);
					return;
				}
			}

			// Priority 3: cumulative load in last 12 months (msg 10012651)
			// Yearly limit now comes from the wallet endpoint (sp_GetWalletsData -> MaxDepositYearly).
			// Current 12-month sum still comes from GetCardActivities (walletStore.totalYearlyDeposit).
			const maxDepositYearly = walletStore.currentWallet ? walletStore.currentWallet.maxDepositYearly : null;
			const totalYearlyDeposit = walletStore.totalYearlyDeposit;
			if (maxDepositYearly != null && totalYearlyDeposit != null) {
				if (toPay + totalYearlyDeposit > maxDepositYearly) {
					const formattedLimit = Number(maxDepositYearly).toLocaleString('he-IL');
					setLoadError(
						(messagesStore.loadCardYearlyLimitError || messagesStore.loadCardLimitationError)
							.replace('{סך פעולות טעינה ב- 12 החודשים האחרונים}', formattedLimit)
							.replace('{{סך פעולות טעינה ב- 12 החודשים האחרונים}}', formattedLimit)
					);
					return;
				}
			}

			// Legacy fallback checks (per-wallet max balance and single-load max) — generic message
			if (toPay > maxBalance - currentWalletBalance || toPay > maxAmountToLoad) {
				setLoadError(messagesStore.loadCardLimitationError);
				return;
			}

			setSumLoad(toPay);
			onSumToLoadBlurOrEnter(toPay);
		}
	};
	const clearError = () => {
		setLoadError('')
	};
	const onShortCodeChanged = (value) => {
		const shortCode = value;
		setShortCode(shortCode)
		creditCardStore.setShortCode(shortCode);
	};

	const onForgotChanged = () => {
		setForgot(!forgot)
	};

	const renderModal = () => {
		const sumLoadVar = typeof sumLoad === 'string' ? Number(sumLoad) : sumLoad;
		return (
			<LoadCardModal
				onCancel={onCancel}
				onLoadCard={isDischarge ? onDischargeClicked : onLoadCardPaid}
				amount={sumLoadVar}
				isDischarge={isDischarge}
			/>
		);
	};
	const renderCreditCardDetails = (disableNumOfPayments, numOfPayment) => {
		return (
			<div className='payment-card-and-user-details'>
				<CustomMediaQuery.Desktop>
					<span className='title-payment-card'>פרטי כרטיס אשראי לחיוב</span>
				</CustomMediaQuery.Desktop>
				<CreditCardDetails
					disableNumOfPayments={disableNumOfPayments}
					onPay={onLoadCardClicked}
					numOfPayment={numOfPayment}
					forgotCode
					loadCard
					onShortCodesaved={onShortCodeChanged}
					onForgotCodeChanged={onForgotChanged}
					disableFirstAndLastName
					hideShortCode={isDischarge}
					onDischarge={onDischargeClicked}
					isDischarge={isDischarge}
					cardId={cardId}
				/>
			</div>
		);
	}
	const renderCreditCardComponent = (disableNumOfPayments, numOfPayment) => {
		return (
			<div className='payment-credit-card-details'>
				<CreditCardComponentCancel
					disableNumOfPayments={disableNumOfPayments}
					onPay={onLoadCardClicked}
					numOfPayment={numOfPayment}
					forgotCode
					loadCard
					onShortCodesaved={onShortCodeChanged}
					onForgotCodeChanged={onForgotChanged}
					disableFirstAndLastName
					hideShortCode={isDischarge}
					onDischarge={onDischargeClicked}
					isDischarge={isDischarge}
					cardId={cardId}
				/>
			</div>
		);
	}
	const renderMobileDischargeContianer = (sumLoad, totalAfterLoad, sumToPay) => {
		return (<div className='discharge-contianer'>
			<div className='discharge-box'>
				<div className='discharge-contianer-sum-amount'>
					<div>
						<div className='title-and-property-discharge'>
							<CustomSpan classNameSpan={`bold`} text={Lang.format('RequestedCreditAmount')} />
							<div className='sum-amount'>
								<CustomInputText
									type={TextTypes.Text}
									value={sumLoad < 0 ? '' : sumLoad + " ₪"}
									onChange={onSumLoadChanged}
								/>
							</div>
						</div>
						<div className='bottom-discharge-box'>
							<CustomSpan
								classNameSpan='club-color-text'
								text={`${Lang.format('SumMaxToDischarge')} ${maxDischargeAmount.toFixed(2)} ₪`}
							/>
						</div>

					</div>

					<div >
						<div className='title-and-property-discharge'>
							<CustomSpan classNameSpan={`bold`} text={Lang.format('CreditAmount')} />
							<CustomSpan text={sumLoad > 0 ? showFixedAmount(`${sumToPay}`, 2) + ' ₪' : ''} />

						</div>
						<div className='bottom-discharge-box'>
							<div>
								<CustomSpan classNameSpan='property club-color-text' text={Lang.format('CreditAmountProperty')} />
								<span className='property'>
									{walletStore.getCard && walletStore.getCard.moneyPercentageCancellationCommission > 0 && <><br /><CustomSpan classNameSpan='property'
										text={`ובניכוי דמי ביטול - ${walletStore.getCard.moneyPercentageCancellationCommission * 100}% מסכום העסקה או ${walletStore.getCard.moneyMaxCommissionAmount}₪, הנמוך מביניהם`} /></>}
								</span>
							</div>
						</div>
					</div>
					<div className='load-error'>
						<span className='red' dangerouslySetInnerHTML={{ __html: loadError || '' }} />
					</div>
					<div className='last-child-ischarge-contianer-sum-amount'>
						<div className='title-and-property-discharge'>
							<CustomSpan classNameSpan={`bold`} text={Lang.format('BalanceWallet')} />
						</div>
						<div className='bottom-discharge-box'>
							<CustomSpan classNameSpan={`bold`} text={sumLoad > 0 ? `${totalAfterLoad.toFixed(2)} ₪` : ''} />

						</div>
					</div>
					{/* {messagesStore.cancelCardMonthlyLimitError && (
						<div className='discharge-monthly-limit-info'>
							<CustomSpan classNameSpan='property' text={messagesStore.cancelCardMonthlyLimitError} />
						</div>
					)} */}
				</div>
			</div>

		</div>)
	}
	const renderDesktopDischargeContianer = (sumLoad, totalAfterLoad, sumToPay) => {
		return (<div className='discharge-contianer'>
			<div className='discharge-box'>
				<CustomHeader
					containerClassName='title-discharge'
					text={Lang.format('CancelLoad')} />
				<div className='discharge-contianer-sum-amount'>
					<div>
						<div className='title-and-property-discharge'>
							<CustomSpan classNameSpan={`bold`} text={Lang.format('RequestedCreditAmount')} />

						</div>
						<div className='left-discharge-box'>
							<CustomInputText
								type={TextTypes.Number}
								value={sumLoad < 0 ? '' : sumLoad}
								onChange={onSumLoadChanged}
							/>
						</div>
					</div>
					<div >
						<div className='title-and-property-discharge'>
							<CustomSpan classNameSpan={`bold`} text={Lang.format('CreditAmount')} />
						</div>
						<div className='left-discharge-box'>
							<CustomSpan classNameSpan={`bold`} text={sumLoad > 0 ? showFixedAmount(`${sumToPay}`, 2) + ' ₪' : ''} />
						</div>
					</div>
					<div>
						<div className='title-and-property-discharge'>
							<CustomSpan classNameSpan={`bold`} text={Lang.format('BalanceWallet')} />
						</div>
						<div className='left-discharge-box'>
							<CustomSpan classNameSpan={`bold`} text={sumLoad > 0 ? `${totalAfterLoad.toFixed(2)} ₪` : ''} />

						</div>
					</div>
				</div>
				<div className='load-error'>
					<span className='red' dangerouslySetInnerHTML={{ __html: loadError || '' }} />
				</div>
				<div>
					{/* {messagesStore.cancelCardMonthlyLimitError && (
						<div className='discharge-monthly-limit-info'>
							<CustomSpan classNameSpan='property' text={messagesStore.cancelCardMonthlyLimitError} />
						</div>
					)} */}
					<CustomSpan text={Lang.format('SumMaxToDischargeProperty') + fromDate} />

					<div>
						<CustomSpan classNameSpan='property club-color-text' text={Lang.format('CreditAmountProperty')} />
						<span className='property'>
							{walletStore.getCard && walletStore.getCard.moneyPercentageCancellationCommission > 0 && <><br /><CustomSpan classNameSpan='property'
								text={`ובניכוי דמי ביטול - ${walletStore.getCard.moneyPercentageCancellationCommission * 100}% מסכום העסקה או ${walletStore.getCard.moneyMaxCommissionAmount}₪, הנמוך מביניהם`} /></>}
						</span>
					</div>
				</div>
			</div>
		</div>)
	}
	const renderLoadCardIsDischarge = () => {
		const currentUser: User = walletStore.authStore.currentUser;
		const numOfPayment = [{ key: 1, value: 'תשלום אחד' }];
		const currentWallet: Wallet = walletStore.getCurrentWallet;

		return (
			<div>
				<CustomMediaQuery.Mobile>
					<span className='title-ischarge-card-container-nobile'>ביטול טעינה</span>
				</CustomMediaQuery.Mobile>
				<CustomModal
					componentToRender={renderModal()}
					onCancel={onCancel}
					visible={loadCardModal}
				/>
				<div className='wallet-card-container discharge-card-container'>

					{walletStore.currentWallet && (
						<Card
							isLoadAllowed={walletStore.currentWallet.loadingMode.isLoadAllowed === 1}
							withLoad={false}
							wallet={walletStore.currentWallet}
							withDischargeAmount={isDischarge}
							maxDischargeAmount={maxDischargeAmount}
						/>
					)}
					<CustomMediaQuery.Desktop>
						{renderDesktopDischargeContianer(sumLoad, totalAfterLoad, sumToPay)}
					</CustomMediaQuery.Desktop>
					<CustomMediaQuery.Mobile>
						{renderMobileDischargeContianer(sumLoad, totalAfterLoad, sumToPay)}
					</CustomMediaQuery.Mobile>
				</div>

				{renderCreditCardComponent(true, numOfPayment)}
			</div>
		);
	};
	const showFixedAmount = (amount: string, numberToShowAfterDot: number) => {
		let newAmount = '';
		let flag = false;
		let count = 0;
		for (let i = 0; i < amount.length; i++) {
			newAmount += amount[i];

			if (amount[i] == '.') {
				flag = true;
			}
			if (flag) {
				if (count == numberToShowAfterDot) {
					break;
				}
				count++;
			}
		}
		return newAmount;
	};

	const renderLoadCardElements = () => {
		const currentUser: User = walletStore.authStore.currentUser;
		let sumToPayVar = isNaN(sumToPay) ? 0 : sumToPay;
		const numOfPayment = [{ key: 1, value: 'תשלום אחד' }];
		const showSpacer = sumLoad == 0 && <div className='spacer' />;
		const maxMonth = walletStore.currentWallet ? walletStore.currentWallet.maxDepositForMonth : 0;
		const maxDep = walletStore.currentWallet ? parseInt(walletStore.currentWallet.maxDeposit) : 0;
		const balance = walletStore.currentWallet ? walletStore.currentWallet.walletBalance : 0;
		const maxLoadedThisMonth = walletStore.currentWallet ? parseInt(walletStore.currentWallet.maxDeposit) - parseInt(walletStore.currentWallet.loadedThisMonth) : 0;
		const maxLoadByBalance = walletStore.currentWallet ? parseInt(walletStore.currentWallet.maxBalance) - walletStore.currentWallet.walletBalance : 0;
		return (
			<div>
				<div className='load-wallet-container'>
					<div className='header-payment-container'>
						{/* <CustomHeader
						containerClassName={`center`}
						headerClassName={'large-font'}
						text={Lang.format('Payment')}
					/> */}
						<div>
							{clubCreditCardSubsidizedOnlyForHolders &&
								<div>
									<CustomMediaQuery.Desktop>
										<EditorMessage doNotCheckLink={false} message={benefitOnlyForBeyahadCardHoldersDesktop} />
									</CustomMediaQuery.Desktop>

									<CustomMediaQuery.Mobile>
										<EditorMessage doNotCheckLink={false} message={benefitOnlyForBeyahadCardHoldersMobile} />
									</CustomMediaQuery.Mobile>
								</div>
							}



						</div>
					</div>

					<CustomModal
						componentToRender={renderModal()}
						onCancel={onCancel}
						visible={loadCardModal}
					/>
					<div className='wallet-card-container'>
						<div className='loading-contianer'>
							<div className='card-details-container'>
								<CustomMediaQuery.Mobile>
									<div className='card-details-container title-container bold'>
										<CustomSpan text={`טעינת כרטיס`} />
									</div>
								</CustomMediaQuery.Mobile>
								<div className='header-card-container'>
									<CustomSpan text={`בחרת להטעין את כרטיס:`} />
								</div>
								<div className='card-details-container'>
									<CustomSpan text={`${walletStore.currentWallet ? walletStore.currentWallet.walletName : ''}`} /><br />
									<CustomSpan text={`עד ₪${maxDep.toLocaleString()} לטעינה`} />
								</div>
								<div className='footer-container'>
									<CustomSpan text={`ניתן לטעון עד סכום כולל של ₪${maxMonth.toLocaleString()} בחודש, ובכפוף למגבלות המופיעות ב`} />
									{authStore.currentUser && authStore.currentUser.moneyTermsURL && (
										<Link
											className='regulations-link'
											to={`${RoutesPath.card.iframe}?link=${authStore.currentUser.moneyTermsURL}`}
										>
											תקנון הארנק הדיגיטלי
										</Link>
									)}
								</div>
							</div>
							<div className='sum-to-load-container' >
								<div className='sum-to-load'>
									<div className='calculate-sum-title'>
										<CustomSpan
											classNameSpan={`bold`}
											text={Lang.format('SumToLoad')}
										/>
									</div>
									<div className='calculate-sum'>
										<CustomInputText
											onBlur={() => { onSumToLoadBlurOrEnter(sumLoad) }}
											value={parseInt(sumLoad.toString()) < 0 ? '' : sumLoad}
											onEnterClick={() => { onSumToLoadBlurOrEnter(sumLoad) }}
											type={TextTypes.Number}
											onChange={onSumLoadChanged}
										/>
										<span className='sign-money bold'>{` ₪ `}</span>
									</div>
								</div>
								<CustomMediaQuery.Mobile>
									<div className='recharge-balance'>
										<MonthlyLoadBalanceHint amount={Math.min(maxLoadByBalance, maxLoadedThisMonth)} />
									</div>
								</CustomMediaQuery.Mobile>
								<div className='sum-to-load'>
									<div className='credit-text'>
										<CustomSpan
											classNameSpan={`bold`}
											text={Lang.format('SumOnCredit')}
										/>
									</div>
									<div className='check-text'>
										{showSpacer}
										<CustomSpan classNameSpan='bold' text={parseInt(sumLoad.toString()) > 0 ? showFixedAmount(`₪${sumToPay}`, 2) : ' '} />
										{showSpacer}
									</div>
								</div>

								<div className='sum-to-load'>
									<div className='credit-text'>
										<CustomSpan
											classNameSpan={`bold`}
											text={Lang.format('SumAfterLoad')}
										/>
									</div>
									<div className='check-to-load-text'>
										{showSpacer}
										<CustomSpan classNameSpan='bold' text={parseInt(sumLoad.toString()) > 0 ? `₪${totalAfterLoad.toFixed(2)}` : ' '} />
										{showSpacer}
									</div>
								</div>
							</div>
							<div className='load-error'>
								<span className='red' dangerouslySetInnerHTML={{ __html: loadError || '' }} />
							</div>
						</div>

						<div className={'card-load-fix'}>
							{walletStore.currentWallet && (
								<CustomMediaQuery.Desktop>
									<CardDetails
										isLoadAllowed={walletStore.currentWallet.loadingMode.isLoadAllowed === 1}
										withLoad={false}
										wallet={walletStore.currentWallet}
										withDischargeAmount={isDischarge}
										maxDischargeAmount={maxDischargeAmount}
									/>
								</CustomMediaQuery.Desktop>
							)}
						</div>
					</div>
					<CustomMediaQuery.Desktop>
						{!forgot && renderCreditCardDetails(true, numOfPayment)}
					</CustomMediaQuery.Desktop>
				</div>
				<CustomMediaQuery.Mobile>
					{!forgot && <div className='load-card-mobile'>
						{renderCreditCardDetails(true, numOfPayment)}
					</div>}
				</CustomMediaQuery.Mobile>
				{forgot && (
					<div className='load-card-with-short-code'>
						<ShortCodePay
							onShortCodeChanged={onShortCodeChanged}
							onForgotShortCodeClicked={onForgotChanged}
							onPay={onLoadCardClicked}
							numofPaymentOprtions={numOfPayment}
							disableNumOfPayments={true}
							loadCard
						/>
					</div>)}
			</div>
		);
	};

	const renderErrorElement = () => { };

	if (!isMint) {
		return isDischarge ? renderLoadCardIsDischarge() : renderLoadCardElements();
	} else {
		// Mint
		if (walletFound) {
			return isDischarge ? renderLoadCardIsDischarge() : renderLoadCardElements();
		} else {
			return (
				<React.Fragment>
					{!viewStore.loadingView ? (
						<div className='mint-error-container'>
							<div className='error'>{<CustomHeader text={Lang.format('Mint104Error')} />}</div>
						</div>
					) : null}
				</React.Fragment>
			);
		}
	}
}
export default observer(LoadCard)
