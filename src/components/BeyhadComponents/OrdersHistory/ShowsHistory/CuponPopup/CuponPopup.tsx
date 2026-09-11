import * as moment from 'moment';
//import { CustomBarcode } from 'nofshonit-base-web-client';
import Barcode from 'react-barcode';
import { format } from 'path';
import * as React from 'react';
import { CONFIGURATION_STORE } from 'src/consts/stores';
import Order from 'src/models/Order';
import rootStores from 'src/stores';
import ConfigurationStore from 'src/stores/ConfigurationStore';
interface Props {
    isMobile: boolean;
    categoryName?: string;
    variantName?: string;
    digitalCodeType? : number;
    cardNumber?: string;
    lastImplementationDate? :Date;
}

interface IState {

}
const configurationStore: ConfigurationStore = rootStores[CONFIGURATION_STORE];
const CuponPopup: React.FC<Props> = ({
    isMobile,
    categoryName,
    variantName,
    digitalCodeType,
    cardNumber,
    lastImplementationDate
}) => {
    const urlQRCode = isMobile ?`${configurationStore.getConfiguration.QRCodeMobile}${cardNumber}`:`${configurationStore.getConfiguration.QRCodeDesktop}${cardNumber}`
    const expireDate = moment(lastImplementationDate).format("DD/MM/YYYY")
    return <div className='popup'>
        <span className='text-color'>
            {categoryName}
        </span>
        <br/>
        <span className='text-color'>
            {variantName}
        </span>
        <br/>
        <br/>
        <span>
            לסריקה:
        </span>
        <br/>
        <br/>
        {digitalCodeType == 2 &&
        <div>
            <div>
                <img alt='Barcode Generator TEC-IT' src={urlQRCode} />
            </div>
            <span>{cardNumber}</span>
            </div>}
        {digitalCodeType == 1 && <div >
            <Barcode value={cardNumber || ''} />
        </div>}
        <br/>
        <br/>
        <span className='text-color'>ניתן למימוש עד: {expireDate}</span>
    </div>;
}
export default CuponPopup;