export interface simpleJSON {
    [key: string]: string;
}

export interface Imeta {
    small: boolean,
    grad: string;
}

export interface Iperson {
    fac: string,
    usl: string;
    stream: string,
}

export interface Idata {
    [key: string]: Iperson;
}

export interface IJson {
    info: Imeta;
    data: Idata;
}

export interface IpostGradJson {
    [key: string]: {
        [key: string]: number;
    };
}

export interface dd {
    [key: string]: {
        [key: string]: string;
    };
}

export type IAllJson = Idata | IJson | IpostGradJson | dd | simpleJSON;