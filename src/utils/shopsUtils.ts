import { WalletsEnum } from '../stores/ShopsStore';
import { ChainItem, ShopData, CategoryTag } from '../models/shopTypes';
import * as _ from 'lodash';

export const getFilteredShops = (
  shops: ShopData[],
  selectedCategories: CategoryTag[],
  selectedChain: ChainItem | null,
  searchText: string
): ShopData[] => {
  return shops
    .filter(
      (shop) =>
        selectedCategories.length === 0 ||
        selectedCategories.some((c) => c.tagId === shop.tagId)
    )
    .map((shop) => {
      let filteredWalletChainData = [...shop.walletChainData];

      if (selectedChain) {
        filteredWalletChainData = filteredWalletChainData.filter(
          (chain) =>
            chain.chainID === selectedChain.chainID ||
            chain.chainName?.includes(selectedChain.text)
        );
      }

      if (searchText) {
        const lowerSearch = searchText.toLowerCase();
        filteredWalletChainData = filteredWalletChainData.filter(
          (chain) =>
            chain.chainName?.toLowerCase().includes(lowerSearch) ||
            shop.tagName?.toLowerCase().includes(lowerSearch) ||
            chain.searchKeyWords?.toLowerCase().includes(lowerSearch)
        );
      }

      return {
        ...shop,
        walletChainData: filteredWalletChainData,
      };
    })
    .filter(
      (shop) => shop.walletChainData && shop.walletChainData.length > 0
    );
};

export const getCategoriesFromShops = (shops: ShopData[]): CategoryTag[] => {
  return shops.map((c) => ({
    tagId: c.tagId ?? -1,
    text: c.tagName ?? '',
  }));
};

export const getChainsFromShops = (shops: ShopData[]): ChainItem[] => {
  return Array.from(
    new Map<number, ChainItem>(
      shops
        .reduce<ChainItem[]>((acc, shop) => {
          const chains: ChainItem[] = (shop.walletChainData || []).map((chain): ChainItem => ({
            chainID: chain.chainID,
            text: chain.chainName,
          }));
          return acc.concat(chains);
        }, [])
        .map((chain) => [chain.chainID, chain])
    ).values()
  );
};
