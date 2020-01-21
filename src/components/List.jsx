import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { getMoreStories, getRecentStories } from '../store/storiesSlice';

const useInfiniteScroll = (callback) => {
    const [isFetching, setIsFetching] = useState(false);

    useEffect(() => {
        function handleScroll() {

            if (isFetching || window.innerHeight + document.documentElement.scrollTop < document.documentElement.offsetHeight - 1) return;
            setIsFetching(true);
        }

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isFetching]);

    useEffect(() => {
        if (!isFetching) return;
        console.log('CAllback')
        callback();
        setIsFetching(false)
    }, [isFetching, callback]);



    return [isFetching, setIsFetching];
};

const List = () => {
    const dispatch = useDispatch()
    const { stories } = useSelector((state) => state.stories)
    const [isFetching, setIsFetching] = useInfiniteScroll(fetchLatestNews);


    function fetchLatestNews() {
        dispatch(getMoreStories())
    }

    useEffect(() => {
        dispatch(getRecentStories())
    }, [dispatch])

    return (
        <>
            <ul>
                {stories.map((story) => <li key={story.id} >{story.title}</li>)}
            </ul>
            {isFetching && 'Fetching more list items...'}
        </>
    );
};

export default List;