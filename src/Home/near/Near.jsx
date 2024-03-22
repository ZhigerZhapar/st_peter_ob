import React, {useEffect, useState} from 'react';
import cl from "./near.module.css"
import arrowLeft from "./arrow-left.svg"
import home from "./home.svg"
import { Link } from "react-router-dom";
import main1 from './img/pic.svg'
import main2 from './img/pic3.svg'
import main3 from './img/pic4.svg'
import main4 from './img/main4.svg'
import main5 from './img/pic5.svg'
import main6 from './img/pic6.svg'
import main7 from './img/pic7.svg'
import main8 from './img/pic8.svg'
import yellow_like from '../../Home/categoryPage/imgs/main/section__publications/icons/yellow_heart.svg'
import Footer from '../../components/Footer';
import axios from "axios";
import {resetButton, setButtonPressed, setButtons} from "../../features/buttonSlide.js";
import {useDispatch, useSelector} from "react-redux";
import {useFetch} from "../../components/hooks/useFetchB.js";
import yellow_heart from "../categoryPage/imgs/main/section__publications/icons/yellow_heart.svg";
import heart from "../page2/img/food/heart.svg";
import {useFetchPupsik} from "../../components/hooks/useFetchPupsik.js";
const Near = () => {
    const [data, setData] = useState({});
    const dispatch = useDispatch();
    const { buttons } = useSelector(state => state.button);
    const [allData, setAllData] = useState([]);
    const [cardsToShow, setCardsToShow] = useState(8);

    const [fetching, isDataLoading, dataError] = useFetch(async () => {
        const response = await axios.get(
            `https://places-test-api.danya.tech/api/getNearPlaces?uid=${window?.Telegram?.WebApp?.initDataUnsafe?.user?.id}`
        );
        setData(response.data || {});
        return response;
    });

    useEffect(() => {
        fetching();
    }, []);
    console.log(data?.posts)

    const loadMoreCards = () => {
        const remainingPosts = data?.posts?.length - cardsToShow;
        const postsToAdd = remainingPosts > 8 ? 8 : remainingPosts; // Максимум загружаем 8 постов

        setCardsToShow(prev => prev + postsToAdd);
    };

    const renderCards = data?.posts?.slice(0, cardsToShow) || [];


    const [datas, setDatas] = useState({});



    const [fetchingPupsik, isDataLoadingPupsik, errorPupsik] = useFetchPupsik(async () => {
        const response = await axios.get(
            `https://places-test-api.danya.tech/api/getUser?uid=${window?.Telegram?.WebApp?.initDataUnsafe?.user?.id}`
        );
        console.log(response)
        setDatas(response.data || {});
        return response;
    });

    useEffect(() => {
        fetchingPupsik();
    }, []);

    const handleButtonClick = async (buttonId, postId) => {
        try {
            if (!buttonId || !postId) {
                console.error("Invalid buttonId or postId");
                return;
            }

            const response = await axios.get(
                `https://places-test-api.danya.tech/api/like?uid=${window?.Telegram?.WebApp?.initDataUnsafe?.user?.id}&postId=${postId}`
            );

            if (response.data.success) {
                const newDatas = { ...datas };
                const likedPosts = newDatas.user?.liked || [];

                // Проверяем, есть ли уже лайк у данного поста
                const existingIndex = likedPosts.findIndex(item => item.id === postId);
                if (existingIndex !== -1) {
                    // Удалить лайк, если он уже есть
                    likedPosts.splice(existingIndex, 1);
                } else {
                    // Добавить лайк, если его нет
                    likedPosts.push({ id: postId });
                }

                // Обновить состояние лайков в datas
                newDatas.user.liked = likedPosts;

                // Обновить состояние datas
                setDatas(newDatas);
            } else {
                console.error("Failed to toggle like status");
            }
        } catch (error) {
            console.error("Error during API request:", error);
        }
    };

    useEffect(() => {
        if (data && data.length > 0) {
            const uniqueData = data.filter((newPost) => {
                return !allData.some((existingPost) => existingPost.id === newPost.id);
            });

            setAllData((prevData) => [...prevData, ...uniqueData]);
        }
    }, [data]);

    return (
        <div>
                <header className={cl.header}>
                <Link to="/">
                    <div className={`${cl.header__container} ${cl._container}`}>
                        <a href="#" className={cl.header__icon}>
                            <img src={arrowLeft} alt="" />
                        </a>
                        <a href="#" className={cl.header__icon}>
                            <img src={home} alt="" />
                        </a>
                    </div>
                </Link>
            </header>

            <div className={cl.main}>
                <div className={cl.title}>
                    Рядом с вами
                </div>

                <div className={cl.nearPlace}>
                    Чтобы приложение подсказало ближайшие места рядом с вами, поделитесь геолокацией с ботом в чате. <a href="https://telegra.ph/Kak-podelitsya-geopoziciej-s-prilozheniem-03-17" target="_blank"  style={{ color: 'red' }}>Смотри как это сделать тут</a>
                </div>


            <div className={cl.cards}>
                {renderCards.map((post, index) => (
                    <div className={cl.card} key={post.id}>
                        <Link to={`/Near/previewPage/${post.id}?categoryId=${post?.category?.id}`}>
                            <img src={`https://places-test-api.danya.tech${post?.images[0]?.url}`} alt="" className={cl.asd}/>
                        </Link>
                        <button onClick={() => handleButtonClick(post.id, post.id)} className={cl.mainLike}>
                            <img className={cl.img__button} src={(datas?.user?.liked || []).some(item => item.id === post.id) ? yellow_heart : heart} alt=""/>
                        </button>
                        <div className={cl.position}>
                            {(Number(post?.distance) / 1000).toFixed(1)} км
                        </div>
                        <div className={cl.mainMatin}>
                            <p className={cl.mainText}>{
                                post?.subcategory?.title
                                ? post?.subcategory?.title
                                : post?.category?.title
                            }</p>
                            <p className={cl.mainSub}>{post?.title}</p>
                        </div>
                    </div>
                ))}
            </div>
                {cardsToShow < (data?.posts?.length || 0) && (
                <button onClick={loadMoreCards} className={cl.but}>
                    ПОКАЗАТЬ ВСЕ
                </button>
            )}
            </div>
            <Footer/>
        </div>
    );

}

export default Near;
