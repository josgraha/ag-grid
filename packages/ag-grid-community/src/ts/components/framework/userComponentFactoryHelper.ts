import { Autowired, Bean } from "../../context/context";
import { IDateComp, IDateParams } from "../../rendering/dateComponent";
import { GridOptions } from "../../entities/gridOptions";
import { IComponent } from "../../interfaces/iComponent";
import { ColDef } from "../../entities/colDef";
import { IHeaderGroupComp, IHeaderGroupParams } from "../../headerRendering/headerGroup/headerGroupComp";
import { IHeaderComp, IHeaderParams } from "../../headerRendering/header/headerComp";
import { GridOptionsWrapper } from "../../gridOptionsWrapper";
import { FilterManager } from "../../filter/filterManager";
import { UserComponentFactory } from "./userComponentFactory";
import { ICellRendererComp, ICellRendererParams } from "../../rendering/cellRenderers/iCellRenderer";
import { GroupCellRendererParams } from "../../rendering/cellRenderers/groupCellRenderer";
import { ISetFilterParams } from "../../interfaces/iSetFilterParams";
import { IRichCellEditorParams } from "../../interfaces/iRichCellEditorParams";
import { Promise } from "../../utils";
import { ILoadingOverlayComp } from "../../rendering/overlays/loadingOverlayComponent";
import { INoRowsOverlayComp } from "../../rendering/overlays/noRowsOverlayComponent";
import { ITooltipComp, ITooltipParams } from "../../rendering/tooltipComponent";
import { GridApi } from "../../gridApi";
import { ColumnApi } from "../../columnController/columnApi";

@Bean('userComponentFactoryHelper')
export class UserComponentFactoryHelper {

    @Autowired("userComponentFactory")
    private userComponentFactory: UserComponentFactory;

    @Autowired("gridOptions")
    private gridOptions: GridOptions;

    @Autowired("gridApi")
    private gridApi: GridApi;

    @Autowired("columnApi")
    private columnApi: ColumnApi;

    public newDateComponent(params: IDateParams): Promise<IDateComp> {
        return this.userComponentFactory.createUserComponent<IDateComp>(
            this.gridOptions,
            params,
            "dateComponent",
            "agDateInput"
        );
    }

    public newHeaderComponent(params:IHeaderParams): Promise<IHeaderComp> {
        return this.userComponentFactory.createUserComponent<IHeaderComp>(
            params.column.getColDef(),
            params,
            "headerComponent",
            "agColumnHeader"
        );
    }

    public newHeaderGroupComponent(params:IHeaderGroupParams): Promise<IHeaderGroupComp> {
        return this.userComponentFactory.createUserComponent(
            params.columnGroup.getColGroupDef(),
            params,
            "headerGroupComponent",
            "agColumnGroupHeader"
        );
    }

    public newFullWidthGroupRowInnerCellRenderer(params:ICellRendererParams):Promise<ICellRendererComp> {
        return this.userComponentFactory.createUserComponent<ICellRendererComp>(this.gridOptions, params, "groupRowInnerRenderer", null, false);
    }

    public newCellRenderer(target: ColDef | ISetFilterParams | IRichCellEditorParams, params:ICellRendererParams):Promise<ICellRendererComp> {
        return this.userComponentFactory.createUserComponent<ICellRendererComp>(target, params, "cellRenderer", null, false);
    }

    public newInnerCellRenderer(target: GroupCellRendererParams, params:ICellRendererParams):Promise<ICellRendererComp> {
        return this.userComponentFactory.createUserComponent<ICellRendererComp>(target, params, "innerRenderer", null);
    }

    public newLoadingOverlayComponent(): Promise<ILoadingOverlayComp> {
        return this.userComponentFactory.createUserComponent<ILoadingOverlayComp>(
            this.gridOptions,
            null,
            "loadingOverlayComponent",
            "agLoadingOverlay"
        );
    }

    public newNoRowsOverlayComponent(): Promise<INoRowsOverlayComp> {
        return this.userComponentFactory.createUserComponent<INoRowsOverlayComp>(
            this.gridOptions,
            null,
            "noRowsOverlayComponent",
            "agNoRowsOverlay"
        );
    }

    public newTooltipComponent(params: ITooltipParams): Promise<ITooltipComp> {
        const colDef = params.column && params.column.getColDef();
        return this.userComponentFactory.createUserComponent<ITooltipComp>(
            colDef,
            params,
            "tooltipComponent",
            'agTooltipComponent'
        );
    }
}