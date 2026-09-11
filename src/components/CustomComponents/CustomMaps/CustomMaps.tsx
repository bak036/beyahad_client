import * as React from 'react';
import { CustomMediaQuery } from '../CustomMediaQuery/CustomMediaQuery';

interface Props {
	categoryName?: string;
	altitude?: number;
	latitude?: number;
	width?: string;
	height?: string;
	scrolling?: string;
}
interface IState {}

// const { BaseLayer } = LayersControl;

const MapContainer : React.FC<Props> = ({
	categoryName,
	altitude,
	latitude,
	width,
	height,
	scrolling
}) => {

	const catergoryAltitude = altitude ? altitude : undefined;
	const catergorylatitude = latitude ? latitude : undefined;
	return (
		<div style={{ height: '200px', width: '100%' }}>
			<div className="mapouter">
				<div className="gmap_canvas">
					{catergoryAltitude &&
					catergorylatitude && (
						<>
						<CustomMediaQuery.Desktop>
								{/* Dont change the height over 199px it changes the business logic we need for the info window */}
							<iframe
						width="100%"
									height='199'
						src={`https://maps.google.com/maps?q=${catergorylatitude},
						${catergoryAltitude}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
						scrolling="no"
						/>
						</CustomMediaQuery.Desktop>
						
						<CustomMediaQuery.Mobile>
								{/* Dont change the height over 199px it changes the business logic we need for the info window */}
							<iframe
						width="100%"
									height='199'
						src={`https://maps.google.com/maps?q=${catergorylatitude},
						${catergoryAltitude}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
						scrolling="no"
						/>
						</CustomMediaQuery.Mobile>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
export default MapContainer;
