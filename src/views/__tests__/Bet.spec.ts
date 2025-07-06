import { describe, expect, test, vi } from 'vitest';
import { defineComponent } from 'vue';
import { flushPromises, mount, RouterLinkStub } from '@vue/test-utils';
import { injectRouterMock } from 'vue-router-mock';
import { createVitestRouterMock } from '@/__tests__/router-mock';
import Bet from '@/views/Bet.vue';
import Pony from '@/components/Pony.vue';
import Alert from '@/components/Alert.vue';
import { RaceModel } from '@/models/RaceModel';

const mockRaceService = {
  get: vi.fn(),
  bet: vi.fn(),
  cancelBet: vi.fn()
};
vi.mock('@/composables/RaceService', () => ({
  useRaceService: () => mockRaceService
}));

const AsyncWrapper = defineComponent({
  components: { Bet },
  template: `<Suspense><Bet/></Suspense>`
});
const router = createVitestRouterMock();

async function betWrapper() {
  injectRouterMock(router);
  // fake router params
  router.setParams({
    raceId: 12
  });
  const wrapper = mount(AsyncWrapper, {
    global: {
      components: {
        Alert
      },
      stubs: {
        RouterLink: RouterLinkStub
      }
    }
  });
  await flushPromises();
  return wrapper.getComponent(Bet);
}

describe('Bet.vue', () => {
  test('should initialize and display the race', async () => {
    const race: RaceModel = {
      id: 12,
      name: 'Paris',
      ponies: [
        { id: 1, name: 'Gentle Pie', color: 'YELLOW' },
        { id: 2, name: 'Big Soda', color: 'ORANGE' },
        { id: 3, name: 'Gentle Bottle', color: 'PURPLE' },
        { id: 4, name: 'Superb Whiskey', color: 'GREEN' },
        { id: 5, name: 'Fast Rainbow', color: 'BLUE' }
      ],
      startInstant: '2020-02-18T08:02:00Z'
    };
    mockRaceService.get.mockResolvedValue(race);

    const wrapper = await betWrapper();

    // It should fetch the race detail using the id in the route params.
    expect(mockRaceService.get).toHaveBeenCalledWith(12);

    // Then we should have the name and ponies displayed in the template
    const ponies = wrapper.findAllComponents(Pony);

    // You should have one Pony component per pony
    expect(ponies).toHaveLength(5);

    // You need an h1 element for the race name
    const raceName = wrapper.get('h1');

    expect(raceName.text()).toContain('Paris');

    // You need a `p` element to display the start instant
    const startInstant = wrapper.get('p');

    // You should use the `fromNow` utils and a computed prop to format the start instant
    expect(startInstant.text()).toContain('ago');
  });

  test('should trigger a bet when a pony is clicked', async () => {
    const race: RaceModel = {
      id: 12,
      name: 'Paris',
      ponies: [
        { id: 1, name: 'Gentle Pie', color: 'YELLOW' },
        { id: 2, name: 'Big Soda', color: 'ORANGE' }
      ],
      startInstant: '2020-02-18T08:02:00Z'
    };
    mockRaceService.get.mockResolvedValue(race);
    const raceWithBet = { ...race, name: 'Paris with bet', betPonyId: 1 };
    mockRaceService.bet.mockResolvedValue(raceWithBet);

    const wrapper = await betWrapper();

    // when we emit a `ponySelected` event
    await wrapper.getComponent(Pony).vm.$emit('ponySelected');
    await flushPromises();

    // then we should have placed a bet on the pony
    expect(mockRaceService.bet).toHaveBeenCalledWith(12, 1);

    // You must store the response of the bet in the field `raceModel`
    const raceName = wrapper.get('h1');

    expect(raceName.text()).toContain('Paris with bet');
  });

  test('should add selected class if the pony is the one we bet on', async () => {
    const race: RaceModel = {
      id: 12,
      name: 'Paris',
      ponies: [
        { id: 1, name: 'Gentle Pie', color: 'YELLOW' },
        { id: 2, name: 'Big Soda', color: 'ORANGE' }
      ],
      startInstant: '2020-02-18T08:02:00Z',
      betPonyId: 1
    };

    mockRaceService.get.mockResolvedValue(race);
    const wrapper = await betWrapper();
    await flushPromises();

    // The `selected` class should be added on the pony we bet on
    expect(wrapper.get('div.col').classes('selected')).toBe(true);

    // The `selected` class should not be added on the other ponies
    expect(wrapper.findAll('div.col')[1].classes('selected')).toBe(false);
  });

  test('should display an error message if bet failed', async () => {
    const race: RaceModel = {
      id: 12,
      name: 'Paris',
      ponies: [
        { id: 1, name: 'Gentle Pie', color: 'YELLOW' },
        { id: 2, name: 'Big Soda', color: 'ORANGE' }
      ],
      startInstant: '2020-02-18T08:02:00Z'
    };

    mockRaceService.get.mockResolvedValue(race);
    mockRaceService.bet.mockRejectedValue(new Error('Oops'));

    const wrapper = await betWrapper();
    await flushPromises();

    // the error message should not be displayed by default
    expect(wrapper.findComponent(Alert).exists()).toBe(false);

    await wrapper.getComponent(Pony).vm.$emit('ponySelected');
    await flushPromises();

    expect(mockRaceService.bet).toHaveBeenCalledWith(12, 1);

    // the error message should be displayed when the bet fails
    const message = wrapper.getComponent(Alert);

    expect(message.text()).toContain('The race is already started or finished');
    expect(message.props().variant).toBe('danger');
  });

  test('should cancel a bet', async () => {
    const race: RaceModel = {
      id: 12,
      name: 'Paris',
      ponies: [
        { id: 1, name: 'Gentle Pie', color: 'YELLOW' },
        { id: 2, name: 'Big Soda', color: 'ORANGE' }
      ],
      startInstant: '2020-02-18T08:02:00Z',
      betPonyId: 1
    };

    mockRaceService.get.mockResolvedValue(race);
    mockRaceService.cancelBet.mockResolvedValue({});
    const wrapper = await betWrapper();
    await flushPromises();

    await wrapper.getComponent(Pony).vm.$emit('ponySelected');
    await flushPromises();

    // `cancelBet` should be called with the race id if the pony is already selected
    expect(mockRaceService.cancelBet).toHaveBeenCalledWith(12);
    // The `selected` class should be removed from the pony
    expect(wrapper.get('div.col').classes('selected')).toBe(false);
  });

  test('should display a message if canceling a bet fails', async () => {
    const race: RaceModel = {
      id: 12,
      name: 'Lyon',
      ponies: [
        { id: 1, name: 'Gentle Pie', color: 'YELLOW' },
        { id: 2, name: 'Big Soda', color: 'ORANGE' }
      ],
      startInstant: '2020-02-18T08:02:00Z',
      betPonyId: 1
    };
    mockRaceService.get.mockResolvedValue(race);
    mockRaceService.cancelBet.mockRejectedValue(new Error('Oops'));
    const wrapper = await betWrapper();
    await flushPromises();

    await wrapper.getComponent(Pony).vm.$emit('ponySelected');
    await flushPromises();

    expect(mockRaceService.cancelBet).toHaveBeenCalledWith(12);

    // the error message should be displayed when canceling bet fails
    const message = wrapper.getComponent(Alert);

    expect(message.text()).toContain('The race is already started or finished');
    expect(message.props().variant).toBe('danger');

    // close the alert
    await message.get('button').trigger('click');

    // the error message should not be displayed anymore
    expect(wrapper.findComponent(Alert).exists()).toBe(false);
  });
});
