import * as React from 'react';
import { CustomHeader, HeaderType, CustomSpan, CustomButton } from 'nofshonit-base-web-client';
import Lang from '../../../config/Language';
import WalletStore from '../../../stores/WalletStore';
import rootStores from '../../..//stores';
import { WALLET_STORE, VIEW_STORE,AUTH_STORE } from '../../../consts/stores';
import { observer } from 'mobx-react';
import ErrorUtils from '../../../utils/errorHandling/ErrorUtils';
import ViewStore from '../../../stores/ViewStore';
import ShortCodeModal from '../../../components/BeyhadComponents/PaymentPage/ShortCodeModal';
import { CustomMediaQuery } from 'src/components/CustomComponents/CustomMediaQuery/CustomMediaQuery';
import { useEffect, useState } from 'react';
import Barcode from "react-barcode";
import AuthStore from '../../../stores/AuthStore';
import ScreenUtils from 'src/utils/ScreenUtils';
import { SPECIAL_NAVBAR_PATHS } from "src/utils/navbarVisibilityUtils";

interface IProps {
	match?: any;
}
interface IState {
	barcodeText: string;
	cardNumber: string;
	cvv: string;
	epirationDate: string;
}

const walletStore: WalletStore = rootStores[WALLET_STORE];
const viewStore: ViewStore = rootStores[VIEW_STORE];
const authStore: AuthStore = rootStores[AUTH_STORE];

const BarcodePayment: React.FC<IProps> = ({
	match
}) => {

	const [barcodeText, setBarcodeText] = useState<string>('');
	const [cardNumber, setCardNumber] = useState<string>('');
	const [cvv, setCvv] = useState<string>('');
	const [expirationDate, setExpirationDate] = useState<string>('');
	const isMobile = ScreenUtils.IsMobile();

	useEffect(() => {
		viewStore.setLoadingView(true);
		walletStore
			.getBarcode()
			.then((barcode) => {
				setBarcodeText(barcode.barCode)
				setCardNumber(barcode.cardNumber)
				setCvv(barcode.cvv)
				setExpirationDate(barcode.expirationDate)
			})
			.catch((err) => {
				ErrorUtils.checkErrorAndShowPopUp(err);
			})
			.finally(() => {
				viewStore.setLoadingView(false);
			});
	}, [])


	const generateBarcodeClick = () => {
		viewStore.setLoadingView(true);
		walletStore
			.getBarcode()
			.then((barcode) => {
				setBarcodeText(barcode.barCode)
				setCardNumber(barcode.cardNumber)
				setCvv(barcode.cvv)
				setExpirationDate(barcode.expirationDate)
			})
			.catch((err) => {
				ErrorUtils.checkErrorAndShowPopUp(err);
			})
			.finally(() => {
				viewStore.setLoadingView(false);
			});
	};

	const print = () => {
		window.print();
	};

	useEffect(() => {
		authStore.showNavBarSearchBox = isMobile;
		authStore.showSearchIcon = !isMobile;
	}, [isMobile, authStore]);

	useEffect(() => {
	return () => {
      const removeSearchBar = SPECIAL_NAVBAR_PATHS.some(p => location.pathname.startsWith(p));
      if (!removeSearchBar) {
        authStore.showNavBarSearchBox = true;
        authStore.showSearchIcon = true;
      }
    };
	}, [window.location.pathname, authStore]);

	const renderBarcode = () => {
		return (
			<div className='barcode-payment-padding'>
				<CustomMediaQuery.Mobile>
					<div className={'barcode-payment-title-container'}>
						<CustomHeader type={HeaderType.Title} text={Lang.format('PayAtRegister')} />
					</div>
				</CustomMediaQuery.Mobile>
				<div className={'barcode-payment-body-padding'}>
					<div className={'barcode-payment-container'}>
						<div>
							<span>{Lang.format('ShowBarcodeAtRegisteryAndPayWithItRow1')}</span>
						</div>
						<div>
							<span>{Lang.format('ShowBarcodeAtRegisteryAndPayWithItRow2')}</span>
						</div>
					</div>
					<div className='btn-container'>
						<CustomButton
							text={Lang.format('GenerateBarcode')}
							buttonClassName={barcodeText && barcodeText.length > 0 ? 'active-generate-bar-code' : 'button-generate-bar-code'}
							onClick={generateBarcodeClick}
						/>
					</div>
					{barcodeText && barcodeText.length > 0 && (
						<>
							<div className='contain-barcode'>
								<div className='generatedBarcode'>
									<div
										className='barcode-number'
										style={{ justifyContent: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
										<Barcode value={barcodeText} displayValue={false} />
									</div>
									<span style={{
										fontSize: '22px',
										marginBottom: '10px',
										color: 'black',
										textAlign: 'center',
										width: '100%',
										display: 'block'
									}} >{barcodeText}</span>
									<div style={{ marginTop: 20, direction: 'rtl' }}>
										{Lang.format('CardNumber')}
										{" " + cardNumber}
										<br />
										{/* {`${this.state.cvv } CVV:`} */}
										<tr>
											<td><p>CVV:&nbsp;</p></td>
											<td>{cvv}</td>
										</tr>
										{"תוקף כרטיס: " + expirationDate}
									</div>
								</div>
							</div>
						</>
					)}
				</div>
			</div>
		)
	}
	const renderEmptyState = () => {
		let emptyStateText;
		if (walletStore.loadingGetWallets) {
			emptyStateText = 'טוען ארנקים...';
		} else {
			emptyStateText = 'לא נמצאו ארנקים משוייכים לכרטיס זה.';
		}

		return (
			<div className='empty-state-charge'>
				<CustomHeader text={emptyStateText} containerClassName={'center'} />
			</div>
		);
	};

	return (
		<div className='barcode-payment-container'>
			{walletStore.getWalletsArray && walletStore.getWalletsArray.length > 0
				? renderBarcode()
				: renderEmptyState()}
		</div>
	);
}
export default observer(BarcodePayment)
