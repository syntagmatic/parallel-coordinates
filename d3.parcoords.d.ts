import { ScaleOrdinal } from 'd3-scale'
import { Axis } from 'd3-axis';

export declare const $V;

export interface IArc {
    active?: string;
    width?: (id) => number;
    startAngle?: (arg?) => number | IArc;
    endAngle?: (arg?) => number;
    arc?: {outerRadius: (n: number) => IArc}
    length?: (id) => number;
}

export interface IPc {
    on(this: IPc, name: string, fn: Function);

    selection: any;
    svg: any;
    applyDimensionDefaults: (arg?: any[]) => IDim & any[];
    resize: () => void;
    getOrderedDimensionKeys: () => any;
    /*^Selection<GElement, NewDatum, PElement, PDatum>*/
    sortDimensions: () => void;
    render: {default?: IPc['default'], (): IPc, queue?: () => void};
    'default': () => void;
    updateAxes: (axes?: number) => IPc;
    autoscale: () => IPc;
    detectDimensions: () => IPc;
    dimensions: (a: any) => void;
    flags: any;
    state: IBar;
    scale: (d, domain) => IPc;
    flip: (d) => IPc;
    commonScale: (global, type) => IPc;
    detectDimensionTypes: (dim) => any;
    bundleDimension: (dim) => any;
    toType: (o: any) => string;
    toTypeCoerceNumbers: (v: any) => string;
    renderBrushed: {(): IPc, 'default'?: () => void, queue?: () => void};
    clear: (s: 'foreground' | 'highlight' | 'brushed') => void;
    version: string;
    // Merges the canvases and SVG elements into one canvas element
    mergeParcoords: (callback?: (canvas: any) => IPc) => string;
    canvas: IContext;
    compute_real_centroids: (row) => number[];
    shadows: () => IPc;
    // draw dots with radius r on the axis line where data intersects
    axisDots: (r) => IPc;
    ctx: IContext;
    alphaOnBrushed: (n: number) => void;
    intersection: (a: IPoint, b: IPoint, c: IPoint, d: IPoint) => {x: number, y: number};
    unhighlight: () => IPc;
    highlight: (data) => IPc;
    reorderable: () => void;
    brushable: () => void;
    createAxes: () => void;

    brushReset(strums?): (() => void) | IPc;

    xscale: ScaleOrdinal<string, Range>;
    interactive: () => IPc;
    g: () => any
    /*GElement*/
    ;
    removeAxes: () => void;
    applyAxisConfig: (axis, dim) => any;
    brushMode: (mode?: string) => string | IPc;
    brushModes: () => string[];
    reorder: (rowdata) => void;
    sortDimensionsByRowData: (rowdata) => void;
    adjacent_pairs: (arr) => any[];
    brushPredicate: (predicate: string) => string | IPc;
    brushExtents: (extents) => {};
}

interface IPoint {
    x: number;
    y: number;
}

interface IDim {
    title?: string;
    orient?: 'left' | 'right';
    ticks?: number;
    innerTickSize?: number;
    outerTickSize?: number;
    tickPadding?: number;
    type?: string;
    index?: number;
    yscale?: {
        (n): number;
        domain: {
            (): IDim['yscale']['domain'][]
            (dom): number,
            reverse: () => IDim
        }
        rangePoints: 'function' | string;
    };
    tickFormat: Axis<any>['tickFormat'];
}

export interface IContext {
    foreground: I;
    brushed: I;
    highlight: I;
    marks;

    // [index: string]: IContext;
}

interface I {
    clearRect: (x: number, y: number, w: number, h: number) => void;
    fillRect: (x: number, y: number, w: number, h: number) => void;
    fillStyle: string;
    globalCompositeOperation: string;
    globalAlpha: number;
    strokeStyle: string;
    lineWidth: number;
    scale: (x: number, y: number) => void;
    clientWidth: number;
    clientHeight: number;
}

export interface IBar {
    data: any[];
    highlighted: any[];
    dimensions: Array<IDim>;
    dimensionTitleRotation: 0;
    brushed: any[];
    brushedColor: null;
    alphaOnBrushed: 0.0;
    mode: 'default';
    rate: 20;
    width: 600;
    height: 300;
    margin: {top: 24, right: 0, bottom: 12, left: 0};
    nullValueSeparator: 'top' | 'bottom' | 'undefined';
    nullValueSeparatorPadding: {top: 8, right: 0, bottom: 8, left: 0};
    color: '#069';
    composite: 'source-over';
    alpha: 0.7;
    bundlingStrength: 0.5;
    smoothness: 0.0;
    showControlPoints: false;
    hideAxis: any[];
    flipAxes: any[];
    animationTime: 1100; // How long it takes to flip the axis when you double click
    rotateLabels: false;
    clusterCentroids?: any;
    // alpha?: number;
    bundleDimension?: any;
    brushPredicate?: IPc['brushPredicate'];
}

export interface IRenderQueue {
    (p): IRenderQueue;

    data: (data: any) => void;
    invalidate: () => void;
    render: () => void;
    rate: (data) => IRenderQueue | number;
    remaining: () => number;
    clear: (func) => IRenderQueue;
}

export interface ICanvas extends IContext {

}

export interface IArc {

}

export interface IStrNum extends IArguments {
    active?: number|string;
    width?: (id) => number;
    p1?: [number, number];
    p2?: number[];
    dims?: IDimension;

    minX?: Range | number;
    maxX?: Range | number;
    minY?: Range | number;
    maxY?: Range | number;
}

export interface IDimension {
    i: -1 | number;
    left: string;
    right: string;
}

export interface IOrigin {
    __origin__?: Range;
}