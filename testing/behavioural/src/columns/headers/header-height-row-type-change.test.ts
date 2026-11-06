import { waitFor } from '@testing-library/dom';
import { TestGridsManager } from 'ag-test-utils';
import { afterEach, describe, expect, test } from 'vitest';

import type { ColDef, ColGroupDef, GridApi, GridOptions } from 'ag-grid-community';
import { TextFilterModule } from 'ag-grid-community';
import { PivotModule, RowGroupingModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

import { createFakeServer, createServerSideDatasource } from '../../columnToolPanel/deferredPivotModeFakeServer';

const olympicRows = [
    { athlete: 'a', country: 'Ireland', year: 2020, sport: 'Rowing', gold: 1, silver: 0, bronze: 0, total: 1 },
    { athlete: 'b', country: 'Ireland', year: 2024, sport: 'Rowing', gold: 2, silver: 0, bronze: 0, total: 2 },
    { athlete: 'c', country: 'France', year: 2020, sport: 'Judo', gold: 3, silver: 0, bronze: 0, total: 3 },
];

// https://github.com/ag-grid/ag-grid/issues/15921
describe('header height when header rows change type but not count', () => {
    const gridsManager = new TestGridsManager({ modules: [TextFilterModule] });
    afterEach(() => gridsManager.reset());

    const headerHeight = (id: string) =>
        document.getElementById(id)!.querySelector<HTMLElement>('.ag-header')!.style.height;

    // [column, floating filter] header rows
    const filteredColumns: ColDef[] = [{ field: 'a', filter: 'agTextColumnFilter', floatingFilter: true }];
    // [group, column] header rows: same count, different types
    const groupedColumns: ColGroupDef[] = [{ headerName: 'Group', children: [{ field: 'a' }] }];

    const gridOptions: GridOptions = {
        headerHeight: 30,
        groupHeaderHeight: 40,
        floatingFiltersHeight: 20,
        rowData: [{ a: 1 }],
    };

    test('is recomputed when [column, filter] rows become [group, column]', async () => {
        await gridsManager.createGridAndWait('reference', { ...gridOptions, columnDefs: groupedColumns });
        const api = await gridsManager.createGridAndWait('changed', { ...gridOptions, columnDefs: filteredColumns });
        expect(headerHeight('changed')).not.toBe(headerHeight('reference'));

        api.setGridOption('columnDefs', groupedColumns);

        expect(headerHeight('changed')).toBe(headerHeight('reference'));
    });

    test('is recomputed when [group, column] rows become [column, filter]', async () => {
        await gridsManager.createGridAndWait('reference', { ...gridOptions, columnDefs: filteredColumns });
        const api = await gridsManager.createGridAndWait('changed', { ...gridOptions, columnDefs: groupedColumns });
        expect(headerHeight('changed')).not.toBe(headerHeight('reference'));

        api.setGridOption('columnDefs', filteredColumns);

        expect(headerHeight('changed')).toBe(headerHeight('reference'));
    });

    test('is recomputed when SSRM pivot mode turns [column, filter] rows into [pivot group, column]', async () => {
        // Primary columns have floating filters; pivot result columns do not.
        const ssrmOptions = (): GridOptions => ({
            ...gridOptions,
            pivotHeaderHeight: gridOptions.headerHeight,
            pivotGroupHeaderHeight: gridOptions.groupHeaderHeight,
            rowData: undefined,
            rowModelType: 'serverSide',
            serverSideDatasource: createServerSideDatasource(createFakeServer(olympicRows as any)),
            columnDefs: [
                { field: 'country', filter: 'agTextColumnFilter', floatingFilter: true },
                { field: 'year', filter: 'agTextColumnFilter', floatingFilter: true },
                { field: 'gold', filter: 'agTextColumnFilter', floatingFilter: true },
            ],
            processPivotResultColDef: (colDef) => {
                colDef.floatingFilter = false;
            },
        });
        const pivotState = {
            state: [
                { colId: 'country', rowGroup: true },
                { colId: 'year', pivot: true },
                { colId: 'gold', aggFunc: 'sum' },
            ],
        };
        const hasPivotResultColumns = (api: GridApi) => (api.getPivotResultColumns() ?? []).length > 0;

        // Same [group, column] rows and heights, built directly.
        await gridsManager.createGridAndWait('reference', { ...gridOptions, columnDefs: groupedColumns });

        const api = await gridsManager.createGridAndWait('changed', ssrmOptions(), {
            modules: [PivotModule, RowGroupingModule, ServerSideRowModelModule],
        });
        api.setGridOption('pivotMode', true);
        api.applyColumnState(pivotState);
        await waitFor(() => expect(hasPivotResultColumns(api)).toBe(true));

        expect(headerHeight('changed')).toBe(headerHeight('reference'));
    });
});
