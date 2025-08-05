 import image from '../assets/Characters.svg'
import googleIcon from '../assets/Group 1171274227.svg';
import facebookIcon from '../assets/Vector (3).svg';
import yandexIcon from '../assets/Group 1171274228.svg';
import lockImg from '../assets/Group 1171274237.svg'
import '../styles/authorize.scss'; 
import {  useContext, useState    } from "react";   
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { authorizeContext } from '../context/authorizeContext';

export default function Authorize () { 
    let [login, setLogin] = useState('');
    let [password, setPassword] = useState('');
    let [error, setError] = useState({
        login: '',
        password: ''
    });
    let { loginFunction} = useContext(authorizeContext)
    let navigate = useNavigate()
    let isFormValid = login && password.length >= 6;
    let handleLoginChange = e => {
        let input = e.target.value;
        let isPhone = /^\+?\d/.test(input);
        if (isPhone) {
            let digits = input.replace(/\D/g, '').slice(0, 11);                // только цифры
            let formatted = formatPhoneRU(digits);
            
            setLogin(formatted);
                setError(prev => ({
                    ...prev,
                    login: digits.length < 11 ? 'Неверный номер телефона' : ''
                }));
            } else {
                let cleaned = sanitizeLogin(input).slice(0, 18);
                setLogin(cleaned);
                setError(prev => ({
                    ...prev,
                    login:
                    cleaned.length === 0
                        ? 'Логин не может быть пустым'
                        : /^[a-zA-Z]/.test(cleaned)
                        ? ''
                        : 'Логин должен начинаться с буквы',
                }));
            }
    };
    let handlePasswordChange = e => setPassword(e.target.value); 

    let formatPhoneRU = (rawDigits) => {
        if (!rawDigits) return ''; 
        if (rawDigits.startsWith('8')) rawDigits = rawDigits.slice(1);
        if (rawDigits.startsWith('7')) rawDigits = rawDigits.slice(1);

        let blocks = [3, 3, 2, 2];   // группы цифр
        let i = 0;
        let formatted = '+7 ';

        for (const len of blocks) {
            const part = rawDigits.slice(i, i + len);
            if (!part) break;
            formatted += part + ' ';
            i += len;
        }

        return formatted.trim();
    };
    let sanitizeLogin = (value) =>
    value
        .replace(/[^a-zA-Z0-9-_]/g, '')  
        .replace(/^(\d+)/, '');

    let handleSubmit = async (e) => {
        e.preventDefault()
        try {
            let res = await axios.post('https://gateway.scan-interfax.ru/api/v1/account/login', {
                login, password
            });
            loginFunction(res.data);
            console.log(res.data);
            navigate('/')

        } catch (err) {
            alert('Неправильный логин или пароль! Ошибка : ', err)
        }
 
    }
    return ( 
        <> 
            <main className="authorize-page">
                <div className="authorize-container">
                    <div className="info-container">
                        <h1 className="title">Для оформления подписки <br />на тариф, необходимо авторизоваться.</h1>
                        <img src={image} alt="" className="img-container" />
                    </div>
                    <form action="" className="authorize-form" onSubmit={handleSubmit}>
                        <div className="authorize-types">
                            <button className="log-in active" type="button">Войти</button>
                            <button className="sign-up" type="button" disabled>Зарегистрироваться</button>
                        </div>
                        <div className="inputs-container">
                            <div className={`first-input`}>
                                <label htmlFor="first">Логин или номер телефона:</label> 
                                    <input
                                        id="first"  
                                        value={login}
                                        type='tel'
                                        onChange={handleLoginChange} 
                                        className={error.login ? 'invalid' : ''}  
                                    /> 
                                {error.login ? <span className="validate-error">{error.login}</span> : ''}
                            </div>
                            <div className={`second-input`}>
                                <label htmlFor="second">Пароль:</label>
                                <input type="password" id="second" className={error.password ? 'invalid' : ''} value={password}  maxLength={20} onChange={handlePasswordChange} />
                                {error.password ? <span className="validate-error">{error.password}</span> : ''}
                            </div>
                        </div>
                        <div className="authorize-btn-container">
                            <button className="authorize-btn" disabled={!isFormValid}  type="submit">Войти</button>
                            <a href=" " onClick={(e) => {
                                e.preventDefault();
                                loginFunction();
                            }} className="authorize-password-btn">Восстановить пароль</a>
                        </div>
                        <div className="authorize-through-sites">
                            <div className="title">Войти через:</div>
                            <div className="sites-container">
                                <div className="item google"><img src={googleIcon} alt="" /></div>
                                <div className="item facebook"><img src={facebookIcon} alt="" /></div>
                                <div className="item yandex"><img src={yandexIcon} alt="" /></div>
                            </div>
                        </div>
                        <img src={lockImg} className="lock-icon" alt="" />
                    </form> 
                </div>
            </main> 
        </>
    )
} 