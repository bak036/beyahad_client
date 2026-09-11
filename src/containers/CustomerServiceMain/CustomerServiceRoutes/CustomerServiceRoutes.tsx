import * as React from 'react';
import { CustomMediaQuery } from 'src/components/CustomComponents/CustomMediaQuery/CustomMediaQuery';
import { AUTH_STORE, USER_DETAILS_STORE, VIEW_STORE } from 'src/consts/stores';
import rootStores from 'src/stores';
import AuthStore from 'src/stores/AuthStore';
import UserDetailsStore from 'src/stores/UserDetailsStore';
import ViewStore from 'src/stores/ViewStore';
import CustomLink from '../../../components/CustomComponents/CustomLink/CustomLink';
import Lang from '../../../config/Language';
import { RoutesPath } from '../../../consts/RoutesPath';
import AlertUtils from 'src/utils/AlertUtils';
import ErrorUtils from 'src/utils/errorHandling/ErrorUtils';
import { useState } from 'react';

interface Props { }

interface IState {
	links: any;
}
const viewStore: ViewStore = rootStores[VIEW_STORE];
const userDetailsStore: UserDetailsStore = rootStores[USER_DETAILS_STORE];
const authStore: AuthStore = rootStores[AUTH_STORE];
const CustomerServiceRoutes : React.FC<Props> = ({
}) => {

	const [links, setLinks] = useState<any>({regulation: `${RoutesPath.iframe}?link=https://www.dts.co.il/HtmlView/10042018-1`,
	questionsAndAnswers: `${RoutesPath.iframe}?link=https://www.dts.co.il/HtmlView/13092021-1`,
	AccessibilityStatement: `${RoutesPath.iframe}?link=https://www.dts.co.il/HtmlView/29032018-5`,
	BenefitsofHistadrut:
		'https://www.histadrut.org.il/%D7%A8%D7%A9%D7%99%D7%9E%D7%AA_%D7%94%D7%94%D7%98%D7%91%D7%95%D7%AA_%D7%9C%D7%97%D7%91%D7%A8%D7%99_%D7%94%D7%A1%D7%AA%D7%93%D7%A8%D7%95%D7%AA',
	ChangesAndUpdates:
		`${RoutesPath.iframe}?link=https://www.dts.co.il/HtmlView/31012023-1`,
	},);

	const openChat = () => {
		// Variable Definition
		const element = document.getElementById('glassix-widget-launcher'); // Get open button element

		// 	// Code Section
		if (element) {
			element.click();
		}
	};
	const DeleteMember = () => {

		const contentHtml =
			"<div >" + Lang.format('DeleteMemberButtonPressed') + "</div>" +
			"<div style='margin-top:3%'>" + Lang.format('DeleteMemberInstructionP1') + "</div>" +
			"<div style='margin-top:3%'>" + Lang.format('DeleteMemberInstructionP2') + "</div>" +
			"<div style='margin-top:3%'>" + Lang.format('DeleteMemberInstructionP3') + "</div>";

		AlertUtils.confirmAlertWithHtmlForDeleteUser(
			'',
			contentHtml,
			Lang.format('DeleteMemberAlertButtonContinue'),
			Lang.format('DeleteMemberAlertButtonPressedByMistake'),

		).then((result) => {
			// Enable loader
			if (result.value) {
				viewStore.setLoadingView(true);
				userDetailsStore
					.deleteUserRequest()
					.then((res) => {
						if (res.data == false) {
							AlertUtils.confirmAlertOneButton('', Lang.format('DeleteMemberNotAllowed'), Lang.format('DeleteMemberNotAllowedOkButton'))
								.then((result) => {
									viewStore.setLoadingView(false);
								});

						}
						else {
							const contentHtml =
								"<div style='margin-top:3%'>" + Lang.format('DeleteMemberRequestReceived') + "</div>" +
								"<div style='margin-top:3%'>" + Lang.format('DeleteMemberRequestHandled5Days') + "</div>";

							AlertUtils.confirmAlertOneButtonWithHtml('', contentHtml, Lang.format('DeleteMemberNotAllowedOkButton'))
								.then((result) => {
									authStore.logout();
								});
						}

					})
					.catch((err) => {
						// Disable loader
						viewStore.setLoadingView(false);
						// Check error type
						ErrorUtils.checkErrorAndShowPopUp(err, '', '');
					});
			}
		});
	};
	const renderDesktop = (regulation,
		questionsAndAnswers,
		AccessibilityStatement,
		BenefitsofHistadrut,
		ChangesAndUpdates,) => {
		return (
			<div className={'customer-service-actions-container'}>
				<div className='box-img-and-title'>
					<img src={require('../../../assets/צאט סטיקי.png')} />
					<CustomLink text={Lang.format('ContactWithPresenter')} exact onClick={openChat} />
				</div>
				<div className='box-img-and-title'>
					<img src={require('../../../assets/contact.svg')} />
					<CustomLink text={Lang.format('Contact')} exact route={RoutesPath.customerService.root} />
				</div>
				<div className='box-img-and-title'>
					<img src={require('../../../assets/question@2x.png')} />
					<CustomLink text={Lang.format('QuestionsAndAnswers')} isExternalPage route={questionsAndAnswers} />
				</div>
				<div className='box-img-and-title'>
					<img src={require('../../../assets/document@2x.png')} />
					<CustomLink text={Lang.format('Regulations')} isExternalPage route={regulation} />
				</div>
				<div className='box-img-and-title'>
					<img src={require('../../../assets/changes.png')} />
					<CustomLink text={Lang.format('ChangesAndUpdates')} isExternalPage route={ChangesAndUpdates} />
				</div>
				<div className='box-img-and-title'>
					<img src={require('../../../assets/documentYOR.svg')} />
					<CustomLink text={Lang.format('SpeakChairman')} route={RoutesPath.customerService.chairmanSpeak} />
				</div>
				<div className='box-img-and-title'>
					<img src={require('../../../assets/נגישות.png')} />
					<CustomLink text={Lang.format('AccessibilityStatement')} isExternalPage route={AccessibilityStatement} />
				</div>
				<div className='box-img-and-title'>
					<img src={require('../../../assets/הטבות.png')} />
					<CustomLink text={Lang.format('BenefitsofHistadrut')} isExternalPage route={BenefitsofHistadrut} newTab={true} />
				</div>
				<div className='box-img-and-title'>
					<img src={require('../../../assets/דבר העובדים.png')} />
					<CustomLink text={Lang.format('DvarHovdim')} isExternalPage route={"https://www.davar1.co.il/"} newTab={true} />
				</div>
				{
					authStore.isUserLoggedIn &&
					<div className='box-img-and-title' onClick={DeleteMember}>
						<img src={require('../../../assets/delete-account.png')} />
						<p style={{
							color: '#0f6bb3',
							fontFamily: 'Rubik-Bold',
							fontSize: '14px',
							fontWeight: 'bold',
							fontStretch: 'normal',
							fontStyle: 'normal',
							lineHeight: '1.16',
							letterSpacing: 'normal'
						}}>בקשה למחיקת חשבון</p>
					</div>
				}

			</div>)
	}
	const renderMobile = (regulation,
		questionsAndAnswers,
		AccessibilityStatement,
		BenefitsofHistadrut,
		ChangesAndUpdates,) => {
		return (<div className={'customer-service-actions-container'}>
			<CustomLink
				exact
				text={Lang.format('ContactWithPresenter')}
				containerClassName={'start-chat-container'}
				onClick={openChat}
				textClassName={'contact-with-presenter'}
				iconElement={<span className={'icon-element chat-container'} />}
			/>
			<div className={'hide-on-desktop '}>
				<div className={'link-with-icon-container '}>
					<CustomLink
						exact
						text={Lang.format('Contact')}
						route={RoutesPath.customerService.root}
						containerClassName={'container-with-icon'}
						textClassName={'text-container-short-width'}
						iconElement={<img src={require('../../../assets/contact.svg')} />}
					/>
					<CustomLink
						text={Lang.format('QuestionsAndAnswers')}
						isExternalPage
						route={questionsAndAnswers}
						containerClassName={'container-with-icon'}
						iconElement={<span className={'icon-element question-icon'} />}
					/>
				</div>
			</div>
			<div className={'row small'}>
				<div className='box-img-and-title'>
					<img src={require('../../../assets/document@2x.png')} />
					<CustomLink text={Lang.format('Regulations')} isExternalPage route={regulation} />
				</div>
				<div className='box-img-and-title'>
					<img src={require('../../../assets/changes.png')} />
					<CustomLink text={Lang.format('ChangesAndUpdates')} isExternalPage route={ChangesAndUpdates} />
				</div>
				<div className='box-img-and-title'>
					<img src={require('../../../assets/documentYOR.svg')} />
					<CustomLink text={Lang.format('SpeakChairman')} route={RoutesPath.customerService.chairmanSpeak} />
				</div>

			</div>
			<div className={'row'}>
				<div className='box-img-and-title'>
					<img src={require('../../../assets/נגישות.png')} />
					<CustomLink text={Lang.format('AccessibilityStatement')} isExternalPage route={AccessibilityStatement} />
				</div>
				<div className='box-img-and-title'>
					<img src={require('../../../assets/הטבות.png')} />
					<CustomLink text={Lang.format('BenefitsofHistadrut')} isExternalPage route={BenefitsofHistadrut} newTab={true} />
				</div>
				<div className='box-img-and-title'>
					<img src={require('../../../assets/דבר העובדים.png')} />
					<CustomLink text={Lang.format('DvarHovdim')} isExternalPage route={"https://www.davar1.co.il/"} newTab={true} />
				</div>

			</div>
		</div>)
	}
	
	const {
		regulation,
		questionsAndAnswers,
		AccessibilityStatement,
		BenefitsofHistadrut,
		ChangesAndUpdates,
	} = links;
	return (
		<>
			<CustomMediaQuery.Desktop>
				{renderDesktop(regulation,
					questionsAndAnswers,
					AccessibilityStatement,
					BenefitsofHistadrut,
					ChangesAndUpdates,)}
			</CustomMediaQuery.Desktop>
			<CustomMediaQuery.Mobile>
				{renderMobile(regulation,
					questionsAndAnswers,
					AccessibilityStatement,
					BenefitsofHistadrut,
					ChangesAndUpdates,)}
			</CustomMediaQuery.Mobile>
		</>
	);
}
export default CustomerServiceRoutes;
