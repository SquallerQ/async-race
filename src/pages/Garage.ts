import { Router } from '../router';
import { doc } from '../browserTypes';

export class Garage {
  private router: Router;

  constructor(router: Router) {
    this.router = router;
  }

  public render(): Node {
    const container = doc.createElement('div');
    container.className = 'page';

    const title = doc.createElement('h1');
    title.textContent = 'Garage Page';

    const button = doc.createElement('button');
    button.textContent = 'Go to Winners';
    button.addEventListener('click', () => this.router.navigateTo('winners'));

    container.append(title, button);

    return container;
  }
}
