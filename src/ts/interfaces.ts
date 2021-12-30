interface Imeta {
    small: boolean,
    grad: string;
}

interface Iperson {
    fac: string,
    usl: string;
    stream: string,
}

interface Idata {
    [key: string]: Iperson;
}

interface IJson {
    info: Imeta;
    data: Idata;
}

interface IpostGradJson {
    [key: string]: {
        [key: string]: number;
    };
}

interface dd {
    [key: string]: {
        [key: string]: string;
    };
}

type IAllJson = Idata | IJson | IpostGradJson | dd;

export type { Imeta, Iperson, Idata, IJson, IpostGradJson, dd, IAllJson };