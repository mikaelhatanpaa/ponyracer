import { describe, expect, test, vi } from 'vitest';
import * as Webstomp from 'webstomp-client';
import { useWsService } from '@/composables/WsService';
import { RaceModel } from '@/models/RaceModel';

declare const global: Window & { WebSocket: () => WebSocket };

// mock the WebSocket object with a fake one
const webSocket = {
  close: vi.fn()
} as unknown as WebSocket;
vi.spyOn(global, 'WebSocket').mockImplementation(() => webSocket);

vi.mock('webstomp-client', () => ({
  over: vi.fn()
}));

describe('WsService', () => {
  test('should connect to the backend', () => {
    let race: RaceModel | null = null;

    // message body returned from the backend
    const raceAsJSON = '{ "id": 12 }';
    // fake Webstomp client that immediately executes the connection callback when connecting
    // and the subscribe callback when subscribing, with a fake message
    const subscription = {
      unsubscribe: vi.fn()
    } as unknown as Webstomp.Subscription;
    const client = {
      connect: vi.fn((_headers, callback) => callback()),
      subscribe: vi.fn((_destination, callback) => {
        callback!({ body: raceAsJSON } as Webstomp.Message);
        return subscription;
      })
    } as unknown as Webstomp.Client;
    vi.mocked(Webstomp.over).mockReturnValue(client);

    const wsService = useWsService();
    const connection = wsService.connect<RaceModel>('/live/12', entity => (race = entity));

    // The WebSocket constructor should be called with the proper URL
    expect(global.WebSocket).toHaveBeenCalledWith('wss://ponyracer.ninja-squad.com/ws');
    // The Webstomp `over` method should have been called
    expect(Webstomp.over).toHaveBeenCalled();
    // The Webstomp client `connect` method should have been called
    expect(client.connect).toHaveBeenCalled();
    // The Webstomp client `subscribe` method should have been called
    expect(client.subscribe).toHaveBeenCalledWith('/live/12', expect.any(Function));
    // The `subscribe` method should deserialize the JSON received in the message body,
    // and call the callback with the result
    expect(race!.id).toBe(12);

    // The connection object returned should have a `disconnect` function
    expect(connection.disconnect).toBeDefined();

    connection.disconnect();

    expect(webSocket.close).toHaveBeenCalled();
    expect(subscription.unsubscribe).toHaveBeenCalled();

    vi.spyOn(client, 'subscribe').mockImplementation((_channel, callback) => {
      callback!({ body: raceAsJSON } as Webstomp.Message);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return null as any;
    });

    // Check if the subscription exists before unsubscribe
    const failedConnection = wsService.connect<RaceModel>('/live/12', entity => (race = entity));
    failedConnection.disconnect();

    expect(webSocket.close).toHaveBeenCalled();
    expect(subscription.unsubscribe).toHaveBeenCalledTimes(1);
  });
});
