<template>
  <div>
    <h1>Score history</h1>
    <canvas ref="chart"></canvas>
  </div>
</template>

<script setup lang="ts">
import { onMounted, useTemplateRef } from 'vue';
import { Chart, Filler, Legend, LinearScale, LineController, LineElement, PointElement, TimeScale, Tooltip } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { useUserStore } from '@/composables/UserStore';
import { useChartService } from '@/composables/ChartService';

Chart.register(LineController, LinearScale, TimeScale, PointElement, LineElement, Legend, Filler, Tooltip);

const chartRef = useTemplateRef('chart');

const userStore = useUserStore();
const chartService = useChartService();
const history = await userStore.getScoreHistory();
const data = chartService.getData(history, 'Score history');
const options = chartService.getOptions();

onMounted(() => {
  new Chart(chartRef.value!, { type: 'line', data, options });
});
</script>
