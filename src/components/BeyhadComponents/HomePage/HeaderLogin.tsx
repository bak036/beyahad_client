import * as React from 'react';
import { Link, Route } from 'react-router-dom';
import { RoutesPath } from 'src/consts/RoutesPath';

interface Props {

}
interface IState {

}

const HeaderLogin : React.FC<Props> = ({
}) => {
    return (		
    <Route>
        <div className='header-login-container'>
            <div className='title-header-container'>
                <p className='title-header'>ברוכים הבאים</p>
                <p className='second-title-header'>למועדון ההטבות</p>
            </div>
            <div className='logo-header-container'>
                <Link to={window.location.pathname.includes(RoutesPath.mint.registration) || window.location.pathname.includes(RoutesPath.login.registration) || window.location.pathname.includes(RoutesPath.login.updatePasswordFromRegistration) || window.location.pathname.includes(RoutesPath.login.updatePasswordFromForgotPassword) ? window.location.pathname : RoutesPath.root}>
                    <span className='logo-one'>
                        <img src={require('../../../assets/logo-1-copy.png')} alt="logo" />
                    </span>
                    <span className='logo-two'>
                        <img src={require('../../../assets/2.png')} alt="logo" />
                    </span>
                </Link>
            </div>
        </div>
    </Route>
    )
}
export default HeaderLogin;
