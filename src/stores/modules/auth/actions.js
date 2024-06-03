import Axios from 'axios';
import { CREATE_ACCOUNT_ACTION } from '../../storeconstants.js';
import { LOGIN_ACTION } from '../../storeconstants.js';
import { LOGOUT_ACTION } from '../../storeconstants.js';
import { SET_USER_TOKEN_DATA_MUTATION } from '../../storeconstants.js';
import CreateAccountValidation from '@/services/CreateAccValidation.js';
import { AUTH_ACTION } from '../../storeconstants.js';
import { AUTO_LOGIN_ACTION } from '../../storeconstants.js';

export default {
    [LOGOUT_ACTION](context) {
        context.commit(SET_USER_TOKEN_DATA_MUTATION, {
            email: null,
            token: null,
            userId: null,
            refreshToken: null,
            expiresIn: null
        });
        localStorage.removeItem('userData')
    },

    async [LOGIN_ACTION](context, payload) {
        return context.dispatch(AUTH_ACTION, {
            ...payload,
            url: `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyDIGaUtVdepjudXmLbleVDakiHZFAYYS1w`
        })
    },

    async [CREATE_ACCOUNT_ACTION](context, payload) {
        return context.dispatch(AUTH_ACTION, {
            ...payload,
            url: `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyDIGaUtVdepjudXmLbleVDakiHZFAYYS1w`
        })
    },

    [AUTO_LOGIN_ACTION](context) {
        let userData = localStorage.getItem('userData')
        if (userData) {
            context.commit(SET_USER_TOKEN_DATA_MUTATION, JSON.parse(userData))
        }
    },

    async [AUTH_ACTION](context, payload) {
        let postData = {
            email: payload.email,
            password: payload.password,
            returnSecureToken: true
        };
        let response = '';
        try {
            response = await Axios.post(
                payload.url,
                postData,
            );
        } catch (err) {
            let errorMessage = CreateAccountValidation.getErrorMessageFromCode(
                err.response.data.error.errors[0].message
            );
            throw errorMessage;
        }
        if (response.status === 200) {
            let tokenData = {
                email: response.data.email,
                token: response.data.idToken,
                userId: response.data.localId,
                refreshToken: response.data.refreshToken,
                expiresIn: response.data.expiresIn
            }
            localStorage.setItem('userData', JSON.stringify(tokenData))
            context.commit(SET_USER_TOKEN_DATA_MUTATION, tokenData)
        }
    },


};


