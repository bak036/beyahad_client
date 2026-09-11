export interface CategoryTag {
  tagId: number;
  text: string;
}

export interface ChainItem {
  chainID: number;
  text: string;
}

export interface ChainData {
  chainID: number;
  chainName: string;
  searchKeyWords?: string;
  isWebOnline?: boolean;
  webSite?: string;
}

export interface ShopData {
  tagId?: number;
  tagName?: string;
  tagDescription?: string;
  tagImg?: string;
  walletChainData: ChainData[];
}
