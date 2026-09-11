import { observer } from 'mobx-react';
import * as React from 'react';
import Lang from '../../config/Language';
import { RoutesPath } from '../../consts/RoutesPath';
import { MESSAGES_STORE, AUTH_STORE, FOOTERVIEWSTORE, BIOMETRICS_STORE } from '../../consts/stores';
import rootStores from '../../stores';
import MessagesStore from '../../stores/MessagesStore';
import FooterViewStore from 'src/stores/FooterViewStore';
import { Route } from 'react-router';
import AuthStore from '../../stores/AuthStore';
import EditorMessage from '../../components/BeyhadComponents/EditorMessage/EditorMessage';
import { CustomSpan } from 'nofshonit-base-web-client';
import ImgRoute from './imgRoute';
import { tryNavigateToLoadCard } from '../../utils/WalletNavigationUtils';
import { CustomMediaQuery } from 'src/components/CustomComponents/CustomMediaQuery/CustomMediaQuery';
import { Linking } from 'react-native';
import BiometricsStore from 'src/stores/BiometricsStore';
import ExternalLinkConfirm from 'src/services/ExternalLinkConfirm';
import { useEffect } from 'react';

interface IState { }

interface Props {
	history?: any;
}
const biometricsStore: BiometricsStore = rootStores[BIOMETRICS_STORE];
const messagesStore: MessagesStore = rootStores[MESSAGES_STORE];
const authStore: AuthStore = rootStores[AUTH_STORE];
const footerViewStore: FooterViewStore = rootStores[FOOTERVIEWSTORE];
const footerRef: React.RefObject<HTMLDivElement> = React.createRef();

const Footer: React.FC<Props> = ({
	history,
}) => {
	const [isMobile, setIsMobile] = React.useState(false);
	useEffect(() => {
		updateDimensions()
	}, [])

	const handleResize = React.useCallback(() => {
		setIsMobile(window.innerWidth < 1025);
	}, []);


	useEffect(() => {
		handleResize();

		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, [handleResize]);

	const updateDimensions = () => {
		const height: HTMLDivElement | null = footerRef.current;
		const footerClientHeight = height ? height.clientHeight : 0;
		footerViewStore.setFooterCurrentHeight(footerClientHeight);
	}

	const goToLink = (url: string, isExternal?: boolean) => {
		// If User is logged in then allow clicking the link
		if (authStore.canActivateAction) {
			if (isExternal) {
				window.open(url, '_blank');
			} else {
				history.push(url);
			}
		}
	};

	const openLinkRoute = (url: string) => {
		history.push(url)
	}
	const openLinkUrl = (url: string) => {
		if (window.localStorage.getItem('webview'))
			biometricsStore.postMessageToNativeApp(`isLinkToOpenUrl?${url}`);
		else
			ExternalLinkConfirm.OpenLinkExternal(url, '_blank')
	}

	// const isMobile = window.innerWidth < 1025;
	const isRegister = window.location.pathname.includes(RoutesPath.mint.registration) || window.location.pathname.includes(RoutesPath.login.registration) || (window.location.pathname.includes(RoutesPath.login.login) && !authStore.isUserLoggedIn);
	console.log(isRegister, authStore.isUserLoggedIn, window.location.pathname)
	return (
		<div className='footer-main-container'>
			<div className='footer-main-container-inner' ref={footerRef}>
				{!authStore.isUserLoggedIn || isRegister &&
					<div className='top-footer'>
						<CustomMediaQuery.Desktop>
							{messagesStore.footerHTMLlogIn && messagesStore.footerHTMLlogIn.length > 0 && <EditorMessage textClassName={'topFooterHTML'} message={messagesStore.footerHTMLlogIn} />}
						</CustomMediaQuery.Desktop>
						<CustomMediaQuery.Mobile>
							{messagesStore.footerHTMLlogIn && messagesStore.footerHTMLlogIn.length > 0 && <EditorMessage textClassName={'topFooterHTML'} message={messagesStore.footerHTMLlogIn} />}
						</CustomMediaQuery.Mobile>
					</div>}
				<div className='icons-footer-container'>
					{authStore.isUserLoggedIn && !isRegister ?
						<div className='icons-footer'>
							<ImgRoute history={history} link={RoutesPath.profile.history} src={'history.png'} text={'OrdersHistory'} />
							<ImgRoute history={history} link={RoutesPath.card.cardCharging} src={'credit-card-footer.png'} text={'LoadCard'} onClickOverride={() => tryNavigateToLoadCard(history)} />
							<ImgRoute history={history} link={RoutesPath.externalLink.questionsAndAnswers} src={'question.png'} text={'QuestionsAndAnswers'} />
							<ImgRoute history={history} link={RoutesPath.customerService.root} src={'email.png'} text={'Contact'} />
							<div className='img-route' onClick={() => openLinkUrl('https://www.facebook.com/histadrutclub')}>
								<img className='logo-item' src={require('../../assets/facebook.png')} />
								<CustomSpan text={Lang.format('Facebook')} />
							</div>
							<ImgRoute history={history} link={RoutesPath.externalLink.regulations} src={'document.png'} text={'Regulations'} />
						</div>
						: <div className='icons-footer container-three-icons'>
							{/* <ImgRoute history={this.props.history} link={'externalLink?link=https://www.dts.co.il/HtmlView/13092021-1'} src={'question.png'} text={'QuestionsAndAnswers'} /> */}
							<div className='img-route' onClick={() => window.open('https://www.dts.co.il/HtmlView/13092021-1', '_blank')}>
								<img className='logo-item' src={require('../../assets/question.png')} />
								<CustomSpan text={Lang.format('QuestionsAndAnswers')} />
							</div>
							<div className='img-route' onClick={() => openLinkUrl('https://www.facebook.com/histadrutclub')}>
								<img className='logo-item' src={require('../../assets/facebook.png')} />
								<CustomSpan text={Lang.format('Facebook')} />
							</div>
							<div className='img-route' onClick={() => window.open('https://www.dts.co.il/HtmlView/10042018-1', '_blank')}>
								<img className='logo-item' src={require('../../assets/document.png')} />
								<CustomSpan text={Lang.format('Regulations')} />
							</div>
						</div>
					}
				</div>
				<div className='buttom-footer' style={{ textAlign: 'center' }}>
					{
						isMobile && messagesStore.footerMObileHTML && messagesStore.footerMObileHTML.length > 0 && (
							<EditorMessage textClassName={'footerHTML'} message={messagesStore.footerMObileHTML} />
						)
					}
					{!isMobile && messagesStore.footerHTML && messagesStore.footerHTML.length > 0 && (
						<EditorMessage textClassName={'footerHTML'} message={messagesStore.footerHTML} />
					)}
				</div>
			</div>
			<div className='icons-footer-container icons-footer-container-botom'>
				<div className='icons-footer menu-footer'>
					<ImgRoute history={history} link={RoutesPath.root} src={'home.png'} text={'HomePageButton'} className={'icons-footer-botom'} />
					<ImgRoute history={history} link={RoutesPath.card.cardCharging} src={'credit-card-botom.png'} text={'LoadCard'} className={'icons-footer-botom'} onClickOverride={() => tryNavigateToLoadCard(history)} />
					<ImgRoute history={history} link={RoutesPath.profile.history} src={'account.png'} text={'PrivateArea'} className={'icons-footer-botom'} />
					<ImgRoute history={history} link={RoutesPath.cart.root} src={'shopping-cart-botom.png'} text={'Cart'} className={'icons-footer-botom'} />
				</div>
			</div>
		</div>
	);
}
export default observer(Footer)
