import '../styles/main.scss'
import {  useContext, useState } from "react"
import firstImagePage from '../assets/2398 1.png'
import image1 from '../assets/Mask group (1).svg'
import image2 from '../assets/Mask group (2).svg'
import image3 from '../assets/Mask group (3).svg'
import arrow from '../assets/icons8-шеврон-вправо-90 1.svg';
import bottomImage from '../assets/Group 14.svg'
import icon1 from '../assets/Group 1171274215.svg'
import icon2 from '../assets/Group 1171274216.svg';
import icon3 from '../assets/Group 1171274214.svg'
import check from '../assets/icons8-галочка-96 1.svg' 
import { authorizeContext } from "../context/authorizeContext";
import { Link } from 'react-router-dom'
export default function MainNode ( ) { 
    let {isAuthorized} = useContext(authorizeContext)
    let itemsArr = [
        {
            text: 'Высокая и оперативная скорость обработки заявки',
            imageSrc : image1
        }, {
            text: 'Огромная комплексная база данных, обеспечивающая объективный ответ на запрос',
            imageSrc: image2
        }, {
            text: 'Защита конфеденциальных сведений, не подлежащих разглашению по федеральному законодательству',
            imageSrc: image3
        }
    ];
    let [items,setItems] = useState(itemsArr)
    let handleClick = (value) => {
        setItems((prevItems) => {
            if (value === "prev") {
                return [prevItems[prevItems.length - 1], ...prevItems.slice(0, prevItems.length - 1)];
            } else {
                return [...prevItems.slice(1), prevItems[0]];
            }
        });
    }
    let cards = [
        {
            title: 'Beginner',
            subtitle: 'Для небольшого исследования',
            price: '1 200 ₽',
            salePrice: '799 ₽',
            credit: '150 ₽',
            ratePlan: [
                'Безлимитная история запросов',
                'Безопасная сделка',
                'Поддержка 24/7'
            ],
            imageUrl: icon1, 
        }, {
            title: 'Pro',
            subtitle: 'Для HR и фрилансеров',
            price: '2 600 ₽',
            salePrice: '1 299 ₽',
            credit: '279 ₽',
            ratePlan: [
                'Все пункты тарифа Beginner',
                'Экспорт истории',
                'Рекомендации по приоритетам'
            ],
            imageUrl: icon2
        }, {
            title: 'Business',
            subtitle: 'Для корпоративных клиентов',
            price: '3 700 ₽',
            salePrice: '2 379 ₽', 
            ratePlan: [
                'Все пункты тарифа Pro',
                'Безлимитное количество запросов',
                'Приоритетная поддержка'
            ],
            imageUrl: icon3
        }, 
    ] 
    return (
        <>
            <main className="main-page"> 
                <section className="description-container">
                    <div className="container">
                        <div className="text-container">
                            <h1 className="title">сервис по поиску публикаций <br />о компании <br />по его ИНН</h1>
                            <p className="description">Комплексный анализ публикаций, получение данных в формате PDF на электронную почту.</p>
                        </div>
                        {isAuthorized && ( 
                            <Link href={`/search`}>
                                <button className="get-info-btn">Запросить данные</button>
                            </Link>
                        )}
                    </div>
                    <div className="img-container">
                        <img src={firstImagePage} alt="" />
                    </div>
                </section>
                <section className="slider-container">
                    <h1 className="title">Почему именно мы</h1>
                    <div className="slider">
                        <div className="prev-btn" onClick={() => handleClick('prev')}>
                            <img src={arrow} alt="" />
                        </div>
                        <div className="items-container">
                            {
                                items.map((item, index) => {
                                    return ( 
                                        <div className="item" key={index}>
                                            <div>
                                                <img src={item.imageSrc} alt="" className="item-icon" />
                                                <h3 className="item-text">{item.text}</h3>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                        <div className="next-btn" onClick={() => handleClick('next')}>
                            <img src={arrow} alt="" />
                        </div>
                    </div>
                    <div className="slider-container__img">
                        <img src={bottomImage} className="" alt="" />
                    </div>
                </section> 
                <section className="pricing-container">
                    <h1 className="title">наши тарифы</h1>
                    <div className="cards-container">
                        {cards.map((card, index) => {
                            return (
                                <div className="card" key={index}>
                                    <div className="card-header">
                                        <div>
                                            <div className="card-header__title">{card.title}</div>
                                            <div className="card-header__subtitle">{card.subtitle}</div>
                                        </div>
                                        <img src={card.imageUrl} alt="" />
                                    </div>
                                    <div className="card-body">
                                        <div className="price-container">
                                            <div>
                                                <div className="sale-price">{card.salePrice}</div>
                                                <div className="price">{card.price}</div>
                                            </div> 
                                            {card.credit && <div className="credit-price">или {card.credit}/мес. при рассрочке на 24 мес.</div>}
                                            {!card.credit && <div className="credit-price"> </div>}
                                        </div>
                                        <div className="rate-plan-container">
                                            <h3 className="subtitle">В тариф входит: </h3>
                                            <div className="container">
                                                {card.ratePlan.map((item, index) => <div className="rate-plan__item" key={index}>
                                                    <img src={check} alt="" /> <div className="item-text">{item}</div>
                                                </div>)}
                                            </div>
                                        </div>
                                        <div className="btn-container">
                                            <button className="btn-container__btn">Подробнее</button>
                                        </div> 
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </section> 
            </main>
        </> 
    )
}