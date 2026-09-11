import * as React from 'react';

interface Props {
  onClick: () => void;
  hasActiveFilters: boolean;
  resultsCount: number;
}

const CategoryFilterButton: React.FC<Props> = ({ onClick, hasActiveFilters, resultsCount }) => {
  return (
    <div className="category-filter-button-container">
      <span className="results-count">סה"כ {resultsCount} תוצאות</span>
      <button className="category-filter-button" onClick={onClick}>
        <img 
          src={hasActiveFilters 
            ? require('../../../assets/CategoriesFilterButtonActive.svg') 
            : require('../../../assets/CategoriesFilterButton.svg')
          } 
          alt="סינון" 
          className="filter-button-image"
        />
      </button>
    </div>
  );
};

export default CategoryFilterButton;
