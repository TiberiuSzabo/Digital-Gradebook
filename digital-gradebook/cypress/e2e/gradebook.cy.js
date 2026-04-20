// cypress/e2e/gradebook.cy.js

describe('Digital Gradebook - E2E Tests (Silver Challenge)', () => {

    it('1. Ar trebui să permită logarea unui profesor și redirecționarea spre MasterView', () => {
        cy.visit('http://localhost:5173');
        cy.contains('Register').click();

        cy.url().should('include', '/register');

        // Completăm formularul de înregistrare
        cy.get('input[name="name"]').type('Robot');
        cy.get('input[name="email"]').type('robot@teacher.com');
        cy.get('input[name="password"]').type('robot');
        cy.get('input[name="confirmPassword"]').type('robot');

        cy.contains('Create account').click();

        cy.visit('http://localhost:5173');
        // 1. Dăm click pe butonul de Login de pe landing page
        cy.contains('Log In').click();

        // 2. Verificăm că am ajuns pe pagina de login
        cy.url().should('include', '/login');

        // 3. Completăm formularul. 
        cy.get('input[type="email"]').type('robot@teacher.com');
        cy.get('input[type="password"]').type('robot');

        // 4. Submit
        cy.contains('Sign In').click();

        // 5. Verificăm dacă ruta s-a schimbat către MasterView
        cy.url().should('include', '/master');
        cy.contains('Digital Gradebook - My Class').should('be.visible');
    });

    it('2. Ar trebui să adauge un elev nou cu succes', () => {
        // Aici presupunem că suntem deja logați (în Cypress poți face un custom command de login)
        // Pentru simplitate, poți repeta pașii de login aici, apoi:
        cy.visit('http://localhost:5173/master');


        // 1. Click pe butonul de adăugare
        cy.contains('+ New Student').click();

        // 2. Verificăm că s-a deschis formularul
        cy.visit('http://localhost:5173/form');

        // 3. Completăm câmpurile esențiale (HINT: folosește atributele name="lastName")
        cy.get('input[name="lastName"]').type('Popescu');
        cy.get('input[name="firstName"]').type('Cypress');
        cy.get('input[name="email"]').type('popescu.cy@student.com');
        cy.get('input[name="birthDate"]').type('01/01/2010');
        cy.get('input[name="cnp"]').type('5100101123456');
        cy.get('input[name="username"]').type('popescu.cypress');
        cy.get('input[name="uniqueNumber"]').type('54321');
        cy.get('input[name="parentDad"]').type('Vasile');
        cy.get('input[name="phoneDad"]').type('0712345678');
        cy.get('input[name="parentMom"]').type('Elena');
        cy.get('input[name="phoneMom"]').type('0712345679');
        cy.get('textarea[name="mentions"]').type('Elev model, foarte silitor.');
        // 4. Salvăm

        cy.contains('Save Student').click();

        // 5. Verificăm că ne-a întors în MasterView și elevul apare în tabel
        cy.url().should('include', '/master');
        cy.contains('Popescu Cypress').should('be.visible');
    });

    it('3. Ar trebui să comute corect între secțiunea de Warnings și cea de Statistics', () => {
        cy.visit('http://localhost:5173/master');

        // 1. Verificăm că by default vedem secțiunea de probleme
        cy.contains('⚠️ Students with problems').should('be.visible');

        // 2. Dăm click pe tab-ul de Statistici pe care tocmai l-am implementat
        cy.contains('Statistics').click();

        // 4. Ne asigurăm că secțiunea cu warning-uri a dispărut
        cy.contains('⚠️ Students with problems').should('not.exist');
    });

});