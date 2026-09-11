import * as React from 'react';
import { useState, useEffect } from 'react';
import { getCurrentPosition } from '../../../utils/locationUtils';
import { USER_DETAILS_STORE, PROFILE_CARD_STORE, SHOPS_STORE, VIEW_STORE } from 'src/consts/stores';
import rootStores from 'src/stores';
import ProfileCardStore from '../../../stores/ProfileCardStore';
import City from 'src/models/City';
import Region from 'src/models/Region';
import ShopsStore from '../../../stores/ShopsStore';

interface Props {
  onClose: () => void;
  onApply: (filter: any) => void;
  savedFilter?: any;
  originalShops: any[];
}

interface SelectedRegion {
  regionId: number;
  regionName: string;
}

interface SelectedCity {
  cityId: number;
  cityName: string;
}

const GeoLocationPopup: React.FC<Props> = ({ onClose, onApply, savedFilter, originalShops }) => {
  const profileCardStore: ProfileCardStore = rootStores[PROFILE_CARD_STORE];
  const userDetailsStore = rootStores[USER_DETAILS_STORE];
  const shopsStore: ShopsStore = rootStores[SHOPS_STORE];
  const viewStore = rootStores[VIEW_STORE];


  const [selectedRegions, setSelectedRegions] = useState<SelectedRegion[]>([]);
  const [selectedCities, setSelectedCities] = useState<SelectedCity[]>([]);
  const [searchCity, setSearchCity] = useState('');
  const [filteredCities, setFilteredCities] = useState<City[]>([]);
  const [filteredRegions, setFilteredRegions] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState<'nearMe' | 'regionOrCity' | null>(null);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [previewCount, setPreviewCount] = useState<number>(0);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isClosing, setIsClosing] = useState(false);
  const walletId = new URLSearchParams(window.location.search).get('walletId') ?? '0';
  const [regionsOriginal, setRegionsOriginal] = useState<any[]>([]);
  const [citiesOriginal, setCitiesOriginal] = useState<City[]>([]);
  const [pendingReset, setPendingReset] = useState(false);


  useEffect(() => {
    if (originalShops?.length > 0) {
      const total = originalShops.reduce(
        (sum, item) => sum + (item.walletChainData?.length || 0),
        0
      );
      setPreviewCount(total);
    }
  }, [originalShops]);


  useEffect(() => {
    const updateCitiesAndRegions = async () => {
      if (userDetailsStore.allCities?.length === 0) {
        await userDetailsStore.getAllCities();
      }
      if (profileCardStore?.allRegions?.length === 0) {
        await profileCardStore.getAllRegions();
      }

      const allCities: City[] = userDetailsStore.allCities || [];
      const allRegions: Region[] = profileCardStore.allRegions || [];
      const walletChains = originalShops || [];
      const regionSet = new Set<number>();
      const citySet = new Set<number>();

      walletChains.forEach(chain => {
        const innerChains = chain.walletChainData || [];

        innerChains.forEach(inner => {
          if (inner.subBranchRegions) {
            inner.subBranchRegions
              .split(',')
              .map(r => parseInt(r.trim()))
              .filter(id => !isNaN(id))
              .forEach(id => regionSet.add(id));
          }

          if (inner.subBranchCities) {
            inner.subBranchCities
              .split(',')
              .map(c => parseInt(c.trim()))
              .filter(id => !isNaN(id))
              .forEach(id => citySet.add(id));
          }
        });
      });


      const filteredRegions = allRegions.filter(r => r.regionId !== undefined && regionSet.has(r.regionId));
      const filteredCities = allCities.filter(c => c.cityId !== undefined && citySet.has(c.cityId));

      setRegionsOriginal(filteredRegions);
      setFilteredRegions(filteredRegions);

      setCitiesOriginal(filteredCities);
      setFilteredCities(filteredCities);


    };

    updateCitiesAndRegions();
  }, [originalShops]);


  useEffect(() => {
    const val = searchCity.trim();

    // אם החיפוש ריק – מחזירים הכל
    if (val === '') {
      setFilteredRegions(regionsOriginal);
      setFilteredCities(citiesOriginal);
      return;
    }

    const lower = val.toLowerCase();

    // פילטור אזורים לפי שם
    const filteredR = regionsOriginal.filter(r =>
      r.regionName.toLowerCase().includes(lower)
    );

    // פילטור ערים לפי שם
    const filteredC = citiesOriginal.filter(c =>
      c.cityName.toLowerCase().includes(lower)
    );

    setFilteredRegions(filteredR);
    setFilteredCities(filteredC);
  }, [searchCity]);

  useEffect(() => {
    if (regionsOriginal.length === 0 && citiesOriginal.length === 0) return;

    if (!savedFilter) {
      setFilteredRegions(regionsOriginal);
      setFilteredCities(citiesOriginal);
      setSearchCity('');
      setSelectedRegions([]);
      setSelectedCities([]);
      setSelectedType(null);
      return;
    }

    // --- טעינת selectedType בצורה נכונה לפי הלוגיקה האמיתית ---
    if (savedFilter.type === 'nearMe') {
      // אם המשתמש בחר "קרוב אליי", זו בחירה אמיתית ותמיד צריכה להישמר
      setSelectedType('nearMe');
    } else {
      // אם מדובר בסינון לפי איזור/עיר
      const noSavedSelection =
        (!savedFilter.regions || savedFilter.regions.length === 0) &&
        (!savedFilter.cities || savedFilter.cities.length === 0);

      if (noSavedSelection) {
        // אין בחירות בפועל → Reset אמיתי
        setSelectedType(null);
      } else {
        // יש בחירה של אזורים/ערים
        setSelectedType('regionOrCity');
      }
    }


    if (savedFilter.regions) {
      setSelectedRegions(savedFilter.regions);

      // הקפצה של הנבחרים לראש הרשימה
      const reorderedRegions = reorderBySelection(regionsOriginal, savedFilter.regions, 'regionId');
      setFilteredRegions(reorderedRegions);
    }

    if (savedFilter.cities) {
      setSelectedCities(savedFilter.cities);

      // הקפצה של הנבחרים לראש הרשימה
      const reorderedCities = reorderBySelection(citiesOriginal, savedFilter.cities, 'cityId');
      setFilteredCities(reorderedCities);
    }


    if (savedFilter.coords) setCoords(savedFilter.coords);
    if (savedFilter.data) setPreviewData(savedFilter.data);

    const total = savedFilter.data?.reduce(
      (sum: number, item: any) => sum + (item.walletChainData?.length || 0),
      0
    ) ?? 0;

    setPreviewCount(total);

  }, [savedFilter, regionsOriginal, citiesOriginal]);

  const toggleRegion = (region: SelectedRegion) => {

    if (pendingReset) {
      setPendingReset(false);
    }

    const isSelected = selectedRegions.some(r => r.regionId === region.regionId);
    let updated;

    const savedIds = savedFilter?.regions?.map(r => r.regionId) ?? [];

    if (isSelected) {
      updated = selectedRegions.filter(r => r.regionId !== region.regionId);
      setFilteredRegions([...filteredRegions]);
    } else {
      updated = [...selectedRegions, region];

      if (savedIds.includes(region.regionId)) {
        const reordered = reorderBySelection(filteredRegions, updated, 'regionId');
        setFilteredRegions(reordered);
      } else {
        setFilteredRegions([...filteredRegions]);
      }
    }

    setSelectedRegions(updated);
    setSelectedType(updated.length === 0 && selectedCities.length === 0 ? null : 'regionOrCity');
    fetchPreviewWithLists(updated, selectedCities, undefined, 'regionOrCity');
  };

  const toggleCity = (city: SelectedCity) => {

    if (pendingReset) {
      setPendingReset(false);
    }

    const isSelected = selectedCities.some(c => c.cityId === city.cityId);
    let updated;

    const savedIds = savedFilter?.cities?.map(c => c.cityId) ?? [];

    if (isSelected) {
      updated = selectedCities.filter(c => c.cityId !== city.cityId);
      setFilteredCities([...filteredCities]);
    } else {
      updated = [...selectedCities, city];

      if (savedIds.includes(city.cityId)) {
        const reordered = reorderBySelection(filteredCities, updated, 'cityId');
        setFilteredCities(reordered);
      } else {
        setFilteredCities([...filteredCities]);
      }
    }

    setSelectedCities(updated);
    setSelectedType(updated.length === 0 && selectedRegions.length === 0 ? null : 'regionOrCity');
    fetchPreviewWithLists(selectedRegions, updated, undefined, 'regionOrCity');
  };


  const fetchPreviewWithLists = async (regionsList: SelectedRegion[], citiesList: SelectedCity[], coords?: { latitude: number; longitude: number } | null, type?: 'nearMe' | 'regionOrCity' | null) => {

    try {
      let data: any[] = [];

      if (type === 'nearMe' && coords) { // 👈 נבדוק לפי הפרמטר, לא לפי state
        data = await shopsStore.getWalletChainNearMe(Number(walletId), coords.latitude, coords.longitude);
      } else {
        const regionIds = regionsList.map(r => r.regionId);
        const cityIds = citiesList.map(c => c.cityId);
        data = filterChainsByRegionOrCity(originalShops, regionIds, cityIds);
      }

      setPreviewData(data);
      const total = data.reduce((sum, item) => sum + (item.walletChainData?.length || 0), 0);
      setPreviewCount(total);
    } catch (err) {
      setPreviewCount(0);
      setPreviewData([]);
    }
  };



  /** קרוב אליי */
  const handleNearMeClick = async () => {
    // אם כבר נבחר - זה Reset
    if (selectedType === 'nearMe') {
      handleReset();
      return;
    }
    try {
      // לא מפעילים loader פה ❌
      // viewStore.setLoadingView(true);
      // ננסה לקבל מיקום – בלי סגירת הפופאפ
      const position = await getCurrentPosition().catch(() => null);
      // ❌ אין אישור מיקום – משאירים פופאפ פתוח
      if (!position) {
        return;
      }
      const userCoords = {
        latitude: position.latitude,
        longitude: position.longitude,
      };
      // ✔ עכשיו מפעילים loader
      viewStore.setLoadingView(true);
      // נשלח לשרת
      const data = await shopsStore.getWalletChainNearMe(
        Number(walletId),
        userCoords.latitude,
        userCoords.longitude
      );
      const filter = {
        type: 'nearMe',
        coords: userCoords,
        regions: [],
        cities: [],
        data,
      };
      // ✔ מפעילים את האנימציית סגירה
      setIsClosing(true);
      setTimeout(() => {
        shopsStore.setGeoFilter(filter);
        shopsStore.setNavigatedFromGeo(true);
        onApply(filter);
        onClose();
        viewStore.setLoadingView(false);
      }, 300); // זמן האנימציה שלך
    } catch (err) {
      viewStore.setLoadingView(false);
    }
  };

  const handleClose = () => {

    // 🔵 אם המשתמש לחץ "איפוס" ואז X → Apply Reset
    if (pendingReset) {
      shopsStore.setGeoFilter(null);
      shopsStore.setShops([...shopsStore.originalShops]);
      shopsStore.setNavigatedFromGeo(false);
      setPendingReset(false);

      setIsClosing(true);
      setTimeout(() => {
        onApply(null);
        onClose();
      }, 300);

      return;
    }

    // ❗ אחרת — סוגר בלבד, כמו היום
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };


  const handleApply = () => {

    // 🔵 אם יש איפוס בהמתנה → מפעיל Reset אמיתי
    if (pendingReset) {
      shopsStore.setGeoFilter(null);
      shopsStore.setShops([...shopsStore.originalShops]);
      shopsStore.setNavigatedFromGeo(false);
      setPendingReset(false);

      setIsClosing(true);
      setTimeout(() => {
        onApply(null);
        onClose();
      }, 300);

      return;
    }

    // 🔵 אם אין שום בחירה – זה RESET אמיתי
    const noSelection =
      selectedType === null &&
      selectedRegions.length === 0 &&
      selectedCities.length === 0;

    if (noSelection) {
      shopsStore.setGeoFilter(null);
      shopsStore.setNavigatedFromGeo(false);
      shopsStore.setShops([...shopsStore.originalShops]);

      setIsClosing(true);
      setTimeout(() => {
        onApply(null);
        onClose();
      }, 300);

      return;
    }

    // ❗ המקורי שלך
    if (!previewData || previewData.length === 0) {
      setIsClosing(true);
      setTimeout(() => onClose(), 300);
      return;
    }

    setIsClosing(true);

    const filter = {
      type: selectedType,
      coords,
      regions: selectedRegions,
      cities: selectedCities,
      data: previewData,
    };

    setSearchCity('');

    setTimeout(() => {
      shopsStore.setGeoFilter(filter);
      shopsStore.setNavigatedFromGeo(true);
      shopsStore.setShops(filter.data); // 🔵 עכשיו מעדכן UI החיצוני
      onApply(filter);
      onClose();
    }, 300);
  };





  const handleReset = () => {
    setSelectedRegions([]);
    setSelectedCities([]);
    setSearchCity('');

    setFilteredRegions(regionsOriginal);
    setFilteredCities(citiesOriginal);

    setSelectedType(null);
    setCoords(null);
    setPreviewData([]);

    // 🔵 עכשיו איפוס לא מעדכן את ה־UI החיצוני!
    // רק מסמן שיש איפוס ממתין
    setPendingReset(true);

    const total = shopsStore.originalShops.reduce(
      (sum, item) => sum + (item.walletChainData?.length || 0),
      0
    );

    setPreviewCount(total);
  };



  const reorderBySelection = (allItems, selectedList, key) => {
    const selectedIds = selectedList.map(item => item[key]);

    const selected = allItems.filter(i => selectedIds.includes(i[key]));
    const notSelected = allItems.filter(i => !selectedIds.includes(i[key]));

    return [...selected, ...notSelected];
  };



  const filterChainsByRegionOrCity = (shops: any[], selectedRegions: number[], selectedCities: number[]) => {

    if (selectedRegions.length === 0 && selectedCities.length === 0) {
      return shops; // אין סינון — נחזיר הכול
    }

    return shops
      .map(shop => {
        const filteredWalletChains = shop.walletChainData.filter(chain => {
          // אם מדובר ברשת אונליין – היא תמיד נשארת ✅
          if (chain.isWebOnline === true) {
            return true;
          }

          // המרה של שדות ה-CSV למערכים
          const chainRegions = (chain.subBranchRegions || '')
            .split(',')
            .map(r => parseInt(r.trim()))
            .filter(id => !isNaN(id));

          const chainCities = (chain.subBranchCities || '')
            .split(',')
            .map(c => parseInt(c.trim()))
            .filter(id => !isNaN(id));

          // בדיקה האם יש התאמה לאזורים או לערים
          const matchRegion = selectedRegions.some(r => chainRegions.includes(r));
          const matchCity = selectedCities.some(c => chainCities.includes(c));

          // נשמור רק אם יש התאמה (או אם אונליין כבר הוחזר)
          return matchRegion || matchCity;
        });

        // נחזיר עותק חדש של ה-shop עם רק הרשתות הרלוונטיות
        return {
          ...shop,
          walletChainData: filteredWalletChains
        };
      })
      // נסנן החוצה קטגוריות ריקות
      .filter(shop => shop.walletChainData.length > 0);
  };






  return (
    <>
      <div className="geo-overlay" onClick={handleClose} />
      <div className={`geo-popup ${isClosing ? 'closing' : ''}`}>
        <div className="geo-header">
          <div className="geo-close">
            <img onClick={handleClose} src={require('../../../assets/icons/close.svg')} alt="איקס לסגירה" />
          </div>
          <span className="geo-title">מיקום</span>
          <button className="geo-reset" onClick={handleReset}>איפוס</button>
        </div>

        <div className="geo-body">
          <div className="geo-search-box">
            <input
              type="text"
              placeholder="חיפוש לפי שם עיר או אזור בארץ"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}

            />
          </div>

          <div className="geo-scrollable">
            {/* קרוב אליי */}
            <div className="near-me-section">
              <div
                className={`geo-option ${selectedType === 'nearMe' ? 'selected' : ''}`}
                onClick={handleNearMeClick}
              >
                {selectedType === 'nearMe' && <div className="geo-bg"></div>}
                <div className="geo-option-content">
                  <img src={require('../../../assets/icons/locationIcon.svg')} alt="מיקום" />
                  <span>קרוב אליי</span>
                </div>
                {selectedType === 'nearMe' && (
                  <img
                    src={require('../../../assets/icons/check.svg')}
                    className="checkmark"
                  />
                )}
              </div>
            </div>


            {filteredRegions.length > 0 && (
              <div className="regions-and-cities-section">
                <div className="geo-subtitle">לפי איזור</div>
                {filteredRegions.map((r) => {
                  const isSelected = selectedRegions.some((sel) => sel.regionId === r.regionId);
                  return (
                    <div
                      key={r.regionId}
                      className={`geo-option ${isSelected ? 'selected' : ''}`}
                      onClick={() => toggleRegion({ regionId: r.regionId, regionName: r.regionName })}
                    >
                      {isSelected && <div className="geo-bg"></div>}
                      <span>{r.regionName}</span>
                      <img src={require('../../../assets/icons/check.svg')} className="checkmark" style={{ opacity: isSelected ? 1 : 0 }} />
                    </div>
                  );
                })}
              </div>
            )}

            {filteredCities.length > 0 && (
              <div className="regions-and-cities-section">
                <div className="geo-subtitle">לפי עיר/יישוב</div>
                <div className="geo-list">
                  {filteredCities.map((city) => {
                    const isSelected = selectedCities.some((sel) => sel.cityId === city.cityId);
                    return (
                      <div
                        key={city.cityId}
                        className={`geo-option ${isSelected ? 'selected' : ''}`}
                        onClick={() => toggleCity({ cityId: city.cityId ?? 0, cityName: city.cityName })}
                      >
                        {isSelected && <div className="geo-bg"></div>}
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

        <div className="geo-footer">
          <button className="geo-apply-btn" onClick={handleApply}>
            הצג תוצאות ({previewCount})
          </button>
        </div>
      </div>
    </>
  );
};

export default GeoLocationPopup;
