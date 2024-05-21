import mutations from './mutations'
import getters from './getters'
import actions from './actions'

export default {
    namespaced: true,
    state() {
        return {
            name: 'Narendra Ram',
            email: 'email@narenkram.com',
        };
    },
    mutations,
    getters,
    actions,
};

