import { createSlice } from '@reduxjs/toolkit';
import api from '../services';

const INITIAL_ITEMS_TO_LOAD = 30;
const MAX_ITEMS_TO_LOAD = 10;

const getRatio = ids => {
    const newest = ids[0];
    const oldest = ids[ids.length - 1];
    return ids.length / (newest + 1 - oldest);
};

const storiesSlice = createSlice({
    name: 'stories',
    initialState: {
        ids: [],
        stored: [],
        avgOccuranceRatio: 1,
        isFetching: false,
    },
    reducers: {
        fetchingStart(state) {
            state.isFetching = true;
        },
        fetchingStop(state) {
            state.isFetching = false;
        },
        fetchRecentStoryIdsSuccess(state, action) {
            const { ids } = action.payload

            const duplicates = ids.reduce(function (acc, el, i, arr) {
                if (arr.indexOf(el) !== i && acc.indexOf(el) < 0) acc.push(el); return acc;
            }, []);
            console.log(duplicates)

            state.ids = state.ids.concat(ids);
        },

        fetchStoryByIdsSuccess(state, action) {
            const { stories } = action.payload
            state.stored = state.stored.concat(stories.filter(Boolean));

            state.avgOccuranceRatio = state.avgOccuranceRatio + (getRatio(stories.map(story => story.id)) - state.avgOccuranceRatio) / 5
        },
    }
})

export const { fetchingStart, fetchingStop, fetchRecentStoryIdsSuccess, fetchStoryByIdsSuccess } = storiesSlice.actions

export default storiesSlice.reducer

export const fetchRecentStoryIds = () => async dispatch => {
    try {
        const response = await api.fetch('/newstories.json', {})
        const ids = await response.json()
        return dispatch(fetchRecentStoryIdsSuccess({ ids }))
    } catch (error) {
        console.log(error)
    }
}

export const fetchStoryByIds = (ids) => async dispatch => {
    try {
        const requests = ids.map(id => api.fetch(`/item/${id}.json`, {}));
        const responses = await Promise.all(requests);
        const stories = await Promise.all(responses.map(response => response.json()))
        return dispatch(fetchStoryByIdsSuccess({ stories }))
    } catch (error) {
        console.log(error)
    }
}

export const fetchStoriesFromId = (fromId) => async (dispatch, getState) => {
    const averageStoryOccurrenceRatio = getState().stories.avgOccuranceRatio;

    let numIds = MAX_ITEMS_TO_LOAD / averageStoryOccurrenceRatio;

    if (fromId - numIds < 0) {
        numIds = fromId;
    }

    const ids = Array.from({ length: numIds }, (v, k) => fromId - k)
    const requests = ids.map(id => api.fetch(`/item/${id}.json`, {}));
    const responses = await Promise.all(requests);
    const items = await Promise.all(responses.map(response => response.json()))
    const stories = items.filter(item => item.type === 'story')


    return Promise.all([dispatch(fetchRecentStoryIdsSuccess({ ids: stories.map(story => story.id) })),
    dispatch(fetchStoryByIdsSuccess({ stories }))])
}


export const getRecentStories = () => async (dispatch, getState) => {

    dispatch(fetchingStart())

    return dispatch(fetchRecentStoryIds())
        .then(() => {
            const ids = getState().stories.ids;
            return dispatch(fetchStoryByIds(ids.slice(0, INITIAL_ITEMS_TO_LOAD)))
        }).then(() => {
            dispatch(fetchingStop())
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
            console.log('fetch more by ids', rangeFrom, rangeTo)
            dispatch(fetchingStart())
            return dispatch(fetchStoryByIds(ids.slice(rangeFrom, rangeTo))).then(() => {
                dispatch(fetchingStop())
            })

        } else {
            // go backward from last id
            console.log('go backward from last id')
            dispatch(fetchingStart())
            return dispatch(fetchStoriesFromId(lastStory.id - 1)).then(() => {
                dispatch(fetchingStop())
            })
        }
    } catch (error) {
        console.log(error)
    }
}