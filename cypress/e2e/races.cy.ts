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
  }

  beforeEach(() => startBackend());

  it('should display a race list', () => {
    cy.visit('/races');
    // loading
    cy.contains('div', 'Loading');
    cy.wait('@getRaces');
    cy.get('h2').should('have.length', 2);
    cy.get('p').should('have.length', 2).and('contain', 'ago');
    cy.get('div.alert').should('not.exist');
  });

  it('should display a loading error', () => {
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
    cy.visit('/races');
    cy.wait('@getRaces');
    cy.get('figure').should('have.length', 10);
    cy.get('img').should('have.length', 10);
    cy.get('figcaption').should('have.length', 10);
  });
});
