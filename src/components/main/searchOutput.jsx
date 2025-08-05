import image1 from '../assets/Group 1171274267.svg';
import arrowBtn from '../assets/icons8-шеврон-вправо-90 1.svg';
import '../styles/searchOutput.scss'; 
import imageCaption2nd from '../assets/70067dc7cc9cb2a3c692147221ee4d3bf37b0270.png';
import { useContext, useEffect, useRef, useState } from 'react'; 
import { useNavigate } from 'react-router-dom';  
import loaderIcon from '../assets/icons8-спиннер,-кадр-5-100 1.svg'
import axios from 'axios';
import { authorizeContext } from '../context/authorizeContext';
export default function SearchOutput() {
    let navigate = useNavigate(); 
    let {token} = useContext(authorizeContext);
    let [tableLoading, setTableLoading] = useState(false)
    let containerRef = useRef(null);
    let [isDragging, setIsDragging] = useState(false);
    let [startX, setStartX] = useState(0);
    let [scrollLeft, setScrollLeft] = useState(10); 
    let [documentsIds, setDocumentsIds] =  useState(() => {
        let rawData = localStorage.getItem('documentsIdArray');
        if (rawData) {
            let data = JSON.parse(rawData)
            return data
        } else {
            return []
        }
    });  
    let [loadedChunksIndex, setLoadedChunksIndex] = useState(0);
    let [visibleDocs, setVisibleDocs] = useState([]); // 10, 20, ...
    let [allDocs, setAllDocs] = useState([]); 
    let [dateArr, setDateArr] = useState([]);  
    let scrollAmount = 300

    let handleMouseDown = (e) => {
        setIsDragging(true);
        setStartX(e.pageX - containerRef.current.offsetLeft);
        setScrollLeft(containerRef.current.scrollLeft);
    }; 
    let handleMouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault(); // чтобы не выделялся текст
        const x = e.pageX - containerRef.current.offsetLeft;
        const walk = (x - startX) * 1.5; // коэффициент скорости
        containerRef.current.scrollLeft = scrollLeft - walk;
    }; 
    let handleMouseUp = () => {
        setIsDragging(false);
    };  
    let handleMouseLeave = () => {
        setIsDragging(false);
    };
    let handleScrollLeft = () => {
        if (containerRef.current) {
            containerRef.current.scrollBy({
            left: -scrollAmount,
            behavior: 'smooth',
            });
        }
    }; 
    const handleScrollRight = () => {
        if (containerRef.current) {
            containerRef.current.scrollBy({
                left: scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    let sliceArrFunc = () => { 
        let chunkSize = 100;
        let start = loadedChunksIndex * chunkSize;
        let end = Math.min(start + chunkSize, documentsIds.length); // не выходить за границы
        const slice = documentsIds.slice(start, end);
        setLoadedChunksIndex(prev => prev + 1);
        return slice; 
    }
    let loadDocuments = async (idsToLoad) => {   
        if (!idsToLoad.length) return;  
        try {
            let res = await axios.post('https://gateway.scan-interfax.ru/api/v1/documents', {
                ids: idsToLoad
            }, {
                headers: {
                    Accept: 'application/json',
                    "Content-Type": 'application/json',
                    Authorization: `Bearer ${token.accessToken}`
                }
            }); 
            let newDocs = res.data
                .filter(item => item.ok)
                .map(item => item.ok); 
            setAllDocs(prev => {
                let existingIds = new Set(prev.map(doc => doc.id));
                let filtered = newDocs.filter(doc => !existingIds.has(doc.id));
                return [...prev, ...filtered];
              });   
        } catch (error) {
            console.error("Ошибка при загрузке документов:", error);
        }
    }
    let cleanXmlPreservePTags = (xmlString) => { 
        let clean = xmlString.replace(/&lt;img[^&]*\/&gt;/gi, '');
 
        clean = clean
            .replace(/<\/?(?!p\b)[^>]+>/g, '') 
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .trim();
 
        let firstPIndex = clean.indexOf('<p');
        if (firstPIndex > 0) {
            let beforeFirstP = clean.slice(0, firstPIndex).trim();
            let afterFirstP = clean.slice(firstPIndex);

            if (beforeFirstP) {
                clean = `<p>${beforeFirstP}</p>\n` + afterFirstP;
            }
        } 
        clean = clean.replace(/<img[^>]*\/?>/gi, '');

        return clean;
    };
    let wordEnding = (documentsCount) => {
        let n = Math.abs(documentsCount) % 100;
        let lastDigit = n % 10; 
        if (n >= 11 && n <= 14) {
            return '';
        } else if (lastDigit === 1) {
            return 'о';
        } else if (lastDigit >= 2 && lastDigit <= 4) {
            return 'а';
        } else {
            return '';
        }
    }   
    let badgeContent = (content) => {
        if(content.isTechNews === true) {
            return <div className="category-badge">Технические новости</div>
        } else if (content.isAnnouncement === true) {
            return <div className="category-badge">Анонсы и события</div>
        } else if (content.isDigest === true) {
            return <div className="category-badge">Сводки новостей</div>
        } else {
            return <div className='empty-badge'> </div>
        }
    }  
    let checkDateArrLength = (num) => {
        if (num === 1) {
            return ''
        } else if (num > 4 || num === 0) {
            return 'ов'
        } else {
            return 'а'
        }
    }

    let handleClick = () => { 
        let nextIndex = visibleDocs.length;
        let nextTen = allDocs.slice(nextIndex, nextIndex + 10);

        if (nextTen.length) { 
            let existingIds = new Set(visibleDocs.map(doc => doc.id));
            let filtered = nextTen.filter(doc => !existingIds.has(doc.id));
            setVisibleDocs(prev => [...prev, ...filtered]);
        } else { 
            let newChunk = sliceArrFunc();
            if (newChunk.length) {
                loadDocuments(newChunk);
            }
        }

    } 
    useEffect(() => {
        let fetchData = async () => { 
            try {
                setTableLoading(true)
                    let rawData = localStorage.getItem('searchOutput');  
                    if (rawData) {
                        let dataObject = JSON.parse(rawData); 
                        let totalDocuments = dataObject.data.find(item => item.histogramType === "totalDocuments").data;
                        let riskFactors = dataObject.data.find(item => item.histogramType === "riskFactors").data;
                        let risksMap = new Map(
                            riskFactors.map(item => [item.date, item.value])
                        ); 
                        let result = totalDocuments.map(item => {
                            let [year, month, day] = item.date.split('T')[0].split('-');
                            return {
                                date: `${day}.${month}.${year}`,
                                general: item.value,
                                risks: risksMap.get(item.date) ?? 0
                            };
                        });  
                        if (documentsIds.length > 0) {
                            if (documentsIds.length <= 100) { 
                                setLoadedChunksIndex(1);
                                loadDocuments(documentsIds);
                            } else { 
                                const targetCount = Math.ceil(documentsIds.length * 0.2);
                                const initialLoadCount = Math.min(targetCount, 100);
                                const initialChunk = documentsIds.slice(0, initialLoadCount);
                                setLoadedChunksIndex(1);
                                loadDocuments(initialChunk);
                            } 
                            setDateArr(result); 
                        } else {
                            navigate('/search')
                        }
                    }  
            } catch (error) {
                console.log(error)
            } finally {
                setTableLoading(false)
            }  
        } 
        fetchData()  
    }, [])  
    useEffect(() => {
        if (visibleDocs.length === 0 && allDocs.length > 0) {
            setVisibleDocs(allDocs.slice(0, 2));
        } 
    }, [allDocs]);  
    let allDocumentsRendered = allDocs.length >= documentsIds.length && visibleDocs.length >= allDocs.length;
    return (
        <>
            <main className="search-output-page">
                <section className="result-container">
                    <div className="info-container">
                        <div className="text-column">
                            <h1 className="title">Ищем. Скоро <br />будут результаты</h1>
                            <div className="subtitle">Поиск может занять некоторое время, просим сохранять терпение.</div>
                        </div>
                        <img src={image1} alt="Изображение рядом с блоком" />
                    </div>
                    <div className="documents-table-container">
                        <div className="text-container">
                            <h2 className="title">Общая сводка</h2>
                            <div className="subtitle">Найдено {dateArr.length} вариант{checkDateArrLength(dateArr.length)}</div> 
                        </div>
                        <div className="table-container">
                            <div className="prev-btn" onClick={handleScrollLeft}><img src={arrowBtn} alt="" /></div>
                            <div className="table">
                                <div className="line-headers">
                                    <h4 className="period-title">Период</h4>
                                    <h4 className="general-title">Всего</h4>
                                    <h4 className="risks-title">Риски</h4>
                                </div>
                                <div className="items-container" ref={containerRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseLeave}>
                                    {
                                        tableLoading ? 
                                            <div className="loader-container">
                                                <img className='loader-img' src={loaderIcon} alt="Иконка загрузки" />
                                                <div className="loader-description">Загружаем данные</div>
                                            </div>
                                        :
                                            (  
                                                dateArr.map((item, id) => 
                                                    <div className="result-item" key={id}>
                                                        <div className="period">{item.date}</div>
                                                        <div className="general">{item.general}</div>
                                                        <div className="risks">{item.risks}</div>
                                                    </div> 
                                                ) 
                                            )
                                    }
                                </div>
                            </div>
                            <div className="next-btn"  onClick={handleScrollRight}><img src={arrowBtn} alt="" /></div>
                        </div>
                    </div>
                </section>
                <section className="documents-container">
                        <h2 className="container-title">Список документов</h2>
                        <div className="documents-list"> 
                            { 
                                visibleDocs.map((doc, i) => ( 
                                    <article className="document-item" key={i}>
                                        <div className="header-row-container">
                                            <div className="date">{new Date(doc.issueDate).toLocaleDateString()}</div>
                                            <div className="source">{doc.source.name}</div>
                                        </div>
                                        <div className="body-container">
                                            <h3 className="title">{doc.title.text}</h3>
                                            {badgeContent(doc.attributes)} 
                                            <img src={imageCaption2nd} alt="" className='document-image' />
                                            <div className="description"  dangerouslySetInnerHTML={{ __html: cleanXmlPreservePTags(doc.content.markup) }}></div>
                                        </div>
                                        <div className="footer-container">
                                            <a href={doc.url} className='document-link'>Читать в источнике</a>
                                            <div className="word-count">{doc.attributes.wordCount} слов{wordEnding(doc.attributes.wordCount)}</div>
                                        </div>
                                    </article>  
                                )) 
                            }  
                        </div>
                        { 
                            !allDocumentsRendered ? (
                                <button type="button" onClick={handleClick} className='load-btn'> 
                                    Показать больше
                                </button>
                            ) : ''
                        }
                        
                </section>
            </main>
        </>
    )
}
