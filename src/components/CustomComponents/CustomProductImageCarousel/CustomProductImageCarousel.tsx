import * as React from 'react';
import { useState } from 'react';
import AliceCarousel from 'react-alice-carousel';
import 'react-alice-carousel/lib/alice-carousel.css';
import {Thumbs} from 'react-responsive-carousel';

interface Props {
	children: any;
}

interface IState {
	currentIndex: number;
	itemsInSlide: number;
}

const CustomMultiSelector : React.FC<Props> = ({
	children
}) => {
	const [currentIndex,setCurrentIndex] = useState<number>(0);
	const [itemsInSlide,setItemsInSlide] = useState<number>(0);

	const slideTo = (i) => setCurrentIndex(i);
	const onSlideChanged = (e) => setCurrentIndex(e.item);
	const slideNext = () => setCurrentIndex(currentIndex + 1);
	const slidePrev = () => setCurrentIndex(currentIndex - 1);

	const handleOnSlideChange = (event) => {
		setCurrentIndex(event)
	};

	const isMoreThan3Slides = () => Array.isArray(children) && children.length > 3;

	const responsive = {
		0: {items: 1},
		300: {items: 1},
		370: {items: 1},
		420: {items: 1},
		480: {items: 3},
		520: {items: 3},
		580: {items: 3},
		625: {items: 3},
		690: {items: 3},
		800: {items: 3},
		830: {items: 4},
		870: {items: 4},
		920: {items: 4},
		1000: {items: 4},
		1025: {items: 4},
	};

	return (
		<div className='product-page-carousel-main-container'>
			{isMoreThan3Slides() && (
			<div
				className='alice-carousel__next-btn-item'
				onClick={() => {
					slideNext();
				}}
			/>)}

			<AliceCarousel
				responsive={responsive}
				slideToIndex={currentIndex}
				onSlideChanged={onSlideChanged}
				startIndex={currentIndex}
				autoPlayInterval={4000}
				dotsDisabled
				buttonsDisabled={true}
				items={children}
			/>
			{isMoreThan3Slides() && (
			<div
				className='alice-carousel__prev-btn-item'
				onClick={() => {
					slidePrev();
				}}
			/>)}
		</div>
	);
}
export default CustomMultiSelector;

