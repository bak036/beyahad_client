import {observer} from 'mobx-react';
import {CustomSpan} from 'nofshonit-base-web-client';
import * as React from 'react';
import Lang from '../../../../../config/Language';
import {RoutesPath} from '../../../../../consts/RoutesPath';
import {ADVERTING_STORE, HOMEPAGE_STORE} from '../../../../../consts/stores';
import Tag from '../../../../../models/Tag';
import rootStores from '../../../../../stores';
import AdvertisingStore from '../../../../../stores/AdvertisingStore';
import HomePageStore from '../../../../../stores/HomePageStore';
import CustomEmptyState from '../../../../CustomComponents/CustomEmptyState/CustomEmptyState';
import CustomTagsCarousel from '../../../../CustomComponents/CustomTagsCarousel/CustomTagsCarousel';
import GoogleAnalyticsUtils from '../.././../../../utils/analytics/GoogleAnalyticsUtils';
import Commercial from '../Commercial';
import { useEffect } from 'react';

interface Props {
	history?: any;
	isHomePage?: boolean;
	tags: number;
	addCommercialAfterTags?: boolean;
}
interface IState {}

const homePageStore: HomePageStore = rootStores[HOMEPAGE_STORE];
const advertisingStore: AdvertisingStore = rootStores[ADVERTING_STORE];

const TagsAdvertisment : React.FC<Props> = ({
	history,
	isHomePage,
	tags,
	addCommercialAfterTags,
}) => {

	const renderShowAll = (tagId: number) => {
		history.push(`${RoutesPath.category.rootShowAllCategories}/${tagId}`);
		window.scrollTo(0, 0);
	};

	const initCopnennt = async () => {
		console.time('advertisingStore.getTopTags');
		await homePageStore.getTopTags(tags);
		console.timeEnd('advertisingStore.getTopTags');

		const tagsArray = homePageStore.getTags;

		if(!isHomePage)
			GoogleAnalyticsUtils.sendTagsAnalyticsHomePage(tagsArray,isHomePage ? 'דף הבית' : 'קטגוריות');
		
		console.time('advertisingStore.getCommercial');
		await advertisingStore.getCommercial();
		console.timeEnd('advertisingStore.getCommercial');

		setTimeout(() => {
			(window as any).startLazyLoader();
		}, 0);
	}

	useEffect(() => {
		initCopnennt();
	},[])


	const renderAllTags = (tagArray: Tag[]) => {
		if (tagArray) {
			let tagsCount = tagArray.length;
			const isMobile = window.innerWidth < 1025;
			return tagArray.map((tag, index) => (
				<React.Fragment key={index}>
					{isHomePage && index > 0 && index % 2 === 0 && <Commercial index={index / 2 - 1} />}
					<div className='carusel-products-container'>
						<div className='main-text-homepage-best'>
							<div className='tags-header'>
								<CustomSpan classNameSpan='large-text-item' text={tag.tagName} />
							</div>
							{!isMobile && <div className='small-text'>
								{(
									<CustomSpan
										classNameSpan='small-text-item cursor-pointer'
										text={Lang.format('ShowAll')}
										onClick={() => renderShowAll(tag.tagId)}
									/>
								)}
							</div>}
						</div>

						{tag.tagCategoryInfo.length > 0 && (
							<div className='home-page-carusel'>
								<CustomTagsCarousel
									history={history}
									list={tag.tagCategoryInfo}
									tagIndex={index}
									caruselPadding={23}
								/>
								{/* <HomePageCarusel history={this.props.history} list={tag.tagCategoryInfo} /> */}
							</div>
						)}
						{isMobile && (<div className='main-text-homepage-best small-text-mobile'>
						<div className='small-text'>
								 {(
									<CustomSpan
										classNameSpan='small-text-item cursor-pointer'
										text={Lang.format('ShowAll')}
										onClick={() => renderShowAll(tag.tagId)}
									/>
								)}
							</div>
						</div>)}
					</div>
					{/* For the odd case if it is the last tag show commercial */}
					{addCommercialAfterTags && tagsCount % 2 == 1 && tagsCount == index + 1 && (
						<Commercial index={index / 2 - 1} />
					)}
				</React.Fragment>
			));
		} else {
			return <CustomEmptyState />;
		}
	};

	const tagsArray = homePageStore.getTags;

	return (
		<div>
			{renderAllTags(tagsArray)}
			{/* For the even case add a commercial */}
			{addCommercialAfterTags && tagsArray.length % 2 == 0 && (
				<Commercial index={tagsArray.length / 2 - 1} />
			)}
		</div>
	);
}

export default observer(TagsAdvertisment)
