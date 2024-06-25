<!-- src/components/LineChart.vue -->
<template>
    <canvas ref="lineChart"></canvas>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import { Chart, LineController, LineElement, PointElement, CategoryScale, LinearScale } from 'chart.js';
  
  Chart.register(LineController, LineElement, PointElement, CategoryScale, LinearScale);
  
  export default {
    name: 'LineChart',
    setup() {
      const lineChart = ref(null);
  
      onMounted(() => {
        const ctx = lineChart.value.getContext('2d');
        new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
            datasets: [{
              label: 'My First dataset',
              backgroundColor: 'rgb(255, 99, 132)',
              borderColor: 'rgb(255, 99, 132)',
              data: [0, 10, 5, 2, 20, 30, 45]
            }]
          },
          options: {}
        });
      });
  
      return {
        lineChart
      };
    }
  };
  </script>