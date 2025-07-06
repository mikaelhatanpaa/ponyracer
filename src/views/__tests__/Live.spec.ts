import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { defineComponent } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
import { injectRouterMock } from 'vue-router-mock';
import { createVitestRouterMock } from '@/__tests__/router-mock';
import Live from '@/views/Live.vue';
import Pony from '@/components/Pony.vue';
import Alert from '@/components/Alert.vue';
import { LiveRaceModel, RaceModel } from '@/models/RaceModel';
import { PonyWithPositionModel } from '@/models/PonyModel';

const mockRaceService = {
  get: vi.fn(),
  boost: vi.fn()
};
vi.mock('@/composables/RaceService', () => ({
  useRaceService: () => mockRaceService
}));

const mockWsService = {
  connect: vi.fn()
};
vi.mock('@/composables/WsService', () => ({
  useWsService: () => mockWsService
}));

const AsyncWrapper = defineComponent({
  components: { Live },
  template: `<Suspense><Live/></Suspense>`
});
const router = createVitestRouterMock();

async function liveWrapper() {
  injectRouterMock(router);
  // fake router params
  router.setParams({
    raceId: 12
  });
  const wrapper = mount(AsyncWrapper, {
    global: {
      components: {
        Alert
      }
    }
  });
  await flushPromises();
  return wrapper;
}

describe('Live.vue', () => {
  const race: RaceModel = {
    id: 12,
    betPonyId: 1,
    name: 'Paris',
    ponies: [
      { id: 1, name: 'Gentle Pie', color: 'YELLOW' },
      { id: 2, name: 'Big Soda', color: 'ORANGE' },
      { id: 3, name: 'Gentle Bottle', color: 'PURPLE' },
      { id: 4, name: 'Superb Whiskey', color: 'GREEN' },
      { id: 5, name: 'Fast Rainbow', color: 'BLUE' }
    ],
    startInstant: '2020-02-18T08:02:00Z',
    status: 'PENDING'
  };

  test('should display a race name, its date and its ponies when pending', async () => {
    // Given a pending race
    mockRaceService.get.mockResolvedValue(race);

    const connection = { disconnect: vi.fn() };
    mockWsService.connect.mockReturnValue(connection);

    const wrapper = await liveWrapper();

    // It should fetch the race detail using the id in the route params.
    expect(mockRaceService.get).toHaveBeenCalledWith(12);

    // It should connect to the WebSocket channel
    expect(mockWsService.connect).toHaveBeenCalledWith('/race/12', expect.any(Function));

    // Then we should have the name and ponies displayed in the template
    const ponies = wrapper.findAllComponents(Pony);

    // You should have one Pony component per pony
    expect(ponies).toHaveLength(5);

    const gentlePie = ponies[0];
    const bigSoda = ponies[1];

    // Ponies should not be running
    expect(gentlePie.props().isRunning).toBe(false);
    expect(bigSoda.props().isRunning).toBe(false);
    // The betted pony should be selected
    expect(gentlePie.element.parentElement!.classList.contains('selected')).toBe(true);
    expect(bigSoda.element.parentElement!.classList.contains('selected')).toBe(false);

    // You need an h1 element for the race name
    const raceName = wrapper.get('h1');

    expect(raceName.text()).toContain('Paris');

    // You need a `p` element to display the start instant
    const startInstant = wrapper.get('p');

    // You should use the `fromNow` utils and a computed prop to format the start instant
    expect(startInstant.text()).toContain('ago');
  });

  test('should display an error if connecting to the websocket fails', async () => {
    mockRaceService.get.mockResolvedValue(race);
    mockWsService.connect.mockImplementation(() => {
      throw new Error('Oops');
    });
    const wrapper = await liveWrapper();

    // Then we should an alert displayed in the template
    const alert = wrapper.getComponent(Alert);

    expect(alert.text()).toContain('A problem occurred during the live');
    expect(alert.props().variant).toBe('danger');

    // close the alert
    await alert.get('button').trigger('click');

    // the error message should not be displayed anymore
    expect(wrapper.findComponent(Alert).exists()).toBe(false);
  });

  test('should display a race name, and its running ponies when running', async () => {
    // Given a running race
    const liveRace: LiveRaceModel = {
      ponies: [
        { id: 1, name: 'Gentle Pie', color: 'YELLOW', position: 50, boosted: false },
        { id: 2, name: 'Big Soda', color: 'ORANGE', position: 20, boosted: false },
        { id: 3, name: 'Gentle Bottle', color: 'PURPLE', position: 20, boosted: false },
        { id: 4, name: 'Superb Whiskey', color: 'GREEN', position: 20, boosted: false },
        { id: 5, name: 'Fast Rainbow', color: 'BLUE', position: 20, boosted: false }
      ],
      status: 'RUNNING'
    };

    mockRaceService.get.mockResolvedValue({ ...race, status: 'RUNNING' });

    const connection = { disconnect: vi.fn() };
    mockWsService.connect.mockReturnValue(connection);

    const wrapper = await liveWrapper();

    // It should fetch the race detail using the id in the route params.
    expect(mockRaceService.get).toHaveBeenCalledWith(12);

    // It should connect to the WebSocket channel
    expect(mockWsService.connect).toHaveBeenCalledWith('/race/12', expect.any(Function));

    const wsCallback = mockWsService.connect.mock.calls[0][1];
    wsCallback(liveRace);
    await flushPromises();

    // Then we should have the name and ponies displayed in the template
    const ponies = wrapper.findAllComponents(Pony);

    // You should have one Pony component per pony
    expect(ponies).toHaveLength(5);

    const gentlePie = ponies[0];
    const bigSoda = ponies[1];

    // Ponies should be running
    expect(gentlePie.props().isRunning).toBe(true);
    expect(bigSoda.props().isRunning).toBe(true);
    // And should have a margin left according to their position on the wrapping div
    expect(gentlePie.element.parentElement!.style.marginLeft).toBe('45%');
    expect(bigSoda.element.parentElement!.style.marginLeft).toBe('15%');
    // The betted pony should be selected
    expect(gentlePie.element.parentElement!.classList.contains('selected')).toBe(true);
    expect(bigSoda.element.parentElement!.classList.contains('selected')).toBe(false);

    // You need an h1 element for the race name
    const raceName = wrapper.get('h1');

    expect(raceName.text()).toContain('Paris');
  });

  test('should update positions when running', async () => {
    // Given a running race
    const liveRace: LiveRaceModel = {
      ponies: [
        { id: 1, name: 'Gentle Pie', color: 'YELLOW', position: 0, boosted: false },
        { id: 2, name: 'Big Soda', color: 'ORANGE', position: 0, boosted: false }
      ],
      status: 'RUNNING'
    };

    mockRaceService.get.mockResolvedValue({ ...race, status: 'RUNNING' });

    const connection = { disconnect: vi.fn() };
    mockWsService.connect.mockReturnValue(connection);

    const wrapper = await liveWrapper();

    // It should fetch the race detail using the id in the route params.
    expect(mockRaceService.get).toHaveBeenCalledWith(12);

    // It should connect to the WebSocket channel
    const wsCallback = mockWsService.connect.mock.calls[0][1];
    wsCallback(liveRace);
    await flushPromises();

    // Then we should have the name and ponies displayed in the template
    const ponies = wrapper.findAllComponents(Pony);

    // You should have one Pony component per pony
    expect(ponies).toHaveLength(2);

    const gentlePie = ponies[0];
    const bigSoda = ponies[1];

    // Ponies should be running
    expect(gentlePie.props().isRunning).toBe(true);
    expect(bigSoda.props().isRunning).toBe(true);
    // And should have a margin left according to their position on the wrapping div
    expect(gentlePie.element.parentElement!.style.marginLeft).toBe('-5%');
    expect(bigSoda.element.parentElement!.style.marginLeft).toBe('-5%');

    // The position should be updated when received via websockets
    liveRace.ponies[0].position = 20;
    liveRace.ponies[1].position = 10;
    wsCallback(liveRace);

    // Then the positions of the ponies should have been updated
    const liveComponent = wrapper.getComponent(Live).vm as unknown as { runningPonies: Array<PonyWithPositionModel>; raceModel: RaceModel };

    expect(liveComponent.runningPonies[0].position).toBe(20);
    expect(liveComponent.runningPonies[1].position).toBe(10);

    // The position and status should be updated when received via websockets
    liveRace.ponies[0].position = 30;
    liveRace.ponies[1].position = 100;
    liveRace.status = 'FINISHED';
    wsCallback(liveRace);

    // Then the positions of the ponies should have been updated
    expect(liveComponent.runningPonies[0].position).toBe(30);
    expect(liveComponent.runningPonies[1].position).toBe(100);
    // Anf the status as well
    expect(liveComponent.raceModel.status).toBe('FINISHED');

    // The disconnection function should have been called
    expect(connection.disconnect).toHaveBeenCalled();
  });

  test('should display the race when finished with a won bet', async () => {
    // Given a finished race
    mockRaceService.get.mockResolvedValue({ ...race, status: 'FINISHED' });

    const connection = { disconnect: vi.fn() };
    mockWsService.connect.mockReturnValue(connection);

    const wrapper = await liveWrapper();
    const liveComponent = wrapper.getComponent(Live).vm as unknown as { runningPonies: Array<PonyWithPositionModel> };
    liveComponent.runningPonies = [
      { id: 1, name: 'Gentle Pie', color: 'YELLOW', position: 100, boosted: false },
      { id: 2, name: 'Big Soda', color: 'ORANGE', position: 90, boosted: false },
      { id: 3, name: 'Gentle Bottle', color: 'PURPLE', position: 100, boosted: false }
    ];
    await flushPromises();

    // It should fetch the race detail using the id in the route params.
    expect(mockRaceService.get).toHaveBeenCalledWith(12);

    // It should not connect to the WebSocket channel as the race is finished
    expect(mockWsService.connect).not.toHaveBeenCalled();

    // Then we should have the ponies that won the race
    const ponies = wrapper.findAllComponents(Pony);

    expect(ponies).toHaveLength(2);

    const gentlePie = ponies[0];
    const gentleBottle = ponies[1];

    // Ponies should not be running
    expect(gentlePie.props().isRunning).toBe(false);
    expect(gentleBottle.props().isRunning).toBe(false);
    // The betted pony should be selected
    expect(gentlePie.element.parentElement!.classList.contains('selected')).toBe(true);
    expect(gentleBottle.element.parentElement!.classList.contains('selected')).toBe(false);

    // You need an h1 element for the race name
    const raceName = wrapper.get('h1');

    expect(raceName.text()).toContain('Paris');

    // It should not display a warning alert as the bet is won
    const alerts = wrapper.findAllComponents(Alert);

    expect(alerts).toHaveLength(1);

    // It should display a success alert as the bet is won
    const betWonAlert = wrapper.getComponent(Alert);

    expect(betWonAlert.text()).toContain('You won your bet!');
    expect(betWonAlert.props().variant).toBe('success');
  });

  test('should display the race when finished with a lost bet', async () => {
    // Given a finished race
    mockRaceService.get.mockResolvedValue({ ...race, status: 'FINISHED', betPonyId: 2 });

    const connection = { disconnect: vi.fn() };
    mockWsService.connect.mockReturnValue(connection);

    const wrapper = await liveWrapper();
    const liveComponent = wrapper.getComponent(Live).vm as unknown as { runningPonies: Array<PonyWithPositionModel> };
    liveComponent.runningPonies = [
      { id: 1, name: 'Gentle Pie', color: 'YELLOW', position: 100, boosted: false },
      { id: 2, name: 'Big Soda', color: 'ORANGE', position: 90, boosted: false },
      { id: 3, name: 'Gentle Bottle', color: 'PURPLE', position: 100, boosted: false }
    ];
    await flushPromises();

    // It should fetch the race detail using the id in the route params.
    expect(mockRaceService.get).toHaveBeenCalledWith(12);

    // It should not connect to the WebSocket channel as the race is finished
    expect(mockWsService.connect).not.toHaveBeenCalled();

    // Then we should have the ponies that won the race
    const ponies = wrapper.findAllComponents(Pony);

    expect(ponies).toHaveLength(2);

    const gentlePie = ponies[0];
    const gentleBottle = ponies[1];

    // Ponies should not be running
    expect(gentlePie.props().isRunning).toBe(false);
    expect(gentleBottle.props().isRunning).toBe(false);
    // The betted pony should be selected
    expect(gentlePie.element.parentElement!.classList.contains('selected')).toBe(false);
    expect(gentleBottle.element.parentElement!.classList.contains('selected')).toBe(false);

    // You need an h1 element for the race name
    const raceName = wrapper.get('h1');

    expect(raceName.text()).toContain('Paris');

    // It should not display a success alert as the bet is lost
    const alerts = wrapper.findAllComponents(Alert);

    expect(alerts).toHaveLength(1);

    // It should display a warning alert if the bet is lost
    const betLostAlert = wrapper.getComponent(Alert);

    expect(betLostAlert.text()).toContain('You lost your bet');
    expect(betLostAlert.props().variant).toBe('warning');
  });

  test('should display the race when finished some time ago', async () => {
    // Given a finished race
    mockRaceService.get.mockResolvedValue({ ...race, status: 'FINISHED' });

    const connection = { disconnect: vi.fn() };
    mockWsService.connect.mockReturnValue(connection);

    const wrapper = await liveWrapper();

    // It should fetch the race detail using the id in the route params.
    expect(mockRaceService.get).toHaveBeenCalledWith(12);

    // It should not connect to the WebSocket channel as the race is finished
    expect(mockWsService.connect).not.toHaveBeenCalled();

    // Then we should have no ponies displayed
    const ponies = wrapper.findAllComponents(Pony);

    expect(ponies).toHaveLength(0);

    // You need an h1 element for the race name
    const raceName = wrapper.get('h1');

    expect(raceName.text()).toContain('Paris');

    // It should not display a success alert as the race is over
    const betWonAlert = wrapper.find('.alert.alert-success');

    expect(betWonAlert.exists()).toBe(false);

    // It should not display a warning alert if the race is over
    const betLostAlert = wrapper.find('.alert.alert-warning');

    expect(betLostAlert.exists()).toBe(false);

    // A simple text should inform the user that the race is over
    expect(wrapper.get('div').text()).toContain('The race is over');
  });

  test('should disconnect from websocket on destruction to avoid memory leaks', async () => {
    // Given a running race
    mockRaceService.get.mockResolvedValue({ ...race, status: 'RUNNING' });

    const connection = { disconnect: vi.fn() };
    mockWsService.connect.mockReturnValueOnce(connection);

    let wrapper = await liveWrapper();
    wrapper.unmount();

    // It should call the disconnect function on destruction
    expect(connection.disconnect).toHaveBeenCalled();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockWsService.connect.mockReturnValueOnce(null as any);

    wrapper = await liveWrapper();
    wrapper.unmount();

    // It should call the disconnect function on destruction only if it exists
    expect(connection.disconnect).toHaveBeenCalledTimes(1);
  });

  describe('boost', () => {
    beforeEach(() => {
      // Use fake timers for these tests to enable jumping in time
      vi.useFakeTimers();
    });

    afterEach(() => {
      // Restore the timers
      vi.useRealTimers();
    });

    test('should boost a pony if clicked 5 times in less than a second', async () => {
      // Given a running race
      mockRaceService.get.mockResolvedValue({ ...race, status: 'RUNNING' });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockRaceService.boost.mockResolvedValue({} as any);

      const connection = { disconnect: vi.fn() };
      mockWsService.connect.mockReturnValueOnce(connection);

      const wrapper = await liveWrapper();
      const liveComponent = wrapper.getComponent(Live).vm as unknown as { runningPonies: Array<PonyWithPositionModel> };
      liveComponent.runningPonies = [
        { id: 1, name: 'Gentle Pie', color: 'YELLOW', position: 0, boosted: true },
        { id: 2, name: 'Big Soda', color: 'ORANGE', position: 0, boosted: false },
        { id: 3, name: 'Gentle Bottle', color: 'PURPLE', position: 0, boosted: false }
      ];
      await flushPromises();

      // Should bind the props isBoosted
      const firstPony = wrapper.getComponent(Pony);

      expect(firstPony.props().isBoosted).toBe(true);

      // If the user clicks on the first pony 5 times every 200ms
      const emit = firstPony.vm.$emit as (event: string) => void;
      emit('ponySelected');
      vi.advanceTimersByTime(200);
      emit('ponySelected');
      vi.advanceTimersByTime(200);
      emit('ponySelected');
      vi.advanceTimersByTime(200);
      emit('ponySelected');
      vi.advanceTimersByTime(200);
      emit('ponySelected');

      // Then we should have a boost triggered
      expect(mockRaceService.boost).toHaveBeenCalledWith(12, 1);
    });

    test('should not boost a pony if clicked 5 times in more than a second', async () => {
      // Given a running race
      mockRaceService.get.mockResolvedValue({ ...race, status: 'RUNNING' });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockRaceService.boost.mockResolvedValue({} as any);

      const connection = { disconnect: vi.fn() };
      mockWsService.connect.mockReturnValueOnce(connection);

      const wrapper = await liveWrapper();
      const liveComponent = wrapper.getComponent(Live).vm as unknown as { runningPonies: Array<PonyWithPositionModel> };
      liveComponent.runningPonies = [
        { id: 1, name: 'Gentle Pie', color: 'YELLOW', position: 0, boosted: false },
        { id: 2, name: 'Big Soda', color: 'ORANGE', position: 0, boosted: false },
        { id: 3, name: 'Gentle Bottle', color: 'PURPLE', position: 0, boosted: false }
      ];
      await flushPromises();

      // If the user clicks on the first pony 5 times in more than a second
      const firstPony = wrapper.getComponent(Pony);
      const emit = firstPony.vm.$emit as (event: string) => void;
      emit('ponySelected');
      vi.advanceTimersByTime(200);
      emit('ponySelected');
      vi.advanceTimersByTime(200);
      emit('ponySelected');
      vi.advanceTimersByTime(200);
      emit('ponySelected');
      vi.advanceTimersByTime(401);
      emit('ponySelected');

      // Then we should not have a boost triggered
      expect(mockRaceService.boost).not.toHaveBeenCalledWith(12, 1);

      // But then we have another click quickly
      vi.advanceTimersByTime(198);
      emit('ponySelected');

      // Then we should have a boost triggered
      expect(mockRaceService.boost).toHaveBeenCalledWith(12, 1);
    });

    test('should not boost a pony if clicked 5 times not consecutively', async () => {
      // Given a running race
      mockRaceService.get.mockResolvedValue({ ...race, status: 'RUNNING' });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockRaceService.boost.mockResolvedValue({} as any);

      const connection = { disconnect: vi.fn() };
      mockWsService.connect.mockReturnValueOnce(connection);

      const wrapper = await liveWrapper();
      const liveComponent = wrapper.getComponent(Live).vm as unknown as { runningPonies: Array<PonyWithPositionModel> };
      liveComponent.runningPonies = [
        { id: 1, name: 'Gentle Pie', color: 'YELLOW', position: 0, boosted: false },
        { id: 2, name: 'Big Soda', color: 'ORANGE', position: 0, boosted: false },
        { id: 3, name: 'Gentle Bottle', color: 'PURPLE', position: 0, boosted: false }
      ];
      await flushPromises();

      // If the user clicks on the first pony 5 times in more than a second
      const firstPony = wrapper.getComponent(Pony);
      const emit = firstPony.vm.$emit as (event: string) => void;
      emit('ponySelected');
      vi.advanceTimersByTime(200);
      emit('ponySelected');
      vi.advanceTimersByTime(200);
      emit('ponySelected');
      // click on second pony
      wrapper.findAllComponents(Pony)[1].vm.$emit('ponySelected');
      vi.advanceTimersByTime(200);
      emit('ponySelected');
      vi.advanceTimersByTime(200);
      emit('ponySelected');

      // Then we should not have a boost triggered
      expect(mockRaceService.boost).not.toHaveBeenCalledWith(12, 1);
    });
  });
});
