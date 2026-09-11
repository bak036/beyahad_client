// import * as React from 'react';
// import { CustomButton } from 'nofshonit-base-web-client';
// import CustomModal from '../../../CustomComponents/CustomModal';
// import BlockModalOne from './FirstBlockModal';
// import BlockModaTwo from './SecondBlockModal';
// import ProfileCardStore from '../../../../stores/ProfileCardStore';
// import rootStores from '../../../../stores';
// import { PROFILE_CARD_STORE } from '../../../../consts/stores';
// import { observer } from 'mobx-react';

// interface Props {}
// interface IState {
// 	modalOne: boolean;
// 	modalTwo: boolean;
// }
// const profileCardStore: ProfileCardStore = rootStores[PROFILE_CARD_STORE];

// @observer
// export default class BlockCard extends React.Component<Props, IState> {
// 	constructor(props) {
// 		super(props);
// 		this.state = {
// 			modalOne: false,
// 			modalTwo: false
// 		};
// 	}

// 	firstModalClicked = () => {
// 		this.setState({ modalOne: true });
// 	};
// 	onModalTwoClicked = () => {
// 		this.setState({ modalOne: false, modalTwo: true });
// 	};
// 	cancelTheSecondModal = () => {
// 		this.setState({ modalTwo: false });
// 	};
// 	cancelTheFirstModal = () => {
// 		this.setState({ modalOne: false });
// 	};
// 	onBlockCard = () => {
// 		profileCardStore.blockCard();
// 	};
// 	onReturnClicked = () => {
// 		this.setState({ modalTwo: false });
// 	};

// 	render() {
// 		return (
// 			<div className="block-card-main-container">
// 				<div className="block-btn">
// 					<CustomModal
// 						visible={this.state.modalOne}
// 						componentToRender={<BlockModalOne onModalTwoClicked={this.onModalTwoClicked} />}
// 						onCancel={this.cancelTheFirstModal}
// 					/>
// 					<CustomModal
// 						visible={this.state.modalTwo}
// 						componentToRender={<BlockModaTwo onRetuern={this.onReturnClicked} onBlock={this.onBlockCard} />}
// 						onCancel={this.cancelTheSecondModal}
// 					/>
// 					<CustomButton text={'popup'} onClick={this.firstModalClicked} />
// 				</div>
// 			</div>
// 		);
// 	}
// }
