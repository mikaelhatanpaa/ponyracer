import * as Webstomp from 'webstomp-client';

interface LiveRaceModel {
  ponies: Array<{ id: number; name: string; color: string; position: number; boosted?: boolean }>;
  status: 'RUNNING' | 'FINISHED';
}

describe('Live', () => {
  const race = {
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

  const user = {
    id: 1,
    login: 'cedric',
    money: 1000,
    registrationInstant: '2015-12-01T11:00:00Z',
    token: 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjF9.5cAW816GUAg3OWKWlsYyXI4w3fDrS5BpnmbyBjVM7lo'
  };

  function startBackend() {
    cy.intercept('GET', 'api/races?status=PENDING', [
      race,
      {
        id: 13,
        name: 'Tokyo',
        ponies: [
          { id: 6, name: 'Fast Rainbow', color: 'BLUE' },
          { id: 7, name: 'Gentle Castle', color: 'GREEN' },
          { id: 8, name: 'Awesome Rock', color: 'PURPLE' },
          { id: 9, name: 'Little Rainbow', color: 'YELLOW' },
          { id: 10, name: 'Great Soda', color: 'ORANGE' }
        ],
        startInstant: '2020-02-18T08:03:00Z'
      }
    ]).as('getRaces');

    cy.intercept('GET', 'api/races/12', race).as('getRace');

    cy.intercept('POST', 'api/races/12/bets', { ...race, betPonyId: 1 }).as('betRace');

    cy.intercept('POST', 'api/races/12/boosts', {}).as('boostPony');
  }

  function storeUserInLocalStorage() {
    localStorage.setItem('rememberMe', JSON.stringify(user));
  }

  function buildFakeWS() {
    const fakeWS = {
      close: () => {
        return;
      },
      send: (message: string) => {
        const unmarshalled = Webstomp.Frame.unmarshallSingle(message);
        if (unmarshalled.command === 'CONNECT') {
          fakeWS.onmessage!({ data: Webstomp.Frame.marshall('CONNECTED') } as MessageEvent);
        } else if (unmarshalled.command === 'SUBSCRIBE' && unmarshalled.headers.destination === '/race/12') {
          fakeWS.id = unmarshalled.headers.id;
        }
      },
      emulateRace: (liveRaceModel: LiveRaceModel) => {
        const headers = {
          destination: '/race/12',
          subscription: fakeWS.id
        };
        const data = Webstomp.Frame.marshall('MESSAGE', headers, JSON.stringify(liveRaceModel));
        fakeWS.onmessage!({ data } as MessageEvent);
      }
    } as WebSocket & { id: string | undefined; emulateRace: (race: LiveRaceModel) => void };
    const wsOptions = {
      onBeforeLoad: (win: Window) => {
        cy.stub(win as Window & { WebSocket: WebSocket }, 'WebSocket')
          .as('ws')
          .returns(fakeWS);
      }
    };
    return { fakeWS, wsOptions };
  }

  beforeEach(() => startBackend());

  it('should display a pending live race', () => {
    storeUserInLocalStorage();

    cy.visit('/races');
    cy.wait('@getRaces');

    // go to bet page for the first race
    cy.get('.btn-primary').first().click();
    cy.wait('@getRace');

    // bet on first pony
    cy.get('img').first().click();
    cy.wait('@betRace');

    // emulate a pending race
    cy.intercept('GET', 'api/races/12', {
      ...race,
      betPonyId: 2,
      status: 'PENDING'
    }).as('getPendingRace');

    // go to live
    cy.get('.btn-primary').first().click();
    cy.location('pathname').should('eq', '/races/12/live');
    cy.wait('@getPendingRace');

    // race detail should be displayed
    cy.get('h1').should('contain', 'Paris');
    cy.get('p').should('contain', 'ago');
    cy.get('img').should('have.length', 5);
    cy.get('.selected').should('have.length', 1);
  });

  it('should display a running live race and boost a pony', () => {
    storeUserInLocalStorage();
    const { fakeWS, wsOptions } = buildFakeWS();

    cy.visit('/races', wsOptions);
    cy.wait('@getRaces');

    // go to bet page for the first race
    cy.get('.btn-primary').first().click();
    cy.wait('@getRace');

    // bet on first pony
    cy.get('img').first().click();
    cy.wait('@betRace');

    // emulate a running race
    cy.intercept('GET', 'api/races/12', {
      ...race,
      betPonyId: 2,
      status: 'RUNNING'
    }).as('getRunningRace');

    // go to live
    cy.get('.btn-primary').first().click();
    cy.location('pathname').should('eq', '/races/12/live');
    cy.wait('@getRunningRace');
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(400);

    // WebSocket connection created
    cy.get('@ws')
      .should('be.called')
      .then(() =>
        fakeWS.emulateRace({
          ponies: [
            { id: 1, name: 'Gentle Pie', color: 'YELLOW', position: 30 },
            { id: 2, name: 'Big Soda', color: 'ORANGE', position: 80 },
            { id: 3, name: 'Gentle Bottle', color: 'PURPLE', position: 70 },
            { id: 4, name: 'Superb Whiskey', color: 'GREEN', position: 60 },
            { id: 5, name: 'Fast Rainbow', color: 'BLUE', position: 30 }
          ],
          status: 'RUNNING'
        })
      );

    // running ponies should be displayed
    cy.get('h1').should('contain', 'Paris');
    cy.get('img').should('have.length', 5);
    cy.get('figure').parent().should('have.attr', 'style').and('include', 'margin-left: 25%;');
    cy.get('.selected')
      .should('have.length', 1)
      .then(() =>
        fakeWS.emulateRace({
          ponies: [
            { id: 1, name: 'Gentle Pie', color: 'YELLOW', position: 50 },
            { id: 2, name: 'Big Soda', color: 'ORANGE', position: 90 },
            { id: 3, name: 'Gentle Bottle', color: 'PURPLE', position: 70 },
            { id: 4, name: 'Superb Whiskey', color: 'GREEN', position: 65 },
            { id: 5, name: 'Fast Rainbow', color: 'BLUE', position: 30 }
          ],
          status: 'RUNNING'
        })
      );
    cy.get('img').should('have.length', 5);
    cy.get('figure')
      .parent()
      .should('have.attr', 'style')
      .and('include', 'margin-left: 45%;')
      .then(() =>
        fakeWS.emulateRace({
          ponies: [
            { id: 1, name: 'Gentle Pie', color: 'YELLOW', position: 60, boosted: true },
            { id: 2, name: 'Big Soda', color: 'ORANGE', position: 90 },
            { id: 3, name: 'Gentle Bottle', color: 'PURPLE', position: 70 },
            { id: 4, name: 'Superb Whiskey', color: 'GREEN', position: 65 },
            { id: 5, name: 'Fast Rainbow', color: 'BLUE', position: 30 }
          ],
          status: 'RUNNING'
        })
      );
    // boost the first pony
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(500);
    // eslint-disable-next-line cypress/unsafe-to-chain-command
    cy.get('img').first().click().click().click().click().click().click();
    cy.wait('@boostPony').its('request.body').should('contain', { ponyId: 1 });
    cy.get('img').should('have.attr', 'src').and('include', '-rainbow.gif');
  });

  it('should display a finished live race', () => {
    storeUserInLocalStorage();
    const { fakeWS, wsOptions } = buildFakeWS();

    cy.visit('/races', wsOptions);
    cy.wait('@getRaces');

    // go to bet page for the first race
    cy.get('.btn-primary').first().click();
    cy.wait('@getRace');

    // bet on first pony
    cy.get('img').first().click();
    cy.wait('@betRace');

    // emulate a finished race
    cy.intercept('GET', 'api/races/12', {
      ...race,
      betPonyId: 2,
      status: 'RUNNING'
    }).as('getRunningRace');

    // go to live
    cy.get('.btn-primary').first().click();
    cy.location('pathname').should('eq', '/races/12/live');
    cy.wait('@getRunningRace');
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(400);

    // WebSocket connection created
    cy.get('@ws')
      .should('be.called')
      // and emulate a finished race
      .then(() =>
        fakeWS.emulateRace({
          ponies: [
            { id: 1, name: 'Gentle Pie', color: 'YELLOW', position: 30 },
            { id: 2, name: 'Big Soda', color: 'ORANGE', position: 100 },
            { id: 3, name: 'Gentle Bottle', color: 'PURPLE', position: 70 },
            { id: 4, name: 'Superb Whiskey', color: 'GREEN', position: 60 },
            { id: 5, name: 'Fast Rainbow', color: 'BLUE', position: 30 }
          ],
          status: 'FINISHED'
        })
      );

    // victorious pony should be displayed
    cy.get('h1').should('contain', 'Paris');
    cy.get('img').should('have.length', 1);
    cy.get('.selected').should('have.length', 1);
    cy.get('.alert.alert-success').should('have.text', 'You won your bet!');
  });
});
