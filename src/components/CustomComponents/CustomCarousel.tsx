import * as React from 'react';
import {Carousel} from 'react-responsive-carousel';
import CategoryStore from '../../stores/CategoryStore';
import {CATEGORY_STORE} from '../../consts/stores';
import rootStores from '../../stores';
import {observer} from 'mobx-react';

const categoryStore: CategoryStore = rootStores[CATEGORY_STORE];
interface Props {
	// TODO: Tom - why do you need all those props? i think we use some of them and not all
	// TODO: Tom - also, put here one prop -> "carouselType" as we talkeddiv}
	transitionTime?: number;
	showArrows?: boolean;
	showIndicators?: boolean;
	showThumbs?: boolean;
	centerMode?: boolean;
	centerSlidePercentage?: number;
	showStatus?: boolean;
	dynamicHeight?: boolean;
	stopOnHover?: boolean;
	width?: string;
	selectedItem?;
	onChange?: any;
	onClickItem?: any;
	children: any;
}

interface IState {}

const CustomCarousel : React.FC<Props> = ({
	transitionTime,
	showArrows,
	showIndicators,
	showThumbs,
	centerMode,
	centerSlidePercentage,
	showStatus,
	dynamicHeight,
	stopOnHover,
	width,
	selectedItem,
	onChange,
	onClickItem,
	children
}) => {
	var itemToShow = categoryStore.caruselImg ? categoryStore.caruselImg : 0;
	return (
		<div>
			<Carousel
				autoPlay={true}
				interval={4000}
				infiniteLoop={true}
				selectedItem={itemToShow}
				transitionTime={transitionTime}
				showArrows={showArrows}
				showIndicators={showIndicators}
				showThumbs={showThumbs}
				centerMode={centerMode}
				centerSlidePercentage={centerSlidePercentage}
				showStatus={showStatus}
				dynamicHeight={dynamicHeight}
				stopOnHover={stopOnHover}
				width={width}
				onClickItem={onClickItem}
				onChange={onChange}>
				{children}
			</Carousel>
		</div>
	);
}
export default observer(CustomCarousel)
