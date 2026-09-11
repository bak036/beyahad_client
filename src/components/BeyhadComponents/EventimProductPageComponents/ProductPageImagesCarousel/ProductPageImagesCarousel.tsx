import { observer } from 'mobx-react';
import * as React from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { CONFIGURATION_STORE } from 'src/consts/stores';
import rootStores from 'src/stores';
import ConfigurationStore from 'src/stores/ConfigurationStore';

interface Props {
	imgArr: any[];
}

interface IState {}
const configurationStore: ConfigurationStore = rootStores[CONFIGURATION_STORE];
const ProductPageImagesCarousel : React.FC<Props> = ({
	imgArr
}) => {

	const renderAllImges = () => {
		return imgArr.map((img, index) => (
			<div key={index} className="product-page-carousel-item-image-container">
				<img
					className="product-page-carousel-image-item"
					alt={img.alt}
					title={img.alt}
					src={`${configurationStore.getConfiguration.picsUrl}/share/${img.file}`}
				/>
			</div>
		));
	};

	return (
		<div className="product-page-images-carousel-container">
			<Carousel dynamicHeight={true} stopOnHover showStatus={false} showArrows={false} showThumbs={false}>
				{/* test: return render after */}
				{/*{this.renderAllImges()}*/}
				<div key={0} className="product-page-carousel-item-image-container">
			<img
				className="product-page-carousel-image-item"
				alt={'test'}
				title={'test'}

				//src={`//pics.k4a.co.il/share/${img.file}`}
				src={`/static/media/generalimage.eeb43679.jpg`}
			/>
		</div>

			</Carousel>
		</div>
	);
}
export default observer(ProductPageImagesCarousel)
