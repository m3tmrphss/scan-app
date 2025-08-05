import { useContext, useEffect, useRef, useState } from "react";
import logo from '../assets/SGN_09_24_2022_1663968217400 1.png' ;
import adaptiveLogo from '../assets/eqw 1.png';
import userIcon from '../assets/Mask group.png' ;
import loaderIcon from '../assets/icons8-спиннер,-кадр-5-100 1.svg'
import '../styles/header.scss';
import '../styles/footer.scss';
import { authorizeContext } from "../context/authorizeContext";
import axios from "axios";
import { Link } from "react-router-dom";
export default function HeaderNode() {  
    let headerRef = useRef() 
    let adaptiveBtnRef = useRef();
    let headerLinksRef = useRef(); 
    let [isActive, setIsActive] = useState(false); 
    let {token, isAuthorized, logoutFunction, limitsInfo, handleChangeData} = useContext(authorizeContext); 
    let [loading, setLoading] = useState(false); 

    useEffect(() => { 
        let body = document.querySelector('body')
        if (isActive) { 
            body.classList.add('no-scroll')
        } else { 
            body.classList.remove('no-scroll')
        }
    }, [isActive]);
    useEffect(() => { 
        if (isAuthorized) {
            headerRef.current.classList.add('logged-in')
        } else {
            headerRef.current.classList.remove('logged-in')
        } 
    }, [isAuthorized])
    useEffect(() => { 
        let fetchData = async () => {
            try {
                setLoading(true)
                if (token) {
                    let res = await axios.get('https://gateway.scan-interfax.ru/api/v1/account/info', {
                        headers : {
                            Accept: 'application/json',
                            "Content-Type": 'application/json',
                            Authorization: `Bearer ${token.accessToken}`
                        }
                    })  
                    let data = res.data.eventFiltersInfo; 
                    handleChangeData(data.usedCompanyCount, data.companyLimit) 
                } 
            } catch (error) {
                console.log(error)
            } finally {
                setLoading(false)
            }
        }
        fetchData() ; 
    }, [token])   
    return (
        <header>
            <div className="header" ref={headerRef}>
                <Link className="page-title"  to="/">
                    <img src={!isActive ? logo : adaptiveLogo} alt="Лого сайта"/>
                </Link>
                <div className={`adaptive-container ${!isActive ? 'd-none' : ''}`} ref={headerLinksRef}>
                    <nav className="navbar" >
                        <Link to="/" className="nav-link">Главная</Link>
                        <a href=" " className="nav-link">Тарифы</a>
                        <a href=" " className="nav-link">FAQ</a>
                    </nav>
                    <div className="user-container">
                        {
                            isAuthorized ? (
                                <div className="authorization-user">
                                    <div className="account-info">
                                        {
                                            loading ? (
                                                <>
                                                    <img src={loaderIcon} alt="Иконка загрузки" className="loader-img" />
                                                </>
                                            ) : (
                                                <> 
                                                    <div className="used-companies limit-item"><h3>Использовано компаний</h3><div className="number1">{limitsInfo.usedCompanyCount}</div> </div>
                                                    <div className="company-limit limit-item"><h3>Лимит по компаниям</h3><div className="number2">{limitsInfo.companyLimit}</div></div>
                                                </>
                                            )
                                        }
                                        </div>
                                    <div className="account-menu">
                                        <div className="text-container">
                                            <div className="user-name">Алексей А.</div>
                                            <a href=" " onClick={  () => logoutFunction()} className="exit-btn">Выйти</a>
                                        </div>
                                        <div className="img-container">
                                            <img src={userIcon} alt="" />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="authorization-links">
                                    <a className="sign-up-link" href='# '>Зарегистрироваться</a> 
                                    <div className="vector"></div>
                                    <Link to={`/authorize`} className="log-in-link">Войти</Link>
                                </div>
                            )
                        }
                    </div>
                </div> 
                <div className={`adaptive-button ${isActive ? 'active-icon' : ''}`} onClick={() => setIsActive(!isActive)}ref={adaptiveBtnRef}> 
                </div>

            </div>
        </header>
    )
}