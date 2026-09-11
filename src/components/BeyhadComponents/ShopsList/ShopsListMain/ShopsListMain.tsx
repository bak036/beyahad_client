import * as React from 'react';
import { observer } from 'mobx-react';
import { Link } from 'react-router-dom';
import Shop from '../Shop/Shop';
import ExternalLinkConfirm from 'src/services/ExternalLinkConfirm';
import { RoutesPath } from 'src/consts/RoutesPath';
import { CustomButton } from 'nofshonit-base-web-client';
import { CustomMediaQuery } from 'src/components/CustomComponents/CustomMediaQuery/CustomMediaQuery';
import { useMemo } from 'react';
import { getFilteredShops } from 'src/utils/shopsUtils';
import rootStores from 'src/stores';
import { SHOPS_STORE } from 'src/consts/stores';

interface ChainData {
  chainID: number;
  chainName: string;
  searchKeyWords?: string;
  isWebOnline?: boolean;
  webSite?: string;
  walletID?: number;
}

interface ShopData {
  tagId?: number;
  tagName?: string;
  tagDescription?: string;
  tagImg?: string;
  walletChainData: ChainData[];
}

interface CategoryTag {
  tagId: number;
  text: string;
}

interface ChainItem {
  chainID: number;
  text: string;
}

interface Props {
  shops?: ShopData[];
  walletId: number;
  walletName: string;
  selectedCategories: CategoryTag[];
  selectedChain: ChainItem | null;
  searchText: string;
}

const ShopsListMain: React.FC<Props> = ({
  shops = [],
  walletId,
  walletName,
  selectedCategories,
  selectedChain,
  searchText
}) => {
  
  const shopsStore = rootStores[SHOPS_STORE];


  const filteredShops = useMemo(() => {
    return getFilteredShops(shops, selectedCategories, selectedChain, searchText);
  }, [shops, selectedCategories, selectedChain, searchText]);

  const renderedShops = useMemo(() => {
    return filteredShops.reduce<React.ReactNode[]>((acc, shop) => {
      const headerElement = (
        <div className="shops-category-chip" key={`chip-${shop.tagId}`}>
          {shop.tagImg && (
            <img src={shop.tagImg} alt={shop.tagName} className="tag-image" />
          )}
          <span>{shop.tagName}</span>
          <span className="description">{shop.tagDescription}</span>
        </div>
      );

      const bodyElement = (
        <div className="shops-body" key={`body-${shop.tagId}`}>
          {shop.walletChainData.map((chain) => {
            const isExternal = chain.isWebOnline && chain.webSite;
            const linkProps = isExternal
              ? {
                  to: '#',
                  onClick: (e: React.MouseEvent) => {
                    e.preventDefault();
                    ExternalLinkConfirm.OpenLinkExternal(chain.webSite!);
                  },
                }
              : {
                  to: `${RoutesPath.card.branchesList}?walletId=${walletId}&chainId=${chain.chainID}`,
                };

            return (
              <div key={chain.chainID} className="shop-card">
                <div className="shop-icon-border">
                  <Shop shop={chain} />
                </div>
                <div className="shop-details">
                  <div className="shop-name">{chain.chainName}</div>
                  <div className="link-branches">
                    <Link
                    {...linkProps}
                      onClick={(e) => {
                        if (linkProps.to && !chain.isWebOnline) {
                            shopsStore.setCategoryFilter(selectedCategories);
                            // 🌟 אם יש GEO פעיל
                            if (shopsStore.geoFilter) {
                              shopsStore.setNavigatedFromGeo(true);
                            }

                            // 🌟 אם המסנן הפעיל הוא קטגוריות בלבד
                            if (!shopsStore.geoFilter && selectedCategories.length > 0) {
                              shopsStore.setNavigatedFromCategory(true);
                            }
                        }
                        if (linkProps.onClick) linkProps.onClick(e);
                      }}
                    >
                    {isExternal ? 'לאתר האינטרנט' : 'לרשימת הסניפים'}
                  </Link>

                  </div>
                </div>
              </div>
            );
          })}
        </div>
      );

      acc.push(headerElement, bodyElement);
      return acc;
    }, []);
  }, [filteredShops, walletId]);

  const printPage = () => {
    window.print();
  };

  return (
    <div className="shops-list-container">
      
        <div className="shops-list-main-title">
          <span className="title-text">{walletName}</span>
          <CustomMediaQuery.Desktop>
            <CustomButton
              onClick={printPage}
              text="הדפסה"
              buttonClassName="print-shops"
            />
          </CustomMediaQuery.Desktop>
        </div>
        <div>{renderedShops}</div>
    </div>
  );
};

export default observer(ShopsListMain);
