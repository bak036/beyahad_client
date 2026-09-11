import * as React from 'react';
import { observer } from 'mobx-react';
import { useEffect, useState, useMemo } from 'react';
import rootStores from 'src/stores';
import { SHOPS_STORE, VIEW_STORE, WALLET_STORE } from 'src/consts/stores';
import { WalletsEnum } from 'src/stores/ShopsStore';
import CustomSearch from 'src/components/CustomComponents/CustomSearch/CustomSearch';
import ShopsListMain from 'src/components/BeyhadComponents/ShopsList/ShopsListMain/ShopsListMain';
import { getCategoriesFromShops, getChainsFromShops } from 'src/utils/shopsUtils';
import { CategoryTag, ChainItem } from 'src/models/shopTypes';
import Lang from '../../../../config/Language';
import GeoLocationPopup from '../../../../components/CustomComponents/GeoLocationPopup/GeoLocationPopup';

const ShopsListMobileContainer: React.FC = () => {
  const shopsStore = rootStores[SHOPS_STORE];
  const viewStore = rootStores[VIEW_STORE];
  const walletStore = rootStores[WALLET_STORE];

  const [searchText, setSearchText] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<CategoryTag[]>([]);
  const [selectedChain, setSelectedChain] = useState<ChainItem | null>(null);

    const [geoActive, setGeoActive] = useState(false);
    const [geoPopupOpen, setGeoPopupOpen] = useState(false);
      
    const walletId = useMemo(() => {
        const searchParams = new URLSearchParams(location.search);
        return searchParams.get('walletId') || '';
    }, [location.search]);

  useEffect(() => {
    const walletID = getWalletIDFromURL();
    const loadAllData = async () => {
      try {
        viewStore.setLoadingView(true);

        const currentWalletId = shopsStore.currentWalletId;
        const isNewWallet = currentWalletId !== walletID;

        // -----------------------------------------
        // 🟢 1) ארנק חדש – איפוס מוחלט
        // -----------------------------------------
        if (isNewWallet) {
          setGeoActive(false);
          shopsStore.setGeoFilter(null);
          shopsStore.clearGeoFilter();

          shopsStore.setNavigatedFromGeo(false);
          shopsStore.setNavigatedFromCategory(false);

          shopsStore.setCategoryFilter([]);
          setSelectedCategories([]);

          setSelectedChain(null);
        }

        // -----------------------------------------
        // 🟢 2) שחזור היסטוריה של GEO
        // -----------------------------------------
        if (!isNewWallet && shopsStore.navigatedFromGeo) {

          if (shopsStore.geoFilter?.data?.length > 0) {
            shopsStore.setShops([...shopsStore.geoFilter.data]);
            setGeoActive(true);
          }

          if (shopsStore.categoryFilter?.length > 0) {
            setSelectedCategories([...shopsStore.categoryFilter]);
          }

          shopsStore.setNavigatedFromGeo(false);
          return;
        }

        // -----------------------------------------
        // 🟢 3) שחזור היסטוריה של קטגוריות בלבד
        // -----------------------------------------
        if (!isNewWallet && shopsStore.navigatedFromCategory) {

          if (shopsStore.categoryFilter?.length > 0) {
            setSelectedCategories([...shopsStore.categoryFilter]);
          }

          shopsStore.setNavigatedFromCategory(false);
        }

        // -----------------------------------------
        // 🟢 4) אם כבר נטען – אל תטען שוב
        // -----------------------------------------
        if (!isNewWallet && shopsStore.shops?.length > 0) {
          return;
        }

        // -----------------------------------------
        // 🟢 5) טעינה ראשונה מהשרת
        // -----------------------------------------
        await walletStore.getWalletById(walletID);
        await shopsStore.init(walletID);

        shopsStore.setOriginalShops([...shopsStore.shops]);
        shopsStore.setCurrentWalletId(walletID);

      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        viewStore.setLoadingView(false);
      }
    };

    loadAllData();
  }, [window.location.search]);


  const getWalletIDFromURL = () => {
    const querySearchString = window.location.search;
    const numberOnlyRegex = /^[0-9]*$/;
    let walletID = WalletsEnum.NO_WALLET_ID;

    if (querySearchString && querySearchString.indexOf('walletId') > -1) {
      const searchParams = new URLSearchParams(querySearchString);
      const walletIdParam = searchParams.get('walletId');
      if (walletIdParam && numberOnlyRegex.test(walletIdParam)) {
        walletID = parseInt(walletIdParam);
      }
    }

    return walletID;
  };


  const shops = shopsStore.shops || [];
  const walletName = walletStore.walletName || 'הארנק שלי';

  const categoriesForSelector = getCategoriesFromShops(shops);
  const chainsForSelector = getChainsFromShops(shops);

  if (!walletStore.walletName) return null;

  return (
    <div className="shop-list-mobile-wrapper">
      <div className="mobile-title-wrapper">
        <div className="page-title">{Lang.format('searchBarTitle')}</div>
      </div>

      <div className="header-search-wrapper">
        <CustomSearch
          searchText={searchText}
          setSearchText={setSearchText}
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          selectedChain={selectedChain}
          setSelectedChain={setSelectedChain}
          categories={categoriesForSelector}
          chains={chainsForSelector}
          geoActive={geoActive}
          setGeoPopupOpen={setGeoPopupOpen}
        />
      </div>

      {geoPopupOpen && (
        <GeoLocationPopup
          onClose={() => setGeoPopupOpen(false)}
          onApply={(filter) => {
            // --- לא נבחר כלום / איפוס ---
            if (!filter?.data || !Array.isArray(filter.data) || filter.data.length === 0) {
              const isRealGeoReset = filter === null;
              setGeoActive(false);
              shopsStore.setGeoFilter(null);
              shopsStore.clearGeoFilter();
              shopsStore.setShops([...shopsStore.originalShops]);

              if (!isRealGeoReset) {
                  shopsStore.setCategoryFilter([]);
                  setSelectedCategories([]);
              }

              return setGeoPopupOpen(false);
            }

            // --- יש תוצאות GEO ---
            setGeoActive(true);
            shopsStore.setGeoFilter(filter);
            shopsStore.setShops(filter.data);

            // ניקוי קטגוריות שלא קיימות יותר
            const newCategories = getCategoriesFromShops(filter.data);

            const cleanedSelected = selectedCategories.filter(cat =>
              newCategories.some(c => c.tagId === cat.tagId)
            );

            if (cleanedSelected.length === 0) {
              // בחר קטגוריה שנעלמה – חזרה ל"הכל"
              shopsStore.setCategoryFilter([]);
              setSelectedCategories([]);
            } else {
              shopsStore.setCategoryFilter(cleanedSelected);
              setSelectedCategories(cleanedSelected);
            }

            setGeoPopupOpen(false);
          }}
          savedFilter={shopsStore.geoFilter}
          originalShops={shopsStore.originalShops}
        />
      )}

      <ShopsListMain
        shops={shops}
        walletId={Number(walletId)}
        walletName={walletName}
        selectedCategories={selectedCategories}
        selectedChain={selectedChain}
        searchText={searchText}
      />
    </div>
  );
};

export default observer(ShopsListMobileContainer);
