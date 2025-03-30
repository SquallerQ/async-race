import { Router } from '../router';
import { doc } from '../browserTypes';

export class Winners {
  private router: Router;

  constructor(router: Router) {
    this.router = router;
  }

  public render(): Node {
    const container = doc.createElement('div');
    container.className = 'page';

    const title = doc.createElement('h1');
    title.textContent = 'Winners Page';

    const button = doc.createElement('button');
    button.textContent = 'Go to Garage Page';
    button.addEventListener('click', () => this.router.navigateTo('garage'));

    container.append(title, button);

    return container;
  }
}
