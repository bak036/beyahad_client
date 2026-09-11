import * as React from 'react';
import { observer } from 'mobx-react';
import ViewStore from '../../../../stores/ViewStore';
import { BRANCHES_STORE, SHOPS_STORE, VIEW_STORE } from '../../../../consts/stores';
import rootStores from '../../../../stores';
import BranchesStore from '../../../../stores/BranchesStore';
import { CustomHeader, HeaderType } from 'nofshonit-base-web-client';
import ShopsStore from '../../../../stores/ShopsStore';
import * as _ from 'lodash';
import Branch from '../Branch/Branch';
import Lang from '../../../../config/Language';
import Branches from '../../../../models/Branches';
import { useEffect, useState } from 'react';
import ExternalLinkConfirm from 'src/services/ExternalLinkConfirm';
import { getCurrentPosition } from '../../../../utils/locationUtils';


interface Props { }

interface IState {
    currentWalletId: number;
    currentChainId: number;
    searchInputValue: string;
    branchesListFiltered: any[];
}

const branchesStore: BranchesStore = rootStores[BRANCHES_STORE];
const shopsStore: ShopsStore = rootStores[SHOPS_STORE];
const viewStore: ViewStore = rootStores[VIEW_STORE];
const ShopsListMain : React.FC<Props> = ({

}) => {

    const [currentWalletId, setCurrentWalletId] = useState<number>(0);
    const [currentChainId, setCurrentChainId] = useState<number>(0);
    const [searchInputValue, setSearchInputValue] = useState<string>('');
    const [branchesListFiltered, setBranchesListFiltered] = useState<any[]>([]);
    const [hasLocationPermission, setHasLocationPermission] = useState(false);


    useEffect(() => {
    const initBranches = async () => {
        viewStore.setLoadingView(true);
        const [walletID, chainId] = getParamsFromURL();
        setCurrentWalletId(walletID);
        setCurrentChainId(chainId);

        try {
            const position = await getCurrentPosition(); // בקשת מיקום מהמשתמש
            if (position && position.latitude && position.longitude) {
                setHasLocationPermission(true); // ✅ המשתמש אישר מיקום
                await branchesStore.getBranchesNearMe(walletID, chainId, position.latitude, position.longitude);
            } else {
                setHasLocationPermission(false); // לא ניתן לקבל מיקום
                await branchesStore.init(walletID, chainId);
            }
        } catch (err) {
            console.warn("לא ניתן לקבל מיקום משתמש:", err.message);
            setHasLocationPermission(false); // ✅ המשתמש סירב
            await branchesStore.init(walletID, chainId); // fallback רגיל
        }

        setBranchesListFiltered(branchesStore.branches.map(x => ({ ...x })));
        viewStore.setLoadingView(false);
    };

    initBranches();
}, []);



    const getParamsFromURL = () => {
        const numberOnlyRegex = /^[0-9]*$/;

        let walletID = 0, chainId = 0;
        const params: any = new Proxy(new URLSearchParams(window.location.search), {
            get: (searchParams, prop: string) => searchParams.get(prop),
        });
        if (params.walletId) {
            if (numberOnlyRegex.test(params.walletId)) {
                walletID = parseInt(params.walletId);
            }
        }
        if (params.chainId) {
            if (numberOnlyRegex.test(params.chainId)) {
                chainId = parseInt(params.chainId);
            }
        }
        return [walletID, chainId];
    };

    const filterBranches = (event) => {
        let arr = branchesStore.branches.map(x => { 
            const deepCopy: any = JSON.parse(JSON.stringify(x))
            return deepCopy;
         } ).filter(x => x.branchName.includes(event.target.value));
        setSearchInputValue(event.target.value) 
        setBranchesListFiltered(arr)
    }
    const walletName = _.get(branchesStore.branches[0], 'walletName', '')
    const chainName = _.get(branchesStore.branches[0], 'chainName', '');
    const webSite = _.get(branchesStore.branches[0], 'webSite', '');

    return (
        <div className={`branches-list-container ${hasLocationPermission ? 'with-distance' : 'no-distance'}`}>
            <div className={'padding-container'}>
               <div className="branches-header">
                    <div className="branches-back-btn" onClick={() => window.history.back()}>
                        <img className='arrow' src={require('../../../../assets/icons/Right-Arrow.svg')} alt="" />
                        <span>חזרה</span>
                    </div>

                    <CustomHeader type={HeaderType.Title} text={walletName} />
                </div>

                <div className='branches-details-list-root'>
                    <div className='branches-details-list'>
                       <div className="branch-website-section">
                            <div className="branch-chain-name">{chainName}</div>

                            {webSite && (
                                <div className="branch-website-row">
                                    <div className="website-top-row">
                                        <img
                                        src={require('../../../../assets/icons/Blue-WebSite-Icon.svg')}
                                        alt="Website"
                                        className="website-icon"
                                        />
                                        <span className="website-label">לאתר האינטרנט:</span>
                                    </div>

                                    <a
                                        href="#"
                                        className="website-link"
                                        onClick={(e) => {
                                        e.preventDefault();
                                        ExternalLinkConfirm.OpenLinkExternal(webSite);
                                        }}
                                    >
                                        {(() => {
                                            try {
                                                const urlObj = new URL(webSite.startsWith('http') ? webSite : 'https://' + webSite);
                                                return urlObj.hostname.replace(/^www\./, 'www.');
                                            } catch {
                                                return webSite.replace(/^https?:\/\//, '').replace(/^\/+|\/+$/g, '');
                                            }
                                        })()}
                                    </a>
                                </div>

                            )}
                        </div>

                        <div className='branches-category-chip'>
                            <span>{Lang.format('SearchBy')}:</span>
                            <input type='text' className='input-search-branches' value={searchInputValue} onChange={filterBranches} />
                            </div>
                        <div className='branch-row-header'>
                            <div className='branch-detail-header branchName-header'>{Lang.format('BranchName')}</div>
                            <div className='branch-detail-header BranchAddress-header'>{Lang.format('BranchAddress')}</div>
                            <div className='branch-detail-header branchPhone-header'>{Lang.format('BranchPhone')}</div>
                            {hasLocationPermission && (
                                <div className='branch-detail-header distance-header'>{Lang.format('Distance')}</div>
                            )}

                        </div>                            {
                            branchesListFiltered.map((branch, index) =>
                                <Branch branch={branch} key={index} showDistance={hasLocationPermission} />
                            )
                        }
                    </div>
                </div>
            </div>
        </div>);
}
export default observer(ShopsListMain)