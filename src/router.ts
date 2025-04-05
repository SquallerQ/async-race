import { Garage } from './pages/Garage';
import { Winners } from './pages/Winners';
import { win, doc, hist } from './browserTypes';

export class Router {
  constructor() {
    this.setupRoutes();
    this.navigateTo('garage');
  }
  private setupRoutes(): void {
    win.addEventListener('popstate', () => this.renderPage());
  }

  public navigateTo(page: string, state: { [key: string]: any } = {}): void {
    hist.pushState(state, '', `/${page}`);
    this.renderPage();
  }
  public getState(): { [key: string]: any } {
    return hist.state || {};
  }

  private renderPage(): void {
    const path = win.location.pathname;
    this.clearBody();

    if (path === '/garage') {
      const garage = new Garage(this);
      doc.body.appendChild(garage.render());
    } else if (path === '/winners') {
      const winners = new Winners(this);
      doc.body.appendChild(winners.render());
    }
  }

  private clearBody(): void {
    while (doc.body.firstChild) {
      doc.body.removeChild(doc.body.firstChild);
    }
  }
}
