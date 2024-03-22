import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import yellow_heart from './../Home/categoryPage/imgs/main/section__publications/icons/yellow_heart.svg';
import heart from './../Home/page2/img/food/heart.svg';
import { useDispatch, useSelector } from 'react-redux';
import useFetch from './hooks/useFetch.js';
import cl from './../Home/page2/page2.module.css';
import Loader from "./UI/Loader/Loader.jsx";
import axios from "axios";
import { setSelectedSubcategory } from "../actions.js";
import { useFetchPupsik } from "./hooks/useFetchPupsik.js";

const SortedPosts = ({ fId, categoryId, categoryTitle }) => {
    const [localData, setLocalData] = useState([]);
    const [loadedPostsCount, setLoadedPostsCount] = useState(8); // Количество загруженных постов
    const dispatch = useDispatch();
    const selectedSubsubcategory = useSelector(state => state.title.subsubcategory);
    const { data, loading, error } = useFetch(
        `https://places-test-api.danya.tech/api/categories/${fId}?populate=posts,posts.images,posts.category,posts.subcategory,posts.subsubcategory`
    );
    const selectedSubcategory = useSelector(state => state.title.selectedSubcategory);
    const [datas, setDatas] = useState({});
    const [filterData, setFilterData] = useState([]);

    // Получаем параметры фильтрации из localStorage
    useEffect(() => {
        const savedSubcategory = JSON.parse(localStorage.getItem('selectedSubcategory'));
        if (savedSubcategory !== undefined) {
            dispatch(setSelectedSubcategory(savedSubcategory));
        }
    }, [dispatch]);

    // Сохраняем параметры фильтрации в localStorage при изменении
    useEffect(() => {
        localStorage.setItem('selectedSubcategory', JSON.stringify(selectedSubcategory));
    }, [selectedSubcategory]);

    useEffect(() => {
        if (!loading && !error && data && data.attributes && data.attributes.posts && data.attributes.posts.data) {
            console.log("SortedPosts - Data received:", data);
            // Проверяем, что данные соответствуют текущей категории (fId)
            if (data.id === categoryId) {
                setLocalData(data.attributes.posts.data || []);
            }
        }
    }, [data, loading, error, categoryId, fId]);


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

                const existingIndex = likedPosts.findIndex(item => item.id === postId);
                if (existingIndex !== -1) {
                    likedPosts.splice(existingIndex, 1);
                } else {
                    likedPosts.push({ id: postId });
                }

                newDatas.user.liked = likedPosts;
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
                return !localData.some((existingPost) => existingPost.id === newPost.id);
            });

            setLocalData((prevData) => [...prevData, ...uniqueData]);
        }
    }, [data]);

    // Применяем фильтры к данным после их загрузки
    useEffect(() => {
        let filteredData = localData;

        if (selectedSubcategory !== null) {
            filteredData = filteredData.filter(post => post.attributes.subcategory?.data?.id === selectedSubcategory);
        }

        if (selectedSubsubcategory !== null) {
            filteredData = filteredData.filter(post => {
                const postSubsubcategoryIds = Array.isArray(post.attributes.subsubcategory?.data)
                    ? post.attributes.subsubcategory.data.map(subsubcategory => subsubcategory.id)
                    : [];
                return postSubsubcategoryIds.includes(selectedSubsubcategory) || post.attributes.subsubcategory?.data?.id === selectedSubsubcategory;
            });
        }

        // Устанавливаем loadedPostsCount в 8 после фильтрации данных
        setLoadedPostsCount(8);
        setFilterData(filteredData);
    }, [localData, selectedSubcategory, selectedSubsubcategory]);

    const loadMorePosts = () => {
        setLoadedPostsCount(prevCount => prevCount + 8); // Увеличиваем количество загруженных постов на 8
    };

    return (
        <div className={`${cl.food__bottom} ${cl._container}`}>
            {loading ? (
                <div className={cl.loaderContainer}>
                    <Loader />
                </div>
            ) : (
                <div className={`${cl.food__row}`}>
                    {filterData.slice(0, loadedPostsCount).map((post) => (
                        <div className={`${cl.food__column}`} key={post.id}>
                            <div>
                                <Link to={`/page2/previewPage/${post.id}?categoryId=${fId}`}>
                                    <img className={cl.kaban} src={`https://places-test-api.danya.tech${post.attributes.images.data[0].attributes.url}`} alt="" />
                                </Link>
                            </div>
                            <button onClick={() => handleButtonClick(post.id, post.id)} className={`${cl.main_like}`}>
                                <img src={(datas?.user?.liked || []).some(item => item.id === post.id) ? yellow_heart : heart} alt="" />
                            </button>
                            <div className="food__content">
                                <h2 className={`${cl.food__name}`}>
                                    {post?.attributes?.subsubcategory?.data?.attributes?.title
                                        ? post?.attributes?.subsubcategory?.data?.attributes?.title
                                        : post?.attributes?.subcategory?.data?.attributes?.title
                                            ? post?.attributes?.subcategory?.data?.attributes?.title
                                            : post?.attributes?.category?.data?.attributes?.title
                                    }
                                </h2>
                                <p className={`${cl.food__position}`}>{post.attributes.title}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {localData.length > loadedPostsCount && filterData.length > loadedPostsCount && (
                // Если еще есть посты для загрузки, показываем кнопку "Загрузить еще"
                <button className={cl.sintolkaban} onClick={loadMorePosts}>Загрузить еще</button>
            )}

        </div>
    );
};

export default SortedPosts;
