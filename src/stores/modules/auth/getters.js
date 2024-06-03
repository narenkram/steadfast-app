import { GET_USER_TOKEN_GETTER, IS_USER_AUTHENTICATED_GETTER } from '@/stores/storeconstants';


export default {
    [GET_USER_TOKEN_GETTER]: (state) => {
        return state.token;
    },
    [IS_USER_AUTHENTICATED_GETTER](state) {
        return !!state.token;
    }
};


