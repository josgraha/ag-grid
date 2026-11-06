import { act, cleanup, render, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import type { ColDef, ColGroupDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { AllCommunityModule } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

// https://github.com/ag-grid/ag-grid/issues/15921
describe('React header height when header rows change type but not count', () => {
    afterEach(() => cleanup());

    // [column, floating filter] header rows
    const filteredColumns: ColDef[] = [{ field: 'a', filter: 'agTextColumnFilter', floatingFilter: true }];
    // [group, column] header rows: same count, different types
    const groupedColumns: ColGroupDef[] = [{ headerName: 'Group', children: [{ field: 'a' }] }];

    const renderGrid = (testId: string, columnDefs: (ColDef | ColGroupDef)[]) => {
        const apiRef: { current?: GridApi } = {};
        const { container } = render(
            <div data-testid={testId}>
                <AgGridReact
                    rowData={[{ a: 1 }]}
                    columnDefs={columnDefs}
                    headerHeight={30}
                    groupHeaderHeight={40}
                    floatingFiltersHeight={20}
                    modules={[AllCommunityModule]}
                    onGridReady={(e: GridReadyEvent) => {
                        apiRef.current = e.api;
                    }}
                />
            </div>
        );
        const headerHeight = () => container.querySelector<HTMLElement>('.ag-header')?.style.height;
        return { apiRef, headerHeight };
    };

    it('recomputes the header height when [column, filter] rows become [group, column]', async () => {
        const reference = renderGrid('reference', groupedColumns);
        const changed = renderGrid('changed', filteredColumns);
        await waitFor(() => {
            expect(reference.apiRef.current).toBeDefined();
            expect(changed.apiRef.current).toBeDefined();
            expect(reference.headerHeight()).toBeTruthy();
            expect(changed.headerHeight()).toBeTruthy();
        });
        expect(changed.headerHeight()).not.toBe(reference.headerHeight());

        act(() => {
            changed.apiRef.current!.setGridOption('columnDefs', groupedColumns);
        });

        // React applies the header height on a later render. The heights differed before the change,
        // so this poll can only pass once the height has been recomputed.
        await waitFor(() => expect(changed.headerHeight()).toBe(reference.headerHeight()));
    });
});
