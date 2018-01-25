interface ID3 extends IPc {
    keys: (a: any) => any[];
    entries: (s: string[]) => any[];
    select: (s: string) => any;
    dispatch: {apply: Function};
    scale: ID3 | (() => ID3) | any;
    ordinal: ID3 | (() => ID3);
    domain: (a: any) => ID3;
    range: (a: any) => ID3;
    svg: ID3Svg;
    rebind: (this: Function, thisArg: any, ...argArray: any[]) => any;
    extent(data: any|((d) => void), f?: (d) => void): ID3;
    rangePoints: (a: any) => ID3;
    time: ID3;
}

interface ID3Svg {
    line: () => ID3Svg;
    axis: () => ID3Svg;
    orient: (s: string) => ID3Svg;
    ticks: (n: number) => ID3Svg;
}

export declare const d3: ID3;

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
    applyDimensionDefaults: (arg?: any[]) => {};
    resize: () => void;
    getOrderedDimensionKeys: () => void;
    sortDimensions: () => void;
    render: () => IPc;
    updateAxes: (axes?: number) => IPc;
    autoscale: () => IPc;
    detectDimensions: () => IPc;
    dimensions: (a: any) => void;
    flags: any;
    state: IBar;
    scale: (d, domain) => IPc;
    flip: (d) => IPc;
    commonScale: (global, type) => IPc;
    bundleDimension:
}

export interface IContext {
    foreground: I;
    brushed: I;
    highlight: I;
}

interface I {
    globalCompositeOperation: string;
    globalAlpha: string;
    strokeStyle: string;
    lineWidth: number;
    scale: (x: number, y: number) => void;
}

export interface IBar {
    data: any[];
    highlighted: any[];
    dimensions: {};
    dimensionTitleRotation: 0;
    brushed: false;
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
    bundleDimension: null;
    smoothness: 0.0;
    showControlPoints: false;
    hideAxis: any[];
    flipAxes: any[];
    animationTime: 1100; // How long it takes to flip the axis when you double click
    rotateLabels: false;
    clusterCentroids?: any;
    alpha?: number;
    bundleDimension?: (a?) => any[]; // returns: `types`
    detectDimensionTypes?: (dim) => any;
}
