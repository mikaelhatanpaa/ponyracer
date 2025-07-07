import { beforeEach, describe, expect, MockedObject, test, vi } from 'vitest';
import { defineComponent } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
import { createVitestPinia } from '@/__tests__/pinia';
import { useUserStore } from '@/composables/UserStore';
import ScoreHistory from '@/views/ScoreHistory.vue';

const mockChartService = {
  getData: vi.fn(),
  getOptions: vi.fn()
};
vi.mock('@/composables/ChartService', () => ({
  useChartService: () => mockChartService
}));

const pinia = createVitestPinia();

const AsyncWrapper = defineComponent({
  components: { ScoreHistory },
  template: `
  <Suspense>
    <ScoreHistory/>
  </Suspense>`
});

async function scoreHistoryWrapper() {
  const wrapper = mount(AsyncWrapper, {
    global: {
      plugins: [pinia]
    }
  });
  await flushPromises();
  return wrapper;
}

describe('ScoreHistory.vue', () => {
  let userStore: MockedObject<ReturnType<typeof useUserStore>>;

  beforeEach(() => {
    userStore = vi.mocked(useUserStore());
    userStore.getScoreHistory.mockResolvedValue([]);
  });

  test('should render the score history', async () => {
    const wrapper = await scoreHistoryWrapper();

    expect(wrapper.get('h1').text()).toBe('Score history');
    // You need a `<canvas>` element to render the chart
    expect(wrapper.get('canvas')).not.toBeNull();

    // You need to call `getScoreHistory()` on mount
    expect(userStore.getScoreHistory).toHaveBeenCalled();
  });
});
