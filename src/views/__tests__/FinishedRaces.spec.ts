import { describe, expect, test, vi } from 'vitest';
import { flushPromises, mount, RouterLinkStub } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { injectRouterMock } from 'vue-router-mock';
import FinishedRaces from '@/views/FinishedRaces.vue';
import Race from '@/components/Race.vue';
import Pagination from '@/components/Pagination.vue';
import { RaceModel } from '@/models/RaceModel';
import { createVitestRouterMock } from '@/__tests__/router-mock';

const mockRaceService = {
  list: vi.fn()
};
vi.mock('@/composables/RaceService', () => ({
  useRaceService: () => mockRaceService
}));

const AsyncWrapper = defineComponent({
  components: { FinishedRaces },
  template: `<Suspense><FinishedRaces/></Suspense>`
});

const router = createVitestRouterMock();
async function finishedRaceWrapper() {
  injectRouterMock(router);
  const asyncWrapper = mount(AsyncWrapper, {
    global: {
      stubs: {
        RouterLink: RouterLinkStub
      }
    }
  });
  await flushPromises();
  return asyncWrapper;
}

describe('FinishedRaces.vue', () => {
  test('should display every race name in a title', async () => {
    // fake router params
    router.setQuery({});
    mockRaceService.list.mockResolvedValue([
      { name: 'London', startInstant: '2020-02-18T08:02:00Z' },
      { name: 'New York', startInstant: '2020-02-18T08:03:00Z' }
    ] as Array<RaceModel>);
    const asyncWrapper = await finishedRaceWrapper();

    expect(mockRaceService.list).toHaveBeenCalledWith('FINISHED');

    const wrapper = asyncWrapper.findComponent(FinishedRaces);
    const raceComponents = wrapper.findAllComponents(Race);

    // You should have a `Race` component per race in your template
    expect(raceComponents).toHaveLength(2);

    // You should have no `RouterLink` to go to the bet page
    const links = asyncWrapper.findAllComponents(RouterLinkStub);

    expect(links).toHaveLength(0);
  });

  test('should display a pagination component', async () => {
    // fake router params
    router.setQuery({
      page: 2
    });
    mockRaceService.list.mockResolvedValue(
      Array.from({ length: 100 }, (_, i) => ({
        id: i,
        name: `Race ${i + 1}`,
        startInstant: '2020-02-18T08:02:00Z'
      })) as Array<RaceModel>
    );
    const asyncWrapper = await finishedRaceWrapper();

    const wrapper = asyncWrapper.findComponent(FinishedRaces);
    const pagination = wrapper.findComponent(Pagination);

    // You should have a `Pagination` component in your template
    expect(pagination.exists()).toBe(true);

    // it should display races between 10 and 19
    expect(pagination.props().currentPage).toBe(2);

    const raceComponents = wrapper.findAllComponents(Race);

    expect(raceComponents).toHaveLength(10);
    expect(raceComponents[0].props().raceModel.id).toBe(10);
    expect(raceComponents[9].props().raceModel.id).toBe(19);
  });

  test('should react to page changes', async () => {
    // fake router params
    router.setQuery({
      page: 2
    });
    mockRaceService.list.mockResolvedValue(
      Array.from({ length: 100 }, (_, i) => ({
        id: i,
        name: `Race ${i + 1}`,
        startInstant: '2020-02-18T08:02:00Z'
      })) as Array<RaceModel>
    );
    const asyncWrapper = await finishedRaceWrapper();

    const wrapper = asyncWrapper.findComponent(FinishedRaces);
    const pagination = wrapper.findComponent(Pagination);

    expect(pagination.props().currentPage).toBe(2);

    await pagination.vm.$emit('pageChange', 1);
    await flushPromises();

    expect(pagination.props().currentPage).toBe(1);

    expect(router.currentRoute.value.query).toStrictEqual({ page: '1' });

    // it should display races between 0 and 9
    const raceComponents = wrapper.findAllComponents(Race);

    expect(raceComponents).toHaveLength(10);
    expect(raceComponents[0].props().raceModel.id).toBe(0);
    expect(raceComponents[9].props().raceModel.id).toBe(9);
  });
});
