import storeModule from "@/store/modules/tool-module";
import ToolTypes from "@/definitions/tool-types";

const { getters, mutations } = storeModule;

describe( "Vuex tool module", () => {
    describe( "getters", () => {
        const state = {
            activeTool: ToolTypes.MOVE,
            activeColor: "red",
            options: {
                [ ToolTypes.ZOOM ]: { level: 1 },
                [ ToolTypes.BRUSH ]: { size: 10 },
            }
        }
        it( "should be able to return the active tool", () => {
            expect( getters.activeTool( state )).toEqual( ToolTypes.MOVE );
        });

        it( "should be able to return the active color", () => {
            expect( getters.activeColor( state )).toEqual( "red" );
        });

        it( "should be able to retrieve the zoom options", () => {
            expect( getters.zoomOptions( state )).toEqual({ level: 1 });
        });

        it( "should be able to retrieve the brush options", () => {
            expect( getters.brushOptions( state )).toEqual({ size: 10 });
        });
    });

    describe( "mutations", () => {
        const state = {
            activeTool: "foo",
            activeColor: "red",
            options: {
                [ ToolTypes.ZOOM ]: { level: 1 },
                [ ToolTypes.BRUSH ]: { size: 10 },
            }
        };

        it( "should be able to set the active tool", () => {
            mutations.setActiveTool( state, { tool: "bar" });
            expect( state.activeTool ).toEqual( "bar" );
        });

        it( "should be able to set the active color", () => {
            mutations.setActiveColor( state, "blue" );
            expect( state.activeColor ).toEqual( "blue" );
        });

        it( "should be able to set individual tool option values", () => {
            mutations.setToolOptionValue( state, { tool: ToolTypes.ZOOM, option: "level", value: 10 });
            expect( state.options ).toEqual({
                [ ToolTypes.ZOOM ]: { level: 10 },
                [ ToolTypes.BRUSH ]: { size: 10 }
            });
        });
    });
});
