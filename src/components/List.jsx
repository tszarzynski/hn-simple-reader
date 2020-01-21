import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { getMoreStories, getRecentStories } from '../store/storiesSlice';
import Story from './Story'
import Stories from './Stories'
import MoreStories from './MoreStories';

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

    }, [isFetching, callback]);



    return [isFetching, setIsFetching];
};

const List = () => {
    const dispatch = useDispatch()
    const { stored, isFetching } = useSelector((state) => state.stories)

    useEffect(() => {

        function handleScroll() {
            console.log('scroll')
            if (isFetching || window.innerHeight + document.documentElement.scrollTop < document.documentElement.offsetHeight - 1) return;
            dispatch(getMoreStories())
        }

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [dispatch, isFetching]);


    useEffect(() => {
        dispatch(getRecentStories())
    }, [dispatch])


    return (
        <Stories>
            {stored.map(story => <Story key={story.id} story={story} />)}
            {isFetching && (<MoreStories></MoreStories>)}
        </Stories>
    );
};

export default List;