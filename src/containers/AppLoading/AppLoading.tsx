import { observer } from 'mobx-react';
import { CustomSpan } from 'nofshonit-base-web-client';
import * as React from 'react';
import ReactLoading from 'react-loading';
import { CustomMediaQuery } from '../../components/CustomComponents/CustomMediaQuery/CustomMediaQuery';
import { RoutesPath } from '../../consts/RoutesPath';
import { VIEW_STORE } from '../../consts/stores';
import rootStores from '../../stores';
import ViewStore from '../../stores/ViewStore';
import swishLogo from '../../assets/swishlogo.svg';

const viewStore: ViewStore = rootStores[VIEW_STORE];

interface IState {}
interface IProps {
	text?: string;
}
const AppLoading : React.FC<IProps> = observer(({
	text
}) => {
	let hide = viewStore.loadingView ? '' : 'hide';
	const isWalletTransitionLoading =
		window.location.pathname.endsWith(RoutesPath.card.cardCharging);
	return (
		<div className={`react-loading ${hide}`}>
			<CustomMediaQuery.Desktop>
				<div className={`react-loading-container ${isWalletTransitionLoading ? 'react-loading-container--wallet' : ''}`}>
					<ReactLoading
						className="react-loading-class"
						type={'spinningBubbles'}
						color={'blue'}
						height={isWalletTransitionLoading ? '120px' : '20%'}
						width={isWalletTransitionLoading ? '120px' : '10%'}
					/>
					{isWalletTransitionLoading && (
						<div className='app-loading-wallet-text'>
							<div className='app-loading-wallet-text__title'>הינכם מועברים לארנק הדיגיטלי</div>
							<div className='app-loading-wallet-text__managed-by'>
								<span>מנוהל על ידי - </span>
								<img src={swishLogo} alt='Swish' className='app-loading-wallet-text__logo' />
							</div>
							<div className='app-loading-wallet-text__company'>סוויש פיי בע"מ ח.פ. 516990074</div>
						</div>
					)}
				</div>
			</CustomMediaQuery.Desktop>
			<CustomMediaQuery.Mobile>
				<div className={`react-loading-container ${isWalletTransitionLoading ? 'react-loading-container--wallet' : ''}`}>
					<ReactLoading
						className="react-loading-class"
						type={'spinningBubbles'}
						color={'blue'}
						height={isWalletTransitionLoading ? '110px' : '50%'}
						width={isWalletTransitionLoading ? '110px' : '25%'}
					/>
					{isWalletTransitionLoading && (
						<div className='app-loading-wallet-text'>
							<div className='app-loading-wallet-text__title'>הינכם מועברים לארנק הדיגיטלי</div>
							<div className='app-loading-wallet-text__managed-by'>
								<span>מנוהל על ידי - </span>
								<img src={swishLogo} alt='Swish' className='app-loading-wallet-text__logo' />
							</div>
							<div className='app-loading-wallet-text__company'>סוויש פיי בע"מ ח.פ. 516990074</div>
						</div>
					)}
				</div>
			</CustomMediaQuery.Mobile>
			{!isWalletTransitionLoading && (
				<div className='app-loading-text'>
					<CustomSpan
						classNameSpan={'app-loading-text-propery'}
						text={text ? text : 'טוען תוצאות'}
					/>
				</div>
			)}
		</div>
	);
})
export default AppLoading;

