<template>
  <section class="row py-3">
    <div class="col-12">
      <!-- Broker Name and Status with Broker ID -->
      <div class="row">
        <div class="col-4">
          <p class="mb-0"><b>Broker</b></p>
          <p>Dhan ID 1234567890 <span class="badge bg-success">Active</span></p>
        </div>
        <div class="col-3">
          <p class="mb-0"><b>Total Funds</b></p>
          <p>₹ 10,000</p>
        </div>
        <div class="col-3">
          <p class="mb-0"><b>Utilized Margin</b></p>
          <p>₹ 5,000</p>
        </div>
        <div class="col-2">
          <div class="d-flex align-items-center float-end">
            <label class="ToggleSwitch">
              <input class="ToggleInput" type="checkbox" id="AutoKill" name="AutoKill" checked>
              <span class="ToggleSlider SliderRound"></span>
            </label>
            <span class="ToggleLabel"><b>Auto Kill</b></span>
          </div>
        </div>
      </div>

    </div>
  </section>
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
    <div class="row">
      <div class="col-2">
        <label for="Exchange" class="form-label mb-0">Exchange</label>
        <select class="form-select" aria-label="Instrument">
          <option selected value="Exchange">NSE</option>
          <option value="BSE">BSE</option>
        </select>
      </div>
      <div class="col-3">
        <label for="Instrument" class="form-label mb-0">Instrument</label>
        <select class="form-select" aria-label="Instrument">
          <option selected value="BankNifty">BankNifty</option>
          <option value="Nifty">Nifty</option>
        </select>
      </div>
      <div class="col-2">
        <label for="OrderType" class="form-label mb-0">Order Type</label>
        <select class="form-select" aria-label="OrderType">
          <option selected value="Market">Market</option>
          <option value="Limit">Limit</option>
        </select>
      </div>
      <div class="col-3">
        <label for="Expiry" class="form-label mb-0">Expiry</label>
        <select class="form-select" aria-label="Expiry">
          <option selected value="current">05-Jun-2024</option>
          <option value="next">12-Jun-2024</option>
        </select>
      </div>
      <div class="col-2">
        <label for="Quantity" class="form-label mb-0">Quantity</label>
        <select class="form-select" aria-label="Quantity">
          <option selected value="15">15</option>
          <option value="30">30</option>
          <option value="45">45</option>
        </select>
      </div>
    </div>
    <div class="row mt-2 align-items-center justify-content-between">
      <div class="col-3">
        <label for="Call Strike" class="form-label mb-0">Call Strike</label>
        <select class="form-select" aria-label="Call Strike">
          <option selected value="51700">51700</option>
          <option value="51800">51800</option>
        </select>

        <p class="mb-0">BankNifty 51700 LTP 432</p>
        <button class="btn btn-lg btn-outline-success fs-5 w-100 mb-2">Buy CE</button>
        <button class="btn btn-lg btn-outline-danger fs-5 w-100">Sell CE</button>
      </div>
      <div class="col-3 text-center">
        <br />
        <p class="mb-0">Nifty Bank</p>
        <p><b>51700 <span class="text-success">(152/0.8%)</span></b></p>
        <button class="btn btn-lg btn-outline-secondary fs-5 w-100 mb-2">Close Position</button>
        <button class="btn btn-lg btn-outline-secondary fs-5 w-100">Cancel Order</button>
      </div>
      <div class="col-3">
        <label for="Put Strike" class="form-label mb-0">Put Strike</label>
        <select class="form-select" aria-label="Put Strike">
          <option selected value="51700">51700</option>
          <option value="51800">51800</option>
        </select>

        <p class="mb-0">BankNifty 51700 LTP 345</p>
        <button class="btn btn-lg btn-outline-success fs-5 w-100 mb-2">Buy PE</button>
        <button class="btn btn-lg btn-outline-danger fs-5 w-100">Sell PE</button>
      </div>
    </div>
  </section>

  <section class="row py-3">
    <div class="col-12">
      <ul class="nav nav-tabs" id="myTab" role="tablist">
        <li class="nav-item" role="presentation">
          <button class="nav-link active" id="positions-tab" data-bs-toggle="tab" data-bs-target="#positions-tab-pane"
            type="button" role="tab" aria-controls="positions-tab-pane" aria-selected="true">Positions</button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="trades-tab" data-bs-toggle="tab" data-bs-target="#trades-tab-pane" type="button"
            role="tab" aria-controls="trades-tab-pane" aria-selected="false">Trades</button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="notifications-tab" data-bs-toggle="tab" data-bs-target="#notifications-tab-pane"
            type="button" role="tab" aria-controls="notifications-tab-pane" aria-selected="false">Notifications</button>
        </li>
      </ul>
      <div class="tab-content" id="myTabContent">
        <div class="tab-pane fade show active" id="positions-tab-pane" role="tabpanel" aria-labelledby="positions-tab"
          tabindex="0">
          positions-tab
        </div>
        <div class="tab-pane fade" id="trades-tab-pane" role="tabpanel" aria-labelledby="trades-tab" tabindex="0">
          trades-tab
        </div>
        <div class="tab-pane fade" id="notifications-tab-pane" role="tabpanel" aria-labelledby="notifications-tab"
          tabindex="0">
          notifications-tab
          <div class="card-body text-danger">
            <p class="fs-5">
              Total Buy/Sell Value 10,500
              <small>exceeds 2 times more than total capital, OVER TRADE Warning</small>
            </p>
          </div>
        </div>
      </div>

    </div>

  </section>
</template>


<script>
import { GET_USER_TOKEN_GETTER } from '@/stores/storeconstants';
import { mapGetters } from 'vuex';
import axiosInstance from '@/services/AxiosTokenInstance';

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
    axiosInstance
      .get('http://localhost:8000/api/user/?auth_token=' + this.token)
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.log(error);
      });


    console.log(this.token);
  },
};
</script>

