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

type IAllJson = Idata | IJson | IpostGradJson;

export type { Imeta, Iperson, Idata, IJson, IpostGradJson, IAllJson };