import { SET_USER_TOKEN_DATA_MUTATION, SET_AUTO_LOGOUT_MUTATION } from '../../storeconstants';


export default {
    [SET_USER_TOKEN_DATA_MUTATION](state, payload) {
        state.email = payload.email;
        state.token = payload.token;
        state.userId = payload.userId;
        state.refreshToken = payload.refreshToken;
        state.expiresIn = payload.expiresIn;
        state.autoLogout = false;
    },

    [SET_AUTO_LOGOUT_MUTATION](state) {
        state.autoLogout = true;
    }
};


