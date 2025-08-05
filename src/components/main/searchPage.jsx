import '../styles/search.scss';
import AirDatepicker from "air-datepicker";
import {useState, useRef, useEffect, useMemo, useContext } from "react";
import "air-datepicker/air-datepicker.css";
import firstFolder from '../assets/Document.svg';
import secondFolder from '../assets/Folders.svg';
import lastImg from '../assets/Group 1171274244.svg'
import axios from "axios";
import { authorizeContext } from "../context/authorizeContext";
import { useNavigate } from "react-router-dom"; 
export default function SearchPage () { 
    function formatInn(digits) {
        const groups = digits.length > 10 ? [4, 6, 2] : [4, 5, 1];

        let idx = 0;
        return groups
            .map(len => digits.slice(idx, (idx += len)))
            .filter(Boolean)
            .join(' ');
    } 
    function control(digits, weights) {
        let sum = 0;
        for (let i = 0; i < weights.length; i++) {
            sum += +digits[i] * weights[i];
        }
        return (sum % 11) % 10;
    } 
    function isInnValid(digits) {
        if (digits.length === 10) {
            return +digits[9] === control(digits, [2, 4, 10, 3, 5, 9, 4, 6, 8]);
        }

        if (digits.length === 12) {
            const ok11 = +digits[10] === control(digits, [7, 2, 4, 10, 3, 5, 9, 4, 6, 8]);
            const ok12 = +digits[11] === control(digits, [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8]);
            return ok11 && ok12;
        }

        return false;
    }
    const dpMinRef = useRef(null);
    const dpMaxRef = useRef(null);
    useEffect(() => {
        if (!dpMinRef.current || !dpMaxRef.current) return;

        let dpMin, dpMax;

        dpMin = new AirDatepicker(dpMinRef.current, {
            autoClose: true, 
            isMobile: true, 
            maxDate: new Date(),
            onSelect({ date }) {
                dpMax.update({ minDate: date });

                // Записываем в state дату начала
                setInputsValue(prev => ({
                    ...prev,
                    dateRange: {
                        ...prev.dateRange,
                        dateStart: date ? date.toISOString().split('T')[0] : ''
                    }
                }));
            }
        });

        dpMax = new AirDatepicker(dpMaxRef.current, {
            autoClose: true,
            isMobile: true,
            maxDate: new Date(),
            onSelect({ date }) {
                dpMin.update({ maxDate: date });
                setInputsValue(prev => ({
                    ...prev,
                    dateRange: {
                        ...prev.dateRange,
                        dateEnd: date ? date.toISOString().split('T')[0] : ''
                    }
                }));
            },
        });

        // Отключаем возможность ручного ввода
        dpMinRef.current.setAttribute("readonly", "true");
        dpMaxRef.current.setAttribute("readonly", "true");

        return () => {
            dpMin.destroy();
            dpMax.destroy();
        };
    }, []);
    let {token, limitsInfo} = useContext(authorizeContext);
    let navigate = useNavigate();
    let [error, setError] = useState({
        inn: ''
    }) ; 
    let [inputsValue, setInputsValue] = useState({
        inn: '',
        tonality: 'any',
        documentsCount: '',
        dateRange: {
            dateStart: '',
            dateEnd: ''
        }
    });
    let isCompanyLimits = useMemo(() => {
        if (limitsInfo.usedCompanyCount === 0 && limitsInfo.companyLimit === 0) {
            return false
        } else {
            return true
        }
    }, [limitsInfo] )
    let isFormValid = useMemo(() => {
        const innRaw = inputsValue.inn.replace(/\D/g, '');
        const docsCount = Number(inputsValue.documentsCount);
        return (
            (innRaw.length === 10 || innRaw.length === 12) &&
            !error.inn &&
            !!inputsValue.tonality &&
            docsCount > 0 && docsCount <= 1000 &&
            inputsValue.dateRange.dateStart &&
            inputsValue.dateRange.dateEnd
        );
    }, [inputsValue, error]);
    let handleInnChange = (e) => { 
        let raw = e.target.value.replace(/\D/g, '').slice(0, 12);  
        let formatted = formatInn(raw); 
        if (raw.length !== 10 && raw.length !== 12) {
            setError(prev => ({ ...prev, inn: 'ИНН должен содержать 10 или 12 цифр' }));
        } else if (!isInnValid(raw)) {
            setError(prev => ({ ...prev, inn: 'Неверный ИНН' }));
        } else {
            setError(prev => ({ ...prev, inn: '' }));
        } 
        setInputsValue(prev => ({
            ...prev, 
            inn: formatted
        }));
    }
    let handleDocsCountChange = (e) => {
        let value = e.target.value.replace(/\D/g, ""); 
        if (value === "") {
            setInputsValue((prev) => ({
            ...prev,
            documentsCount: "",
            }));
            return;
        } 
        const number = Number(value); 
        if (number >= 1 && number <= 1000) {
            setInputsValue((prev) => ({
                ...prev,
                documentsCount: number,
            }));
        }
    };
     
    let handleSubmit = async (e) => {
        e.preventDefault();
        let dateStart = inputsValue.dateRange.dateStart;
        let dateEnd = inputsValue.dateRange.dateEnd;
        let sliceDate = (date) => {
            if (date.includes('-')) return date;
            const [day, month, year] = date.split('.');
            return `${year}-${month}-${day}`;
        }; 
        try {
            let dateRes = await axios.post('https://gateway.scan-interfax.ru/api/v1/objectsearch/histograms', {
                
                "issueDateInterval": {
                    "startDate":`${sliceDate(dateStart)}T00:00:00+03:00`,
                    "endDate": `${sliceDate(dateEnd)}T23:59:59+03:00`
                },
                "searchContext": {
                    "targetSearchEntitiesContext": {
                    "targetSearchEntities": [
                        {
                        "type": "company",
                        "sparkId": null,
                        "entityId": null,
                        "inn": `${inputsValue.inn.replace(/\D/g, '')}`,
                        "maxFullness": true,
                        "inBusinessNews": null
                        }
                    ],
                    "onlyMainRole": true,
                    "tonality": `${inputsValue.tonality}`,
                    "onlyWithRiskFactors": false,
                    "riskFactors": {
                        "and": [],
                        "or": [],
                        "not": []
                    },
                    "themes": {
                        "and": [],
                        "or": [],
                        "not": []
                    }
                    },
                    "themesFilter": {
                        "and": [],
                        "or": [],
                        "not": []
                    }
                },
                "searchArea": {
                    "includedSources": [],
                    "excludedSources": [],
                    "includedSourceGroups": [],
                    "excludedSourceGroups": []
                },
                "attributeFilters": {
                    "excludeTechNews": true,
                    "excludeAnnouncements": true,
                    "excludeDigests": true
                },
                "similarMode": "duplicates",
                "limit": +inputsValue.documentsCount,
                "sortType": "sourceInfluence",
                "sortDirectionType": "desc",
                "intervalType": "month",
                "histogramTypes": [
                    "totalDocuments",
                    "riskFactors"
                ], 
            }, {
                headers: { 
                    Accept: 'application/json',
                    "Content-Type": 'application/json',
                    Authorization: `Bearer ${token.accessToken}`
                }
            })
            localStorage.setItem('searchOutput', JSON.stringify(dateRes.data)) 
           
        } catch (error) {
            console.log(error);
        } 
        try {
            let documentsRes = await axios.post('https://gateway.scan-interfax.ru/api/v1/objectsearch', {
                "issueDateInterval": {
                    "startDate":`${sliceDate(dateStart)}T00:00:00+03:00`,
                    "endDate": `${sliceDate(dateEnd)}T23:59:59+03:00`
                },
                "searchContext": {
                    "targetSearchEntitiesContext": {
                    "targetSearchEntities": [
                        {
                        "type": "company",
                        "sparkId": null,
                        "entityId": null,
                        "inn": `${inputsValue.inn.replace(/\D/g, '')}`,
                        "maxFullness": true,
                        "inBusinessNews": null
                        }
                    ],
                    "onlyMainRole": true,
                    "tonality": `${inputsValue.tonality}`,
                    "onlyWithRiskFactors": false,
                    "riskFactors": {
                        "and": [],
                        "or": [],
                        "not": []
                    },
                    "themes": {
                        "and": [],
                        "or": [],
                        "not": []
                    }
                    },
                    "themesFilter": {
                        "and": [],
                        "or": [],
                        "not": []
                    }
                },
                "searchArea": {
                    "includedSources": [],
                    "excludedSources": [],
                    "includedSourceGroups": [],
                    "excludedSourceGroups": []
                },
                "attributeFilters": {
                    "excludeTechNews": true,
                    "excludeAnnouncements": true,
                    "excludeDigests": true
                },
                "similarMode": "duplicates",
                "limit": +inputsValue.documentsCount,
                "sortType": "sourceInfluence",
                "sortDirectionType": "desc",
                "intervalType": "month",
                "histogramTypes": [
                    "totalDocuments",
                    "riskFactors"
                ], 
            }, {
                headers: { 
                    Accept: 'application/json',
                    "Content-Type": 'application/json',
                    Authorization: `Bearer ${token.accessToken}`
                }
            });
            let dataArr = documentsRes.data.items.map(item => item.encodedId);  
            localStorage.setItem('documentsIdArray', JSON.stringify(dataArr)); 
            await navigate('/result')   
        } catch (error) {
            console.log(error);
        } 
    };

    return (
        <> 
            <main className="search-page">
                <div className="container">
                    <div className="text-container">
                        <div className="text-items">
                            <div className="title">
                                Найдите необходимые данные в пару кликов.
                            </div>
                            <div className="description">
                                Задайте параметры поиска. <br />
                                Чем больше заполните, тем точнее поиск
                            </div>
                        </div>
                        <div className="folders-icon-container">
                            <img src={firstFolder} alt="" className="first-folder-img" />
                            <img src={secondFolder} alt="" className="second-folder-img" /> 
                        </div>
                    </div>
                    <div className="form-items">
                        <form className="form-container" onSubmit={handleSubmit} >
                            <div className="left-column-container">
                                <div className={`input-container ${error.inn ? 'invalid' : ''}`}>
                                    <label htmlFor="inn">ИНН компании<span className="validation">*</span></label>
                                    <input type="text" id="inn" value={inputsValue.inn}  placeholder="10 цифр" onChange={handleInnChange}/>
                                    {error.inn ? <span className="validation-error-span">{error.inn}</span>: ''}
                                </div>
                                <div className="input-container">
                                    <label htmlFor="tonality">Тональность</label>
                                    <select name="" id="tonality" onChange={(e) => {
                                        setInputsValue((prev) => ({
                                            ...prev, 
                                            tonality: e.target.value
                                        })) 
                                    }} value={inputsValue.tonality}>
                                        <option value="any" selected>Любая</option>
                                        <option value="negative">Негативная</option>
                                        <option value="positive">Позитивная</option>
                                    </select>
                                </div>
                                <div className={`input-container ${error.documentsCount ? 'invalid' : ''}`}>
                                    <label htmlFor="documents-count">Количество документов в выдаче<span className="validation">*</span></label>
                                    <input type="text" id={"documents-count"} value={inputsValue.documentsCount} onChange={handleDocsCountChange} placeholder="От 1 до 1000"  />
                                    {error.documentsCount ? <span className="validation-error-span">{error.documentsCount}</span> : ''}
                                </div>
                                <div className={`input-container ${error.dateRange ? 'invalid' : ''} range-container`}>
                                    <label htmlFor="range">Диапазон поиска<span className="validation">*</span></label>
                                    <div>
                                        <input type="text" name="start" ref={dpMinRef} id="range" onChange={(e) => setInputsValue(prev => ({...prev, dateRange: {...prev.dateRange, dateStart: e.target.value}}))} placeholder="Дата начала"/>
                                        <input type="text" name="end" ref={dpMaxRef} id="end-range" onChange={(e) => setInputsValue(prev => ({...prev, dateRange: {...prev.dateRange, dateEnd: e.target.value}}))}   placeholder="Дата конца" />   
                                    </div>
                                    {error.dateRange ? <span className="validation-error-span">{error.dateRange}</span> : ''}
                                </div>

                            </div>
                            <div className="right-column-container">
                                <div className="checkbox-container">
                                    <div className="checkbox">
                                        <input type="checkbox" id="completeness" />
                                        <label htmlFor="completeness">Признак максимальной полноты</label>
                                    </div>
                                    <div className="checkbox">
                                        <input type="checkbox" id="mentions" />
                                        <label htmlFor="mentions">Упоминания в бизнес-контексте</label>
                                    </div>
                                    <div className="checkbox">
                                        <input type="checkbox" id="role" />
                                        <label htmlFor="role">Главная роль в публикации</label>
                                    </div>
                                    <div className="checkbox">
                                        <input type="checkbox" id="risk-factors" />
                                        <label htmlFor="risk-factors">Публикации только с риск-факторами</label>
                                    </div>
                                    <div className="checkbox">
                                        <input type="checkbox" id="markets-tech-news" />
                                        <label htmlFor="">Включать технические новости рынков</label>
                                    </div>
                                    <div className="checkbox">
                                        <input type="checkbox" id="announcements-and-calendars" />
                                        <label htmlFor="announcements-and-calendars">Включать анонсы и календари</label>
                                    </div>
                                    <div className="checkbox">
                                        <input type="checkbox" id="news-summaries" />
                                        <label htmlFor="news-summaries">Включать сводки новостей</label>
                                    </div>
                                </div>
                                <div className="btn-container">
                                    <div>
                                        <button className="submit-btn" type="submit" disabled={!isFormValid && isCompanyLimits} >Поиск</button>
                                        <p className="required-inputs">* Обязательные к заполнению поля</p>
                                    </div>
                                </div>

                            </div>
                        </form> 
                        <img src={lastImg} alt="" className="last-img" />
                    </div>
                </div> 
            </main> 
        </>
    )
}