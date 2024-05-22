import { GET_USER_TOKEN_GETTER } from '@/stores/storeconstants';

export default {
    [GET_USER_TOKEN_GETTER]: (state) => {
        return state.token;
    },
};


