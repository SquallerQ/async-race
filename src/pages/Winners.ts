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

    const title = doc.createElement('h1');
    title.textContent = 'Winners Page';

    const button = doc.createElement('button');
    button.textContent = 'Go to Garage Page';
    button.addEventListener('click', () => {
      this.router.navigateTo('garage', { currentPage: this.garagePage });
    });

    container.append(title, button);

    return container;
  }
}
