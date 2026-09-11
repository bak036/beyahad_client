import { observer } from 'mobx-react';
import { CustomHeader, CustomSeperator, CustomSpan, HeaderType } from 'nofshonit-base-web-client';
import * as React from 'react';
import Lang from '../../../../config/Language';
import { WALLET_STORE, VIEW_STORE } from '../../../../consts/stores';
import rootStores from '../../../../stores';
import WalletStore from '../../../../stores/WalletStore';
import TransactionComponent from './TransactionComponent';
import ViewStore from '../../../../stores/ViewStore';
import { RoutesPath } from 'src/consts/RoutesPath';
import { NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
const moment = require('moment');

interface IState {
	display: boolean;
}
interface Props { }

const walletStore: WalletStore = rootStores[WALLET_STORE];
const viewStore: ViewStore = rootStores[VIEW_STORE];

const BalanceAndUses : React.FC<Props> = ({
}) => {
	const [display,setDisplay] = useState<boolean>(false);

	useEffect(() => {
		viewStore.setLoadingView(true);
		walletStore.getTransactions().then(() => {
			viewStore.setLoadingView(false);
		});
	},[])

	const renderAllTransactions = () => {
		return walletStore.transactions.map((transaction) => (
			<TransactionComponent key={transaction.id} transaction={transaction} />
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

		const { currentUser } = walletStore.authStore;
		return (
			<div className='balance-container'>
				<CustomHeader headerClassName='title-balance-and-uses' text={Lang.format('BalanceAndUses')} containerClassName={`center`} />
				<div className='wallet-details-container'>
					<div className='wallet-details'>
						{/* <div className='item-detail'>
							<CustomSpan text={`תעודת זהות ${currentUser ? currentUser.identityNumber : '0000'}`} />
						</div> */}
						<div className='item-detail'>
							<CustomSpan
								text={`מספר כרטיס ${currentUser && currentUser.cardNumber ? currentUser.cardNumber : 'לא קיים כרטיס'
									}`}
							/>
						</div>
						<div className='item-detail'>
							<CustomSpan text={`סטטוס כרטיס `} />
							<CustomSpan
								classNameSpan={`${walletStore.card && walletStore.card.cardInfo && walletStore.card.cardInfo.cardStatus === 1
										? 'green'
										: 'red'
									}`}
								text={`${walletStore.card && walletStore.card.cardInfo && walletStore.card.cardInfo.cardStatus === 1
										? 'פעיל'
										: 'לא פעיל'
									}`}
							/>
						</div>
						<div className='item-detail'>
							<CustomSpan text={`יתרה כוללת לכרטיס `} />
							<CustomSpan
								classNameSpan={'green'}
								text={`₪${walletStore.card && walletStore.card.balance ? showFixedAmount(`${walletStore.card.balance}`, 2) : '0'} `}
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
						{/* <div className='item-detail'>
							<CustomSpan
								text={`תאריל הפעלה/אקטוב  ${
									walletStore.card && walletStore.card.cardInfo && walletStore.card.cardInfo.activationTime
										? moment(`${walletStore.card.cardInfo.activationTime}`).format('DD/MM/YYYY')
										: '0/0/0'
								}`}
							/>
						</div> */}
						{/* <div className='item-detail'>
							<CustomSpan
								text={`בתוקף עד  ${
									walletStore.card && walletStore.card.cardInfo && walletStore.card.cardInfo.activationTime
										? moment(`${walletStore.card.cardInfo.expiredDate}`).format('DD/MM/YYYY')
										: '0/0/0'
								}`}
							/>
						</div> */}
						<div className='item-detail' style={{marginTop:20}}>
							<NavLink to={RoutesPath.card.cardCharging} className='item-detail'>
								יתרה לפי ארנק
							</NavLink>
						</div>
						<div className='transactions-container'>
							{/* <CustomHeader type={HeaderType.Text} text={'יתרות ותנועות'} /> */}
							<div className='titles-container'>
								<div className='title-container'>
									<CustomSpan text={'תאריך ושעה'} />
								</div>
								<div className='title-container'>
									<CustomSpan text={'סוג פעולה'} />
								</div>
								<div className='title-container sum'>
									<CustomSpan text={'סכום'} />
								</div>
								<div className='title-container' />
							</div>
							<CustomSeperator />
							{renderAllTransactions()}
						</div>
					</div>
				</div>
			</div>
		);
	}
	export default observer(BalanceAndUses)
