import { Garage } from './pages/Garage';
import { Winners } from './pages/Winners';
import { win, doc, hist, HTMLElement } from './browserTypes';

export class Router {
  private pages: {
    [key: string]: { instance: Garage | Winners; element: HTMLElement };
  } = {};
  private currentPath: string = '';

  constructor() {
    this.pages['/garage'] = { instance: new Garage(this), element: null! };
    this.pages['/winners'] = { instance: new Winners(this), element: null! };
    win.addEventListener('popstate', () => this.renderPage());
    this.navigateTo('garage');
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
    if (this.currentPath === path) return;

    if (this.currentPath && this.pages[this.currentPath]) {
      this.pages[this.currentPath].element.style.display = 'none';
    }

    this.currentPath = path;

    if (!this.pages[path].element) {
      this.pages[path].element = this.pages[
        path
      ].instance.render() as HTMLElement;
      doc.body.appendChild(this.pages[path].element);
    } else {
      this.pages[path].element.style.display = 'block';
    }
  }
}
