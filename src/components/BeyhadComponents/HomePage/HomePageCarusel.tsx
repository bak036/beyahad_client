import * as React from 'react';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import CustomCarousel from '../../CustomComponents/CustomCarousel';
import {CustomMediaQuery} from '../../CustomComponents/CustomMediaQuery/CustomMediaQuery';
import CaruselItem from './CaruselItem';

interface Props {
	list: any[];
	history?: any;
}
interface IState {}

const HomePageCarusel : React.FC<Props> = ({
	list,
	history
}) => {

	const renderAllCarouselItems = () => {
		return list.map((category, index) => (
			<React.Fragment>
				<CaruselItem history={history} category={category} key={index} />
			</React.Fragment>
		));
	};
	return (
		<React.Fragment>
			<CustomMediaQuery.Desktop>
				<CustomCarousel
					transitionTime={1000}
					showArrows={true}
					showIndicators={false}
					showThumbs={false}
					centerMode={true}
					centerSlidePercentage={25}
					showStatus={false}
				>
					{renderAllCarouselItems()}
				</CustomCarousel>
			</CustomMediaQuery.Desktop>
			<CustomMediaQuery.Mobile>
				<CustomCarousel
					showStatus={false}
					transitionTime={1000}
					showArrows={true}
					showIndicators={false}
					showThumbs={false}
					centerMode={true}
					centerSlidePercentage={40}
				>
					{renderAllCarouselItems()}
				</CustomCarousel>
			</CustomMediaQuery.Mobile>
		</React.Fragment>
	);
}

export default HomePageCarusel;
