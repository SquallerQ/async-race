import { Router } from '../router';
import { doc } from '../browserTypes';

interface Car {
  name: string;
  color: string;
  id: number;
}

export class Garage {
  private router: Router;

  constructor(router: Router) {
    this.router = router;
  }
  public async fetchCars(): Promise<Car[]> {
    const response = await fetch('http://127.0.0.1:3000/garage');
    if (!response.ok) {
      throw new Error('Failed to fetch cars');
    }
    return await response.json();
  }

  public render(): Node {
    const container = doc.createElement('div');
    container.className = 'page';

    const title = doc.createElement('h1');
    title.textContent = 'Garage Page';

    const tracksContainer = doc.createElement('div');
    tracksContainer.className = 'tracks__container';

    const button = doc.createElement('button');
    button.textContent = 'Go to Winners';
    button.addEventListener('click', () => this.router.navigateTo('winners'));

    container.append(title, tracksContainer, button);

    this.fetchCars()
      .then(cars => {
        cars.forEach(car => {
          const track = this.createTrack(car);
          tracksContainer.append(track);
        });
      })
      .catch(error => {});

    return container;
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
    carSvg.style.fill = car.color;
    const useElement = doc.createElementNS('http://www.w3.org/2000/svg', 'use');
    useElement.setAttribute('href', '../../sprite.svg#car');
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
}
