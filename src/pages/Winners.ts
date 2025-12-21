import { Router } from '../router';
import { fetchWinners, fetchCar } from '../utils/api';
import { WINNERS_TABLE_HEADERS, WINNERS_PER_PAGE } from '../utils/constants';

export class Winners {
  private router: Router;
  private garagePage: number;
  private totalWinners: number = 0;
  private currentPage: number;
  private title: HTMLElement;
  private pageIndicator: HTMLSpanElement;
  private prevButton: HTMLButtonElement;
  private nextButton: HTMLButtonElement;
  private winnersTable: HTMLElement;
  private sortColumn: 'wins' | 'time' = 'wins';
  private sortOrder: 'ASC' | 'DESC' = 'DESC';

  constructor(router: Router) {
    this.router = router;
    this.garagePage = router.getState().currentPage || 1;
    this.currentPage = 1;
    this.title = document.createElement('h1');
    this.pageIndicator = document.createElement('span');
    this.prevButton = document.createElement('button');
    this.nextButton = document.createElement('button');
    this.winnersTable = document.createElement('table');
  }

  public render(): Node {
    const container = document.createElement('div');
    container.className = 'page winners-page';

    const routerButtonsContainer = document.createElement('div');
    routerButtonsContainer.className = 'router-buttons__container';

    const goToGarage = document.createElement('button');
    goToGarage.className = 'router-buttons__button';
    goToGarage.textContent = 'To Garage';
    goToGarage.addEventListener('click', () => {
      this.router.navigateTo('garage', { currentPage: this.garagePage });
    });

    const goToWinnersButton = document.createElement('button');
    goToWinnersButton.className = 'router-buttons__button';
    goToWinnersButton.textContent = 'To Winners';
    goToWinnersButton.disabled = true;

    routerButtonsContainer.append(goToGarage, goToWinnersButton);

    this.title.textContent = `Winners (${this.totalWinners})`;
    this.pageIndicator.className = 'actual__page';
    this.pageIndicator.textContent = `Page ${this.currentPage}`;

    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'pagination';

    this.prevButton.textContent = 'Previous';
    this.prevButton.className = 'pagination__button';
    this.prevButton.addEventListener('click', () => this.loadWinners(this.currentPage - 1));

    this.nextButton.textContent = 'Next';
    this.nextButton.className = 'pagination__button';
    this.nextButton.addEventListener('click', () => this.loadWinners(this.currentPage + 1));

    paginationContainer.append(this.prevButton, this.nextButton);

    this.winnersTable.className = 'winners-table';
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    WINNERS_TABLE_HEADERS.forEach((header) => {
      const th = document.createElement('th');
      th.textContent = header.text;
      if (header.sortable && header.key) {
        th.classList.add('sortable');
        th.setAttribute('data-sort', header.key);
        th.addEventListener('click', () => this.sortTable(header.key as 'wins' | 'time'));
      }
      headerRow.append(th);
    });

    thead.append(headerRow);
    this.winnersTable.append(thead);

    container.append(routerButtonsContainer, this.title, this.pageIndicator, paginationContainer, this.winnersTable);

    this.loadWinners(this.currentPage);

    return container;
  }

  private async loadWinners(page: number): Promise<void> {
    try {
      const { winners, total } = await fetchWinners(page, WINNERS_PER_PAGE, this.sortColumn, this.sortOrder);
      this.totalWinners = total;
      const totalPages = Math.ceil(this.totalWinners / WINNERS_PER_PAGE);
      if (page < 1 || (this.totalWinners > 0 && page > totalPages)) return;
      this.currentPage = page;

      this.title.textContent = `Winners (${this.totalWinners})`;
      this.pageIndicator.textContent = `Page ${this.currentPage}`;

      const tbody = document.createElement('tbody');
      tbody.innerHTML = '';

      for (let i = 0; i < winners.length; i++) {
        const winner = winners[i];
        const car = await fetchCar(winner.id);
        if (!car) continue;

        const row = document.createElement('tr');

        const numberCell = document.createElement('td');
        numberCell.textContent = `${(this.currentPage - 1) * WINNERS_PER_PAGE + i + 1}`;

        const carCell = document.createElement('td');
        const carSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        carSvg.setAttribute('width', '40');
        carSvg.setAttribute('height', '40');
        const useElement = document.createElementNS('http://www.w3.org/2000/svg', 'use');
        useElement.setAttribute('href', '../../sprite.svg#car');
        useElement.setAttribute('fill', car.color);
        useElement.setAttribute('stroke', '#000000');
        useElement.setAttribute('stroke-width', '2');
        carSvg.append(useElement);
        carCell.append(carSvg);

        const nameCell = document.createElement('td');
        nameCell.textContent = car.name;

        const winsCell = document.createElement('td');
        winsCell.textContent = `${winner.wins}`;

        const timeCell = document.createElement('td');
        timeCell.textContent = `${(winner.time / 1000).toFixed(2)}`;

        row.append(numberCell, carCell, nameCell, winsCell, timeCell);
        tbody.append(row);
      }

      const oldTbody = this.winnersTable.querySelector('tbody');
      if (oldTbody) oldTbody.remove();
      this.winnersTable.append(tbody);

      this.pageIndicator.textContent = `Page ${this.currentPage}`;
      this.updatePaginationButtons(totalPages, winners.length);
    } catch (error) {
      console.error(error);
    }
  }

  private sortTable(column: 'wins' | 'time'): void {
    if (this.sortColumn === column) {
      this.sortOrder = this.sortOrder === 'ASC' ? 'DESC' : 'ASC';
    } else {
      this.sortColumn = column;
      this.sortOrder = 'DESC';
    }
    this.loadWinners(this.currentPage);
  }
  private updatePaginationButtons(totalPages: number, currentPageItems: number): void {
    this.prevButton.disabled = this.currentPage === 1;
    this.nextButton.disabled = this.currentPage === totalPages || currentPageItems < WINNERS_PER_PAGE;
  }

  public async updateWinners(): Promise<void> {
    await this.loadWinners(this.currentPage);
  }
}
