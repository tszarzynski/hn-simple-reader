import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { getMoreStories, getRecentStories } from '../store/storiesSlice';
import Story from './Story'
import Stories from './Stories'
import MoreStories from './MoreStories';
import Error from './Error';

const List = () => {
    const dispatch = useDispatch()
    const { stored, isFetching, error } = useSelector((state) => state.stories)

    useEffect(() => {

        function handleScroll() {
            if (isFetching || window.innerHeight + document.documentElement.scrollTop < document.documentElement.offsetHeight * 0.85) return;
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
            {error && (<Error errorMsg={error}></Error>)}
            {stored.map(story => <Story key={story.id} story={story} />)}
            {isFetching && (<MoreStories></MoreStories>)}
        </Stories>
    );
};

export default List;