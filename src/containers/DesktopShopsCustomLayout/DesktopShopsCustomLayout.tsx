
import * as React from 'react';
import { observer } from 'mobx-react';
import { useEffect, useMemo, useState } from 'react';
import { SHOPS_STORE, VIEW_STORE,AUTH_STORE ,WALLET_STORE} from '../../consts/stores';
import rootStores from 'src/stores';
import CustomSearch from '../../components/CustomComponents/CustomSearch/CustomSearch';
import ShopsListMain from '../../components/BeyhadComponents/ShopsList/ShopsListMain/ShopsListMain';
import ScreenUtils from '../../utils/ScreenUtils';
import { getCategoriesFromShops, getChainsFromShops } from '../../utils/shopsUtils';
import { ShopData, ChainItem, CategoryTag } from '../../models/shopTypes';
import {RoutesPath} from '../../consts/RoutesPath';
import AuthStore from '../../stores/AuthStore';
import WalletStore from '../../stores/WalletStore';
import { WalletsEnum } from '../../stores/ShopsStore';
import { SPECIAL_NAVBAR_PATHS } from "src/utils/navbarVisibilityUtils";
import Lang from '../../config/Language';
import GeoLocationPopup from '../../components/CustomComponents/GeoLocationPopup/GeoLocationPopup';


interface Props {
  renderMenu: () => JSX.Element;
  renderAllCards: () => JSX.Element[] | null;
}

const DesktopShopsCustomLayout: React.FC<Props> = ({ renderMenu, renderAllCards }) => {
  const [searchText, setSearchText] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<CategoryTag[]>([]);
  const [selectedChain, setSelectedChain] = useState<ChainItem | null>(null);

  const shopsStore = rootStores[SHOPS_STORE];
  const viewStore = rootStores[VIEW_STORE];
  const authStore: AuthStore = rootStores[AUTH_STORE];
  const walletStore: WalletStore = rootStores[WALLET_STORE];

  const [isMobile, setIsMobile] = useState(ScreenUtils.IsMobile());
  const [geoActive, setGeoActive] = useState(false);
  const [geoPopupOpen, setGeoPopupOpen] = useState(false);


  useEffect(() => {
    const handleResize = () => setIsMobile(ScreenUtils.IsMobile());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const walletId = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('walletId') || '';
  }, [location.search]);

  useEffect(() => {
    return () => {
      shopsStore.shops = []; 
    };
  }, []);

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

  useEffect(() => {
    authStore.showNavBarSearchBox = isMobile;
    authStore.showSearchIcon = !isMobile;
  }, [isMobile, authStore]);

  useEffect(() => {
    return () => {
          const removeSearchBar = SPECIAL_NAVBAR_PATHS.some(p => location.pathname.startsWith(p));
          if (!removeSearchBar) {
            authStore.showNavBarSearchBox = true;
            authStore.showSearchIcon = true;
          }
        };
  }, [window.location.pathname, authStore]);

  const shops = shopsStore.shops || [];
  const categoriesForSelector = getCategoriesFromShops(shops);
  const chainsForSelector = getChainsFromShops(shops);
  const shouldRenderMenuAndCards = walletStore.walletName && shopsStore.shops.length > 0;


  return (
    <>
          <div className="shop-list-wrapper">
            {shouldRenderMenuAndCards && (
              <>
                <div className="search-header-container">
                  <div className="search-header-inner">
                    <div className="header-row">
                        <div className="header-title-wrapper">
                            {categoriesForSelector.length > 0 && (
                              <div className="page-title">{Lang.format('searchBarTitle')}</div>
                            )}
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
                          renderMenu={renderMenu}
                          geoActive={geoActive}
                          setGeoPopupOpen={setGeoPopupOpen}
                        />

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


                      </div>
                      <div className="header-placeholder" />
                    </div>
                  </div>
                </div>

                <div className="shop-list-content-wrapper">
                <div className={`menu-container ${shopsStore.shops.length === 1 ? ' one-tag' : ''}`}>{renderMenu()}</div>
                <div className="shops-list-section">
                    <ShopsListMain
                      shops={shopsStore.shops}
                      walletName={walletStore.walletName}
                      walletId={Number(walletId)}
                      selectedCategories={selectedCategories}
                      selectedChain={selectedChain}
                      searchText={searchText}
                    />
                </div>
                </div>
              </>
            )}

          
          </div>
    </>
  );
};

export default observer(DesktopShopsCustomLayout);