import { Router } from '../router';
import {
  doc,
  HTMLElement,
  HTMLSpanElement,
  HTMLButtonElement,
  console,
} from '../browserTypes';
import { fetchWinners, fetchCar } from '../utils/api';

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
    this.title = doc.createElement('h1');
    this.pageIndicator = doc.createElement('span');
    this.prevButton = doc.createElement('button');
    this.nextButton = doc.createElement('button');
    this.winnersTable = doc.createElement('table');
  }

  public render(): Node {
    const container = doc.createElement('div');
    container.className = 'page winners-page';

    const routerButtonsContainer = doc.createElement('div');
    routerButtonsContainer.className = 'router-buttons__container';

    const goToGarage = doc.createElement('button');
    goToGarage.className = 'router-buttons__button';
    goToGarage.textContent = 'To Garage';
    goToGarage.addEventListener('click', () => {
      this.router.navigateTo('garage', { currentPage: this.garagePage });
    });

    const goToWinnersButton = doc.createElement('button');
    goToWinnersButton.className = 'router-buttons__button';
    goToWinnersButton.textContent = 'To Winners';
    goToWinnersButton.disabled = true;

    routerButtonsContainer.append(goToGarage, goToWinnersButton);

    this.title.textContent = `Winners (${this.totalWinners})`;
    this.pageIndicator.className = 'actual__page';
    this.pageIndicator.textContent = `Page ${this.currentPage}`;

    const paginationContainer = doc.createElement('div');
    paginationContainer.className = 'pagination';

    this.prevButton.textContent = 'Previous';
    this.prevButton.className = 'pagination__button';
    this.prevButton.addEventListener('click', () =>
      this.loadWinners(this.currentPage - 1),
    );

    this.nextButton.textContent = 'Next';
    this.nextButton.className = 'pagination__button';
    this.nextButton.addEventListener('click', () =>
      this.loadWinners(this.currentPage + 1),
    );

    paginationContainer.append(this.prevButton, this.nextButton);

    this.winnersTable.className = 'winners-table';
    const thead = doc.createElement('thead');
    const headerRow = doc.createElement('tr');

    const headers = [
      { text: 'Number', sortable: false },
      { text: 'Car', sortable: false },
      { text: 'Name', sortable: false },
      { text: 'Wins', sortable: true, key: 'wins' },
      { text: 'Best time (seconds)', sortable: true, key: 'time' },
    ];

    headers.forEach((header) => {
      const th = doc.createElement('th');
      th.textContent = header.text;
      if (header.sortable) {
        th.className = 'sortable';
        th.addEventListener('click', () =>
          this.sortTable(header.key as 'wins' | 'time'),
        );
      }
      headerRow.append(th);
    });

    thead.append(headerRow);
    this.winnersTable.append(thead);

    container.append(
      routerButtonsContainer,
      this.title,
      this.pageIndicator,
      paginationContainer,
      this.winnersTable,
    );

    this.loadWinners(this.currentPage);

    return container;
  }

  private async loadWinners(page: number): Promise<void> {
    try {
      const { winners, total } = await fetchWinners(
        page,
        10,
        this.sortColumn,
        this.sortOrder,
      );
      this.totalWinners = total;
      const totalPages = Math.ceil(this.totalWinners / 10);
      if (page < 1 || (this.totalWinners > 0 && page > totalPages)) return;
      this.currentPage = page;

      this.title.textContent = `Winners (${this.totalWinners})`;
      this.pageIndicator.textContent = `Page ${this.currentPage}`;

      const tbody = doc.createElement('tbody');
      tbody.innerHTML = '';

      for (let i = 0; i < winners.length; i++) {
        const winner = winners[i];
        const car = await fetchCar(winner.id);
        if (!car) continue;

        const row = doc.createElement('tr');

        const numberCell = doc.createElement('td');
        numberCell.textContent = `${(this.currentPage - 1) * 10 + i + 1}`;

        const carCell = doc.createElement('td');
        const carSvg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
        carSvg.setAttribute('width', '40');
        carSvg.setAttribute('height', '40');
        const useElement = doc.createElementNS(
          'http://www.w3.org/2000/svg',
          'use',
        );
        useElement.setAttribute('href', '../../sprite.svg#car');
        useElement.setAttribute('fill', car.color);
        useElement.setAttribute('stroke', '#000000');
        useElement.setAttribute('stroke-width', '2');
        carSvg.append(useElement);
        carCell.append(carSvg);

        const nameCell = doc.createElement('td');
        nameCell.textContent = car.name;

        const winsCell = doc.createElement('td');
        winsCell.textContent = `${winner.wins}`;

        const timeCell = doc.createElement('td');
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
  private updatePaginationButtons(
    totalPages: number,
    currentPageItems: number,
  ): void {
    this.prevButton.disabled = this.currentPage === 1;
    this.nextButton.disabled =
      this.currentPage === totalPages || currentPageItems < 10;
  }

  public async updateWinners(): Promise<void> {
    await this.loadWinners(this.currentPage);
  }
}
