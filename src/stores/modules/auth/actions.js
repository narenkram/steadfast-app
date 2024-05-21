import Axios from 'axios';
import { CREATE_ACCOUNT_ACTION } from '../../storeconstants.js';

export default {
    async [CREATE_ACCOUNT_ACTION](_, payload) {
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
        console.log(response);
    },
};


