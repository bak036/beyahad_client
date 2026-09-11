import * as React from 'react';
import City from 'src/models/City';
import Street from 'src/models/Street';

type CityOrStreet = City | Street;

interface ListBoxProps<T extends CityOrStreet> {
  items: T[];
  onSelected?: (value: T) => void;
  onMouseDown?: () => void;
}

const ListBox = <T extends CityOrStreet>({ items, onSelected, onMouseDown }: ListBoxProps<T>) => {

  const handleItemClick = (item: T) => {
    if (onSelected) {
      onSelected(item);
    }
  };

  return (
    <div className="listBox" onMouseDown={onMouseDown}>
      <ul>
        {items.map((item) => (
          <li 
            key={('streetName' in item) ? (item as Street).streetId : (item as City).cityId} 
            onClick={() => handleItemClick(item)}
          >
            {('streetName' in item) ? (item as Street).streetName : (item as City).cityName}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ListBox;