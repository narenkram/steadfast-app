import Axios from 'axios';
import { CREATE_ACCOUNT_ACTION } from '../../storeconstants.js';
import { SET_USER_TOKEN_DATA_MUTATION } from '../../storeconstants.js';

export default {
    async [CREATE_ACCOUNT_ACTION](context, payload) {
        let postData = {
            email: payload.email,
            password: payload.password,
            returnSecureToken: true
        }
        let response = await Axios.post(
            `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyDIGaUtVdepjudXmLbleVDakiHZFAYYS1w
            `,
            postData,
        );

        if (response.status === 200) {
            context.commit(SET_USER_TOKEN_DATA_MUTATION, {
                email: response.data.email,
                token: response.data.idToken,
                userId: response.data.localId,
                refreshToken: response.data.refreshToken,
                expiresIn: response.data.expiresIn
            })
        }
    },
};


