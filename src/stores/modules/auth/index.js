import mutations from './mutations'
import getters from './getters'
import actions from './actions'

export default {
    namespaced: true,
    state() {
        return {
            token: '',
            email: 'email@narenkram.com',
            userId: '',
            refreshToken: '',
            expiresIn: '',
        };
    },
    mutations,
    getters,
    actions,
};

