import { createStore } from 'vuex'
import auth from './modules/auth'
import { SHOW_LOADER_MUTATION } from './storeconstants.js'

const store = createStore({
    modules: {
        auth,
    },
    state() {
        return {
            showLoader: false,
        }
    },
    mutations: {
        [SHOW_LOADER_MUTATION](state, payload) {
            state.showLoader = payload;
        },
    },
});

export default store;

