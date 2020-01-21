import { createSlice } from '@reduxjs/toolkit';
import api from '../services';

const MAX_ITEMS_TO_LOAD = 50;

const storiesSlice = createSlice({
    name: 'stories',
    initialState: {
        ids: [],
        stored: [],
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
            const { storyIds } = action.payload
            state.ids = state.ids.concat(storyIds);
        },

        fetchStoryByIdsSuccess(state, action) {
            const { stories } = action.payload
            state.stored = state.stored.concat(stories.filter(Boolean));
        },
    }
})

export const { fetchingStart, fetchingStop, fetchRecentStoryIdsSuccess, fetchStoryByIdsSuccess } = storiesSlice.actions

export default storiesSlice.reducer

export const fetchRecentStoryIds = () => async dispatch => {
    try {
        const response = await api.fetch('/newstories.json', {})
        const storyIds = await response.json()
        return dispatch(fetchRecentStoryIdsSuccess({ storyIds }))
    } catch (error) {
        console.log(error)
    }
}

export const fetchStoryByIds = (storyIds) => async dispatch => {
    try {
        const requests = storyIds.map(id => api.fetch(`/item/${id}.json`, {}));
        const responses = await Promise.all(requests);
        const stories = await Promise.all(responses.map(response => response.json()))
        return dispatch(fetchStoryByIdsSuccess({ stories }))
    } catch (error) {
        console.log(error)
    }
}


export const getRecentStories = () => async (dispatch, getState) => {

    dispatch(fetchingStart())

    return dispatch(fetchRecentStoryIds())
        .then(() => {
            const storyIds = getState().stories.ids;
            return dispatch(fetchStoryByIds(storyIds.slice(0, MAX_ITEMS_TO_LOAD)))
        }).then(() => {
            dispatch(fetchingStop())
        })
}

export const getMoreStories = () => async (dispatch, getState) => {
    const state = getState();

    try {
        const storyIds = state.stories.ids;
        const storedStories = state.stories.stored;
        const lastStory = storedStories[storedStories.length - 1];

        if (storedStories.length > 0 && lastStory.id === 0) {
            // no more stories to fetch from HN
            console.log('mo more left')
        } else if (storedStories.length < storyIds.length) {
            // fetch more by ids
            const rangeFrom = storedStories.length;
            const rangeTo = storedStories.length + MAX_ITEMS_TO_LOAD;

            dispatch(fetchingStart())
            dispatch(fetchStoryByIds(storyIds.slice(rangeFrom, rangeTo))).then(() => {
                dispatch(fetchingStop())
            })

        } else {
            console.log('fetch more going backward')
        }
    } catch (error) {
        console.log(error)
    }
}