import { observer } from 'mobx-react';
import * as React from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { CustomMediaQuery } from '../../../CustomComponents/CustomMediaQuery/CustomMediaQuery';
import CustomCarousel from '../../../CustomComponents/CustomCarousel';
import ConfigurationStore from 'src/stores/ConfigurationStore';
import rootStores from 'src/stores';
import { CONFIGURATION_STORE } from 'src/consts/stores';

interface Props {
	imgArr: any[];
	isInfoTabPage?: boolean;
}

interface IState {}
const configurationStore:ConfigurationStore= rootStores[CONFIGURATION_STORE];
const ImageProductPage : React.FC<Props> = ({
	imgArr,
	isInfoTabPage
}) => {

	const renderAllImges = () => {
		if (imgArr.length > 0) {
			return imgArr.map((img, index) => (
				<div key={index} className="img-carousel-container">
					<img
						className="img-carousel-item"
						alt={`${img.alt}`}
						title={`${img.alt}`}
						src={`${configurationStore.getConfiguration.picsUrl}/share/${img.file}`}
					/>
				</div>
			));
		}
		return;
	};

	return (
		<div className="carousel-imges-container">
			<CustomMediaQuery.Desktop>
				{!isInfoTabPage && (
					<CustomCarousel showStatus={false} showArrows={false} stopOnHover  showThumbs={false}>
						{renderAllImges()}
					</CustomCarousel>
				)}
			</CustomMediaQuery.Desktop>
			<CustomMediaQuery.Mobile>
				{!isInfoTabPage && (
					<CustomCarousel
						dynamicHeight={true}
						stopOnHover
						showStatus={false}
						showArrows={false}
						showThumbs={false}
					>
						{renderAllImges()}
					</CustomCarousel>
				)}
			</CustomMediaQuery.Mobile>
		</div>
	);
}
export default observer(ImageProductPage)
