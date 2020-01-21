import { createSlice } from '@reduxjs/toolkit';
import api from '../services';

const POSTS_ON_UPDATE = 50;

const storiesSlice = createSlice({
    name: 'stories',
    initialState: {
        ids: [],
        stories: [],
        isFetching: false,
    },
    reducers: {
        fetchingStart(state, action) {
            state.isFetching = true;
        },
        fetchingStop(state, action) {
            state.isFetching = false;
        },
        fetchRecentStoryIdsSuccess(state, action) {
            const { ids } = action.payload
            state.ids = state.ids.concat(ids);
        },

        fetchStoryByIdsSuccess(state, action) {
            const { stories } = action.payload
            state.stories = state.stories.concat(stories);
        },
    }
})

export const { fetchingStart, fetchingStop, fetchRecentStoryIdsSuccess, fetchStoryByIdsSuccess } = storiesSlice.actions

export default storiesSlice.reducer

export const fetchRecentStoryIds = () => async dispatch => {
    try {
        dispatch(fetchingStart())
        const response = await api.fetch('/newstories.json', {})
        const ids = await response.json()
        dispatch(fetchRecentStoryIdsSuccess({ ids }))
        dispatch(fetchingStop())
    } catch (error) {
        dispatch(fetchingStop())
        console.log(error)
    }
}

export const fetchStoryByIds = (ids) => async dispatch => {
    try {
        dispatch(fetchingStart())

        const requests = ids.map(id => api.fetch(`/item/${id}.json`, {}));
        const responses = await Promise.all(requests);
        const stories = await Promise.all(responses.map(response => response.json()))

        dispatch(fetchStoryByIdsSuccess({ stories }))
        dispatch(fetchingStop())
    } catch (error) {
        dispatch(fetchingStop())
        console.log(error)
    }
}


export const getRecentStories = () => async (dispatch, getState) => {
    return dispatch(fetchRecentStoryIds())
        .then(() => {
            const storyIds = getState().stories.ids;
            return dispatch(fetchStoryByIds(storyIds.slice(0, POSTS_ON_UPDATE)))
        })
}

export const getMoreStories = () => async (dispatch, getState) => {
    const state = getState();

    try {
        const storyIds = state.stories.ids;
        const storedStories = state.stories.stories;
        const lastStory = storedStories[storedStories.length - 1];

        if (storedStories.length > 0 && lastStory.id === 0) {
            console.log('mo more left')
        } else if (storedStories.length < storyIds.length) {
            const rangeFrom = storedStories.length;
            const rangeTo = storedStories.length + POSTS_ON_UPDATE;

            dispatch(fetchingStart())
            dispatch(fetchStoryByIds(storyIds.slice(rangeFrom, rangeTo)))
            dispatch(fetchingStop())
        } else {
            console.log('fettch bext')
        }
    } catch (error) {
        console.log(error)
    }
}