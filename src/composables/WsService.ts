import * as Webstomp from 'webstomp-client';

export interface Connection {
  disconnect: () => void;
}

const wsService = {
  connect<T>(channel: string, callback: (entity: T) => void): Connection {
    const webSocket = new WebSocket(`wss://ponyracer.ninja-squad.com/ws`);
    const stompClient: Webstomp.Client = Webstomp.over(webSocket, { debug: false });
    let subscription: Webstomp.Subscription;
    stompClient.connect({}, () => {
      subscription = stompClient.subscribe(channel, (message: Webstomp.Message) => {
        const entity: T = JSON.parse(message.body);
        callback(entity);
      });
    });
    return {
      disconnect() {
        subscription?.unsubscribe();
        webSocket.close();
      }
    };
  }
};

export function useWsService() {
  return wsService;
}
