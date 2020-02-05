import { createSlice } from "@reduxjs/toolkit";
import api from "../services";

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
  name: "stories",
  initialState: {
    ids: [], // stories IDs
    stored: [], // fetched stories
    avgOccuranceRatio: 1,
    isFetching: false,
    error: "",
    showBookmarked: false
  },
  reducers: {
    fetchingStart(state) {
      state.error = "";
      state.isFetching = true;
    },
    fetchingStop(state) {
      state.isFetching = false;
    },
    fetchStoryIdsSuccess(state, action) {
      const { ids } = action.payload;

      state.ids = state.ids.concat(ids);
    },
    fetchStoryByIdsSuccess(state, action) {
      const { stories } = action.payload;

      state.stored = state.stored.concat(stories);

      state.avgOccuranceRatio =
        state.avgOccuranceRatio +
        (getRatio(stories.map(story => story.id)) - state.avgOccuranceRatio) /
          5;
    },
    toggleBookmarkPost(state, action) {
      const { id } = action.payload;

      state.stored = state.stored.map(story => {

        if (story.id === id) {
          const bookmarked = story.bookmarked || false;
          
          return {...story, bookmarked: !bookmarked}

        } else {
          return story;
        }
      })
    },
    toggleListView(state, action) {
      state.showBookmarked = !state.showBookmarked;
    },
    notifyError(state, action) {
      const { error } = action.payload;

      state.isFetching = false;
      state.error = error;
    }
  }
});

export const {
  fetchingStart,
  fetchingStop,
  fetchStoryIdsSuccess,
  fetchStoryByIdsSuccess,
  notifyError,
  toggleBookmarkPost,
  toggleListView
} = storiesSlice.actions;

export default storiesSlice.reducer;


export const listItems = (state) => {

  return state.stories.showBookmarked 
  ? state.stories.stored.filter(story => story.bookmarked === true)
  : state.stories.stored;
}


/**
 * Fetch Top 500 story ids from HN
 */
export const fetchStoryIds = () => async dispatch => {
  try {
    const response = await api.fetch("/newstories.json", {});

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const ids = await response.json();

    return dispatch(fetchStoryIdsSuccess({ ids }));
  } catch (error) {

    dispatch(notifyError({ error: error.message }));
    return Promise.reject(error);
  }
};

/**
 * Fetch stories for given ids
 */
export const fetchStoryByIds = ids => async dispatch => {
  try {

    const requests = ids.map(id => api.fetch(`/item/${id}.json`, {}));
    const responses = await Promise.all(requests);
    const items = await Promise.all(
      responses.map(response => response.json())
    );

    // handle null responses
    const stories = items.map((story, i) => story !== null ? story : ({id: ids[i]}))

    // stories = stories.filter(story => story !== null)
    return dispatch(fetchStoryByIdsSuccess({ stories }));
  } catch (error) {

    dispatch(notifyError({ error: error.message }));
    return Promise.reject(error);
  }
};

/**
 * Get stories not included in Top 500 by walking back trough the list of items
 */
export const fetchStoriesFromId = fromId => async (dispatch, getState) => {
  const averageStoryOccurrenceRatio = getState().stories.avgOccuranceRatio;

  // number of ids to try in order to get MAX_ITEMS_TO_LOAD items
  let numIds = MAX_ITEMS_TO_LOAD / averageStoryOccurrenceRatio;

  if (fromId - numIds < 0) {
    numIds = fromId;
  }

  try {
    // generate ids
    const ids = Array.from({ length: numIds }, (v, k) => fromId - k);
    const requests = ids.map(id => api.fetch(`/item/${id}.json`, {}));
    const responses = await Promise.all(requests);
    const items = await Promise.all(responses.map(response => response.json()));
    // filter out items which are not stories
    const stories = items.filter(item => item.type === "story");

    return Promise.all([
      dispatch(fetchStoryIdsSuccess({ ids: stories.map(story => story.id) })),
      dispatch(fetchStoryByIdsSuccess({ stories }))
    ]);
  } catch (error) {
    dispatch(notifyError({ error: error.message }));
    return Promise.reject(error);
  }
};

/**
 * Load top 500 stories from HN
 */
export const getRecentStories = () => async (dispatch, getState) => {
  dispatch(fetchingStart());

  // fetch top 500 ids
  return dispatch(fetchStoryIds())
    .then(() => {
      const ids = getState().stories.ids;
      // fetch initial stories
      return dispatch(fetchStoryByIds(ids.slice(0, INITIAL_ITEMS_TO_LOAD)));
    })
    .then(() => {
      dispatch(fetchingStop());
    })
    .catch(error => {
      dispatch(notifyError({ error: error.message }));
    });
};

/**
 * Load more stories
 */
export const getMoreStories = () => async (dispatch, getState) => {
  const state = getState();

  if (state.stories.isFetching) return;

  try {
    const ids = state.stories.ids;
    const stored = state.stories.stored;
    const lastStory = stored[stored.length - 1];

    if (stored.length > 0 && lastStory.id === 0) {
      // no more stories to fetch from HN
      console.log("mo more left");
    } else if (stored.length < ids.length) {
      // fetch more stories from ids pool

      const rangeFrom = stored.length;
      const rangeTo = stored.length + MAX_ITEMS_TO_LOAD;

      dispatch(fetchingStart());

      return dispatch(fetchStoryByIds(ids.slice(rangeFrom, rangeTo)))
        .then(() => {
          dispatch(fetchingStop());
        })
        .catch(error => {
          dispatch(notifyError({ error: error.message }));
        });
    } else {
      // go backward from last id

      dispatch(fetchingStart());
      return dispatch(fetchStoriesFromId(lastStory.id - 1))
        .then(() => {
          dispatch(fetchingStop());
        })
        .catch(error => {
          dispatch(notifyError({ error: error.message }));
        });
    }
  } catch (error) {
    dispatch(notifyError({ error: error.message }));
  }
};
