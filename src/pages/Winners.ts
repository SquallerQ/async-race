import { Router } from '../router';
import { doc } from '../browserTypes';

export class Winners {
  private router: Router;
  private garagePage: number;

  constructor(router: Router) {
    this.router = router;
    this.garagePage = router.getState().currentPage || 1;
  }

  public render(): Node {
    const container = doc.createElement('div');
    container.className = 'page';

    const routerButtonsContainer = doc.createElement('div');
    routerButtonsContainer.className = 'router-buttons__container';

    const goToGarage = doc.createElement('button');
    goToGarage.className = 'router-buttons__button';
    goToGarage.textContent = 'To Garage';
    goToGarage.addEventListener('click', () => {
      this.router.navigateTo('garage', { currentPage: this.garagePage });
    });

    const goToWinnersButton = doc.createElement('button');
    goToWinnersButton.className = 'router-buttons__button';
    goToWinnersButton.textContent = 'To Winners';
    goToWinnersButton.disabled = true;

    routerButtonsContainer.append(goToGarage, goToWinnersButton);

    const title = doc.createElement('h1');
    title.textContent = 'Winners Page';

    container.append(routerButtonsContainer, title);

    return container;
  }
}
