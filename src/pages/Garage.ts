import { Router } from '../router';
import {
  doc,
  win,
  HTMLElement,
  HTMLHeadingElement,
  HTMLInputElement,
  HTMLButtonElement,
  HTMLSpanElement,
  SVGSVGElement,
  SVGUseElement,
  DOMMatrixReadOnly,
  setTimeout,
  console,
} from '../browserTypes';

import { Winners } from './Winners';
import { Car } from '../types';
import {
  fetchCars,
  createCar,
  deleteCar,
  deleteWinner,
  startEngine,
  stopEngine,
  driveCar,
  saveWinner,
  updateCar,
} from '../utils/api';

export class Garage {
  private router: Router;
  private totalCars: number = 0;
  private title: HTMLHeadingElement;
  private tracksContainer: HTMLElement;
  private selectedCarId: number | null = null;
  private updateNameInput: HTMLInputElement;
  private updateColorInput: HTMLInputElement;
  private updateButton: HTMLButtonElement;
  private currentPage: number;
  private pageIndicator: HTMLSpanElement;
  private prevButton: HTMLButtonElement;
  private nextButton: HTMLButtonElement;

  constructor(router: Router) {
    this.router = router;
    this.title = doc.createElement('h1');
    this.tracksContainer = doc.createElement('div');
    this.updateNameInput = doc.createElement('input');
    this.updateColorInput = doc.createElement('input');
    this.updateButton = doc.createElement('button');
    this.pageIndicator = doc.createElement('span');
    this.prevButton = doc.createElement('button');
    this.nextButton = doc.createElement('button');
    this.currentPage = router.getState().currentPage || 1;
  }

  public render(): Node {
    const container = doc.createElement('div');
    container.className = 'page';

    const routerButtonsContainer = doc.createElement('div');
    routerButtonsContainer.className = 'router-buttons__container';

    const goToGarage = doc.createElement('button');
    goToGarage.className = 'router-buttons__button';
    goToGarage.textContent = 'To Garage';
    goToGarage.disabled = true;

    const goToWinnersButton = doc.createElement('button');
    goToWinnersButton.className = 'router-buttons__button';
    goToWinnersButton.textContent = 'To Winners';
    goToWinnersButton.addEventListener('click', () => {
      this.router.navigateTo('winners', { currentPage: this.currentPage });
    });

    routerButtonsContainer.append(goToGarage, goToWinnersButton);

    const formsContainer = doc.createElement('div');
    formsContainer.className = 'forms__container';

    const createForm = doc.createElement('div');
    createForm.className = 'forms__create';

    const nameInput = doc.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'forms__create-input';
    nameInput.placeholder = 'Enter car name';

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

    const updateForm = doc.createElement('div');
    updateForm.className = 'forms__update';

    this.updateNameInput.type = 'text';
    this.updateNameInput.className = 'forms__update-input';
    this.updateNameInput.disabled = true;

    this.updateColorInput.type = 'color';
    this.updateColorInput.value = '#3cc8e0';
    this.updateColorInput.className = 'forms__update-input';
    this.updateColorInput.disabled = true;

    this.updateButton.textContent = 'Update';
    this.updateButton.className = 'forms__update-button';
    this.updateButton.disabled = true;
    this.updateButton.addEventListener('click', () =>
      this.updateCar(
        this.selectedCarId,
        this.updateNameInput.value,
        this.updateColorInput.value,
        this.updateNameInput,
      ),
    );
    updateForm.append(
      this.updateNameInput,
      this.updateColorInput,
      this.updateButton,
    );

    const menuButtonsContainer = doc.createElement('div');
    menuButtonsContainer.className = 'menu-buttons__container';

    const generateButton = doc.createElement('button');
    generateButton.textContent = 'Generate 100 Cars';
    generateButton.className = 'menu-buttons__generate-btn';
    generateButton.addEventListener('click', () => this.addHundredCars());

    const startRaceButton = doc.createElement('button');
    startRaceButton.textContent = 'Start Race';
    startRaceButton.className = 'menu-buttons__start-btn';
    startRaceButton.addEventListener('click', () => this.startRace());

    const resetRaceButton = doc.createElement('button');
    resetRaceButton.textContent = 'Reset Race';
    resetRaceButton.className = 'menu-buttons__reset-btn';
    resetRaceButton.addEventListener('click', () => this.resetRace());

    menuButtonsContainer.append(
      generateButton,
      startRaceButton,
      resetRaceButton,
    );

    formsContainer.append(createForm, updateForm);

    this.title.textContent = `Garage (${this.totalCars} cars)`;
    this.pageIndicator.className = 'actual__page';
    this.pageIndicator.textContent = `Page ${this.currentPage}`;

    this.tracksContainer.className = 'tracks__container';

    const paginationContainer = doc.createElement('div');
    paginationContainer.className = 'pagination';

    this.prevButton.textContent = 'Previous';
    this.prevButton.className = 'pagination__button';
    this.prevButton.addEventListener('click', () =>
      this.loadCars(this.currentPage - 1),
    );

    this.nextButton.textContent = 'Next';
    this.nextButton.className = 'pagination__button';
    this.nextButton.addEventListener('click', () =>
      this.loadCars(this.currentPage + 1),
    );

    paginationContainer.append(this.prevButton, this.nextButton);

    container.append(
      routerButtonsContainer,
      formsContainer,
      menuButtonsContainer,
      this.title,
      this.pageIndicator,
      this.tracksContainer,
      paginationContainer,
    );

    this.loadCars(this.currentPage);

    return container;
  }

  private async loadCars(page: number): Promise<void> {
    try {
      const { cars, total } = await fetchCars(page);
      this.totalCars = total;
      this.currentPage = page;
      this.title.textContent = `Garage (${this.totalCars})`;
      this.pageIndicator.textContent = `Page ${this.currentPage}`;
      this.tracksContainer.innerHTML = '';
      cars.forEach((car) => this.tracksContainer.append(this.createTrack(car)));

      const totalPages = Math.ceil(this.totalCars / 7);
      this.prevButton.disabled = this.currentPage === 1;
      this.nextButton.disabled =
        this.currentPage === totalPages || cars.length < 7;
    } catch (error) {
      console.error(error);
    }
  }

  private createTrack(car: Car): Node {
    const trackContainer = doc.createElement('div');
    trackContainer.className = 'track__container';
    trackContainer.setAttribute('data-id', car.id.toString());

    const buttonsContainer = doc.createElement('div');
    buttonsContainer.className = 'track__buttons-container';

    const buttonsContainerTop = doc.createElement('div');
    buttonsContainerTop.className = 'track__buttons-container--top';

    const buttonsContainerBottom = doc.createElement('div');
    buttonsContainerBottom.className = 'track__buttons-container--bottom';

    const selectButton = doc.createElement('button');
    selectButton.className = 'buttons-container__select';
    selectButton.textContent = 'Select';
    selectButton.addEventListener('click', () =>
      this.selectCar(car.id, carName, useElement),
    );

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
    startButton.addEventListener('click', () =>
      this.startCar(car.id, carSvg, startButton, stopButton),
    );

    const stopButton = doc.createElement('button');
    stopButton.className = 'buttons-container__stop';
    stopButton.textContent = 'B';
    stopButton.disabled = true;
    stopButton.addEventListener('click', () =>
      this.stopCar(car.id, carSvg, startButton, stopButton),
    );

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
    useElement.setAttribute('stroke', '#000000');
    useElement.setAttribute('stroke-width', '2');
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

  private async createCar(name: string, color: string): Promise<void> {
    try {
      await createCar(name, color);
      await this.loadCars(this.currentPage);
    } catch (error) {
      console.error(error);
    }
  }

  private async updateCar(
    carId: number | null,
    name: string,
    color: string,
    nameInput: HTMLInputElement,
  ): Promise<void> {
    if (!carId) {
      console.log('No car selected');
      return;
    }
    if (!name.trim()) {
      const originalPlaceholder = nameInput.placeholder;
      nameInput.placeholder = 'Name cannot be empty';
      nameInput.value = '';
      nameInput.focus();
      setTimeout(() => {
        nameInput.placeholder = originalPlaceholder;
      }, 1000);
      return;
    }

    try {
      const updatedCar = await updateCar(carId, name, color);
      const track = this.tracksContainer.querySelector(
        `.track__container[data-id="${carId}"]`,
      );
      if (track) {
        const carName = track.querySelector('span');
        const carSvgUse = track.querySelector('svg use');
        if (carName) carName.textContent = updatedCar.name;
        if (carSvgUse) carSvgUse.setAttribute('fill', updatedCar.color);
      }

      this.resetUpdateForm();
    } catch (error) {
      console.error(error);
    }
  }

  private async removeCar(
    carId: number,
    trackContainer: HTMLElement,
  ): Promise<void> {
    try {
      await deleteCar(carId);
      await deleteWinner(carId);
      trackContainer.remove();
      this.totalCars -= 1;
      this.updateTitle();
      await this.loadCars(this.currentPage);

      const winnersInstance = this.router.getPageInstance('winners');
      if (winnersInstance instanceof Winners) {
        await winnersInstance.updateWinners();
      }
    } catch (error) {
      console.error(error);
    }
  }

  private selectCar(
    carId: number,
    carNameElement: HTMLSpanElement,
    carSvgUse: SVGUseElement,
  ): void {
    this.selectedCarId = carId;
    const currentName = carNameElement.textContent || '';
    const currentColor = carSvgUse.getAttribute('fill') || '#3cc8e0';

    this.updateNameInput.value = currentName;
    this.updateColorInput.value = currentColor;
    this.updateNameInput.disabled = false;
    this.updateColorInput.disabled = false;
    this.updateButton.disabled = false;
  }

  private resetUpdateForm(): void {
    this.selectedCarId = null;
    this.updateNameInput.value = '';
    this.updateColorInput.value = '#3cc8e0';
    this.updateNameInput.disabled = true;
    this.updateColorInput.disabled = true;
    this.updateButton.disabled = true;
  }

  private updateTitle(): void {
    this.title.textContent = `Garage (${this.totalCars})`;
  }

  private async addHundredCars(): Promise<void> {
    const carNames = [
      'Tesla',
      'BMW',
      'Audi',
      'Porsche',
      'Ferrari',
      'Lamborghini',
      'Mercedes',
      'Ford',
      'Chevrolet',
      'Toyota',
      'Honda',
      'Nissan',
      'Subaru',
    ];
    const carModels = [
      'Model S',
      'M5',
      'A4',
      'C-Class',
      'B4',
      'CC-2',
      'MC-6',
      '488',
      '911',
      'MX-5',
      'WRX',
      'MCA',
    ];
    const carColors = [
      '#FF0000',
      '#00FF00',
      '#0000FF',
      '#FFFF00',
      '#FF00FF',
      '#00FFFF',
      '#FFA500',
      '#A52A2A',
      '#800080',
    ];

    try {
      for (let i = 0; i < 100; i++) {
        const randomBrand =
          carNames[Math.floor(Math.random() * carNames.length)];
        const randomModel =
          carModels[Math.floor(Math.random() * carModels.length)];
        const name = `${randomBrand} ${randomModel}`;
        const color = carColors[Math.floor(Math.random() * carColors.length)];
        await createCar(name, color);
      }

      await this.loadCars(this.currentPage);
    } catch (error) {
      console.error(error);
    }
  }

  private async startCar(
    carId: number,
    carSvg: SVGSVGElement,
    startButton: HTMLButtonElement,
    stopButton: HTMLButtonElement,
  ): Promise<void> {
    try {
      startButton.disabled = true;
      stopButton.disabled = false;

      const { velocity, distance } = await startEngine(carId);

      const duration = distance / velocity;
      const containerWidth =
        carSvg.parentElement?.parentElement?.clientWidth || 0;
      const carWidth = carSvg.clientWidth;
      const maxTranslate = containerWidth - carWidth - 10;

      carSvg.style.transition = `transform ${duration}ms linear`;
      carSvg.style.transform = `translateX(${maxTranslate}px)`;

      const { success } = await driveCar(carId);

      if (!success) {
        const computedStyle = win.getComputedStyle(carSvg);
        const matrix = new DOMMatrixReadOnly(computedStyle.transform);
        const currentX = matrix.m41;
        carSvg.style.transition = 'none';
        carSvg.style.transform = `translateX(${currentX}px)`;
        console.error(`Engine failure for car ${carId}`);
        return;
      }

      setTimeout(() => {
        startButton.disabled = false;
        stopButton.disabled = true;
      }, duration);
    } catch (error) {
      console.error(error);
      startButton.disabled = false;
      stopButton.disabled = true;
    }
  }

  private async stopCar(
    carId: number,
    carSvg: SVGSVGElement,
    startButton: HTMLButtonElement,
    stopButton: HTMLButtonElement,
  ): Promise<void> {
    try {
      await stopEngine(carId);

      carSvg.style.transition = 'transform 0.3s ease-out';
      carSvg.style.transform = 'translateX(0px)';

      startButton.disabled = false;
      stopButton.disabled = true;
    } catch (error) {
      console.error(error);
    }
  }

  private async startRace(): Promise<void> {
    this.resetRace();
    this.disableButtonsDuringRace();
    const carElements =
      this.tracksContainer.querySelectorAll('.track__container');
    const racePromises: Promise<{
      id: number;
      time: number;
      success: boolean;
    }>[] = [];

    carElements.forEach((track) => {
      const carId = Number(track.getAttribute('data-id'));
      const carSvg = track.querySelector('svg') as SVGSVGElement;
      const startButton = track.querySelector(
        '.buttons-container__start',
      ) as HTMLButtonElement;
      const stopButton = track.querySelector(
        '.buttons-container__stop',
      ) as HTMLButtonElement;

      if (carId && carSvg) {
        racePromises.push(
          this.startSingleCar(carId, carSvg, startButton, stopButton),
        );
      }
    });

    try {
      const firstFinished = new Promise<{
        id: number;
        time: number;
        success: boolean;
      }>((resolve) => {
        racePromises.forEach((promise) => {
          promise.then((result) => {
            if (result.success) resolve(result);
          });
        });
      });

      const winner = await Promise.race([
        firstFinished,
        Promise.all(racePromises).then(() => null),
      ]);
      if (winner) {
        const winnerName =
          this.tracksContainer.querySelector(
            `.track__container[data-id="${winner.id}"] span`,
          )?.textContent || `Car #${winner.id}`;
        this.showWinner(winnerName, winner.time);

        await saveWinner(winner.id, winner.time);
        const winnersInstance = this.router.getPageInstance('/winners');
        if (winnersInstance instanceof Winners) {
          await winnersInstance.updateWinners();
        }
      }

      await Promise.all(racePromises);
    } catch (error) {
      console.error('Race error:', error);
    }
  }

  private async startSingleCar(
    carId: number,
    carSvg: SVGSVGElement,
    startButton: HTMLButtonElement,
    stopButton: HTMLButtonElement,
  ): Promise<{ id: number; time: number; success: boolean }> {
    try {
      startButton.disabled = true;
      stopButton.disabled = false;

      const { velocity, distance } = await startEngine(carId);

      const duration = distance / velocity;
      const containerWidth =
        carSvg.parentElement?.parentElement?.clientWidth || 0;
      const carWidth = carSvg.clientWidth;
      const maxTranslate = containerWidth - carWidth - 10;

      carSvg.style.transition = `transform ${duration}ms linear`;
      carSvg.style.transform = `translateX(${maxTranslate}px)`;

      const { success } = await driveCar(carId);

      if (!success) {
        const computedStyle = win.getComputedStyle(carSvg);
        const matrix = new DOMMatrixReadOnly(computedStyle.transform);
        const currentX = matrix.m41;
        carSvg.style.transition = 'none';
        carSvg.style.transform = `translateX(${currentX}px)`;
        return { id: carId, time: duration, success: false };
      }

      setTimeout(() => {
        startButton.disabled = false;
        stopButton.disabled = true;
      }, duration);

      return { id: carId, time: duration, success: true };
    } catch (error) {
      console.error(`Car ${carId} error:`, error);
      return { id: carId, time: Infinity, success: false };
    }
  }

  private resetRace(): void {
    const carElements =
      this.tracksContainer.querySelectorAll('.track__container');
    carElements.forEach((track) => {
      const carSvg = track.querySelector('svg') as SVGSVGElement;
      const startButton = track.querySelector(
        '.buttons-container__start',
      ) as HTMLButtonElement;
      const stopButton = track.querySelector(
        '.buttons-container__stop',
      ) as HTMLButtonElement;

      if (carSvg) {
        carSvg.style.transition = 'transform 0.3s ease-out';
        carSvg.style.transform = 'translateX(0px)';
      }

      if (startButton && stopButton) {
        startButton.disabled = false;
        stopButton.disabled = true;
      }
    });
    this.enableButtonsAfterRace();
  }
  private showWinner(winnerName: string, time: number): void {
    const winnerMessage = doc.createElement('div');
    winnerMessage.className = 'winner-message';
    winnerMessage.textContent = `Winner: ${winnerName}, Time: ${(time / 1000).toFixed(2)}s`;

    const page = doc.querySelector('.page') as HTMLElement;
    page.appendChild(winnerMessage);
    setTimeout(() => {
      winnerMessage.remove();
    }, 5000);
  }
  private disableButtonsDuringRace(): void {
    const removeButtons = this.tracksContainer.querySelectorAll(
      '.buttons-container__remove',
    );
    removeButtons.forEach((button) => {
      (button as HTMLButtonElement).disabled = true;
    });

    const selectButtons = this.tracksContainer.querySelectorAll(
      '.buttons-container__select',
    );
    selectButtons.forEach((button) => {
      (button as HTMLButtonElement).disabled = true;
    });

    const startButtons = this.tracksContainer.querySelectorAll(
      '.buttons-container__start',
    );
    startButtons.forEach((button) => {
      (button as HTMLButtonElement).disabled = true;
    });

    this.prevButton.disabled = true;
    this.nextButton.disabled = true;

    const createButton = doc.querySelector(
      '.forms__create-button',
    ) as HTMLButtonElement;
    const generateButton = doc.querySelector(
      '.menu-buttons__generate-btn',
    ) as HTMLButtonElement;
    const startRaceButton = doc.querySelector(
      '.menu-buttons__start-btn',
    ) as HTMLButtonElement;

    if (createButton) createButton.disabled = true;
    if (generateButton) generateButton.disabled = true;
    if (startRaceButton) startRaceButton.disabled = true;

    const toWinnersButton = doc.querySelector(
      '.router-buttons__button:not([disabled])',
    );
    if (toWinnersButton) {
      (toWinnersButton as HTMLButtonElement).disabled = true;
      setTimeout(() => {
        (toWinnersButton as HTMLButtonElement).disabled = false;
      }, 500);
    }
  }
  private enableButtonsAfterRace(): void {
    const removeButtons = this.tracksContainer.querySelectorAll(
      '.buttons-container__remove',
    );
    removeButtons.forEach((button) => {
      (button as HTMLButtonElement).disabled = false;
    });

    const selectButtons = this.tracksContainer.querySelectorAll(
      '.buttons-container__select',
    );
    selectButtons.forEach((button) => {
      (button as HTMLButtonElement).disabled = false;
    });

    const startButtons = this.tracksContainer.querySelectorAll(
      '.buttons-container__start',
    );
    startButtons.forEach((button) => {
      (button as HTMLButtonElement).disabled = false;
    });

    const totalPages = Math.ceil(this.totalCars / 7);
    this.prevButton.disabled = this.currentPage === 1;
    this.nextButton.disabled = this.currentPage === totalPages;

    const createButton = doc.querySelector(
      '.forms__create-button',
    ) as HTMLButtonElement;
    const generateButton = doc.querySelector(
      '.menu-buttons__generate-btn',
    ) as HTMLButtonElement;
    const startRaceButton = doc.querySelector(
      '.menu-buttons__start-btn',
    ) as HTMLButtonElement;

    if (createButton) createButton.disabled = false;
    if (generateButton) generateButton.disabled = false;
    if (startRaceButton) startRaceButton.disabled = false;
  }
}
