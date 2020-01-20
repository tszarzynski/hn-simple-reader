import React, { useEffect, useState } from 'react';

const useInfiniteScroll = (callback, forceCallback = false) => {
    const [isFetching, setIsFetching] = useState(forceCallback);

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
    const [listItems, setListItems] = useState([]);
    const [isFetching, setIsFetching] = useInfiniteScroll(fetchLatestNews, false);


    function fetchLatestNews() {
        fetch('https://hacker-news.firebaseio.com/v0/jobstories.json')
            .then(response => response.json())
            .then((data) => {
                data.forEach((newsId) => {
                    fetch(` https://hacker-news.firebaseio.com/v0/item/${newsId}.json`)
                        .then(response => response.json())
                        .then((itemDetail) => {

                            setListItems(prevState => ([...prevState, itemDetail]))
                        })
                });

                setIsFetching(false);
            })
    }

    return (
        <>
            <ul className="list-group mb-2">
                {listItems.map((post, i) => <li key={post.id} className="list-group-item">{post.title}</li>)}
            </ul>
            {isFetching && 'Fetching more list items...'}
        </>
    );
};

export default List;