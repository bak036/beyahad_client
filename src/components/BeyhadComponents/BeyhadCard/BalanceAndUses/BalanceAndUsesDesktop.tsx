import * as React from 'react';
import {CustomHeader, HeaderType, CustomSelector, CustomSpan, CustomSeperator} from 'nofshonit-base-web-client';
import {WALLET_STORE} from '../../../../consts/stores';
import rootStores from '../../../../stores';
import WalletStore from '../../../../stores/WalletStore';
import {observer} from 'mobx-react';
import TransactionComponent from './TransactionComponent';
import TransactionDesktopComponent from './TransactionDesktopComponent';
import {RoutesPath} from '../../../../consts/RoutesPath';
import {NavLink} from 'react-router-dom';
import { useState } from 'react';
const moment = require('moment');

interface Props {}
interface IState {
	display: boolean;
}
const walletStore: WalletStore = rootStores[WALLET_STORE];
const BalanceAndUsesDesktop : React.FC<Props> = ({
}) => {

	const [display, setDisplay] = useState<boolean>(false);

	const renderAllTransactions = () => {
		return walletStore.transactions.map((transaction) => (
			<TransactionDesktopComponent key={transaction.id} transaction={transaction} />
		));
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
	const {currentUser} = walletStore.authStore;
	return (
		<div className='balance-desktop-container'>
			<div className={`wallet-and-transaction-container`}>
				<div className={`wallet-container`}>
					<div className='wallet-details'>
						{/* <div className='item-detail'>
							<CustomSpan text={`תעודת זהות לקוח ${currentUser ? currentUser.identityNumber : '0000'}`} />
						</div> */}
						<div className='item-detail'>
							<CustomSpan
								text={`כרטיס מספר:  ${
									currentUser && currentUser.cardNumber ? currentUser.cardNumber : 'לא קיים כרטיס'
								}`}
							/>
						</div>
						<div className='item-detail'>
							<CustomSpan text={`סטטוס כרטיס: `} />
							<CustomSpan
								classNameSpan={`${
									walletStore.card && walletStore.card.cardInfo && walletStore.card.cardInfo.cardStatus === 1
										? 'green'
										: 'red'
								}`}
								text={`${
									walletStore.card && walletStore.card.cardInfo && walletStore.card.cardInfo.cardStatus === 1
										? 'פעיל'
										: 'לא פעיל'
								}`}
							/>
						</div>
						<div className='item-detail'>
							<CustomSpan text={`יתרה כוללת לכרטיס: `} />
							<CustomSpan
								classNameSpan={'green'}
								text={`₪${walletStore.card && walletStore.card.balance ?showFixedAmount(`${walletStore.card.balance}`, 2): 0} `}
							/>
						</div>
						{walletStore.maxDepositYearly != null && (
							<div className='item-detail'>
								<CustomSpan text={`סך טעינות ב- 12 החודשים האחרונים: `} />
								<CustomSpan
									text={`${walletStore.totalYearlyDeposit.toLocaleString()} ₪ מתוך ${walletStore.maxDepositYearly.toLocaleString()} ₪`}
								/>
							</div>
						)}
						<div className='item-detail'>
							<NavLink to={RoutesPath.card.cardCharging} className='item-detail'>
								יתרה לפי ארנק
							</NavLink>
						</div>
						{/* <div className='item-detail'>
							<CustomSpan
								text={`בתוקף עד ${
									walletStore.card && walletStore.card.cardInfo
										? moment(`${walletStore.card.cardInfo.expiredDate}`).format('DD/MM/YYYY')
										: '0/0/0'
								}`}
							/>
						</div> */}
					</div>
				</div>

				<div className='transactions-container'>
					{/* <CustomHeader type={HeaderType.Text} text={'יתרות ותנועות'} /> */}
					<div className='titles-container'>
						<div className='title-container'>
							<CustomSpan text={'תאריך ושעה'} />
						</div>
						<div className='title-container'>
							<CustomSpan text={'מספר פעולה'} />
						</div>
						<div className='title-container'>
							<CustomSpan text={'מזהה פיתקית'} />
						</div>
						<div className='title-container'>
							<CustomSpan text={'רשת'} />
						</div>
						<div className='title-container'>
							<CustomSpan text={'סניף'} />
						</div>
						<div className='title-container'>
							<CustomSpan text={'סוג פעולה'} />
						</div>
						<div className='title-container'>
							<CustomSpan text={'סכום'} />
						</div>
					</div>
					<CustomSeperator />
					{renderAllTransactions()}
				</div>
			</div>
		</div>
	);
}
export default observer(BalanceAndUsesDesktop)
