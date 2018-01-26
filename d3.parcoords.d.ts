interface ID3 extends IPc {
    keys: (a: any) => any[];
    entries: (s: any[]) => any[];
    select: (s: string) => any;
    dispatch: {apply: Function};
    scale: ID3 | (() => ID3) | any;
    ordinal: ID3 | (() => ID3);
    domain: (a: any) => ID3;
    range: (a: any) => ID3;
    svg: ID3Svg;
    rebind: (this: ID3, thisArg: any, ...argArray: any[]) => any;

    extent(data: any | ((d) => void), f?: (d) => void): ID3;

    rangePoints: (a: any) => ID3;
    time: ID3;
    ascending: (idx0, idx1) => number;
    timer: (doFrame) => ID3;

    renderQueue: IRenderQueue;

    map: () => IMap;
    min: (a: number[]) => number;
}

interface IMap {
    has: (k) => boolean;
    set: (k, v) => void;
    get: (k) => typeof k;
}

interface ID3Svg {
    line: () => ID3Svg;
    axis: () => ID3Svg;
    orient: (s: string) => ID3Svg;
    ticks: (n: number) => ID3Svg;
}

export declare const d3: ID3;
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
    selection: any;
    svg: any;
    applyDimensionDefaults: (arg?: any[]) => IDim & any[];
    resize: () => void;
    getOrderedDimensionKeys: () => void;
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
    mergeParcoords: (callback?: (canvas: any) => void) => string;
    canvas: IContext;
    compute_real_centroids: (row) => number[];
    shadows: () => IPc;
    // draw dots with radius r on the axis line where data intersects
    axisDots: (r) => IPc;
    ctx: IContext;
    alphaOnBrushed: (n: number) => void;
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
    };
}

export interface IContext {
    foreground: I;
    brushed: I;
    highlight: I;
    marks;
}

interface I {
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