<!-- src/components/LineChart.vue -->
<template>
    <canvas ref="lineChart"></canvas>
  </template>
  
  <script>
  import { ref, onMounted, watch } from 'vue';
  import { Chart, LineController, LineElement, PointElement, CategoryScale, LinearScale } from 'chart.js';
  
  Chart.register(LineController, LineElement, PointElement, CategoryScale, LinearScale);
  
  export default {
    name: 'LineChart',
    props: {
      profitData: {
        type: Array,
        required: true
      }
    },
    setup(props) {
      const lineChart = ref(null);
      let chartInstance = null;
  
      // Function to generate hourly labels from 9:15 AM to 3:30 PM
      const generateHourlyLabels = () => {
        const labels = [];
        let currentTime = new Date();
        currentTime.setHours(9, 15, 0, 0); // Set to 9:15 AM
  
        while (currentTime.getHours() < 15 || (currentTime.getHours() === 15 && currentTime.getMinutes() <= 30)) {
          labels.push(currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
          currentTime.setMinutes(currentTime.getMinutes() + 60); // Increment by 1 hour
        }
  
        return labels;
      };
  
      onMounted(() => {
        const ctx = lineChart.value.getContext('2d');
        chartInstance = new Chart(ctx, {
          type: 'line',
          data: {
            labels: generateHourlyLabels(), // Use the generated labels
            datasets: [{
              label: 'MTM Profit',
              backgroundColor: 'rgb(255, 99, 132)',
              borderColor: 'rgb(255, 99, 132)',
              data: props.profitData // Use the passed prop data
            }]
          },
          options: {}
        });
      });
  
      watch(() => props.profitData, (newData) => {
        if (chartInstance) {
          chartInstance.data.datasets[0].data = newData;
          chartInstance.update();
        }
      });
  
      return {
        lineChart
      };
    }
  };
  </script>