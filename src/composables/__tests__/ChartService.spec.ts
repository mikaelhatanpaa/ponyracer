import { describe, expect, test } from 'vitest';
import { useChartService } from '@/composables/ChartService';
import { ScoreHistoryModel } from '@/models/UserModel';

describe('useChartService', () => {
  test('should build data', () => {
    const chartService = useChartService();
    const history: Array<ScoreHistoryModel> = [
      { instant: '2022-06-01T11:00:00Z', money: 100 },
      { instant: '2022-06-01T13:00:00Z', money: 200 }
    ];
    const data = chartService.getData(history, 'Title');

    expect(data).toStrictEqual({
      labels: ['2022-06-01T11:00:00Z', '2022-06-01T13:00:00Z'],
      datasets: [
        {
          label: 'Title',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          fill: 'origin',
          tension: 0.2,
          data: [100, 200]
        }
      ]
    });
  });

  test('should build options', () => {
    const chartService = useChartService();
    const options = chartService.getOptions();

    expect(options).toStrictEqual({
      scales: {
        x: {
          type: 'time'
        }
      }
    });
  });
});
