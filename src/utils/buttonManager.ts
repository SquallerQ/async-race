import {
  doc,
  HTMLElement,
  HTMLButtonElement,
  setTimeout,
} from '../browserTypes';

export function disableButtonsDuringRace(
  tracksContainer: HTMLElement,
  prevButton: HTMLButtonElement,
  nextButton: HTMLButtonElement,
): void {
  const removeButtons = tracksContainer.querySelectorAll(
    '.buttons-container__remove',
  );
  removeButtons.forEach((button) => {
    (button as HTMLButtonElement).disabled = true;
  });

  const selectButtons = tracksContainer.querySelectorAll(
    '.buttons-container__select',
  );
  selectButtons.forEach((button) => {
    (button as HTMLButtonElement).disabled = true;
  });

  const startButtons = tracksContainer.querySelectorAll(
    '.buttons-container__start',
  );
  startButtons.forEach((button) => {
    (button as HTMLButtonElement).disabled = true;
  });

  prevButton.disabled = true;
  nextButton.disabled = true;

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

export function enableButtonsAfterRace(
  tracksContainer: HTMLElement,
  prevButton: HTMLButtonElement,
  nextButton: HTMLButtonElement,
  totalCars: number,
  currentPage: number,
): void {
  const removeButtons = tracksContainer.querySelectorAll(
    '.buttons-container__remove',
  );
  removeButtons.forEach((button) => {
    (button as HTMLButtonElement).disabled = false;
  });

  const selectButtons = tracksContainer.querySelectorAll(
    '.buttons-container__select',
  );
  selectButtons.forEach((button) => {
    (button as HTMLButtonElement).disabled = false;
  });

  const startButtons = tracksContainer.querySelectorAll(
    '.buttons-container__start',
  );
  startButtons.forEach((button) => {
    (button as HTMLButtonElement).disabled = false;
  });

  const totalPages = Math.ceil(totalCars / 7);
  prevButton.disabled = currentPage === 1;
  nextButton.disabled = currentPage === totalPages;

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
