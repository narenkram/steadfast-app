<template>
  <section class="row py-3">
    <div class="col-lg-5">
      <div class="Card">
        <blockquote class="fs-1">₹ 653.25</blockquote>
        <blockquote class="fs-4">₹ 606.25 <small> After ₹ 47 Tax charges</small></blockquote>
      </div>
    </div>
    <div class="col-lg-5">
      <div class="Card">
        <blockquote class="fs-2">1.25% <small> on Total Capital</small></blockquote>
        <blockquote class="fs-4">10.5% <small> on Deployed Capital</small></blockquote>
      </div>
    </div>
    <div class="col-lg-2 d-flex justify-content-center align-items-center">
      <div class="Card">
        <button class="btn btn-primary shadow fs-3">Kill Switch</button>
      </div>
    </div>
  </section>

  <hr />

  <section class="row py-2">
    <div class="col">
      <div class="row">
        <div class="col-4">
          <select class="form-select" aria-label="Instrument">
            <option selected value="BankNifty">BankNifty</option>
            <option value="Nifty">Nifty</option>
          </select>
        </div>
        <div class="col-4">
          <select class="form-select" aria-label="OrderType">
            <option selected value="Market">Market Order</option>
            <option value="Limit">Limit Order</option>
          </select>
        </div>
        <div class="col-4">
          <select class="form-select" aria-label="OrderType">
            <option selected value="Weekly">Weekly Expiry</option>
            <option value="Monthly">Monthly Expiry</option>
          </select>
        </div>
      </div>
      <div class="row align-items-center">
        <div class="col-6">
          <blockquote class="mt-3 blockquote row text-left">
            <p>BankNifty Spot - 48502 0.5%</p>
            <p>BankNifty FUT 1 - 48700 1.05%</p>
            <p>BankNifty FUT 2 - 48745 1.2%</p>
            <p>BankNifty FUT 3 - 48760 1.5%</p>
          </blockquote>
        </div>
        <div class="col-6">
          <blockquote class="blockquote">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="AutoKill" name="AutoKill" checked />
              <label class="form-check-label" for="AutoKill">Auto Kill (Activated)</label>
            </div>
            <div class="form-check mt-4">
              <input class="form-check-input" type="radio" name="optionMode" id="optionMode1" />
              <label class="form-check-label" for="optionMode1"> In the Money </label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="radio" name="optionMode" id="optionMode2" checked />
              <label class="form-check-label" for="optionMode2"> At the Money </label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="radio" name="optionMode" id="optionMode3" />
              <label class="form-check-label" for="optionMode3"> Out of the Money </label>
            </div>
          </blockquote>
        </div>
      </div>

      <hr />

      <div class="row py-4">
        <div class="col-6">
          <p class="mb-0"><b>LTP 432</b></p>
          <p>BankNifty Strike</p>
          <button class="btn btn-lg btn-outline-success fs-5 w-100 mb-2">Buy CE</button>
          <button class="btn btn-lg btn-outline-secondary fs-5 w-100">Close Position</button>
        </div>
        <div class="col-6">
          <p class="mb-0"><b>LTP 345</b></p>
          <p>BankNifty Strike</p>
          <button class="btn btn-lg btn-outline-danger fs-5 w-100 mb-2">Buy PE</button>
          <button class="btn btn-lg btn-outline-secondary fs-5 w-100">Cancel Order</button>
        </div>
      </div>
    </div>
  </section>

  <hr />

  <section class="row py-3">
    <div class="col-12">
      <h3>Live Notifications</h3>
    </div>
    <div class="card-body text-danger">
      <p class="fs-5">
        Total Buy/Sell Value 10,500
        <small>exceeds 2 times more than total capital, OVER TRADE Warning</small>
      </p>
    </div>
  </section>
</template>


<script>
import { GET_USER_TOKEN_GETTER } from '@/stores/storeconstants';
import { mapGetters } from 'vuex';
// import axios from 'axios';

export default {
  // data() {
  //   return;
  // },

  computed: {
    ...mapGetters('auth', {
      token: GET_USER_TOKEN_GETTER,
    }),
  },

  mounted() {

    // Get Trade Data from broker API
    // axios
    //   .get('http://localhost:8000/api/user/?auth_token=' + this.token)
    //   .then((response) => {
    //     console.log(response.data);
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //   });


    // console.log(this.token);
  },
};
</script>

