import * as React from 'react';
import Lang from "../../../../config/Language";

const CustomerService : React.FC = () => {
    return (
        <div className={"customer-service-container"}>
            <div className={"customer-padding"}>
                <span className={"customer-service-row customer-service-text"}>
                {Lang.format("ContactCustomerPhoneNumber")}</span>

                <span className={"customer-service-row customer-service-text"}>
                {Lang.format("ContactCustomerServiceTime")}</span>

                <span className={"customer-service-row customer-service-text customer-service-times"}>
                {Lang.format("ContactCustomerServiceTime1")}</span>

                <span className={"customer-service-row customer-service-text customer-service-times"}>
                {Lang.format("ContactCustomerServiceTime2")}</span>
            </div>
        </div>
    )
}
export default CustomerService;