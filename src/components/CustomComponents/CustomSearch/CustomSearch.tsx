// CustomSearch.tsx - React component with improved styling

import * as React from 'react';
import { useRef, useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, { Navigation } from 'swiper/core';
import 'swiper/swiper.min.css';
import 'swiper/components/navigation/navigation.min.css';
import { CustomButton } from 'nofshonit-base-web-client';
import GeoLocationButton from '../GeoLocationButton/GeoLocationButton';

SwiperCore.use([Navigation]);

interface Props {
  searchText: string;
  setSearchText: (val: string) => void;
  selectedCategories: any;
  setSelectedCategories: (val: any) => void;
  selectedChain: any;
  setSelectedChain: (val: any) => void;
  categories: any[];
  chains: any[];
  renderMenu?: () => JSX.Element;
  geoActive: boolean;
  setGeoPopupOpen: (val: boolean) => void;
}

const CustomSearch: React.FC<Props> = ({
  searchText,
  setSearchText,
  selectedCategories,
  setSelectedCategories,
  selectedChain,
  setSelectedChain,
  categories,
  renderMenu,
  geoActive,
  setGeoPopupOpen,
}) => {
  const swiperRef = useRef<any>(null);
  const fullWidthRef = useRef<HTMLDivElement>(null);
  const [showArrows, setShowArrows] = useState(false);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const handleCategoryClick = (category: any) => {
    if (category.tagId === 'ALL') {
      setSelectedCategories([]);
      return;
    }
    setSelectedCategories((prevSelected) => {
      const exists = prevSelected.some((c) => c.tagId === category.tagId);
      return exists
        ? prevSelected.filter((c) => c.tagId !== category.tagId)
        : [...prevSelected, category];
    });
  };

  const handleAllClick = () => {
    setSelectedCategories([]);
  };

  const handleNext = () => {
    swiperRef.current?.slideNext();
  };

  const handlePrev = () => {
    swiperRef.current?.slidePrev();
  };

  const updateArrowVisibility = () => {
    if (!swiperRef.current) return;
    setAtStart(swiperRef.current.isBeginning);
    setAtEnd(swiperRef.current.isEnd);
  };

  useEffect(() => {
    const checkWidth = () => {
      const fullWidth = fullWidthRef.current?.scrollWidth || 0;
      const swiperWidth = swiperRef.current?.el?.offsetWidth || 0;
      const isMobile = window.innerWidth <= 768;
      setShowArrows(isMobile || fullWidth > swiperWidth);
    };

    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, [categories]);

return (
  <div className="search-header-wrapper">
    <div className="search-header-inner-centered">
      {/* חיפוש + קטגוריות - ממורכזים */}
      <div className="search-inner-wrapper">
        <div className="search-controls-container">

          <div className='search-input-with-geo'>
            <div className="search-input-box">
              <div className="search-icon" />
              <input
                type="text"
                pattern="^[A-Za-z֐-׿0-9&'.\- ]*$"
                value={searchText}
                placeholder="חיפוש רשתות בארנק"
                onChange={(e) => {
                  const allowedRegex = /^[\u0590-\u05FFa-zA-Z0-9&'.\- ]*$/;
                  const inputValue = e.target.value;
                  if (allowedRegex.test(inputValue)) {
                    setSearchText(inputValue);
                  }
                }}
              /> 
            </div>

            <GeoLocationButton
                isActive={geoActive}
                onClick={() => setGeoPopupOpen(true)}
              />

          </div>

          {categories.length > 1 && (
            <div className="category-carousel-container">
              {showArrows && !atEnd && (
                <div className="swiper-button-prev category-arrow" onClick={() => {
                  handleNext();
                  setTimeout(updateArrowVisibility, 100);
                }} />
              )}
            
              <Swiper
                slidesPerView="auto"
                dir="rtl"
                spaceBetween={12}
                navigation={false}
                className="category-carousel"
                onSwiper={(swiper) => {
                  swiperRef.current = swiper;
                  setTimeout(updateArrowVisibility, 0);
                }}
                onSlideChange={updateArrowVisibility}
                onResize={updateArrowVisibility}
              >

                {showArrows && !atEnd && <div className="carousel-fade carousel-fade-left" />}
                {showArrows && !atStart && <div className="carousel-fade carousel-fade-right" />}

                <SwiperSlide key="all-categories" className="carousel-slide">
                  <CustomButton
                    text="הכל"
                    onClick={handleAllClick}
                    buttonClassName={`category-chip ${selectedCategories.length === 0 ? 'selected' : ''}`}
                  />
                </SwiperSlide>

                {categories.map((category) => (
                  <SwiperSlide key={category.tagId} className="carousel-slide">
                    <CustomButton
                      text={category.text}
                      onClick={() => handleCategoryClick(category)}
                      buttonClassName={`category-chip ${selectedCategories.some((c) => c.tagId === category.tagId) ? 'selected' : ''}`}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>

              {showArrows && !atStart && (
                <div className="swiper-button-next category-arrow" onClick={() => {
                  handlePrev();
                  setTimeout(updateArrowVisibility, 100);
                }} />
              )}

              <div className="hidden-carousel-measurer" ref={fullWidthRef}>
                <div className="carousel-slide" style={{ display: 'flex' }}>
                  <div className="category-chip">הכל</div>
                  {categories.map((category) => (
                    <div key={category.tagId} className="category-chip">{category.text}</div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);




};

export default CustomSearch;
