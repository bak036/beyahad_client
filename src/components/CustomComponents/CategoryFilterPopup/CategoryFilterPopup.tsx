import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import InputRange from 'react-input-range-rtl';
import 'react-input-range-rtl/lib/css/index.css';
import { USER_DETAILS_STORE, PROFILE_CARD_STORE } from 'src/consts/stores';
import rootStores from 'src/stores';
import ProfileCardStore from '../../../stores/ProfileCardStore';
import City from 'src/models/City';
import Region from 'src/models/Region';
import Category from 'src/models/Category';
import { CategoryType } from 'src/models/enums';

interface Props {
  onClose: () => void;
  onApply: (filter: CategoryFilter) => void;
  category: Category;
  savedFilter?: CategoryFilter;
  originalCategories: Category[];
}

export interface CategoryFilter {
  priceMin?: number;
  priceMax?: number;
  selectedRegions?: SelectedRegion[];
  selectedCities?: SelectedCity[];
  dateFrom?: string;
  dateTo?: string;
}

interface SelectedRegion {
  regionId: number;
  regionName: string;
}

interface SelectedCity {
  cityId: number;
  cityName: string;
}

type ViewMode = 'main' | 'location' | 'date';

const CategoryFilterPopup: React.FC<Props> = ({ onClose, onApply, category, savedFilter, originalCategories }) => {
  const profileCardStore: ProfileCardStore = rootStores[PROFILE_CARD_STORE];
  const userDetailsStore = rootStores[USER_DETAILS_STORE];

  const [viewMode, setViewMode] = useState<ViewMode>('main');
  const [isClosing, setIsClosing] = useState(false);

  // Filter parameter constants (from server FilterParameters)
  const FILTER_PARAM_PRICE = 1;
  const FILTER_PARAM_LOCATION = 2;
  const FILTER_PARAM_DATE = 3;

  // Parse filterParameters from server - can be CSV string (e.g., "1,2,3") or array
  const parseFilterParameters = (filterParams: any): number[] => {
    if (!filterParams) return [];

    // If it's already an array, return it
    if (Array.isArray(filterParams)) {
      return filterParams.map(p => typeof p === 'string' ? parseInt(p) : p).filter(p => !isNaN(p));
    }

    // If it's a Set, convert to array
    if (filterParams instanceof Set) {
      return Array.from(filterParams).map(p => typeof p === 'string' ? parseInt(p) : p).filter(p => !isNaN(p));
    }

    // If it's a string (CSV format like "1,2,3"), parse it
    if (typeof filterParams === 'string') {
      return filterParams
        .split(',')
        .map(p => p.trim())
        .map(p => parseInt(p))
        .filter(p => !isNaN(p));
    }

    return [];
  };

  // Collect data from subCategories of the current category
  // Example: If current category is 39878, collect prices, cityIds, etc. from its subCategories (grandchildren)
  const collectDataFromSubCategories = React.useMemo(() => {
    const prices = new Set<number>();
    const cityIds = new Set<number>();
    const regionIds = new Set<number>();
    const dateRanges: Array<{ startDate: string | Date; endDate: string | Date }> = [];

    originalCategories.forEach((subCat: Category) => {
      // Collect prices
      if (subCat.prices) {
        const subPrices = Array.isArray(subCat.prices) ? subCat.prices : Array.from(subCat.prices);
        subPrices.forEach(p => prices.add(p));
      }

      // Collect cityIds
      if (subCat.cityIds) {
        const subCityIds = Array.isArray(subCat.cityIds) ? subCat.cityIds : Array.from(subCat.cityIds);
        subCityIds.forEach(id => cityIds.add(id));
      }

      // Collect regionIds
      if (subCat.regionIds) {
        const subRegionIds = Array.isArray(subCat.regionIds) ? subCat.regionIds : Array.from(subCat.regionIds);
        subRegionIds.forEach(id => regionIds.add(id));
      }

      // Collect dateRanges
      if (subCat.dateRanges && subCat.dateRanges.length > 0) {
        subCat.dateRanges.forEach(dr => {
          dateRanges.push({
            startDate: (dr as any).startDate || (dr as any).StartDate || dr.startDate,
            endDate: (dr as any).endDate || (dr as any).EndDate || dr.endDate
          });
        });
      }
    });

    return {
      prices: Array.from(prices),
      cityIds: Array.from(cityIds),
      regionIds: Array.from(regionIds),
      dateRanges
    };
  }, [originalCategories]);

  // Check if category should show filters based on server data
  // When clicking on a category (e.g., child 39878), the popup should use:
  // 1. isFilterEnabled and filterParameters from the current category (39878) - to determine which filters to show
  // 2. Data (prices, cityIds, regionIds, dateRanges) collected from subCategories of the current category
  // 
  // Example: For category 39878 (child):
  // - filterParameters: [1, 2] from category 39878 -> shows Price (1) and Location (2)
  // - prices, cityIds, etc. collected from subCategories of 39878 (grandchildren)
  const filterParameters = React.useMemo(() => parseFilterParameters(category?.filterParameters), [category?.filterParameters]);

  // Only show filters if isFilterEnabled is true for the current category
  const isFilterEnabled = React.useMemo(() => category?.isFilterEnabled === true, [category?.isFilterEnabled]);

  // Determine which filters to show based on current category's filterParameters
  const shouldShowPrice = React.useMemo(() =>
    isFilterEnabled && filterParameters.includes(FILTER_PARAM_PRICE),
    [isFilterEnabled, filterParameters]
  );

  const shouldShowLocation = React.useMemo(() =>
    isFilterEnabled && filterParameters.includes(FILTER_PARAM_LOCATION) &&
    collectDataFromSubCategories.cityIds.length > 0,
    [isFilterEnabled, filterParameters, collectDataFromSubCategories.cityIds]
  );

  const shouldShowDate = React.useMemo(() =>
    isFilterEnabled && filterParameters.includes(FILTER_PARAM_DATE) &&
    collectDataFromSubCategories.dateRanges.length > 0,
    [isFilterEnabled, filterParameters, collectDataFromSubCategories.dateRanges]
  );

  // Calculate min and max dates from dateRanges
  const dateRange = React.useMemo<{ minDate: Date | null; maxDate: Date | null }>(() => {
    if (!shouldShowDate || collectDataFromSubCategories.dateRanges.length === 0) {
      return { minDate: null, maxDate: null };
    }

    let minDate: Date | null = null;
    let maxDate: Date | null = null;

    collectDataFromSubCategories.dateRanges.forEach(dr => {
      const startDate = dr.startDate instanceof Date ? dr.startDate : new Date(dr.startDate);
      const endDate = dr.endDate instanceof Date ? dr.endDate : new Date(dr.endDate);

      if (!isNaN(startDate.getTime())) {
        if (!minDate || startDate < minDate) {
          minDate = startDate;
        }
      }

      if (!isNaN(endDate.getTime())) {
        if (!maxDate || endDate > maxDate) {
          maxDate = endDate;
        }
      }
    });

    return { minDate, maxDate };
  }, [shouldShowDate, collectDataFromSubCategories.dateRanges]);

  // Price filter - get min/max from subCategories data
  const calculatePriceRange = (prices: number[]): { min: number; max: number } => {
    if (!prices || prices.length === 0) {
      return { min: 0, max: 0 };
    }

    const min = Math.min(...prices);
    const max = Math.max(...prices);

    // If there's a price 0, min should be 0
    if (prices.some(p => p === 0)) {
      return { min: 0, max };
    }

    return { min, max };
  };

  // Calculate price range from subCategories data (stays constant)
  const priceRange = React.useMemo(() => {
    if (!shouldShowPrice) {
      return { min: 0, max: 0 };
    }
    return calculatePriceRange(collectDataFromSubCategories.prices);
  }, [shouldShowPrice, collectDataFromSubCategories.prices]);

  const [priceMin, setPriceMin] = useState<number>(priceRange.min);
  const [priceMax, setPriceMax] = useState<number>(priceRange.max);
  const [priceMinInput, setPriceMinInput] = useState<string>(priceRange.min.toString());
  const [priceMaxInput, setPriceMaxInput] = useState<string>(priceRange.max.toString());
  const [priceMinError, setPriceMinError] = useState<string>('');
  const [priceMaxError, setPriceMaxError] = useState<string>('');

  // Location filter
  const [selectedRegions, setSelectedRegions] = useState<SelectedRegion[]>([]);
  const [selectedCities, setSelectedCities] = useState<SelectedCity[]>([]);
  const [searchCity, setSearchCity] = useState('');
  const [filteredCities, setFilteredCities] = useState<City[]>([]);
  const [filteredRegions, setFilteredRegions] = useState<Region[]>([]);
  const [regionsOriginal, setRegionsOriginal] = useState<Region[]>([]);
  const [citiesOriginal, setCitiesOriginal] = useState<City[]>([]);

  // Date filter
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [activeDateInput, setActiveDateInput] = useState<'from' | 'to'>('from');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dateFromError, setDateFromError] = useState<string>('');
  const [dateToError, setDateToError] = useState<string>('');

  // Drawer states
  const [priceDrawerOpen, setPriceDrawerOpen] = useState(true);
  const [locationDrawerOpen, setLocationDrawerOpen] = useState(false);
  const [dateDrawerOpen, setDateDrawerOpen] = useState(false);

  // Results count
  const [resultsCount, setResultsCount] = useState<number>(0);

  // Track if popup was just opened (for reordering on open only)
  const isInitialLoadRef = useRef(true);

  // Load cities and regions from server data
  useEffect(() => {
    const loadCitiesAndRegions = async () => {
      if (!shouldShowLocation) {
        setRegionsOriginal([]);
        setFilteredRegions([]);
        setCitiesOriginal([]);
        setFilteredCities([]);
        return;
      }

      if (userDetailsStore.allCities?.length === 0) {
        await userDetailsStore.getAllCities();
      }
      if (profileCardStore?.allRegions?.length === 0) {
        await profileCardStore.getAllRegions();
      }

      const allCities: City[] = userDetailsStore.allCities || [];
      const allRegions: Region[] = profileCardStore.allRegions || [];

      // Filter by subCategories data (cityIds and regionIds collected from children)
      const subCategoryCityIds = new Set(collectDataFromSubCategories.cityIds);
      const subCategoryRegionIds = new Set(collectDataFromSubCategories.regionIds);

      const filteredR = allRegions.filter(r => r.regionId !== undefined && subCategoryRegionIds.has(r.regionId));
      const filteredC = allCities.filter(c => c.cityId !== undefined && subCategoryCityIds.has(c.cityId));

      setRegionsOriginal(filteredR);
      setFilteredRegions(filteredR);
      setCitiesOriginal(filteredC);
      setFilteredCities(filteredC);
    };

    loadCitiesAndRegions();
  }, [shouldShowLocation, collectDataFromSubCategories.cityIds, collectDataFromSubCategories.regionIds]);

  // Search filter for cities/regions
  useEffect(() => {
    const val = searchCity.trim();
    if (val === '') {
      // When search is empty, just use original lists (no reordering - that happens only on popup open)
      setFilteredRegions(regionsOriginal);
      setFilteredCities(citiesOriginal);
      return;
    }

    const lower = val.toLowerCase();
    const filteredR = regionsOriginal.filter(r => r.regionName.toLowerCase().includes(lower));
    const filteredC = citiesOriginal.filter(c => c.cityName.toLowerCase().includes(lower));

    // Just filter, don't reorder (reordering happens only on popup open)
    setFilteredRegions(filteredR);
    setFilteredCities(filteredC);
  }, [searchCity, regionsOriginal, citiesOriginal]);

  // Reset price range when categories change (only if no saved filter)
  useEffect(() => {
    if (!savedFilter || (savedFilter.priceMin === undefined && savedFilter.priceMax === undefined)) {
      setPriceMin(priceRange.min);
      setPriceMax(priceRange.max);
      setPriceMinInput(priceRange.min.toString());
      setPriceMaxInput(priceRange.max.toString());
      setPriceMinError('');
      setPriceMaxError('');
    }
  }, [priceRange]);

  // Load saved filter
  useEffect(() => {
    // Reset initial load flag when popup opens (savedFilter changes)
    isInitialLoadRef.current = true;

    if (savedFilter) {
      if (savedFilter.priceMin !== undefined) {
        setPriceMin(savedFilter.priceMin);
        setPriceMinInput(savedFilter.priceMin.toString());
      }
      if (savedFilter.priceMax !== undefined) {
        setPriceMax(savedFilter.priceMax);
        setPriceMaxInput(savedFilter.priceMax.toString());
      }
      if (savedFilter.selectedRegions) {
        setSelectedRegions(savedFilter.selectedRegions);
      }
      if (savedFilter.selectedCities) {
        setSelectedCities(savedFilter.selectedCities);
      }
      if (savedFilter.dateFrom) {
        setDateFrom(savedFilter.dateFrom);
      }
      if (savedFilter.dateTo) {
        setDateTo(savedFilter.dateTo);
      }
    }
    // No default date - user must select manually
  }, [savedFilter]);

  // Reorder lists when popup opens (when regions/cities are loaded for the first time)
  // This happens only on popup open, not during live selection changes
  useEffect(() => {
    // Only reorder on initial load when lists are first populated
    if (isInitialLoadRef.current && (regionsOriginal.length > 0 || citiesOriginal.length > 0)) {
      if (regionsOriginal.length > 0) {
        if (selectedRegions.length > 0) {
          const reorderedRegions = reorderBySelection(regionsOriginal, selectedRegions, 'regionId', 'regionName');
          setFilteredRegions(reorderedRegions);
        } else {
          // If no selections, just use original order
          setFilteredRegions(regionsOriginal);
        }
      }

      if (citiesOriginal.length > 0) {
        if (selectedCities.length > 0) {
          const reorderedCities = reorderBySelection(citiesOriginal, selectedCities, 'cityId', 'cityName');
          setFilteredCities(reorderedCities);
        } else {
          // If no selections, just use original order
          setFilteredCities(citiesOriginal);
        }
      }

      // Mark that initial load is done
      isInitialLoadRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regionsOriginal, citiesOriginal]); // Only when original lists change (popup open), not when selections change

  // Calculate results count based on current filters
  const calculateResultsCount = React.useCallback((): number => {
    let filtered = [...originalCategories];

    // Apply price filter
    if (shouldShowPrice && (priceMin !== priceRange.min || priceMax !== priceRange.max)) {
      filtered = filtered.filter(cat => {
        // Get prices from category.prices (array from server) or from variants
        let categoryPrices: number[] = [];

        // First, try to get prices from category.prices (from server)
        if (cat.prices) {
          const pricesArray = Array.isArray(cat.prices) ? cat.prices : Array.from(cat.prices);
          categoryPrices = pricesArray;
        }

        // If no prices from server, try variants
        if (categoryPrices.length === 0 && cat.variants && cat.variants.length > 0) {
          categoryPrices = cat.variants.map(v => v.price || 0).filter(p => p !== undefined && p !== null);
        }

        // If still no prices, check if price range includes 0
        if (categoryPrices.length === 0) {
          return priceMin <= 0 && 0 <= priceMax;
        }

        // Check if at least one price is in range
        return categoryPrices.some(price => price >= priceMin && price <= priceMax);
      });
    }

    // Apply location filter
    if (shouldShowLocation && (selectedRegions.length > 0 || selectedCities.length > 0)) {
      filtered = filtered.filter(cat => {
        // Get cityIds and regionIds from category (from server)
        let categoryCityIds: number[] = [];
        let categoryRegionIds: number[] = [];

        // Get cityIds from category.cityIds (from server)
        if (cat.cityIds) {
          const cityIdsArray = Array.isArray(cat.cityIds) ? cat.cityIds : Array.from(cat.cityIds);
          categoryCityIds = cityIdsArray;
        }

        // Get regionIds from category.regionIds (from server)
        if (cat.regionIds) {
          const regionIdsArray = Array.isArray(cat.regionIds) ? cat.regionIds : Array.from(cat.regionIds);
          categoryRegionIds = regionIdsArray;
        }

        // If no data from server, try locations array
        if (categoryCityIds.length === 0 && categoryRegionIds.length === 0 && cat.locations && cat.locations.length > 0) {
          cat.locations.forEach(loc => {
            if (loc.cityId) {
              categoryCityIds.push(loc.cityId);
            }
            if (loc.regionId) {
              const regionIdNum = typeof loc.regionId === 'string' ? parseInt(loc.regionId) : loc.regionId;
              if (!isNaN(regionIdNum)) {
                categoryRegionIds.push(regionIdNum);
              }
            }
          });
        }

        // Check if category matches selected regions or cities
        const selectedRegionIds = selectedRegions.map(r => r.regionId);
        const selectedCityIds = selectedCities.map(c => c.cityId);

        const regionMatch = selectedRegionIds.length > 0 && categoryRegionIds.some(r => selectedRegionIds.includes(r));
        const cityMatch = selectedCityIds.length > 0 && categoryCityIds.some(c => selectedCityIds.includes(c));

        return regionMatch || cityMatch;
      });
    }

    // Apply date filter
    if (shouldShowDate && dateFrom && dateTo) {
      const fromDate = parseDate(dateFrom);
      const toDate = parseDate(dateTo);

      if (fromDate && toDate) {
        // Set toDate to end of day so single-day ranges include the entire day
        const toDateEnd = new Date(toDate);
        toDateEnd.setHours(23, 59, 59, 999);

        filtered = filtered.filter(cat => {
          // Check if category has dateRanges that overlap with selected range
          if (cat.dateRanges && cat.dateRanges.length > 0) {
            return cat.dateRanges.some((dr: any) => {
              const rangeStart = dr.startDate instanceof Date ? dr.startDate : new Date(dr.startDate);
              const rangeEnd = dr.endDate instanceof Date ? dr.endDate : new Date(dr.endDate);

              const rangeStartTime = rangeStart.getTime();
              const rangeEndTime = rangeEnd.getTime();
              const fromTime = fromDate.getTime();
              const toTime = toDateEnd.getTime();

              // Check for overlap: ranges overlap if one starts before the other ends
              const overlaps = (rangeStartTime <= toTime && rangeEndTime >= fromTime);

              // Also check if category range contains or is contained by selected range
              const containsSelected = (rangeStartTime <= fromTime && rangeEndTime >= toTime);
              const containedBySelected = (fromTime <= rangeStartTime && toTime >= rangeEndTime);

              return overlaps || containsSelected || containedBySelected;
            });
          }

          // Fallback: check events if no dateRanges
          if (cat.events && cat.events.length > 0) {
            return cat.events.some(event => {
              if (!event.dateFormattedString) return false;
              const eventDate = new Date(event.dateFormattedString);
              return eventDate >= fromDate && eventDate <= toDateEnd;
            });
          }

          return false;
        });
      }
    }

    return filtered.length;
  }, [priceMin, priceMax, selectedRegions, selectedCities, dateFrom, dateTo, originalCategories, priceRange, shouldShowPrice, shouldShowLocation, shouldShowDate]);

  useEffect(() => {
    const count = calculateResultsCount();
    setResultsCount(count);
  }, [calculateResultsCount]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleBack = () => {
    setViewMode('main');
  };

  const handleReset = () => {
    const range = calculatePriceRange(collectDataFromSubCategories.prices);
    setPriceMin(range.min);
    setPriceMax(range.max);
    setPriceMinInput(range.min.toString());
    setPriceMaxInput(range.max.toString());
    setPriceMinError('');
    setPriceMaxError('');
    setSelectedRegions([]);
    setSelectedCities([]);
    setDateFrom('');
    setDateTo('');
    setSearchCity('');
    setFilteredRegions(regionsOriginal);
    setFilteredCities(citiesOriginal);
    setSelectedDate(null);
    setActiveDateInput('to');
  };

  const handleApply = () => {
    // Validate: if fromDate is set, toDate must also be set
    if (dateFrom && !dateTo) {
      setDateToError('טווח התאריכים שנבחר אינו תקין');
      return;
    }

    // Block apply if there are existing date errors
    if (dateFromError || dateToError) {
      return;
    }

    const range = calculatePriceRange(collectDataFromSubCategories.prices);
    const filter: CategoryFilter = {
      priceMin: priceMin !== range.min ? priceMin : undefined,
      priceMax: priceMax !== range.max ? priceMax : undefined,
      selectedRegions: selectedRegions.length > 0 ? selectedRegions : undefined,
      selectedCities: selectedCities.length > 0 ? selectedCities : undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    };

    setIsClosing(true);
    setTimeout(() => {
      onApply(filter);
      onClose();
    }, 300);
  };

  // Reorder items by selection: selected items first (sorted alphabetically), then unselected items
  const reorderBySelection = <T extends { regionId?: number; cityId?: number; regionName?: string; cityName?: string }>(
    allItems: T[],
    selectedList: SelectedRegion[] | SelectedCity[],
    key: 'regionId' | 'cityId',
    nameKey: 'regionName' | 'cityName'
  ): T[] => {
    const selectedIds = (selectedList as any[]).map(item => item[key]);
    // Get selected items
    const selected = allItems.filter(i => selectedIds.includes(i[key]));
    // Get unselected items
    const notSelected = allItems.filter(i => !selectedIds.includes(i[key]));

    // Sort selected items alphabetically by name
    const sortedSelected = selected.sort((a, b) => {
      const nameA = (a[nameKey] || '').toLowerCase();
      const nameB = (b[nameKey] || '').toLowerCase();
      return nameA.localeCompare(nameB, 'he');
    });

    // Return selected (sorted) first, then unselected
    return [...sortedSelected, ...notSelected];
  };

  const toggleRegion = (region: SelectedRegion) => {
    const isSelected = selectedRegions.some(r => r.regionId === region.regionId);
    if (isSelected) {
      setSelectedRegions(selectedRegions.filter(r => r.regionId !== region.regionId));
    } else {
      setSelectedRegions([...selectedRegions, region]);
    }
    // No reordering here - only color and checkmark change
    // Reordering will happen only on next popup open
  };

  const toggleCity = (city: SelectedCity) => {
    const isSelected = selectedCities.some(c => c.cityId === city.cityId);
    if (isSelected) {
      setSelectedCities(selectedCities.filter(c => c.cityId !== city.cityId));
    } else {
      setSelectedCities([...selectedCities, city]);
    }
    // No reordering here - only color and checkmark change
    // Reordering will happen only on next popup open
  };

  const handleLocationDrawerClick = () => {
    if (locationDrawerOpen) {
      setLocationDrawerOpen(false);
    } else {
      setViewMode('location');
      setLocationDrawerOpen(true);
    }
  };

  const handleDateDrawerClick = () => {
    if (dateDrawerOpen) {
      setDateDrawerOpen(false);
    } else {
      setViewMode('date');
      setDateDrawerOpen(true);
    }
  };

  const handlePriceChange = (min: number, max: number) => {
    const range = calculatePriceRange(collectDataFromSubCategories.prices);
    const newMin = Math.max(range.min, Math.min(min, range.max));
    const newMax = Math.min(range.max, Math.max(max, range.min));
    setPriceMin(newMin);
    setPriceMax(newMax);
    setPriceMinInput(newMin.toString());
    setPriceMaxInput(newMax.toString());
    setPriceMinError('');
    setPriceMaxError('');
  };

  const handlePriceInputChange = (type: 'min' | 'max', value: string) => {
    // Only update the input value during typing, no validation
    if (type === 'min') {
      setPriceMinInput(value);
    } else {
      setPriceMaxInput(value);
    }
  };

  const handlePriceInputBlur = (type: 'min' | 'max') => {
    const range = calculatePriceRange(collectDataFromSubCategories.prices);
    const inputValue = type === 'min' ? priceMinInput : priceMaxInput;
    const numValue = inputValue === '' ? NaN : parseInt(inputValue);
    const isValidNumber = !isNaN(numValue) && inputValue !== '';

    if (type === 'min') {
      // Validate if value is outside range (only if it's a valid number)
      if (isValidNumber && (numValue < range.min || numValue > range.max)) {
        setPriceMinError(`ניתן להזין מחיר בטווח שבין ${range.min} ל- ${range.max} ש"ח`);
      } else {
        setPriceMinError('');
        if (isValidNumber) {
          const newMin = Math.max(range.min, Math.min(numValue, range.max));
          if (newMin <= priceMax) {
            setPriceMin(newMin);
            setPriceMinInput(newMin.toString());
          } else {
            // If newMin > priceMax, keep the input but don't update priceMin
            setPriceMinInput(inputValue);
          }
        } else {
          // If empty or invalid, reset to current priceMin
          setPriceMinInput(priceMin.toString());
        }
      }
    } else {
      // Validate if value is outside range (only if it's a valid number)
      if (isValidNumber && (numValue < range.min || numValue > range.max)) {
        setPriceMaxError(`ניתן להזין מחיר בטווח שבין ${range.min} ל- ${range.max} ש"ח`);
      } else {
        setPriceMaxError('');
        if (isValidNumber) {
          const newMax = Math.min(range.max, Math.max(numValue, range.min));
          if (newMax >= priceMin) {
            setPriceMax(newMax);
            setPriceMaxInput(newMax.toString());
          } else {
            // If newMax < priceMin, keep the input but don't update priceMax
            setPriceMaxInput(inputValue);
          }
        } else {
          // If empty or invalid, reset to current priceMax
          setPriceMaxInput(priceMax.toString());
        }
      }
    }
  };

  // Validate that date is not before today
  const isValidDate = (date: Date, isFrom: boolean = true): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate.getTime() >= today.getTime();
  };

  // Helper function to get today's date (normalized to midnight)
  const getToday = (): Date => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  // Helper function to check if a date is before today
  const isDateBeforeToday = (date: Date): boolean => {
    const today = getToday();
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate.getTime() < today.getTime();
  };

  // Validate date format DD.MM.YYYY
  const isValidDateFormat = (dateStr: string): boolean => {
    const regex = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/;
    if (!regex.test(dateStr)) return false;
    const parsed = parseDate(dateStr);
    if (!parsed) return false;
    // Check if parsed date matches the input (to catch invalid dates like 32.13.2025)
    const formatted = formatDate(parsed);
    return formatted === dateStr;
  };

  const handleDateSelect = (date: Date) => {
    // Prevent selection of dates before today
    if (isDateBeforeToday(date)) {
      return;
    }

    setDateFromError('');
    setDateToError('');
    setSelectedDate(date);
    const dateStr = formatDate(date);
    const fromDate = parseDate(dateFrom);
    const toDate = parseDate(dateTo);

    // Check if clicking on the same date that's already selected
    if (fromDate) {
      const fromDateCheck = new Date(fromDate);
      fromDateCheck.setHours(0, 0, 0, 0);
      const clickedDate = new Date(date);
      clickedDate.setHours(0, 0, 0, 0);

      if (fromDateCheck.getTime() === clickedDate.getTime()) {
        if (!toDate) {
          // No toDate yet - allow same-date selection (single day range)
          setDateTo(dateStr);
          setDateToError('');
          setActiveDateInput('from');
          return;
        }
        // Both dates set, clicking on from - deselect it
        setDateFrom('');
        setDateTo('');
        setActiveDateInput('from');
        return;
      }
    }

    if (toDate) {
      const toDateCheck = new Date(toDate);
      toDateCheck.setHours(0, 0, 0, 0);
      const clickedDate = new Date(date);
      clickedDate.setHours(0, 0, 0, 0);

      if (toDateCheck.getTime() === clickedDate.getTime()) {
        // Clicking on the same date as to - deselect it
        setDateTo('');
        setActiveDateInput('to');
        return;
      }
    }

    // Logic: first click = from, second click = to, third click = reset
    if (!fromDate) {
      // First click - set as from
      setDateFrom(dateStr);
      setDateTo('');
      setActiveDateInput('to');
      return;
    }

    if (!toDate) {
      // Second click - set as to
      // dateTo cannot be before dateFrom
      if (date < fromDate) {
        // Cannot select a date before fromDate
        setDateToError('טווח התאריכים שנבחר אינו תקין');
        return;
      } else {
        setDateTo(dateStr);
        setDateToError('');
      }
      setActiveDateInput('from');
      return;
    }

    // Third click - reset and start new selection
    setDateFrom(dateStr);
    setDateTo('');
    setActiveDateInput('to');
  };

  const formatDate = (date: Date): string => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const parseDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    const parts = dateStr.split('.');
    if (parts.length === 3) {
      const day = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1;
      const year = parseInt(parts[2]);
      return new Date(year, month, day);
    }
    return null;
  };

  const compareDates = (dateStr1: string, dateStr2: string): number => {
    const date1 = parseDate(dateStr1);
    const date2 = parseDate(dateStr2);
    if (!date1 || !date2) return 0;
    return date1.getTime() - date2.getTime();
  };

  const getTitle = (): string => {
    if (viewMode === 'location') return 'מיקום';
    if (viewMode === 'date') return 'תאריך';
    return 'סינון';
  };

  const getLocationLabel = (): string => {
    const totalSelected = selectedRegions.length + selectedCities.length;

    // אם נבחר אייטם אחד בלבד - הצג את השם שלו
    if (totalSelected === 1) {
      if (selectedRegions.length === 1) {
        return selectedRegions[0].regionName;
      }
      if (selectedCities.length === 1) {
        return selectedCities[0].cityName;
      }
    }

    // אם נבחרו יותר מאייטם אחד
    if (totalSelected > 1) {
      const regionsCount = selectedRegions.length;
      const citiesCount = selectedCities.length;

      // רק ערים
      if (regionsCount === 0 && citiesCount > 0) {
        return `נבחרו ${citiesCount} ערים`;
      }

      // רק אזורים
      if (citiesCount === 0 && regionsCount > 0) {
        return `נבחרו ${regionsCount} אזורים`;
      }

      // גם וגם
      if (regionsCount > 0 && citiesCount > 0) {
        return `נבחרו ${totalSelected} מיקומים`;
      }
    }

    // ברירת מחדל
    return 'כל האיזורים';
  };

  const hasActiveFilters = (): boolean => {
    const range = calculatePriceRange(collectDataFromSubCategories.prices);
    return (
      priceMin !== range.min ||
      priceMax !== range.max ||
      selectedRegions.length > 0 ||
      selectedCities.length > 0 ||
      dateFrom !== '' ||
      dateTo !== ''
    );
  };

  const renderMainView = () => (
    <>
      {/* Price Drawer */}
      {shouldShowPrice && (
        <div className="filter-drawer">
          <div className="filter-drawer-header" onClick={() => setPriceDrawerOpen(!priceDrawerOpen)}>
            <div className="filter-drawer-title">
              <img src={require('../../../assets/israeli-shekel-icon.svg')} alt="מחיר" className="currency-icon" />
              <span>מחיר</span>
            </div>
          </div>
          {priceDrawerOpen && (
            <div className="filter-drawer-content">
              <div className="price-slider-container">
                <div className="price-slider-wrapper">
                  <InputRange
                    minValue={priceRange.min}
                    maxValue={priceRange.max}
                    value={{ min: priceMin, max: priceMax }}
                    onChange={(value: any) => {
                      if (value && typeof value === 'object' && 'min' in value && 'max' in value) {
                        handlePriceChange(value.min, value.max);
                      }
                    }}
                    {...({ direction: 'rtl' } as any)}
                    className="price-slider-range"
                  />
                </div>
                <div className="price-slider-labels">
                  <span className="price-slider-label-min">₪{priceRange.min}</span>
                  <span className="price-slider-label-max">₪{priceRange.max}</span>
                </div>
              </div>
              <div className="price-inputs">
                <div className="price-input-wrapper">
                  <div className="price-input-group">
                    <input
                      type="number"
                      value={priceMinInput}
                      onChange={(e) => handlePriceInputChange('min', e.target.value)}
                      onBlur={() => handlePriceInputBlur('min')}
                      className="price-input"
                      min="0"
                      max={priceMax}
                    />
                    <span className="currency-symbol">₪</span>
                  </div>
                  {priceMinError && (
                    <div className="price-input-error">{priceMinError}</div>
                  )}
                </div>
                <span className="price-separator">עד</span>
                <div className="price-input-wrapper">
                  <div className="price-input-group">
                    <input
                      type="number"
                      value={priceMaxInput}
                      onChange={(e) => handlePriceInputChange('max', e.target.value)}
                      onBlur={() => handlePriceInputBlur('max')}
                      className="price-input"
                      min={priceMin}
                      max="10000"
                    />
                    <span className="currency-symbol">₪</span>
                  </div>
                  {priceMaxError && (
                    <div className="price-input-error">{priceMaxError}</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Location Drawer */}
      {shouldShowLocation && (
        <div className="filter-drawer">
          <div className="filter-drawer-header" onClick={handleLocationDrawerClick}>
            <div className="filter-drawer-title">
              <img src={require('../../../assets/locationPin2.svg')} alt="מיקום" />
              <span>מיקום</span>
            </div>
            <div className="filter-drawer-location-right">
              <span className="location-label">{getLocationLabel()}</span>
              <img src={require('../../../assets/gentel-arrow.svg')} alt="חץ" className="filter-drawer-arrow" />
            </div>
          </div>
        </div>
      )}

      {/* Date Drawer */}
      {shouldShowDate && (
        <div className="filter-drawer">
          <div className="filter-drawer-header" onClick={handleDateDrawerClick}>
            <div className="filter-drawer-title">
              <img src={require('../../../assets/calendar.svg')} alt="תאריך" />
              <span>תאריך</span>
            </div>
            <div className="filter-drawer-date-right">
              {dateFrom && dateTo ? (
                <span className="date-range-display">{dateFrom}-{dateTo}</span>
              ) : dateFrom ? (
                <span className="date-range-display">{dateFrom}</span>
              ) : dateTo ? (
                <span className="date-range-display">{dateTo}</span>
              ) : (
                <span className="date-range-display">הכל</span>
              )}
              <img src={require('../../../assets/gentel-arrow.svg')} alt="חץ" className="filter-drawer-arrow" />
            </div>
          </div>
        </div>
      )}
    </>
  );

  const renderLocationView = () => (
    <div className="filter-location-view">
      <div className="filter-search-box">
        <input
          type="text"
          placeholder="חיפוש לפי שם עיר או אזור בארץ"
          value={searchCity}
          onChange={(e) => setSearchCity(e.target.value)}
        />
      </div>
      <div className="filter-scrollable">
        {filteredRegions.length > 0 && (
          <div className="regions-and-cities-section">
            <div className="filter-subtitle">לפי איזור</div>
            <div className="filter-list">
              {filteredRegions.map((r) => {
                const isSelected = selectedRegions.some((sel) => sel.regionId === r.regionId);
                return (
                  <div
                    key={r.regionId}
                    className={`filter-option ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleRegion({ regionId: r.regionId, regionName: r.regionName })}
                  >
                    {isSelected && <div className="filter-bg"></div>}
                    <span>{r.regionName}</span>
                    <img src={require('../../../assets/icons/check.svg')} className="checkmark" style={{ opacity: isSelected ? 1 : 0 }} />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {filteredCities.length > 0 && (
          <div className="regions-and-cities-section">
            <div className="filter-subtitle">לפי עיר/יישוב</div>
            <div className="filter-list">
              {filteredCities.map((city) => {
                const isSelected = selectedCities.some((sel) => sel.cityId === city.cityId);
                return (
                  <div
                    key={city.cityId}
                    className={`filter-option ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleCity({ cityId: city.cityId ?? 0, cityName: city.cityName })}
                  >
                    {isSelected && <div className="filter-bg"></div>}
                    <span>{city.cityName}</span>
                    <img src={require('../../../assets/icons/check.svg')} className="checkmark" style={{ opacity: isSelected ? 1 : 0 }} />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderCalendar = () => {
    const months: Date[] = [];

    // Always start with current month
    const today = new Date();
    const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Always start from current month
    // Don't use dateRange to limit the calendar - it's only for filtering logic
    let startDate: Date = currentMonth;

    // Calculate how many months to show
    // No maximum limit - allow extensive scrolling forward
    // Show a large number of months initially (120 months = 10 years)
    // This allows users to select dates far into the future (2030, 2050, 2080, etc.)
    let monthsToShow = 120; // Show 120 months initially (10 years)

    // Don't use dateRange.maxDate to limit months - allow unlimited future dates
    // The dateRange is only used for filtering logic, not for limiting calendar display
    // Users can select any future date without restrictions

    for (let i = 0; i < monthsToShow; i++) {
      const monthDate = new Date(startDate);
      monthDate.setMonth(startDate.getMonth() + i);
      months.push(monthDate);
    }

    const weekDays = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש']; // RTL: Saturday (ש) on the left, Sunday (א) on the right

    interface DayData {
      day: number;
      date: Date | null; // null for empty cells (padding)
      isSelected?: boolean;
      isInRange?: boolean;
    }

    return (
      <div className="calendar-months">
        {months.map((monthDate, monthIndex) => {
          const year = monthDate.getFullYear();
          const month = monthDate.getMonth();
          const monthNames = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];

          const firstDay = new Date(year, month, 1);
          const lastDay = new Date(year, month + 1, 0);
          const daysInMonth = lastDay.getDate();
          const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

          const days: DayData[] = [];

          // Add empty cells before the first day of the month to align with correct weekday
          // This ensures the calendar shows the correct day of week for each date
          // But we don't add actual dates from previous month - just empty padding cells
          for (let i = 0; i < startingDayOfWeek; i++) {
            days.push({
              day: 0,
              date: null, // Empty cell - no date
              isSelected: false,
              isInRange: false
            });
          }

          // Add current month days
          for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = formatDate(date);
            const isSelected = dateStr === dateFrom || dateStr === dateTo;
            const isInRange = !!(dateFrom && dateTo &&
              compareDates(dateStr, dateFrom) >= 0 &&
              compareDates(dateStr, dateTo) <= 0);

            days.push({
              day,
              date,
              isSelected,
              isInRange
            });
          }

          // Add empty cells at the end to complete the last week (if needed)
          // Calculate how many cells we have so far
          const totalCells = days.length;
          const daysInWeek = 7;
          const remainingDaysInWeek = totalCells % daysInWeek;

          // Only add empty cells if the last week is incomplete
          if (remainingDaysInWeek > 0) {
            const emptyCellsToAdd = daysInWeek - remainingDaysInWeek;
            for (let i = 0; i < emptyCellsToAdd; i++) {
              days.push({
                day: 0,
                date: null, // Empty cell - no date
                isSelected: false,
                isInRange: false
              });
            }
          }

          return (
            <div key={monthIndex} className="calendar-month">
              <div className="calendar-month-title">
                {monthNames[month]} {year}
              </div>
              <div className="calendar-weekdays">
                {weekDays.map((day, index) => (
                  <div key={index} className="calendar-weekday">{day}</div>
                ))}
              </div>
              <div className="calendar-days">
                {days.map((dayData, dayIndex) => {
                  // Handle empty cells (padding) - no date, just empty space
                  if (!dayData.date) {
                    return (
                      <div
                        key={dayIndex}
                        className="calendar-day empty"
                      >
                        <span className="day-number"></span>
                      </div>
                    );
                  }

                  const dateStr = formatDate(dayData.date);

                  // Use full Date object for comparison (year, month, day)
                  const currentDate = new Date(dayData.date);
                  currentDate.setHours(0, 0, 0, 0);

                  const fromDate = parseDate(dateFrom);
                  const toDate = parseDate(dateTo);

                  // Check if this is today
                  const today = getToday();
                  const isToday = currentDate.getTime() === today.getTime();

                  // Check if date is before today (should be disabled)
                  const isDisabled = isDateBeforeToday(currentDate);

                  // Simplified logic - all days belong to current month only
                  let isSelected = false;
                  let isInRange = false;
                  let isRangeStart = false;
                  let isRangeEnd = false;

                  // Check if this date is selected (exactly matches from or to by full date comparison)
                  // Only mark as selected if there's no error for that date
                  if (fromDate && !dateFromError) {
                    const fromDateCheck = new Date(fromDate);
                    fromDateCheck.setHours(0, 0, 0, 0);
                    if (currentDate.getTime() === fromDateCheck.getTime()) {
                      isSelected = true;
                    }
                  }
                  if (toDate && !isSelected && !dateToError) {
                    const toDateCheck = new Date(toDate);
                    toDateCheck.setHours(0, 0, 0, 0);
                    if (currentDate.getTime() === toDateCheck.getTime()) {
                      isSelected = true;
                    }
                  }

                  // Check if this date is in the range (between from and to, EXCLUDING start and end)
                  // Only show range when BOTH from and to are selected AND there are no errors
                  // Range works only on actual dates of the current month
                  if (fromDate && toDate && !dateFromError && !dateToError) {
                    const fromDateCheck = new Date(fromDate);
                    fromDateCheck.setHours(0, 0, 0, 0);
                    const toDateCheck = new Date(toDate);
                    toDateCheck.setHours(0, 0, 0, 0);

                    const currentTime = currentDate.getTime();
                    const fromTime = fromDateCheck.getTime();
                    const toTime = toDateCheck.getTime();

                    // Ensure from <= to for comparison
                    const minTime = Math.min(fromTime, toTime);
                    const maxTime = Math.max(fromTime, toTime);

                    // Check if this is the start or end date (by full date comparison)
                    isRangeStart = currentTime === fromTime;
                    isRangeEnd = currentTime === toTime;

                    // Range includes dates BETWEEN start and end (not including start and end themselves)
                    isInRange = currentTime > minTime && currentTime < maxTime;
                  }
                  // IMPORTANT: Only show range when BOTH fromDate AND toDate are selected
                  // If only one date is selected, no range should be shown

                  // Middle of range - dates between start and end (not including start/end)
                  // Note: range-start and range-end should NOT have in-range class
                  const isRangeMiddle = isInRange;

                  // Only add range classes when BOTH fromDate and toDate are selected
                  const hasBothDates = !!(fromDate && toDate);

                  // Build className - simplified, no overflow logic
                  const classNames = [
                    'calendar-day',
                    isSelected ? 'selected' : '',
                    isInRange && !isSelected && hasBothDates ? 'in-range' : '',
                    isRangeMiddle && hasBothDates ? 'range-middle' : '',
                    isRangeStart && !isInRange && hasBothDates ? 'range-start' : '',
                    isRangeEnd && !isInRange && hasBothDates ? 'range-end' : '',
                    isToday ? 'today' : '',
                    isDisabled ? 'disabled' : ''
                  ].filter(Boolean).join(' ');

                  return (
                    <div
                      key={dayIndex}
                      className={classNames}
                      onClick={() => !isDisabled && handleDateSelect(dayData.date!)}
                      style={isDisabled ? { cursor: 'not-allowed', opacity: 0.5 } : {}}
                    >
                      <span className="day-number">{dayData.day}</span>
                      {isToday && <span className="today-dot"></span>}
                    </div>

                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const handleDateInputChange = (type: 'from' | 'to', value: string) => {
    // Allow only digits, dots, and spaces
    const cleanedValue = value.replace(/[^\d.]/g, '');

    // Update the input value
    if (type === 'from') {
      setDateFrom(cleanedValue);
      setActiveDateInput('from');
    } else {
      setDateTo(cleanedValue);
      setActiveDateInput('to');
    }

    // Validate format first - if format is valid, check if date is before today
    const regex = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/;
    if (regex.test(cleanedValue)) {
      const parsed = parseDate(cleanedValue);
      if (parsed) {
        // Check if parsed date matches the input (catches invalid dates like 32.13.2025)
        const inputParts = cleanedValue.split('.');
        const parsedDay = parsed.getDate();
        const parsedMonth = parsed.getMonth() + 1;
        const parsedYear = parsed.getFullYear();
        const inputDay = parseInt(inputParts[0]);
        const inputMonth = parseInt(inputParts[1]);
        const inputYear = parseInt(inputParts[2]);

        // If date values match, it's a valid date - check if it's before today
        if (parsedDay === inputDay && parsedMonth === inputMonth && parsedYear === inputYear) {
          if (isDateBeforeToday(parsed)) {
            if (type === 'from') {
              setDateFromError('לא ניתן להזין תאריך מוקדם מהתאריך הנוכחי');
            } else {
              setDateToError('לא ניתן להזין תאריך מוקדם מהתאריך הנוכחי');
            }
            return;
          } else {
            // Date is valid and not before today - clear error
            if (type === 'from') {
              setDateFromError('');
            } else {
              setDateToError('');
            }
            return;
          }
        }
      }
    }

    // If format is not valid or date is invalid, clear error (format validation will happen on blur)
    if (type === 'from') {
      setDateFromError('');
    } else {
      setDateToError('');
    }
  };

  const handleDateInputBlur = (type: 'from' | 'to') => {
    const dateStr = type === 'from' ? dateFrom : dateTo;

    if (!dateStr) {
      if (type === 'from') {
        setDateFromError('');
      } else {
        setDateToError('');
      }
      return;
    }

    // Validate format - check basic format first
    const regex = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/;
    if (!regex.test(dateStr)) {
      if (type === 'from') {
        setDateFromError('תאריך לא תקין. נא להזין בפורמט DD.MM.YYYY');
      } else {
        setDateToError('תאריך לא תקין. נא להזין בפורמט DD.MM.YYYY');
      }
      return;
    }

    // Try to parse the date
    const parsed = parseDate(dateStr);
    if (!parsed) {
      if (type === 'from') {
        setDateFromError('תאריך לא תקין');
      } else {
        setDateToError('תאריך לא תקין');
      }
      return;
    }

    // Check if parsed date matches the input (catches invalid dates like 32.13.2025)
    // Compare the actual date values, not the format (to handle cases like 17.02.2026 vs 17.2.2026)
    const inputParts = dateStr.split('.');
    const parsedDay = parsed.getDate();
    const parsedMonth = parsed.getMonth() + 1;
    const parsedYear = parsed.getFullYear();
    const inputDay = parseInt(inputParts[0]);
    const inputMonth = parseInt(inputParts[1]);
    const inputYear = parseInt(inputParts[2]);

    if (parsedDay !== inputDay || parsedMonth !== inputMonth || parsedYear !== inputYear) {
      if (type === 'from') {
        setDateFromError('תאריך לא תקין. נא להזין בפורמט DD.MM.YYYY');
      } else {
        setDateToError('תאריך לא תקין. נא להזין בפורמט DD.MM.YYYY');
      }
      return;
    }

    // Validate that date is not before today (this check was already done in onChange, but we check again)
    if (isDateBeforeToday(parsed)) {
      if (type === 'from') {
        setDateFromError('לא ניתן להזין תאריך מוקדם מהתאריך הנוכחי');
      } else {
        setDateToError('לא ניתן להזין תאריך מוקדם מהתאריך הנוכחי');
      }
      return;
    }

    // Format the date
    const formattedDate = formatDate(parsed);

    if (type === 'from') {
      setDateFrom(formattedDate);
      setDateFromError('');

      // If to date exists and is before from, show error
      const toDate = parseDate(dateTo);
      if (toDate && parsed > toDate) {
        setDateToError('טווח התאריכים שנבחר אינו תקין');
      }
    } else {
      // Validate to is not before from
      const fromDate = parseDate(dateFrom);
      if (fromDate && parsed < fromDate) {
        setDateToError('טווח התאריכים שנבחר אינו תקין');
        return;
      }

      setDateTo(formattedDate);
      setDateToError('');
    }
  };

  const renderDateView = () => {
    const fromDate = parseDate(dateFrom);
    const toDate = parseDate(dateTo);

    return (
      <div className="filter-date-view">
        <div className="date-inputs">
          <div className={`date-input-group ${activeDateInput === 'from' ? 'active' : ''} ${dateFromError ? 'error' : ''}`}>
            <label>מתאריך-</label>
            <input
              type="text"
              value={dateFrom}
              placeholder="DD MM YYYY"
              onChange={(e) => handleDateInputChange('from', e.target.value)}
              onFocus={() => setActiveDateInput('from')}
              onBlur={() => handleDateInputBlur('from')}
            />
            {dateFromError && <span className="date-error">{dateFromError}</span>}
          </div>
          <div className={`date-input-group ${activeDateInput === 'to' ? 'active' : ''} ${dateToError ? 'error' : ''}`}>
            <label>עד-</label>
            <input
              type="text"
              value={dateTo}
              placeholder="DD MM YYYY"
              onChange={(e) => handleDateInputChange('to', e.target.value)}
              onFocus={() => setActiveDateInput('to')}
              onBlur={() => handleDateInputBlur('to')}
            />
            {dateToError && <span className="date-error">{dateToError}</span>}
          </div>
        </div>
        <div className="calendar-container">
          {renderCalendar()}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="filter-overlay" onClick={handleClose} />
      <div className={`filter-popup ${isClosing ? 'closing' : ''}`}>
        <div className="filter-header">
          <div className="filter-close">
            {viewMode === 'main' ? (
              <img onClick={handleClose} src={require('../../../assets/close.svg')} alt="סגירה" />
            ) : (
              <img onClick={handleBack} src={require('../../../assets/Right-Arrow.svg')} alt="חזרה" style={{ transform: 'scaleX(-1)' }} />
            )}
          </div>
          <span className="filter-title">{getTitle()}</span>
          <button className="filter-reset" onClick={handleReset}>איפוס</button>
        </div>

        <div className="filter-body">
          {viewMode === 'main' && renderMainView()}
          {viewMode === 'location' && renderLocationView()}
          {viewMode === 'date' && renderDateView()}
        </div>

        <div className="filter-footer">
          <button className={`filter-apply-btn ${resultsCount === 0 ? 'no-results' : ''}`} onClick={handleApply}>
            הצגת תוצאות ({resultsCount})
          </button>
        </div>
      </div>
    </>
  );
};

export default CategoryFilterPopup;
