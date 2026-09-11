import * as React from 'react';
import MediaQuery from 'react-responsive';

export const mobileMaxWidth = '1025px';
const desktopQueryString = `(min-width: ${mobileMaxWidth})`
const mobileQueryString = `(max-width: ${mobileMaxWidth})`

export namespace CustomMediaQuery {
	export class Desktop extends React.Component {
		render() {
			return (
				<MediaQuery query={desktopQueryString}>
					{this.props.children}
				</MediaQuery>
			)
		}
	}
	export class Mobile extends React.Component {
		render() {
			return (
				<MediaQuery query={mobileQueryString}>
					{this.props.children}
				</MediaQuery>
			)
		}
	}
}