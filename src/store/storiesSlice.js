import { createSlice } from '@reduxjs/toolkit'
import api from '../services'

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
            state.ids = ids;
        },
    }
})

export const { fetchingStart, fetchingStop, fetchRecentStoryIdsSuccess } = storiesSlice.actions

export default storiesSlice.reducer



export const fetchRecentStoryIds = (

) => async dispatch => {
    try {
        dispatch(fetchingStart())
        const ids = await api.fetch('/newstories', {})
        dispatch(fetchRecentStoryIdsSuccess(ids))
    } catch (err) {
        console.log(err)
    }
}