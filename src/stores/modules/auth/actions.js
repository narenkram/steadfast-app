import Axios from 'axios';
import { CREATE_ACCOUNT_ACTION } from '../../storeconstants.js';
import { LOGIN_ACTION } from '../../storeconstants.js';
import { LOGOUT_ACTION } from '../../storeconstants.js';
import { SET_USER_TOKEN_DATA_MUTATION } from '../../storeconstants.js';
import CreateAccountValidation from '@/services/CreateAccValidation.js';
import { AUTH_ACTION } from '../../storeconstants.js';
import { AUTO_LOGIN_ACTION } from '../../storeconstants.js';
import { AUTO_LOGOUT_ACTION } from '../../storeconstants.js';
import { SET_AUTO_LOGOUT_MUTATION } from '../../storeconstants.js';

let timer = ''

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
        if (timer) {
            clearTimeout(timer)
        }
    },

    [AUTO_LOGOUT_ACTION](context) {
        context.dispatch(LOGOUT_ACTION)
        context.commit(SET_AUTO_LOGOUT_MUTATION)
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
        let userDataString = localStorage.getItem('userData')
        if (userDataString) {
            let userData = JSON.parse(userDataString)
            let expirationTime = userData.expiresIn - new Date().getTime();

            if (expirationTime < 10000) {
                context.dispatch(AUTO_LOGOUT_ACTION);
            } else {
                timer = setTimeout(() => {
                    context.dispatch(AUTO_LOGOUT_ACTION)
                }, expirationTime)
            }
            context.commit(SET_USER_TOKEN_DATA_MUTATION, userData)
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
            let expirationTime = response.data.expiresIn * 1000;

            timer = setTimeout(() => {
                context.dispatch(AUTO_LOGOUT_ACTION)
            }, expirationTime)

            let tokenData = {
                email: response.data.email,
                token: response.data.idToken,
                userId: response.data.localId,
                refreshToken: response.data.refreshToken,
                expiresIn: expirationTime
            }
            localStorage.setItem('userData', JSON.stringify(tokenData))
            context.commit(SET_USER_TOKEN_DATA_MUTATION, tokenData)
        }
    },


};


