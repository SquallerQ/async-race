import { Router } from '../router';
import { doc, HTMLElement, HTMLHeadingElement } from '../browserTypes';

interface Car {
  name: string;
  color: string;
  id: number;
}

export class Garage {
  private router: Router;
  private totalCars: number = 0;
  private title: HTMLHeadingElement;
  private tracksContainer: HTMLElement;

  constructor(router: Router) {
    this.router = router;
    this.title = doc.createElement('h1');
    this.tracksContainer = doc.createElement('div');
  }
  public async fetchCars(page: number = 1): Promise<Car[]> {
    const response = await fetch(
      `http://127.0.0.1:3000/garage?_page=${page}&_limit=10`,
      { method: 'GET' },
    );
    if (!response.ok) {
      throw new Error('Failed');
    }

    const totalCount = response.headers.get('X-Total-Count');
    this.totalCars = totalCount ? parseInt(totalCount, 10) : 0;
    this.updateTitle();
    return await response.json();
  }

  public render(): Node {
    const container = doc.createElement('div');
    container.className = 'page';

    const formsContainer = doc.createElement('div');
    formsContainer.className = 'forms__container';

    const createForm = doc.createElement('div');
    createForm.className = 'forms__create';

    const nameInput = doc.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'forms__create-input';

    const colorInput = doc.createElement('input');
    colorInput.type = 'color';
    colorInput.value = '#3cc8e0';
    colorInput.className = 'forms__create-input';

    const createButton = doc.createElement('button');
    createButton.textContent = 'Create';
    createButton.className = 'forms__create-button';
    createButton.addEventListener('click', () =>
      this.createCar(nameInput.value, colorInput.value),
    );

    createForm.append(nameInput, colorInput, createButton);
    formsContainer.append(createForm);

    this.title.textContent = `Garage (${this.totalCars} cars)`;

    this.tracksContainer.className = 'tracks__container';

    const button = doc.createElement('button');
    button.textContent = 'Go to Winners';
    button.addEventListener('click', () => this.router.navigateTo('winners'));

    container.append(createForm, this.title, this.tracksContainer, button);

    this.fetchCars()
      .then(cars => {
        cars.forEach(car => {
          const track = this.createTrack(car);
          this.tracksContainer.append(track);
        });
      })
      .catch(error => {
        throw new Error('Failed to load cars');
      });

    return container;
  }

  private updateTitle(): void {
    this.title.textContent = `Garage (${this.totalCars} cars)`;
  }
  private async createCar(name: string, color: string): Promise<void> {
    if (!name.trim()) {
      console.error('Failed');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:3000/garage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, color }),
      });

      if (!response.ok) {
        throw new Error('Failed');
      }

      const newCar: Car = await response.json();
      const track = this.createTrack(newCar);
      this.tracksContainer.append(track);
      this.totalCars += 1;
      this.updateTitle();
    } catch (error) {
      console.error(error);
    }
  }

  private createTrack(car: Car): Node {
    const trackContainer = doc.createElement('div');
    trackContainer.className = 'track__container';

    const buttonsContainer = doc.createElement('div');
    buttonsContainer.className = 'track__buttons-container';

    const buttonsContainerTop = doc.createElement('div');
    buttonsContainerTop.className = 'track__buttons-container--top';

    const buttonsContainerBottom = doc.createElement('div');
    buttonsContainerBottom.className = 'track__buttons-container--bottom';

    const selectButton = doc.createElement('button');
    selectButton.className = 'buttons-container__select';
    selectButton.textContent = 'Select';

    const removeButton = doc.createElement('button');
    removeButton.className = 'buttons-container__remove';
    removeButton.textContent = 'Remove';
    removeButton.addEventListener('click', () =>
      this.removeCar(car.id, trackContainer),
    );

    const carName = doc.createElement('span');
    carName.textContent = car.name;

    const startButton = doc.createElement('button');
    startButton.className = 'buttons-container__start';
    startButton.textContent = 'A';

    const stopButton = doc.createElement('button');
    stopButton.className = 'buttons-container__stop';
    stopButton.textContent = 'B';

    buttonsContainerTop.append(selectButton, removeButton, carName);
    buttonsContainerBottom.append(startButton, stopButton);

    buttonsContainer.append(buttonsContainerTop, buttonsContainerBottom);

    const animationContainer = doc.createElement('div');
    animationContainer.className = 'track__animation-container';

    const carFlagContainer = doc.createElement('div');
    carFlagContainer.className = 'car_flag-container';

    const carSvg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
    carSvg.setAttribute('width', '60');
    carSvg.setAttribute('height', '60');
    const useElement = doc.createElementNS('http://www.w3.org/2000/svg', 'use');
    useElement.setAttribute('href', '../../sprite.svg#car');
    useElement.setAttribute('fill', car.color);
    carSvg.append(useElement);

    const flagSvg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
    flagSvg.setAttribute('width', '30');
    flagSvg.setAttribute('height', '30');
    const useFlag = doc.createElementNS('http://www.w3.org/2000/svg', 'use');
    useFlag.setAttribute('href', '../../sprite.svg#flag');
    flagSvg.append(useFlag);

    const road = doc.createElement('div');
    road.className = 'track__road';

    carFlagContainer.append(carSvg, flagSvg);
    animationContainer.append(carFlagContainer, road);

    trackContainer.append(buttonsContainer, animationContainer);

    return trackContainer;
  }

  private async removeCar(carId: number, trackContainer: HTMLElement): Promise<void> {
    try {
      const response = await fetch(`http://127.0.0.1:3000/garage/${carId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove car');
      }
      trackContainer.remove();
      this.totalCars -= 1;
      this.updateTitle();
    } catch (error) {
      console.error(error);
    }
  }
}
