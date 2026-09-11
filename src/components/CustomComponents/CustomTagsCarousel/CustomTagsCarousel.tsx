import * as React from 'react';
import AliceCarousel from 'react-alice-carousel';
import 'react-alice-carousel/lib/alice-carousel.css';
import CaruselItem from '../../BeyhadComponents/HomePage/CaruselItem';
import {Thumbs} from 'react-responsive-carousel';
import { useState } from 'react';

interface Props {
	history?: any;
	list: any[];
	caruselPadding: number;
	tagIndex: number;
}
interface IState {
	currentIndex: number;
	itemsInSlide: number;
}

const CustomTagsCarousel : React.FC<Props> = ({
	history,
	list,
	caruselPadding,
	tagIndex
}) => {

	const [currentIndex,setCurrentIndex] = useState<number>(0);
	const [itemsInSlide,setItemsInSlide] = useState<number>(1);

	const slideTo = (i) => setCurrentIndex(i);
	const onSlideChanged = (e) => setCurrentIndex(e.item);
	const slideNext = () => setCurrentIndex(currentIndex + 1);
	const slidePrev = () => setCurrentIndex(currentIndex - 1);

	const handleOnSlideChange = (event) => {
		setCurrentIndex(event)
	};

	const responsive = {
		0: {items: 1},
		300: {items: 1.3},
		370: {items: 1.3},
		420: {items: 1.4},
		480: {items: 1.5},
		520: {items: 2.1},
		580: {items: 2.2},
		625: {items: 2.5},
		690: {items: 2.7},
		800: {items: 3},
		830: {items: 3.3},
		870: {items: 3.6},
		920: {items: 4},
		1000: {items: 4},
		1025: {items: 4},
		1600: {items: 4},
		1900: {items: 4},
	};

	const renderAllCarouselItems = () => {
		const handleOnDragStart = (e) => e.preventDefault();
		return list.map((category, index) => (
			<CaruselItem
				onDragStart={handleOnDragStart}
				history={history}
				category={category}
				key={index}
				tagIndex={tagIndex}
			/>
		));
	};
	return (
		<div className='custon-carousel-main-container'>
			<div
				className='alice-carousel__prev-btn-item'
				onClick={() => {
					slidePrev();
				}}
			/>
			<AliceCarousel
				responsive={responsive}
				slideToIndex={currentIndex}
				startIndex={currentIndex}
				autoPlayInterval={4000}
				dotsDisabled
				buttonsDisabled={true}
				onSlideChange={() => {
					// Activates lazy load
					setTimeout(() => {
						window.scrollTo(window.pageXOffset, window.pageYOffset + 5);
						window.scrollTo(window.pageXOffset, window.pageYOffset - 5);
					}, 300);
				}}>
				{renderAllCarouselItems()}
			</AliceCarousel>
			<div
				className='alice-carousel__next-btn-item'
				onClick={() => {
					slideNext();
				}}
			/>
		</div>
	);
}
export default CustomTagsCarousel;
