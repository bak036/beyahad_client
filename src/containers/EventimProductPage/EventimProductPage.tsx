import {observer} from 'mobx-react';
import {CustomButton, CustomSpan, Logger} from 'nofshonit-base-web-client';
import * as React from 'react';
import {isNullOrUndefined} from 'util';
import TagsAdvertisment from '../../components/BeyhadComponents/CustomService/Advertisement/TagsAdvertisment/TagsAdvertisment';
import EditorMessage from '../../components/BeyhadComponents/EditorMessage/EditorMessage';
import EventimDescription from '../../components/BeyhadComponents/EventimProductPageComponents/EventimDescription/EventimDescription';
import EventimFilters from '../../components/BeyhadComponents/EventimProductPageComponents/EventimFilters/EventimFilters';
import EventsList from '../../components/BeyhadComponents/EventimProductPageComponents/EventsList/EventsList';
import ProductPageImagesCarousel from '../../components/BeyhadComponents/EventimProductPageComponents/ProductPageImagesCarousel/ProductPageImagesCarousel';
import ProductTabs from '../../components/BeyhadComponents/EventimProductPageComponents/ProductTabs/ProductTabs';
import TicketsList from '../../components/BeyhadComponents/EventimProductPageComponents/TicketsList/TicketsList';
import BreadCrumbs, {Crumbs} from '../../components/CustomComponents/BreadCrumbs/BreadCrumbs';
import CustomEmptyState from '../../components/CustomComponents/CustomEmptyState/CustomEmptyState';
import Lang from '../../config/Language';
import {RoutesPath} from '../../consts/RoutesPath';
import {AUTH_STORE, EVENTIM_STORE, VIEW_STORE, CATEGORY_STORE, CONFIGURATION_STORE} from '../../consts/stores';
import Category from '../../models/Category';
import EventimEvent from '../../models/EventimEvent';
import Ticket from '../../models/Ticket';
import rootStores from '../../stores';
import AuthStore from '../../stores/AuthStore';
import EventimStore from '../../stores/EventimStore';
import ViewStore from '../../stores/ViewStore';
import AlertUtils from '../../utils/AlertUtils';
import GoogleAnalyticsUtils from '../../utils/analytics/GoogleAnalyticsUtils';
import {onUrlChange} from '../../utils/authentication/historyUtils';
import ErrorUtils, {ErrorDescription, ErrorHTML} from '../../utils/errorHandling/ErrorUtils';
import {runSeatMapScripts} from './SeatMapScript';
import TabsHorizontalComponent from '../../components/CustomComponents/TabsHorizontalComponent/TabsHorizontalComponent';
import TextCustomItemComponent from '../../components/CustomComponents/TextCustomItemComponent/TextCustomItemComponent';
import CustomButtonBeyahad from '../../components/CustomComponents/CustomButtonBeyahad/CustomButtonBeyahad';
import ImageProductPage from '../../components/BeyhadComponents/ProductPage/ImageProductPage/ImageProductPage';
import CustomProductImageCarousel from '../../components/CustomComponents/CustomProductImageCarousel/CustomProductImageCarousel';
import CategoryStore from '../../stores/CategoryStore';
import {CustomMediaQuery} from '../../components/CustomComponents/CustomMediaQuery/CustomMediaQuery';
import ProductPageTabs from '../../components/BeyhadComponents/ProductPage/ProductPageTabs/ProductPageTabs';
import {CustomHeader, HeaderType} from 'nofshonit-base-web-client';
import ProductPageInfoTab from '../../components/BeyhadComponents/ProductPage/ProductPageTabs/ProductPageInfoTab';
import CustomLink from '../../components/CustomComponents/CustomLink/CustomLink';
import { useEffect, useState } from 'react';
import ConfigurationStore from 'src/stores/ConfigurationStore';

const starIcon = require('../../assets/Star.png');
const questionMarkIcon = require('../../assets/quastionmark.png');
const termsIcon = require('../../assets/Vector-terms.png');
const defaultImage = require('../../assets/generalimage.jpg');

interface Props {
	match?: any;
	location?: any;
	history?: any;
	isMint?: boolean;
	accessToken?: string;
}
interface IState {
	loading: boolean;
	foundEventProductPage: boolean;
	productPageErr?: string;
	foundCategory?: boolean;
}

const eventimStore: EventimStore = rootStores[EVENTIM_STORE];
const categoryStore: CategoryStore = rootStores[CATEGORY_STORE];
const viewStore: ViewStore = rootStores[VIEW_STORE];
const authStore: AuthStore = rootStores[AUTH_STORE];
const configurationStore: ConfigurationStore = rootStores[CONFIGURATION_STORE];

const EventimProductPage : React.FC<Props> = ({
	match,
	location,
	history,
	isMint,
	accessToken,
}) => {
	let breadcrumbs: string[] = [];

	const [loading, setLoading] = useState<boolean>(true);
	const [foundEventProductPage, setFoundEventProductPage] = useState<boolean>(false);
	const [productPageErr, setProductPageErr] = useState<string>();
	const [foundCategory, setFoundCategory] = useState<boolean>(false);

	useEffect(() => {
		viewStore.setLoadingView(true);
		const prId = match.params.categoryId;
		const select_promotion = localStorage.getItem('select_promotion');
		if(select_promotion)
		{
			authStore.creativeNameForGA = 'banner',
			authStore.promotionNameForGA = 'HomePageBanner'
			localStorage.removeItem('select_promotion');
		}
		categoryStore
		.getCategoryProductsByID(prId)
		.then((category: Category) => {
			if (categoryStore.productPageCategory.isEvents) {
				if (isMint) {
					history.push(
						`${RoutesPath.mint.rooteventimProductPage}/${categoryStore.productPageCategory.categoryId}`
					);
				} 
				// else {
				// 	this.history.replace(
				// 		`${RoutesPath.category.rooteventimProductPage}/${categoryStore.productPageCategory.categoryId}`
				// 	);
				// }
			}
			if (category) {
				setFoundCategory(true)
			}
			// if (!this.props.isMint) homePageStore.getTopTags(1);
		})
		.catch((err) => {
			Logger.error('new error for product page is', err);

			// Check if there is an error from the server
			// This is a patch from 11.08.19
			if (ErrorUtils.isStringError(err)) {
				const errorDescription = err as ErrorDescription;
				setProductPageErr(errorDescription.message)
			} else if (ErrorUtils.isHTMLError(err)) {
				const errorHtml = err as ErrorHTML;
				setProductPageErr(errorHtml.message)
			}
		})
		.finally(() => {
			viewStore.setLoadingView(false);
		});
		eventimStore
			.getProductPageByCategoryId(prId)
			.then(() => {
				setLoading(false)
				setFoundEventProductPage(true)
				viewStore.setLoadingView(false)
			})
			.catch((err) => {
				// Check if there is an error from the server
				// This is a patch from 11.08.19
				if (ErrorUtils.isStringError(err)) {
					const errorDescription = err as ErrorDescription;
					setProductPageErr(errorDescription.message)
				} else if (ErrorUtils.isHTMLError(err)) {
					const errorHtml = err as ErrorHTML;
					setProductPageErr(errorHtml.message)
				}
				setLoading(false)
				viewStore.setLoadingView(false);
			})
			.finally(() => {
				if (eventimStore.getProductPageCategory && eventimStore.getProductPageCategory.events) {
					// GoogleAnalyticsUtils.detailsEvents(
					// 	eventimStore.getProductPageCategory,
					// 	eventimStore.getProductPageCategory.events
					// );
				}
			});
		eventimStore.ClearFilteredEvents();
		onUrlChange(onBackToEventsListClick);
		return () => {
			authStore.creativeNameForGA = undefined,
			authStore.promotionNameForGA = undefined
			if (eventimStore.selectedEvent) {
				eventimStore.onBackToEventsListClick();
				eventimStore.showMap = false;
			}
		}
	},[])

	const renderBreadCrumbs = (product: Category) => {

		// Render BreadCrumbs based on url
		let crumbsRoute: Crumbs[] = [];
		let breadcrumbsLinks: string[] = [];
		crumbsRoute.push(new Crumbs('דף הבית', RoutesPath.root));
		breadcrumbsLinks.push(RoutesPath.root);

		// Get Url Path from props location
		let { pathname } = location;

		// Remove "/" if it is the last char of the pathname.
		pathname = pathname[pathname.length - 1] == '/' ? pathname.slice(0, pathname.length - 1) : pathname;

		if (product && product.breadcrumbs) {
			for (let i = 0; i < product.breadcrumbs.length; i++) {
				if (product.breadcrumbs[i]) {
					if (product.breadcrumbs.length > 2) {
						if (i === product.breadcrumbs.length - 2) {
							crumbsRoute.push(
								new Crumbs(
									product.breadcrumbs[i].name,
									`${RoutesPath.category.rootProducts}/${product.breadcrumbs[i].id}`
								)
							);
							breadcrumbsLinks.push(`${RoutesPath.category.rootProducts}/${product.breadcrumbs[i].id}`);

						} else if (i === product.breadcrumbs.length - 1) {
							crumbsRoute.push(
								new Crumbs(
									product.breadcrumbs[i].name,
									`${RoutesPath.category.rootProductPage}/${product.breadcrumbs[i].id}`
								)
							);
							breadcrumbsLinks.push(`${RoutesPath.category.rootProductPage}/${product.breadcrumbs[i].id}`);

						} else {
							crumbsRoute.push(
								new Crumbs(product.breadcrumbs[i].name, `${RoutesPath.category.rootLobby}/${product.breadcrumbs[i].id}`)
							);

							breadcrumbsLinks.push(`${RoutesPath.category.rootLobby}/${product.breadcrumbs[i].id}`);
						}
					} else {
						crumbsRoute.push(
							new Crumbs(product.breadcrumbs[i].name, `${RoutesPath.category.rootLobby}/${product.breadcrumbs[i].id}`)
						);

						breadcrumbsLinks.push(`${RoutesPath.category.rootLobby}/${product.breadcrumbs[i].id}`);
					}
				}
			}
		}

		breadcrumbs = breadcrumbsLinks;
		return <BreadCrumbs crumbs={crumbsRoute} />;
	};


	const redirectToEventsPage = () =>{
		let linkToParent = '/';
		if(breadcrumbs)
			linkToParent = breadcrumbs[(breadcrumbs.length-1)-1];
		
		history.push(linkToParent);
	}

	// Here Filter the Events
	const onVanueSelected = (selectedVanue: string) => {
		eventimStore.setSelectedVenue(selectedVanue);
		eventimStore.setSelectedDate(null);
		eventimStore.setSelectedTime(null);
	};

	const onDateSelected = (selectedDate: string | null) => {
		eventimStore.setSelectedDate(selectedDate);
	};

	const onTimeSelected = (selectedTime: string | null) => {
		eventimStore.setSelectedTime(selectedTime);
	};

	// We use this to enable browser back button ability.
	// We alse use historyUtils - onUrlChange at ComponentDidMount
	// to make a certain action happen when clicking the back button.
	const pushCurrentUrlToHistory = () => {
		if (!isMint) {
			history.push(location.pathname);
			scrollToTopContent();
		} else {
			history.push(location.pathname + `?accessToken=${accessToken}`);
		}
	}

	const scrollToTopContent = () => {
		const elementById = document.getElementsByClassName('eventim-product-page-description-container');
		// Check if the window is mobile
		const isMobile = window.innerWidth < 1025;
		if (isMobile && elementById && elementById[0] && elementById[0]['offsetTop']) {
			let contentPosition = elementById[0]['offsetTop'];
			// extra offset for the navbar
			const offsetTop = 53;
			window.scrollTo(0, contentPosition - offsetTop);
		}
	};

	const onEventimEventSelected = async (event: EventimEvent) => {
		try {
			viewStore.setLoadingView(true);

			await eventimStore.selectEventimEvent(event).then((htmlMap) => {
				const tickets = eventimStore.tickets;
				const productPageCategory = eventimStore.productPageCategory;
				GoogleAnalyticsUtils.sendEventsToAnalytics(productPageCategory,tickets,'view_item',authStore.productJsonForGA,authStore.productIndexForGA,
															authStore.promotionNameForGA,authStore.creativeNameForGA);
				pushCurrentUrlToHistory();
				if (eventimStore.showMap) {
					runSeatMapScripts(htmlMap, eventimStore, onCreateReservation, authStore.currentUser.identityNumber);
				}
			});
		} catch (err) {
			// I didn't show the errorDescription becuase the server returned "errorDescription: "The given key '731561' was not present in the dictionary.""
			Logger.error('Error occurd in getting event');
		} finally {
			viewStore.setLoadingView(false);
		}
	};

	const onCreateReservation = (dataToCreate) => {
		let data = JSON.parse(dataToCreate);
		
		viewStore.setLoadingView(true);
		let reservationBodyConverted = JSON.parse(dataToCreate);
		if(reservationBodyConverted.ListOfSeats){
			for(let i = 0;i < reservationBodyConverted.ListOfSeats.length;i++){
				reservationBodyConverted.ListOfSeats[i] = Object.assign(reservationBodyConverted.ListOfSeats[i],{productJsonForGA : 
					GoogleAnalyticsUtils.convertEventForGA(eventimStore.getProductPageCategory,reservationBodyConverted.ListOfSeats[i],
						authStore.productJsonForGA,authStore.productIndexForGA,authStore.creativeNameForGA,authStore.promotionNameForGA)});
			}
		}
		eventimStore
			.onPayClickWithMap(reservationBodyConverted)
			.then(() => {
				AlertUtils.successAlert('', Lang.format('EventimPaymentSuccess'));
				try {
					GoogleAnalyticsUtils.addEventToCart(
						reservationBodyConverted,true
					);
				} catch (error) {
					console.log('GoogleAnalytics AddEventToCart With Map Error');
				}
				if (isMint) {
					history.push(RoutesPath.mint.cart);
				} else {
					history.push(RoutesPath.cart.root);
				}
			})
			.catch((err) => {
				// Check error type
				ErrorUtils.checkErrorAndShowPopUp(err);
			})
			.finally(() => {
				viewStore.setLoadingView(false);
			});
	};

	const onQuantityIncrease = (ticket: Ticket) => {
		eventimStore.onQuantityIncrease(ticket);
	};

	const onQuantityDecrease = (ticket: Ticket) => {
		eventimStore.onQuantityDecrease(ticket);
	};

	const onPayClick = async () => {
		viewStore.setLoadingView(true);
		await eventimStore
			.onPayClick(authStore.productJsonForGA,authStore.productIndexForGA
				,authStore.creativeNameForGA,authStore.promotionNameForGA)
			.then(() => {
				try {
					// GoogleAnalyticsUtils.addEventToCart(
					// 	eventimStore.getProductPageCategory,
					// 	eventimStore.getSelectedEvent && eventimStore.getSelectedEvent.eventId,
					// 	eventimStore.getTickets
					// );
				} catch (error) {
					console.log('Google Analytics AddEventToCart Error Without Map');
				}
				AlertUtils.successAlert('', Lang.format('EventimPaymentSuccess'));
				if (isMint) {
					history.push(RoutesPath.mint.cart);
				} else {
					history.push(RoutesPath.cart.root);
				}
			})
			.catch((err) => {
				ErrorUtils.checkErrorAndShowPopUp(err);
			})
			.finally(() => {
				viewStore.setLoadingView(false);
			});
	};

	const onBackToEventsListClick = () => {
		eventimStore.onBackToEventsListClick();
		eventimStore.ClearFilteredEvents();
		eventimStore.showMap = false;
	};

	const isUserSelectedEvent = () => {
		return !isNullOrUndefined(eventimStore.selectedEvent);
	};

	const renderTicketsList = () => {
		if (eventimStore.getSelectedEvent) {
			const eventimEvent: EventimEvent = eventimStore.getSelectedEvent;
			const tickets: Ticket[] = eventimStore.getTickets;
			return (
				<div className='route-and-tickets-variants-list-container'>
					<div className='route-and-redeem-type-container'>
						<div className='redeem-type-container'>
							<TextCustomItemComponent
								text = {`${Lang.format('RedeemTypeTitle')}: 
										${(eventimStore.getSelectedEvent.isSelfPrint ? Lang.format('SelfPrint') : Lang.format('PersonalPickup'))}`}
								icon= {{src:require('../../assets/icons/movie-ticket.svg'), name: 'movie ticket'}} 
							/>
						</div>
						<div className='back-to-events-list-button-container'>
						<CustomButtonBeyahad
							isBackgroundColor={false}
							customClass={'narrow'}
							onClick={onBackToEventsListClick}
							isCurserPointer={true}
							buttonText = {Lang.format('BackToShowsBoard')}
						/>
						</div>
					</div>
					<TicketsList
						ticketsWithoutSeatArray={tickets}
						onQuantityIncrease={onQuantityIncrease}
						onQuantityDecrease={onQuantityDecrease}
						onPayClick={onPayClick}
						showMap={eventimStore.showMap}
					/>
				</div>
			);
		} else {
				{/* 
					<div className='eventim-empty-state-container'>
						<CustomEmptyState />
					</div>
				*/}
			return (
				<></>
			);
		}
	}

	const renderAllImges = (imgArr) => {
		return imgArr.map((img, index) => (
			<div key={index} className='product-page-info-tabs-images' onClick={() => (categoryStore.caruselImg = index)}>
				<img
					className='product-page-info-tabs-img'
					title={`${img.alt}`}
					alt={`${img.alt}`}
					src={`${configurationStore.getConfiguration.picsUrl}/share/${img.file}`}
				/>
			</div>
		));
	};

	const renderProductPageMobileTabs = (termsOfUseData, howToUseData, moreInfoTabData) => {
		/* 
		TODO: fix location according to new dev
		*/
		const usefulInformationTab = (
			<ProductPageTabs
				ComponentName={Lang.format('Useful_Information')}
				ComponentImg={termsIcon}
				ComponentDataArray={termsOfUseData}
				isHtml={true}
			/>
		);
		const howToUseTab = (
			<ProductPageTabs
				ComponentName={Lang.format('How_to_Use')}
				ComponentImg={starIcon}
				ComponentData={howToUseData}
				isHtml={true}
			/>
		);
		const moreInfoTab = (
			<ProductPageTabs
				ComponentName={Lang.format('More_Info')}
				ComponentImg={questionMarkIcon}
				ComponentData={moreInfoTabData}
				isHtml={true}
			/>
		);

		return (
			<>
				{usefulInformationTab}
				{howToUseTab}
				{moreInfoTab}
			</>
		);
	};

	const returnHomePageClicked = () => {
		if (history) history.push('/');
	};

	const productPageCategory: Category = eventimStore.getProductPageCategory;
	const selectedEvent: EventimEvent | undefined = eventimStore.getSelectedEvent;
	const product = categoryStore.getProductPageCategory;

	// If Event Product Was Found Show It
	if (foundEventProductPage && productPageCategory) {
		const images = productPageCategory.images;
		const howToUse = productPageCategory.redimType ? productPageCategory.redimType : '';
		const termsOfUse: string[] = [
			productPageCategory.termsOfUse ? productPageCategory.termsOfUse : '',
			productPageCategory.remarks ? productPageCategory.remarks : '',
			productPageCategory.campaignDetails ? productPageCategory.campaignDetails : '',
			productPageCategory.minimumInventoryForSale ? `<p style="margin-top:10px;font-family:Arial;font-size:16px;color:#808080";><span> ${productPageCategory.minimumInventoryForSale}</span></p>` : '',
		];
		const moreInfoTab = productPageCategory.categoryHTML ? productPageCategory.categoryHTML : '';
		let htmlMap = eventimStore.mapHTML ? eventimStore.mapHTML : '';

		const componentsToRender = 
		[
			{isHtml: true, icon: questionMarkIcon, title: Lang.format('More_Info'), content: moreInfoTab},
			{isHtml: true, icon: termsIcon, title: Lang.format('Useful_Information'), content: termsOfUse},
			{isHtml: true, icon: starIcon, title: Lang.format('How_to_Use'), content: howToUse},
		];
		return (
			<div className='eventim-product-page-container'>
				<CustomMediaQuery.Desktop>
					<div className='breadcrumbs'>{!isMint ? renderBreadCrumbs(product) : null}</div>
				</CustomMediaQuery.Desktop>
				<CustomMediaQuery.Mobile>
				{/* Image, Description (and filters when needed), and Tickets (when needed) */}
				<div className='eventim-product-page-header'>
				<div className='product-page-image-info-tab'>
							<div className='product-page-top-image'>
								{images.length > 0 ? (
									<ImageProductPage imgArr={images} />
								) : (
									<img src={defaultImage} style={{width: '100%'}} alt={eventimStore.getProductPageCategoryWithFilteredEvents.categoryName} />
								)}
								{/* <ImageProductPage imgArr={images} /> */}
							</div>
							{/*
							{images.length > 0 && (
								<div className='product-page-info-tabs-component-data'>
									<div className='product-page-info-tabs-images-container'>
										<CustomProductImageCarousel>
											{this.renderAllImges(images)}
										</CustomProductImageCarousel>
									</div>
								</div>
							)}
							*/}
					</div>
					{/* // TODO: always show the component, even if it does not have images! */}						
					<div className='eventim-product-page-description-container'>
						<EventimDescription category={productPageCategory} event={selectedEvent} />
						{/*							
							need to develop this. the width need to be 100%:
						*/}
						{!isUserSelectedEvent() ? 
						((eventimStore.getProductPageCategory.events &&
								eventimStore.getProductPageCategory.events.length > 0) ? 
						<EventimFilters
							onVanueSelected={onVanueSelected}
							onDateSelected={onDateSelected}
							onTimeSelected={onTimeSelected}
							productPageCategory={eventimStore.getProductPageCategoryWithFilteredEvents}
						/>
						: (<div className='event-empty-container'>

								<img src={require('../../assets/icons/no_events.png')} alt='no events'/>

								<TextCustomItemComponent
									text={`לא נמצאו מופעים`}
									spanClassName={`biggerTxt bold text-light-blue`}
								/>
								<CustomLink
									text={`חזרה ללוח המופעים`}
									onClick={redirectToEventsPage}
								/>
							</div>)
						) : (
							renderTicketsList()
						)}

						{/* Events table */}
						{!isUserSelectedEvent() && (
							<EventsList events={eventimStore.getFilteredEvents} onEventimEventSelected={onEventimEventSelected} />
						)}	

						{/* Seat Map */}
						{eventimStore.showMap && (
							<div className='seat-map-container'>
							<div className='seat-map-inner-container'>
								<CustomHeader
									text={Lang.format('ChooseSeats')}
									headerClassName='bold'
									type={HeaderType.SubTitle}
								/>
								<EditorMessage doNotCheckLink={false} message={htmlMap} textClassName={'htmlMap'} />
							</div>
						</div>
						)}
					</div>
				</div>

				{/* Tabs */}
				<div className='product-page-tabs'>
					{renderProductPageMobileTabs(termsOfUse, howToUse, moreInfoTab)}
				</div>

				{/* Simillar Events */}
				{!isMint ? (
					<div className='home-page-carusel-container'>
						<TagsAdvertisment tags={1} history={history} isHomePage={false} />
					</div>
				) : null}
			</CustomMediaQuery.Mobile>


			<CustomMediaQuery.Desktop>
				{/* Image, Description (and filters when needed), and Tickets (when needed) */}
				<div className='eventim-product-page-header'>
					{/* // TODO: always show the component, even if it does not have images! */}						
					<div className='eventim-product-page-description-container'>
						<EventimDescription category={productPageCategory} event={selectedEvent} />
						{/*							
							need to develop this. the width need to be 100%:
						*/}
						{!isUserSelectedEvent() ? (
							((eventimStore.getProductPageCategory.events &&
								eventimStore.getProductPageCategory.events.length > 0) ? 
							<EventimFilters
								onVanueSelected={onVanueSelected}
								onDateSelected={onDateSelected}
								onTimeSelected={onTimeSelected}
								productPageCategory={eventimStore.getProductPageCategoryWithFilteredEvents}
							/>
							: (<div className='event-empty-container'>

									<img src={require('../../assets/icons/no_events.png')} alt='no events'/>

									<TextCustomItemComponent
										text={`לא נמצאו מופעים`}
										spanClassName={`biggerTxt bold text-light-blue`}
									/>
									<CustomLink
										text={`חזרה ללוח המופעים`}
										onClick={redirectToEventsPage}
									/>
								</div>)
							)
						) : (
							renderTicketsList()
						)}
					</div>
					
					<div className='product-page-image-info-tab'>
							<div className='product-page-top-image'>
								{images.length > 0 ? (
									<ImageProductPage imgArr={images} />
								) : (
									<img src={defaultImage} style={{width: '100%'}} alt={eventimStore.getProductPageCategoryWithFilteredEvents.categoryName} />
								)}
								{/* <ImageProductPage imgArr={images} /> */}
							</div>
							{images.length > 0 && (
								<div className='product-page-info-tabs-component-data'>
									<div className='product-page-info-tabs-images-container'>
										<CustomProductImageCarousel>
											{renderAllImges(images)}
										</CustomProductImageCarousel>
									</div>
								</div>
							)}
					</div>
				</div>
				{/* Events table */}
				{!isUserSelectedEvent() && (
					<EventsList events={eventimStore.getFilteredEvents} onEventimEventSelected={onEventimEventSelected} />
				)}
				{/* Seat Map */}
				{eventimStore.showMap && (
					<div className='seat-map-container'>
						<div className='seat-map-inner-container'>
							<CustomHeader
								text={Lang.format('ChooseSeats')}
								headerClassName='bold'
								type={HeaderType.SubTitle}
							/>
							<EditorMessage doNotCheckLink={false} message={htmlMap} textClassName={'htmlMap'} />
						</div>
					</div>
				)}

				{/* Tabs */}					
				<div className='product-page-tab-desktop'>
					<TabsHorizontalComponent tabComponents={componentsToRender} />
				</div>

				{/* Simillar Events */}
				{!isMint ? (
					<div className='home-page-carusel'>
						<TagsAdvertisment tags={1} history={history} isHomePage={false} />
					</div>
				) : null}
			</CustomMediaQuery.Desktop>


			</div>
		);
	} else {
		// Event Product Was Not Found
		if (!loading) {
			if (productPageErr) {
				return <EditorMessage doNotCheckLink={false} textClassName='product-page-only-for-members' message={productPageErr} />;
			} else {
				return (
					<div className='eventim-empty-state-container'>
						<CustomEmptyState text={Lang.format('BenefitNotFound')} />
					</div>
				);
			}
		}
	}
	return null;
}
export default observer(EventimProductPage);
