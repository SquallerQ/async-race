import { Router } from '../router';
import {
  doc,
  HTMLElement,
  HTMLHeadingElement,
  HTMLInputElement,
  HTMLButtonElement,
  HTMLSpanElement,
  SVGUseElement,
  setTimeout,
  console,
  fetch,
} from '../browserTypes';

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

    const createError = doc.createElement('span');
    createError.className = 'forms__error';
    createError.style.display = 'none';

    const createButton = doc.createElement('button');
    createButton.textContent = 'Create';
    createButton.className = 'forms__create-button';
    createButton.addEventListener('click', () =>
      this.createCar(nameInput.value, colorInput.value, nameInput),
    );

    createForm.append(nameInput, colorInput, createButton, createError);

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

    const button = doc.createElement('button');
    button.textContent = 'Go to Winners';
    button.addEventListener('click', () => {
      this.router.navigateTo('winners', { currentPage: this.currentPage });
    });

    container.append(
      formsContainer,
      this.title,
      this.pageIndicator,
      this.tracksContainer,
      paginationContainer,
      button,
    );

    this.loadCars(this.currentPage);

    return container;
  }

  public async fetchCars(page: number = 1, limit: number = 7): Promise<Car[]> {
    const response = await fetch(
      `http://127.0.0.1:3000/garage?_page=${page}&_limit=${limit}`,
      { method: 'GET' },
    );
    if (!response.ok) {
      throw new Error('Failed to fetch cars');
    }

    const totalCount = response.headers.get('X-Total-Count');
    this.totalCars = totalCount ? parseInt(totalCount, 10) : 0;
    this.updateTitle();
    return await response.json();
  }

  private async loadCars(page: number): Promise<void> {
    const totalPages = Math.ceil(this.totalCars / 7);
    if (page < 1 || (this.totalCars > 0 && page > totalPages)) return;
    this.currentPage = page;

    try {
      const cars = await this.fetchCars(this.currentPage, 7);
      this.tracksContainer.replaceChildren();
      cars.forEach((car) => {
        const track = this.createTrack(car);
        this.tracksContainer.append(track);
      });

      this.pageIndicator.textContent = `Page ${this.currentPage}`;
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

  private async createCar(
    name: string,
    color: string,
    nameInput: HTMLInputElement,
  ): Promise<void> {
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
      const response = await fetch('http://127.0.0.1:3000/garage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, color }),
      });

      if (!response.ok) {
        throw new Error('Failed to create car');
      }

      const newCar: Car = await response.json();
      const track = this.createTrack(newCar);
      this.tracksContainer.append(track);
      this.totalCars += 1;
      this.updateTitle();
      this.loadCars(this.currentPage);
      nameInput.value = '';
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
      const response = await fetch(`http://127.0.0.1:3000/garage/${carId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, color }),
      });

      if (!response.ok) {
        throw new Error('Failed to update car');
      }

      const updatedCar: Car = await response.json();
      const track = this.tracksContainer.querySelector(`
        .track__container[data-id="${carId}"]`);
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
      const response = await fetch(`http://127.0.0.1:3000/garage/${carId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove car');
      }
      trackContainer.remove();
      this.totalCars -= 1;
      this.updateTitle();
      this.loadCars(this.currentPage);
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
}
