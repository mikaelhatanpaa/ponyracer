import { ChartData, ChartOptions } from 'chart.js';
import { ScoreHistoryModel } from '@/models/UserModel';

export function useChartService() {
  return {
    getData(history: Array<ScoreHistoryModel>, label: string): ChartData {
      return {
        labels: history.map(event => event.instant),
        datasets: [
          {
            label,
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            fill: 'origin',
            tension: 0.2,
            data: history.map(event => event.money)
          }
        ]
      };
    },
    getOptions(): ChartOptions {
      return {
        scales: {
          x: {
            type: 'time'
          }
        }
      };
    }
  };
}
