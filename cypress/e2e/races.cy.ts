describe('Races', () => {
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
    ]).as('getPendingRaces');
    // return an array of 60 races
    cy.intercept(
      'GET',
      'api/races?status=FINISHED',
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        name: 'Tokyo ' + i,
        ponies: [
          { id: 11, name: 'Fast Rainbow', color: 'YELLOW' },
          { id: 12, name: 'Gentle Castle', color: 'ORANGE' },
          { id: 13, name: 'Awesome Rock', color: 'PURPLE' },
          { id: 14, name: 'Little Rainbow', color: 'BLUE' },
          { id: 15, name: 'Great Soda', color: 'GREEN' }
        ],
        startInstant: '2020-02-18T08:01:00Z'
      }))
    ).as('getFinishedRaces');
  }

  function storeUserInLocalStorage() {
    localStorage.setItem('rememberMe', JSON.stringify(user));
  }

  beforeEach(() => startBackend());

  it('should display a list of pending races by default', () => {
    cy.visit('/races');
    // should redirect to home page as the user is not logged
    cy.location('pathname')
      .should('eq', '/')
      .then(
        // log the user and try again
        () => storeUserInLocalStorage()
      );
    cy.visit('/races');
    // loading
    cy.contains('div', 'Loading');
    cy.location('pathname').should('eq', '/races/pending');
    cy.wait('@getPendingRaces');
    cy.get('h2').should('have.length', 2);
    cy.get('p').should('have.length', 2).and('contain', 'ago');
    cy.get('div.alert').should('not.exist');
  });

  it('should display a loading error', () => {
    storeUserInLocalStorage();
    // override the response to have an error
    cy.intercept('GET', 'api/races?status=PENDING', {
      statusCode: 404,
      delay: 500
    }).as('getRacesError');
    cy.visit('/races');
    // loading
    cy.contains('div', 'Loading');
    cy.wait('@getRacesError');
    cy.contains('div.alert', 'An error occurred while loading');
  });

  it('should display ponies', () => {
    storeUserInLocalStorage();
    cy.visit('/races');
    cy.wait('@getPendingRaces');
    cy.get('figure').should('have.length', 10);
    cy.get('img').should('have.length', 10);
    cy.get('figcaption').should('have.length', 10);
  });

  it('should display a list of finished races in another tab', () => {
    storeUserInLocalStorage();
    cy.visit('/races/pending');
    cy.wait('@getPendingRaces');

    const pendingRacesTab = () => cy.get('.nav-tabs .nav-link').first();
    const finishedRacesTab = () => cy.get('.nav-tabs .nav-link').eq(1);

    pendingRacesTab().should('have.class', 'active').and('contain', 'Pending races');
    finishedRacesTab().should('not.have.class', 'active').and('contain', 'Finished races');
    finishedRacesTab().click();

    cy.location('pathname').should('eq', '/races/finished');
    cy.wait('@getFinishedRaces');

    pendingRacesTab().should('not.have.class', 'active');
    finishedRacesTab().should('have.class', 'active');

    cy.get('h2').should('have.length', 10);
    cy.get('h2').first().should('contain', 'Tokyo 0');
    cy.get('p').should('have.length', 10);
    cy.get('p').first().should('contain', 'ago');

    // when we click on the third page
    cy.get('.pagination .page').eq(2).click();
    // then the URL contains the page number
    cy.location('search').should('eq', '?page=3');

    // and the page should display the correct races
    cy.get('h2').should('have.length', 10);
    cy.get('h2').first().should('contain', 'Tokyo 20');

    // when we click on next
    cy.get('.pagination .next').click();
    // then the URL contains the next page number
    cy.location('search').should('eq', '?page=4');

    // and the page should display the correct races
    cy.get('h2').should('have.length', 10);
    cy.get('h2').first().should('contain', 'Tokyo 30');

    // when we click on previous
    cy.get('.pagination .previous').click();
    // then the URL contains the previous page number
    cy.location('search').should('eq', '?page=3');
  });
});
