/// <reference types="cypress" />

/**
 * Balance Test - Test game mechanics and progression
 * 
 * Tests:
 * 1. Starting stats and progression
 * 2. Debt mechanics and loyalty penalty
 * 3. Stock trading profitability
 * 4. Plan execution and market impact
 * 5. Win/lose conditions
 */

describe('Game Balance Test', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.window().then((win) => {
      // Clear tutorial flag to skip it
      win.localStorage.setItem('orangeTutorialCompleted', 'true');
    });
    cy.reload();
    cy.wait(1000);
  });

  describe('1. Starting State & Basic Stats', () => {
    it('should start with correct initial stats', () => {
      // Click start game
      cy.contains('button', 'Start Game').click();
      cy.wait(2000);

      // Check initial stats via data attributes or text content
      cy.get('.stats-bar').within(() => {
        // Health should be 100
        cy.contains('100').should('exist');
        // Money should be 600B
        cy.contains('600B').should('exist');
      });
    });

    it('should have 4 turns per year (Annual Report check)', () => {
      cy.contains('button', 'Start Game').click();
      cy.wait(2000);

      // Play through 4 turns quickly
      for (let i = 0; i < 4; i++) {
        // Skip turn (go golfing)
        cy.contains('button', 'Golf').click({ force: true });
        cy.wait(3000);
      }

      // Annual Report should appear at turn 4
      cy.contains('Year 1 Review', { timeout: 5000 }).should('exist');
    });
  });

  describe('2. Debt Mechanics & Loyalty Penalty', () => {
    it('should apply interest on debt', () => {
      cy.contains('button', 'Start Game').click();
      cy.wait(2000);

      // Get starting money
      let startingMoney: number;
      cy.get('.stats-bar').contains(/\d+B/).invoke('text').then((text) => {
        startingMoney = parseInt(text);
      });

      // Execute expensive plan to go into debt
      cy.contains('button', 'Plan').click();
      cy.wait(1000);
      
      // Select first plan (any plan)
      cy.get('.plan-card').first().click();
      cy.wait(500);

      // Execute without spinning
      cy.contains('button', 'Blind Play').click({ force: true });
      cy.wait(2000);

      // Check if money went negative (debt)
      cy.get('.stats-bar').within(() => {
        cy.get('.money-value.negative').should('exist');
      });

      // Check The Juice for interest message
      cy.contains('Interest payment', { timeout: 5000 }).should('exist');
    });

    it('should apply loyalty penalty for debt > 100B', () => {
      cy.contains('button', 'Start Game').click();
      cy.wait(2000);

      // Try to accumulate debt by spending money
      // Post multiple rants to drain money
      for (let i = 0; i < 7; i++) {
        cy.contains('button', '📱 The Juice').click();
        cy.wait(500);
        cy.contains('button', '📝 Post').click();
        cy.wait(500);
        cy.get('textarea').type('Test rant #{i}');
        cy.contains('button', 'Post Rant').click();
        cy.wait(1000);
      }

      // Go to next turn
      cy.contains('button', 'Golf').click({ force: true });
      cy.wait(3000);

      // Check for loyalty penalty message
      cy.contains('Inner circle worried about debt').should('exist');
    });
  });

  describe('3. Stock Trading System', () => {
    it('should show all 15 stocks with charts', () => {
      cy.contains('button', 'Start Game').click();
      cy.wait(2000);

      // Open Cliff Street
      cy.contains('button', '📊').click();
      cy.wait(1000);

      // Check stock cards exist
      cy.get('.stock-card').should('have.length', 15);

      // Check mini-charts exist
      cy.get('.mini-chart-preview').should('have.length', 15);
    });

    it('should allow buying and selling stocks', () => {
      cy.contains('button', 'Start Game').click();
      cy.wait(2000);

      // Open Cliff Street
      cy.contains('button', '📊').click();
      cy.wait(1000);

      // Get starting cash
      let startingCash: number;
      cy.get('.summary-item').first().contains(/\d+B/).invoke('text').then((text) => {
        startingCash = parseInt(text.replace('B', ''));
      });

      // Buy first stock
      cy.get('.stock-card').first().within(() => {
        cy.contains('button', 'Buy').click();
      });
      cy.wait(500);

      // Confirm buy in modal
      cy.get('ion-modal').within(() => {
        cy.contains('button', 'Confirm').click();
      });
      cy.wait(1000);

      // Cash should decrease
      cy.get('.summary-item').first().contains(/\d+B/).invoke('text').then((text) => {
        const newCash = parseInt(text.replace('B', ''));
        expect(newCash).to.be.lessThan(startingCash);
      });

      // Portfolio value should increase
      cy.contains('Portfolio:').parent().should('not.contain', '0B');
    });

    it('should calculate profit/loss correctly', () => {
      cy.contains('button', 'Start Game').click();
      cy.wait(2000);

      // Open Cliff Street
      cy.contains('button', '📊').click();
      cy.wait(1000);

      // Buy a stock
      cy.get('.stock-card').first().within(() => {
        cy.contains('button', 'Buy').click();
      });
      cy.wait(500);
      cy.get('ion-modal').within(() => {
        cy.contains('button', 'Confirm').click();
      });
      cy.wait(1000);

      // Check Profit/Loss exists
      cy.contains('Profit/Loss:').should('exist');
      
      // Initially should be negative due to spread
      cy.contains('Profit/Loss:').parent().within(() => {
        cy.get('.value.negative').should('exist');
      });
    });
  });

  describe('4. Plan Execution & Market Impact', () => {
    it('should show market buzz on plan cards', () => {
      cy.contains('button', 'Start Game').click();
      cy.wait(2000);

      // Open plan selector
      cy.contains('button', 'Plan').click();
      cy.wait(1000);

      // Check for market buzz section
      cy.contains('Market Buzz').should('exist');

      // Check for market hints (not exact percentages)
      cy.get('.market-effect').should('have.length.greaterThan', 0);
      cy.get('.stock-hint').first().should('exist');
    });

    it('should update stock prices after plan execution', () => {
      cy.contains('button', 'Start Game').click();
      cy.wait(2000);

      // Get initial stock prices from Cliff Street
      cy.contains('button', '📊').click();
      cy.wait(1000);
      
      let initialPrices: number[] = [];
      cy.get('.stock-card').each(($card) => {
        const priceText = $card.find('.price').text();
        const price = parseInt(priceText.replace('$', ''));
        initialPrices.push(price);
      });

      // Go back and execute a plan
      cy.contains('button', 'Game').click();
      cy.wait(500);
      cy.contains('button', 'Plan').click();
      cy.wait(1000);

      // Select and execute a plan with market impact
      cy.get('.plan-card').first().click();
      cy.wait(500);
      cy.contains('button', 'Blind Play').click({ force: true });
      cy.wait(2000);

      // Check The Juice for stock market messages
      cy.contains('StockMarket', { timeout: 5000 }).should('exist');

      // Go back to Cliff Street and verify prices changed
      cy.contains('button', '📊').click();
      cy.wait(1000);

      let pricesChanged = false;
      cy.get('.stock-card').each(($card, index) => {
        const priceText = $card.find('.price').text();
        const newPrice = parseInt(priceText.replace('$', ''));
        if (newPrice !== initialPrices[index]) {
          pricesChanged = true;
        }
      }).then(() => {
        expect(pricesChanged).to.be.true;
      });
    });
  });

  describe('5. Debt Chart & Cliff Street', () => {
    it('should show correct debt in Cliff Street chart', () => {
      cy.contains('button', 'Start Game').click();
      cy.wait(2000);

      // Drain money by rants
      for (let i = 0; i < 10; i++) {
        cy.contains('button', '📱 The Juice').click();
        cy.wait(500);
        cy.contains('button', '📝 Post').click();
        cy.wait(500);
        cy.get('textarea').type('Drain money');
        cy.contains('button', 'Post Rant').click();
        cy.wait(500);
      }

      // Open Cliff Street
      cy.contains('button', '📊').click();
      cy.wait(1000);

      // Check debt chart shows non-zero value
      cy.contains('Debt').parent().within(() => {
        cy.contains(/\d+B/).should('not.contain', '0B');
      });
    });
  });

  describe('6. Win/Lose Progression', () => {
    it('should show game over on health = 0', () => {
      cy.contains('button', 'Start Game').click();
      cy.wait(2000);

      // Repeatedly use health for research
      cy.window().then((win: any) => {
        win.gameStore.stats.health = 5;
      });

      // Open plan and try research with health
      cy.contains('button', 'Plan').click();
      cy.wait(1000);

      // Click random research multiple times
      cy.get('.random-research-btn').first().click({ force: true });
      cy.wait(500);

      // Game should be over
      cy.contains('Game Over', { timeout: 5000 }).should('exist');
    });

    it('should check loyalty threshold at turn 16', () => {
      cy.contains('button', 'Start Game').click();
      cy.wait(2000);

      // Fast forward to turn 16
      cy.window().then((win: any) => {
        win.gameStore.currentTurn = 15;
        win.gameStore.stats.loyalty = 90; // Above threshold
      });

      // Execute one more turn
      cy.contains('button', 'Golf').click({ force: true });
      cy.wait(3000);

      // Should get second term
      cy.contains('Second Term', { timeout: 5000 }).should('exist');
    });
  });

  describe('7. Balance Observations', () => {
    it('should log progression statistics', () => {
      cy.contains('button', 'Start Game').click();
      cy.wait(2000);

      // Play through 8 turns (2 years)
      for (let turn = 0; turn < 8; turn++) {
        cy.log(`Turn ${turn + 1}`);

        // Get current stats
        cy.window().then((win: any) => {
          cy.log('Stats:', {
            health: win.gameStore.stats.health,
            money: win.gameStore.stats.money,
            loyalty: win.gameStore.stats.loyalty,
            support: win.gameStore.stats.support,
            debt: win.gameStore.debt,
            portfolioValue: win.gameStore.portfolioValue,
            portfolioProfit: win.gameStore.portfolioProfit
          });
        });

        // Skip turn
        cy.contains('button', 'Golf').click({ force: true });
        cy.wait(3000);

        // Close annual report if it appears
        if (turn === 3 || turn === 7) {
          cy.contains('button', 'Continue').click({ force: true });
          cy.wait(1000);
        }
      }

      // Final statistics
      cy.window().then((win: any) => {
        const stats = win.gameStore.stats;
        cy.log('Final Stats:', stats);

        // Balance checks
        expect(stats.health).to.be.greaterThan(0, 'Health should not reach 0');
        expect(stats.loyalty).to.be.greaterThan(0, 'Loyalty should not reach 0');
        
        // Log if debt became problematic
        if (win.gameStore.debt > 200) {
          cy.log('Warning: High debt detected:', win.gameStore.debt);
        }
      });
    });
  });
});
