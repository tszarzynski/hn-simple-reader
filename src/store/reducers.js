import { combineReducers } from 'redux'
import storiesReducer from './storiesSlice'

const rootReducer = combineReducers({
    stories: storiesReducer,
})

export default rootReducer