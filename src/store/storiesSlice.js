import { createSlice } from '@reduxjs/toolkit';
import api from '../services';

// number of items to load initially
const INITIAL_ITEMS_TO_LOAD = 30;
// number of item to load while scrolling
const MAX_ITEMS_TO_LOAD = 10;

const getRatio = ids => {
    const newest = ids[0];
    const oldest = ids[ids.length - 1];
    return ids.length / (newest + 1 - oldest);
};

const storiesSlice = createSlice({
    name: 'stories',
    initialState: {
        ids: [], // stories IDs
        stored: [], // fetched stories
        avgOccuranceRatio: 1,
        isFetching: false,
        error: ''
    },
    reducers: {
        fetchingStart(state) {
            state.error = ''
            state.isFetching = true;
        },
        fetchingStop(state) {
            state.isFetching = false;
        },
        fetchStoryIdsSuccess(state, action) {
            const { ids } = action.payload

            state.ids = state.ids.concat(ids);
        },
        fetchStoryByIdsSuccess(state, action) {
            const { stories } = action.payload
            state.stored = state.stored.concat(stories.filter(Boolean));

            state.avgOccuranceRatio = state.avgOccuranceRatio + (getRatio(stories.map(story => story.id)) - state.avgOccuranceRatio) / 5
        },
        notifyError(state, action) {
            const { error } = action.payload

            state.isFetching = false;
            state.error = error;
        },
    }
})

export const { fetchingStart, fetchingStop, fetchStoryIdsSuccess, fetchStoryByIdsSuccess, notifyError } = storiesSlice.actions

export default storiesSlice.reducer

export const fetchStoryIds = () => async dispatch => {
    try {
        const response = await api.fetch('/newstories.json', {})

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const ids = await response.json()

        return dispatch(fetchStoryIdsSuccess({ ids }))
    } catch (error) {

        dispatch(notifyError({ error: error.message }))
        return Promise.reject(error);
    }
}

export const fetchStoryByIds = (ids) => async dispatch => {
    try {
        const requests = ids.map(id => api.fetch(`/item/${id}.json`, {}));
        const responses = await Promise.all(requests);
        const stories = await Promise.all(responses.map(response => response.json()))
        return dispatch(fetchStoryByIdsSuccess({ stories }))
    } catch (error) {
        dispatch(notifyError({ error: error.message }))
        return Promise.reject(error);
    }
}

export const fetchStoriesFromId = (fromId) => async (dispatch, getState) => {
    const averageStoryOccurrenceRatio = getState().stories.avgOccuranceRatio;

    let numIds = MAX_ITEMS_TO_LOAD / averageStoryOccurrenceRatio;

    if (fromId - numIds < 0) {
        numIds = fromId;
    }

    try {
        const ids = Array.from({ length: numIds }, (v, k) => fromId - k)
        const requests = ids.map(id => api.fetch(`/item/${id}.json`, {}));
        const responses = await Promise.all(requests);
        const items = await Promise.all(responses.map(response => response.json()))
        const stories = items.filter(item => item.type === 'story')


        return Promise.all([dispatch(fetchStoryIdsSuccess({ ids: stories.map(story => story.id) })),
        dispatch(fetchStoryByIdsSuccess({ stories }))])
    } catch (error) {
        dispatch(notifyError({ error: error.message }))
        return Promise.reject(error);
    }
}


export const getRecentStories = () => async (dispatch, getState) => {

    dispatch(fetchingStart())

    return dispatch(fetchStoryIds())
        .then(() => {
            const ids = getState().stories.ids;
            return dispatch(fetchStoryByIds(ids.slice(0, INITIAL_ITEMS_TO_LOAD)))
        }).then(() => {
            dispatch(fetchingStop())
        }).catch((error) => {
            dispatch(notifyError({ error: error.message }))
        })

}

export const getMoreStories = () => async (dispatch, getState) => {
    const state = getState();

    try {
        const ids = state.stories.ids;
        const stored = state.stories.stored;
        const lastStory = stored[stored.length - 1];

        if (stored.length > 0 && lastStory.id === 0) {
            // no more stories to fetch from HN
            console.log('mo more left')
        } else if (stored.length < ids.length) {
            // fetch more by ids

            const rangeFrom = stored.length;
            const rangeTo = stored.length + MAX_ITEMS_TO_LOAD;

            dispatch(fetchingStart())

            return dispatch(fetchStoryByIds(ids.slice(rangeFrom, rangeTo))).then(() => {
                dispatch(fetchingStop())
            }).catch((error) => {
                dispatch(notifyError({ error: error.message }))
            })

        } else {
            // go backward from last id

            dispatch(fetchingStart())
            return dispatch(fetchStoriesFromId(lastStory.id - 1)).then(() => {
                dispatch(fetchingStop())
            }).catch((error) => {
                dispatch(notifyError({ error: error.message }))
            })
        }
    } catch (error) {

        dispatch(notifyError({ error: error.message }))
    }
}